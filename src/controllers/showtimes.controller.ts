import { Request, Response } from 'express';
import { ObjectId, MongoServerError } from 'mongodb';
import { matchedData } from 'express-validator';

import { collections } from '../services/database.services';
import type { Showtime } from '../models/showtimes.model';
import type { CreateShowtimeInput } from '../dto/showtimes.dto';

import { getDatesBetween } from '../helpers/helpers';

export class ShowtimesController {
  getShowtimes = async (_req: Request, res: Response): Promise<void> => {
    try {
      const showtimes = await collections.showtimes
        .find()
        .sort({
          date: 1,
          time: 1
        })
        .toArray();
      res.status(200).json(showtimes);
    } catch (error) {
      console.error('Error getting showtimes:', error);
      res.status(500).json({
        message: 'Error getting showtimes'
      });
    }
  };

  getShowtimeById = async (req: Request, res: Response): Promise<void> => {
    const { showtimeId } = matchedData(req, {
      locations: ['params']
    });
    try {
      const showtime = await collections.showtimes.findOne({
        _id: new ObjectId(showtimeId)
      });
      if (!showtime) {
        res.status(404).json({
          message: 'Showtime not found'
        });
        return;
      }
      res.status(200).json(showtime);
    } catch (error) {
      console.error('Error getting showtime:', error);
      res.status(500).json({
        message: 'Error getting showtime'
      });
    }
  };

  getShowtimesByMovie = async (req: Request, res: Response): Promise<void> => {
    const { movieId } = matchedData(req, {
      locations: ['params']
    });
    try {
      const showtimes = await collections.showtimes
        .find({
          movieId: new ObjectId(movieId)
        })
        .sort({
          date: 1,
          time: 1
        })
        .toArray();
      res.status(200).json(showtimes);
    } catch (error) {
      console.error('Error getting showtimes by movie:', error);
      res.status(500).json({
        message: 'Error getting showtimes by movie'
      });
    }
  };

  createShowtimes = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = matchedData(req, {
        locations: ['body']
      }) as CreateShowtimeInput;
      const movieId = new ObjectId(data.movieId);
      const movieExists = await collections.movies.findOne({
        _id: movieId
      });
      if (!movieExists) {
        res.status(404).json({
          message: 'Movie not found'
        });
        return;
      }
      const dates = getDatesBetween(data.startDate, data.endDate);
      const conflicts = await collections.showtimes
        .find({
          date: {
            $in: dates
          },
          time: data.time
        })
        .toArray();
      if (conflicts.length > 0) {
        res.status(409).json({
          message: 'One or more showtimes conflict with existing showtimes',
          conflicts: conflicts.map((showtime) => ({
            date: showtime.date,
            time: showtime.time
          }))
        });
        return;
      }
      const showtimes: Showtime[] = dates.map((date) => ({
        movieId,
        date,
        time: data.time,
        showtimeType: data.showtimeType
      }));
      const result = await collections.showtimes.insertMany(showtimes);
      res.status(201).json({
        message: 'Showtimes created successfully',
        insertedCount: result.insertedCount,
        showtimeIds: Object.values(result.insertedIds)
      });
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        res.status(409).json({
          message: 'A showtime already exists for one of the selected dates and time'
        });
        return;
      }
      console.error('Error creating showtimes:', error);
      res.status(500).json({
        message: 'Error creating showtimes'
      });
    }
  };
}
