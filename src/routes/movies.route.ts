import express from 'express';
import { MoviesController } from '../controllers/movies.controller';
import { 
  movieIdParamValidationRules,
  movieTitleParamValidationRules,
} from '../middleware/validators/movies.validator';
import { validate } from '../middleware/validators/validate';

export const movieRouter = express.Router();

const controller = new MoviesController();

movieRouter.get(
  '/all', 
  controller.getMovies
);
movieRouter.get(
  '/search/:title', 
  movieTitleParamValidationRules(),
  validate,
  controller.searchByTitle
);
movieRouter.get(
  '/:movieId', 
  movieIdParamValidationRules(),
  validate,
  controller.getMovieById
);

export default movieRouter;