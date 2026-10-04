import { Request, Response } from 'express';
import { matchedData } from 'express-validator';
import { ObjectId, MongoServerError } from 'mongodb';

import { collections } from '../services/database.services';
import { generateTicketsForShowtime } from '../services/tickets.services';

export class TicketsController {
  generateTicketsFromShowtime = async (req: Request, res: Response): Promise<void> => {
    const { showtimeId } = matchedData(req, {
      locations: ['params']
    }) as { showtimeId: string };
    const showtimeObjectId = new ObjectId(showtimeId);
    try {
      const showtime = await collections.showtimes.findOne({
        _id: showtimeObjectId
      });
      if (!showtime) {
        res.status(404).json({
          message: `Unable to find showtime with id: ${showtimeId}`
        });
        return;
      }
      const insertedCount = await generateTicketsForShowtime(showtimeObjectId);
      if (insertedCount === 0) {
        res.status(200).json({
          message: `All tickets already exist for showtime ID ${showtimeId}`,
          insertedCount: 0
        });
        return;
      }
      res.status(201).json({
        message: `Missing tickets for showtime ID ${showtimeId} created successfully`,
        insertedCount
      });
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        res.status(409).json({
          message: 'One or more tickets already exist for this showtime and seat'
        });
        return;
      }
      console.error('Error generating tickets:', error);
      res.status(500).json({
        message: 'Error generating tickets'
      });
    }
  };
}
