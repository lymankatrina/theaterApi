import { Request, Response } from 'express';
import { matchedData } from 'express-validator';
import { MongoServerError, ObjectId } from 'mongodb';

import type { CreatePriceInput, UpdatePriceInput } from '../dto/prices.dto';
import type { Price } from '../models/prices.model';

import { collections } from '../services/database.services';

export class PricesController {
  getPrices = async (_req: Request, res: Response): Promise<void> => {
    try {
      const prices = await collections.prices.find().sort({ admissionType: 1 }).toArray();
      res.status(200).json(prices);
    } catch (error) {
      console.error('Error getting prices:', error);
      res.status(500).json({
        message: 'Error getting prices'
      });
    }
  };

  getPriceById = async (req: Request, res: Response): Promise<void> => {
    const { priceId } = matchedData(req, {
      locations: ['params']
    });
    try {
      const price = await collections.prices.findOne({
        _id: new ObjectId(priceId)
      });
      if (!price) {
        res.status(404).json({
          message: 'Price not found'
        });
        return;
      }
      res.status(200).json(price);
    } catch (error) {
      console.error('Error getting price:', error);
      res.status(500).json({
        message: 'Error getting price'
      });
    }
  };

  createPrice = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = matchedData(req, {
        locations: ['body']
      }) as CreatePriceInput;
      const newPrice: Price = {
        ...data
      };
      const result = await collections.prices.insertOne(newPrice);
      res.status(201).json({
        message: 'Successfully created a new price',
        priceId: result.insertedId
      });
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        res.status(409).json({
          message: 'A price for this admission type already exists'
        });
        return;
      }
      console.error('Error creating price:', error);
      res.status(500).json({
        message: 'Unable to create price'
      });
    }
  };

  updatePriceById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { priceId } = matchedData(req, {
        locations: ['params']
      });
      const data = matchedData(req, {
        locations: ['body']
      }) as UpdatePriceInput;
      const result = await collections.prices.updateOne(
        {
          _id: new ObjectId(priceId)
        },
        {
          $set: data
        }
      );
      if (result.matchedCount === 0) {
        res.status(404).json({
          message: 'Price not found'
        });
        return;
      }
      res.status(200).json({
        message: result.modifiedCount > 0 ? 'Successfully updated price' : 'Price is already up to date'
      });
    } catch (error) {
      console.error('Error updating price:', error);
      res.status(500).json({
        message: 'Unable to update price'
      });
    }
  };
}
