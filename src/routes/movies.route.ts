import { Router } from 'express';
import { requiresAuth } from 'express-openid-connect';
import { MoviesController } from '../controllers/movies.controller';
import { validAdmin } from '../middleware/permissions.middleware';
import {
  movieIdParamValidationRules,
  movieTitleQueryValidationRules,
  movieValidationRules,
  updateMovieValidationRules
} from '../middleware/validators/movies.validator';
import { validate } from '../middleware/validators/validate';

export const movieRouter = Router();

const controller = new MoviesController();

movieRouter.get('/', movieTitleQueryValidationRules(), validate, controller.getMovies);
movieRouter.get('/:movieId', movieIdParamValidationRules(), validate, controller.getMovieById);
movieRouter.post('/', requiresAuth(), validAdmin, movieValidationRules(), validate, controller.createMovie);
movieRouter.put(
  '/:movieId',
  requiresAuth(),
  validAdmin,
  movieIdParamValidationRules(),
  updateMovieValidationRules(),
  validate,
  controller.updateMovieById
);
movieRouter.delete('/:movieId', requiresAuth(), validAdmin, movieIdParamValidationRules(), validate, controller.deleteMovieById);

export default movieRouter;
