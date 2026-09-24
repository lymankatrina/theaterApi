import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { matchedData } from 'express-validator';

import type { Movie } from '../models/movies.model';
import type { CreateMovieInput, UpdateMovieInput } from '../dto/movies.dto';

import { collections, mongoClient } from '../services/database.services';

export class MoviesController {
  getMovies = async (req: Request, res: Response): Promise<void> => {
    try {
      const { title } = matchedData(req, {
        locations: ['query']
      });
      const filter = title
        ? {
            title: {
              $regex: title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
              $options: 'i'
            }
          }
        : {};
      const movies = await collections.movies.find(filter).sort({ title: 1 }).toArray();
      res.status(200).json(movies);
    } catch (error) {
      console.error('Error getting movies:', error);
      res.status(500).json({
        message: 'Error getting movies'
      });
    }
  };

  getMovieById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { movieId } = matchedData(req, {
        locations: ['params']
      });
      const movie = await collections.movies.findOne({
        _id: new ObjectId(movieId)
      });
      if (!movie) {
        res.status(404).json({
          message: 'Movie not found'
        });
        return;
      }
      res.status(200).json(movie);
    } catch (error) {
      console.error('Error getting movie:', error);
      res.status(500).json({
        message: 'Error getting movie'
      });
    }
  };

  createMovie = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = matchedData(req, {
        locations: ['body']
      }) as CreateMovieInput;
      const newMovie: Movie = {
        ...data
      };
      const result = await collections.movies.insertOne(newMovie);
      res.status(201).json({
        message: 'Successfully created a new movie',
        movieId: result.insertedId
      });
    } catch (error) {
      console.error('Error creating movie', error);
      res.status(500).json({
        message: 'Unable to create movie'
      });
    }
  };

  updateMovieById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { movieId } = matchedData(req, {
        locations: ['params']
      });
      const data = matchedData(req, {
        locations: ['body']
      }) as UpdateMovieInput;
      if (Object.keys(data).length === 0) {
        res.status(400).json({
          message: 'No movie fields provided for update'
        });
        return;
      }
      const updatedMovie: Partial<Movie> = {
        ...data
      };
      const result = await collections.movies.updateOne(
        {
          _id: new ObjectId(movieId)
        },
        {
          $set: updatedMovie
        }
      );
      if (result.matchedCount === 0) {
        res.status(404).json({
          message: 'Movie not found'
        });
        return;
      }
      res.status(200).json({
        message: result.modifiedCount > 0 ? 'Successfully updated movie' : 'Movie is already up to date'
      });
    } catch (error) {
      console.error('Error updating movie', error);
      res.status(500).json({
        message: 'Unable to update movie'
      });
    }
  };

  deleteMovieById = async (req: Request, res: Response): Promise<void> => {
    const { movieId } = matchedData(req, {
      locations: ['params']
    });
    const movieObjectId = new ObjectId(movieId);
    const session = mongoClient.startSession();
    try {
      let deletedShowtimes = 0;
      let deletedTickets = 0;
      await session.withTransaction(async () => {
        const movie = await collections.movies.findOne(
          {
            _id: movieObjectId
          },
          {
            session
          }
        );
        if (!movie) {
          throw new Error('MOVIE_NOT_FOUND');
        }
        const showtimes = await collections.showtimes
          .find(
            {
              movieId: movieObjectId
            },
            {
              session
            }
          )
          .toArray();
        const showtimeIds = showtimes.filter((showtime) => showtime._id).map((showtime) => showtime._id);
        if (showtimeIds.length > 0) {
          const protectedTicket = await collections.tickets.findOne(
            {
              showtimeId: {
                $in: showtimeIds
              },
              status: {
                $in: ['reserved', 'sold']
              }
            },
            {
              session
            }
          );
          if (protectedTicket) {
            throw new Error('MOVIE_HAS_PROTECTED_TICKETS');
          }
          const ticketResult = await collections.tickets.deleteMany(
            {
              showtimeId: {
                $in: showtimeIds
              }
            },
            {
              session
            }
          );
          deletedTickets = ticketResult.deletedCount;
          const showtimeResult = await collections.showtimes.deleteMany(
            {
              movieId: movieObjectId
            },
            {
              session
            }
          );
          deletedShowtimes = showtimeResult.deletedCount;
        }
        const movieResult = await collections.movies.deleteOne(
          {
            _id: movieObjectId
          },
          {
            session
          }
        );
        if (movieResult.deletedCount !== 1) {
          throw new Error('MOVIE_DELETE_FAILED');
        }
      });
      res.status(200).json({
        message: 'Movie, showtimes, and tickets deleted successfully',
        deletedMovies: 1,
        deletedShowtimes,
        deletedTickets
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'MOVIE_NOT_FOUND') {
        res.status(404).json({
          message: 'Movie not found'
        });
        return;
      }
      if (error instanceof Error && error.message === 'MOVIE_HAS_PROTECTED_TICKETS') {
        res.status(409).json({
          message: 'Movie cannot be deleted because one or more showtimes have reserved or sold tickets'
        });
        return;
      }
      console.error('Error deleting movie', error);
      res.status(500).json({
        message: 'Unable to delete movie'
      });
    } finally {
      await session.endSession();
    }
  };
}
