import { Request, Response } from 'express';
import { matchedData } from 'express-validator';
import { MongoServerError, ObjectId } from 'mongodb';

import type { CreateOrderInput } from '../dto/orders.dto';

import { collections } from '../services/database.services';
import { createOrder } from '../services/orders.services';
import { AppError } from '../errors/app.error';

export class OrdersController {
  getOrderById = async (req: Request, res: Response): Promise<void> => {
    const { orderId } = matchedData(req, {
      locations: ['params']
    });
    try {
      const user = req.currentUser;
      if (!user?._id) {
        res.status(403).json({
          message: 'Access denied'
        });
        return;
      }
      const order = await collections.orders.findOne({
        _id: new ObjectId(orderId)
      });
      if (!order) {
        res.status(404).json({
          message: 'Order not found'
        });
        return;
      }
      const isOwner = order.userId?.equals(user._id) || order.employeeId?.equals(user._id);
      if (!isOwner && user.role !== 'admin') {
        res.status(403).json({
          message: 'Access denied'
        });
        return;
      }
      res.status(200).json(order);
    } catch (error) {
      console.error('Error getting order:', error);
      res.status(500).json({
        message: 'Error getting order'
      });
    }
  };

  createOrder = async (req: Request, res: Response): Promise<void> => {
    const user = req.currentUser;
    const data = matchedData(req) as CreateOrderInput;
    if (!user?._id) {
      res.status(401).json({
        message: 'User not authenticated'
      });
      return;
    }
    try {
      const order = await createOrder(data.cartId, user);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          message: error.message
        });
        return;
      }
      if (error instanceof MongoServerError && error.code === 11000) {
        res.status(409).json({
          message: 'An order already exists for this cart'
        });
        return;
      }
      console.error('Error creating order:', error);
      res.status(500).json({
        message: 'Unable to create order'
      });
    }
  };
}
