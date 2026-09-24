import { Request, Response } from 'express';
import { ObjectId, MongoServerError } from 'mongodb';
import { matchedData } from 'express-validator';

import { collections, mongoClient } from '../services/database.services';
import { generateTicketsForShowtime } from '../services/tickets.services';
import type { Showtime } from '../models/showtimes.model';
import type { CreateShowtimeInput } from '../dto/showtimes.dto';

import { getDatesBetween } from '../helpers/helpers';

export class ShowtimesController {
  getShowtimes = async (req: Request, res: Response): Promise<void> => {
    try {
      const { movieId } = matchedData(req, {
        locations: ['query']
      });
      const filter = movieId
        ? {
            movieId: new ObjectId(movieId)
          }
        : {};
      const showtimes = await collections.showtimes
        .find(filter)
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

  createShowtimes = async (req: Request, res: Response): Promise<void> => {
    const data = matchedData(req, {
      locations: ['body']
    }) as CreateShowtimeInput;
    const movieId = new ObjectId(data.movieId);
    const session = mongoClient.startSession();
    try {
      let insertedCount = 0;
      let ticketsCreated = 0;
      let showtimeIds: ObjectId[] = [];
      await session.withTransaction(async () => {
        const movieExists = await collections.movies.findOne(
          {
            _id: movieId
          },
          {
            session
          }
        );
        if (!movieExists) {
          throw new Error('MOVIE_NOT_FOUND');
        }
        const dates = getDatesBetween(data.startDate, data.endDate);
        const conflicts = await collections.showtimes
          .find(
            {
              date: {
                $in: dates
              },
              time: data.time
            },
            {
              session
            }
          )
          .toArray();
        if (conflicts.length > 0) {
          const conflictError = new Error('SHOWTIME_CONFLICT');
          Object.assign(conflictError, {
            conflicts: conflicts.map((showtime) => ({
              date: showtime.date,
              time: showtime.time
            }))
          });
          throw conflictError;
        }
        const showtimes: Showtime[] = dates.map((date) => ({
          movieId,
          date,
          time: data.time,
          showtimeType: data.showtimeType
        }));
        const result = await collections.showtimes.insertMany(showtimes, {
          session
        });
        insertedCount = result.insertedCount;
        showtimeIds = Object.values(result.insertedIds);
        for (const showtimeId of showtimeIds) {
          ticketsCreated += await generateTicketsForShowtime(showtimeId, session);
        }
      });
      res.status(201).json({
        message: 'Showtimes and tickets created successfully',
        insertedCount,
        ticketsCreated,
        showtimeIds
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'MOVIE_NOT_FOUND') {
        res.status(404).json({
          message: 'Movie not found'
        });
        return;
      }
      if (error instanceof Error && error.message === 'SHOWTIME_CONFLICT') {
        const conflicts = (
          error as Error & {
            conflicts?: {
              date: string;
              time: string;
            }[];
          }
        ).conflicts;
        res.status(409).json({
          message: 'One or more showtimes conflict with existing showtimes',
          conflicts
        });
        return;
      }
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
    } finally {
      await session.endSession();
    }
  };

  deleteShowtime = async (req: Request, res: Response): Promise<void> => {
    const { showtimeId } = matchedData(req, {
      locations: ['params']
    }) as { showtimeId: string };
    const showtimeObjectId = new ObjectId(showtimeId);
    const session = mongoClient.startSession();
    try {
      let deletedTickets = 0;
      await session.withTransaction(async () => {
        const showtime = await collections.showtimes.findOne(
          {
            _id: showtimeObjectId
          },
          {
            session
          }
        );
        if (!showtime) {
          throw new Error('SHOWTIME_NOT_FOUND');
        }
        const protectedTicket = await collections.tickets.findOne(
          {
            showtimeId: showtimeObjectId,
            status: {
              $in: ['reserved', 'sold']
            }
          },
          {
            session
          }
        );
        if (protectedTicket) {
          throw new Error('SHOWTIME_HAS_PROTECTED_TICKETS');
        }
        const ticketResult = await collections.tickets.deleteMany(
          {
            showtimeId: showtimeObjectId
          },
          {
            session
          }
        );
        deletedTickets = ticketResult.deletedCount;
        const showtimeResult = await collections.showtimes.deleteOne(
          {
            _id: showtimeObjectId
          },
          {
            session
          }
        );
        if (showtimeResult.deletedCount !== 1) {
          throw new Error('SHOWTIME_DELETE_FAILED');
        }
      });
      res.status(200).json({
        message: 'Showtime and tickets deleted successfully',
        deletedShowtimes: 1,
        deletedTickets
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'SHOWTIME_NOT_FOUND') {
        res.status(404).json({
          message: 'Showtime not found'
        });
        return;
      }
      if (error instanceof Error && error.message === 'SHOWTIME_HAS_PROTECTED_TICKETS') {
        res.status(409).json({
          message: 'Showtime cannot be deleted because it has reserved or sold tickets'
        });
        return;
      }
      console.error('Error deleting showtime:', error);
      res.status(500).json({
        message: 'Error deleting showtime'
      });
    } finally {
      await session.endSession();
    }
  };
}
