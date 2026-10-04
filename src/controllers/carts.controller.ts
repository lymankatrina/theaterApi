import { Request, Response } from 'express';
import { matchedData } from 'express-validator';
import { MongoServerError, ObjectId } from 'mongodb';

import type {
  CreateCartInput,
  AddTicketToCartInput,
  UpdateCartTicketInput,
  AddConcessionToCartInput,
  UpdateConcessionQuantityInput
} from '../dto/carts.dto';

import type { CartTicketItem } from '../types/cart.types';

import type { Cart } from '../models/carts.model';
import { ownsCart } from '../services/carts.services';
import { collections, mongoClient } from '../services/database.services';

export class CartsController {
  getCartById = async (req: Request, res: Response): Promise<void> => {
    const { cartId } = matchedData(req, {
      locations: ['params']
    });
    try {
      const user = req.currentUser;
      if (!user || !user._id) {
        res.status(403).json({
          message: 'Access denied'
        });
        return;
      }
      const cart = await collections.carts.findOne({
        _id: new ObjectId(cartId)
      });
      if (!cart) {
        res.status(404).json({
          message: 'Cart not found'
        });
        return;
      }
      const userOwnsCart = ownsCart(cart, user._id);
      if (!userOwnsCart && user.role !== 'admin') {
        res.status(403).json({
          message: 'Access denied'
        });
        return;
      }
      res.status(200).json(cart);
    } catch (error) {
      console.error('Error getting cart:', error);
      res.status(500).json({
        message: 'Error getting cart'
      });
    }
  };

  createCart = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.currentUser;
      if (!user || !user._id) {
        res.status(404).json({
          message: 'User not found'
        });
        return;
      }
      const data = matchedData(req, {
        locations: ['body']
      }) as CreateCartInput;
      if (user.role === 'customer' && data.salesChannel !== 'online') {
        res.status(403).json({
          message: 'Customers may only create online carts'
        });
        return;
      }
      const now = new Date();
      const newCart: Cart = {
        ticketItems: [],
        concessionItems: [],
        status: 'active',
        salesChannel: data.salesChannel,
        createdAt: now,
        updatedAt: now
      };
      if (data.salesChannel === 'online') {
        newCart.userId = user._id;
      } else {
        newCart.employeeId = user._id;
      }
      const result = await collections.carts.insertOne(newCart);
      res.status(201).json({
        message: 'Successfully created a new cart',
        cartId: result.insertedId
      });
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        res.status(409).json({
          message: 'An active cart already exists'
        });
        return;
      }
      console.error('Error creating cart:', error);
      res.status(500).json({
        message: 'Unable to create cart'
      });
    }
  };

  addTicketToCart = async (req: Request, res: Response): Promise<void> => {
    const { cartId } = matchedData(req, {
      locations: ['params']
    });
    const data = matchedData(req, {
      locations: ['body']
    }) as AddTicketToCartInput;
    const user = req.currentUser;
    if (!user || !user._id) {
      res.status(403).json({
        message: 'Access denied'
      });
      return;
    }
    try {
      const cart = await collections.carts.findOne({
        _id: new ObjectId(cartId),
        status: 'active'
      });
      if (!cart) {
        res.status(404).json({
          message: 'Active cart not found'
        });
        return;
      }
      const userOwnsCart = ownsCart(cart, user._id);
      if (!userOwnsCart && user.role !== 'admin') {
        res.status(403).json({
          message: 'Access denied'
        });
        return;
      }
      const price = await collections.prices.findOne({
        admissionType: data.admissionType
      });
      if (!price) {
        res.status(404).json({
          message: 'Price not found for admission type'
        });
        return;
      }
      const ticketId = new ObjectId(data.ticketId);
      const session = mongoClient.startSession();
      try {
        await session.withTransaction(async () => {
          const reservedTicket = await collections.tickets.findOneAndUpdate(
            {
              _id: ticketId,
              status: 'available'
            },
            {
              $set: {
                status: 'reserved'
              }
            },
            {
              session,
              returnDocument: 'after'
            }
          );
          if (!reservedTicket) {
            throw new Error('Ticket is not available');
          }
          const cartTicketItem: CartTicketItem = {
            ticketId,
            admissionType: data.admissionType,
            priceInCents: price.priceInCents
          };
          const cartResult = await collections.carts.updateOne(
            {
              _id: new ObjectId(cartId),
              status: 'active'
            },
            {
              $push: {
                ticketItems: cartTicketItem
              },
              $set: {
                updatedAt: new Date()
              }
            },
            {
              session
            }
          );
          if (cartResult.modifiedCount === 0) {
            throw new Error('Unable to add ticket to cart');
          }
        });
      } finally {
        await session.endSession();
      }
      res.status(200).json({
        message: 'Successfully added ticket to cart'
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Ticket is not available') {
        res.status(409).json({
          message: 'Ticket is not available'
        });
        return;
      }
      console.error('Error adding ticket to cart:', error);
      res.status(500).json({
        message: 'Unable to add ticket to cart'
      });
    }
  };

  updateCartTicket = async (req: Request, res: Response): Promise<void> => {
    const { cartId, ticketId } = matchedData(req, {
      locations: ['params']
    });
    const data = matchedData(req, {
      locations: ['body']
    }) as UpdateCartTicketInput;
    const user = req.currentUser;
    if (!user || !user._id) {
      res.status(403).json({
        message: 'Access denied'
      });
      return;
    }
    const cart = await collections.carts.findOne({
      _id: new ObjectId(cartId),
      status: 'active'
    });
    if (!cart) {
      res.status(404).json({
        message: 'Active cart not found'
      });
      return;
    }
    const userOwnsCart = ownsCart(cart, user._id);
    if (!userOwnsCart && user.role !== 'admin') {
      res.status(403).json({
        message: 'Access denied'
      });
      return;
    }
    const price = await collections.prices.findOne({
      admissionType: data.admissionType
    });
    if (!price) {
      res.status(404).json({
        message: 'Price not found for admission type'
      });
      return;
    }
    const result = await collections.carts.updateOne(
      {
        _id: new ObjectId(cartId),
        status: 'active',
        'ticketItems.ticketId': new ObjectId(ticketId)
      },
      {
        $set: {
          'ticketItems.$.admissionType': data.admissionType,
          'ticketItems.$.priceInCents': price.priceInCents,
          updatedAt: new Date()
        }
      }
    );
    if (result.matchedCount === 0) {
      res.status(404).json({
        message: 'Ticket not found in cart'
      });
      return;
    }
    res.status(200).json({
      message: 'Successfully updated ticket in cart'
    });
  };
}
