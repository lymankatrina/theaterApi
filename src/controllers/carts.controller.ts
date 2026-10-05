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

import type { CartTicketItem, CartConcessionItem } from '../types/cart.types';

import type { Cart } from '../models/carts.model';
import { ownsCart, getCartExpiration, getCartActivityUpdate } from '../services/carts.services';
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
        res.status(403).json({
          message: 'Access denied'
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
                updatedAt: new Date(),
                expiresAt: getCartExpiration()
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
            updatedAt: new Date(),
            expiresAt: getCartExpiration()
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
    } catch (error) {
      console.error('Error updating ticket in cart:', error);
      res.status(500).json({
        message: 'Unable to update ticket in cart'
      });
    }
  };

  removeTicketFromCart = async (req: Request, res: Response): Promise<void> => {
    const { cartId, ticketId } = matchedData(req, {
      locations: ['params']
    });
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
      const ticketObjectId = new ObjectId(ticketId);
      const ticketInCart = cart.ticketItems.some((item) => item.ticketId.equals(ticketObjectId));
      if (!ticketInCart) {
        res.status(404).json({
          message: 'Ticket not found in cart'
        });
        return;
      }
      const isLastTicket = cart.ticketItems.length === 1;
      const session = mongoClient.startSession();
      try {
        await session.withTransaction(async () => {
          let cartResult;
          if (isLastTicket) {
            cartResult = await collections.carts.updateOne(
              {
                _id: new ObjectId(cartId),
                status: 'active'
              },
              {
                $pull: {
                  ticketItems: {
                    ticketId: ticketObjectId
                  }
                },
                $set: {
                  updatedAt: new Date()
                },
                $unset: {
                  expiresAt: ''
                }
              },
              {
                session
              }
            );
          } else {
            cartResult = await collections.carts.updateOne(
              {
                _id: new ObjectId(cartId),
                status: 'active'
              },
              {
                $pull: {
                  ticketItems: {
                    ticketId: ticketObjectId
                  }
                },
                $set: {
                  updatedAt: new Date(),
                  expiresAt: getCartExpiration()
                }
              },
              {
                session
              }
            );
          }
          if (cartResult.modifiedCount === 0) {
            throw new Error('Unable to remove ticket from cart');
          }
          const ticketResult = await collections.tickets.updateOne(
            {
              _id: ticketObjectId,
              status: 'reserved'
            },
            {
              $set: {
                status: 'available'
              }
            },
            {
              session
            }
          );
          if (ticketResult.modifiedCount === 0) {
            throw new Error('Unable to release ticket');
          }
        });
      } finally {
        await session.endSession();
      }
      res.status(200).json({
        message: 'Successfully removed ticket from cart'
      });
    } catch (error) {
      console.error('Error removing ticket from cart:', error);
      res.status(500).json({
        message: 'Unable to remove ticket from cart'
      });
    }
  };

  addConcessionToCart = async (req: Request, res: Response): Promise<void> => {
    const { cartId } = matchedData(req, {
      locations: ['params']
    });
    const data = matchedData(req, {
      locations: ['body']
    }) as AddConcessionToCartInput;
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
      const concessionObjectId = new ObjectId(data.concessionId);
      const concession = await collections.concessions.findOne({
        _id: concessionObjectId,
        isActive: true
      });
      if (!concession) {
        res.status(404).json({
          message: 'Active concession not found'
        });
        return;
      }
      const concessionInCart = cart.concessionItems.some((item) => item.concessionId.equals(concessionObjectId));
      const hasTickets = cart.ticketItems.length > 0;
      if (concessionInCart) {
        const result = await collections.carts.updateOne(
          {
            _id: new ObjectId(cartId),
            status: 'active',
            'concessionItems.concessionId': concessionObjectId
          },
          {
            $inc: {
              'concessionItems.$.quantity': data.quantity
            },
            $set: {
              'concessionItems.$.priceInCents': concession.priceInCents,
              ...getCartActivityUpdate(hasTickets)
            }
          }
        );
        if (result.modifiedCount === 0) {
          throw new Error('Unable to update concession in cart');
        }
      } else {
        const cartConcessionItem: CartConcessionItem = {
          concessionId: concessionObjectId,
          quantity: data.quantity,
          priceInCents: concession.priceInCents
        };
        const result = await collections.carts.updateOne(
          {
            _id: new ObjectId(cartId),
            status: 'active'
          },
          {
            $push: {
              concessionItems: cartConcessionItem
            },
            $set: {
              ...getCartActivityUpdate(hasTickets)
            }
          }
        );
        if (result.modifiedCount === 0) {
          throw new Error('Unable to add concession to cart');
        }
      }
      res.status(200).json({
        message: 'Successfully added concession to cart'
      });
    } catch (error) {
      console.error('Error adding concession to cart:', error);
      res.status(500).json({
        message: 'Unable to add concession to cart'
      });
    }
  };

  updateConcessionQuantity = async (req: Request, res: Response): Promise<void> => {
    const { cartId, concessionId } = matchedData(req, {
      locations: ['params']
    });
    const data = matchedData(req, {
      locations: ['body']
    }) as UpdateConcessionQuantityInput;
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
      const concessionObjectId = new ObjectId(concessionId);
      const hasTickets = cart.ticketItems.length > 0;
      const result = await collections.carts.updateOne(
        {
          _id: new ObjectId(cartId),
          status: 'active',
          'concessionItems.concessionId': concessionObjectId
        },
        {
          $set: {
            'concessionItems.$.quantity': data.quantity,
            ...getCartActivityUpdate(hasTickets)
          }
        }
      );
      if (result.matchedCount === 0) {
        res.status(404).json({
          message: 'Concession not found in cart'
        });
        return;
      }
      res.status(200).json({
        message: 'Successfully updated concession quantity'
      });
    } catch (error) {
      console.error('Error updating concession quantity:', error);
      res.status(500).json({
        message: 'Unable to update concession quantity'
      });
    }
  };

  removeConcessionFromCart = async (req: Request, res: Response): Promise<void> => {
    const { cartId, concessionId } = matchedData(req, {
      locations: ['params']
    });
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
      const concessionObjectId = new ObjectId(concessionId);
      const hasTickets = cart.ticketItems.length > 0;
      const cartResult = await collections.carts.updateOne(
        {
          _id: new ObjectId(cartId),
          status: 'active',
          'concessionItems.concessionId': concessionObjectId
        },
        {
          $pull: {
            concessionItems: {
              concessionId: concessionObjectId
            }
          },
          $set: {
            ...getCartActivityUpdate(hasTickets)
          }
        }
      );
      if (cartResult.matchedCount === 0) {
        res.status(404).json({
          message: 'Concession not found in cart'
        });
        return;
      }
      res.status(200).json({
        message: 'Successfully removed concession item from cart'
      });
    } catch (error) {
      console.error('Error removing concession from cart:', error);
      res.status(500).json({
        message: 'Unable to remove concession from cart'
      });
    }
  };
}
