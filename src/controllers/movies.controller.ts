import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { matchedData } from 'express-validator';

import type { Movie } from '../models/movies.model';
import type { 
  CreateMovieInput, 
  UpdateMovieInput 
} from '../dto/movies.dto';

import { collections } from '../services/database.services';

export class MoviesController {
  getMovies = async (
    _req: Request, 
    res: Response
  ): Promise<void> => {
    try {
      const movies = await collections.movies
        .find()
        .sort({ title: 1 })
        .toArray();
      res.status(200).json(movies);
    } catch (error) {
      console.error('Error getting movies:', error);
      res.status(500).json({
        message: 'Error getting movies'
      });
    }
  };

  getMovieById = async (
    req: Request, 
    res: Response
  ): Promise<void> => {
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

  searchByTitle = async (
    req: Request, 
    res: Response
  ): Promise<void> => {
    try {
      const { title } = matchedData(req, {
        locations: ['params']
      });
      const escapedTitle = title.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
      );
      const movies = await collections.movies
        .find({
          title: {
            $regex: escapedTitle,
            $options: 'i'
          }
        })
        .sort({ title: 1 })
        .toArray();
      res.status(200).json(movies);
    } catch (error) {
      console.error(
        'Error searching by title', 
        error
      );
      res.status(500).json({ 
        message: 'Error searching by movie title' 
      });
    }
  };

  createMovie = async (
    req: Request, 
    res: Response
  ): Promise<void> => {
    try {
      const data = matchedData(req, {
        locations: ['body']
      }) as CreateMovieInput;
      const newMovie: Movie = {
        ...data
      };
      const result = 
        await collections.movies.insertOne(
          newMovie
        );
      res.status(201).json({ 
        message: 'Successfully created a new movie',
        movieId: result.insertedId
      });
    } catch (error) {
      console.error(
        'Error creating movie', 
        error
      );
      res.status(500).json({ 
        message: 'Unable to create movie' 
      });
    }
  };

  updateMovieById = async (
    req: Request, 
    res: Response
  ): Promise<void> => {
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
      const result = 
        await collections.movies.updateOne(
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
        message:
          result.modifiedCount > 0
            ? 'Successfully updated movie'
            : 'Movie is already up to date'
      });
    } catch (error) {
      console.error(
        'Error updating movie', 
        error
      );
      res.status(500).json({
        message: 'Unable to update movie'
      });
    }
  };
}
