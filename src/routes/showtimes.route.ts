import express from 'express';

import { requiresAuth } from 'express-openid-connect';

import { ShowtimesController } from '../controllers/showtimes.controller';

import { validAdmin } from '../middleware/permissions.middleware';

import { movieIdQueryValidationRules } from '../middleware/validators/movies.validator';

import { showtimeIdParamValidationRules, showtimeValidationRules } from '../middleware/validators/showtimes.validator';

import { validate } from '../middleware/validators/validate';

export const showtimeRouter = express.Router();
const controller = new ShowtimesController();

showtimeRouter.get('/', movieIdQueryValidationRules(), validate, controller.getShowtimes);
showtimeRouter.get('/:showtimeId', showtimeIdParamValidationRules(), validate, controller.getShowtimeById);
showtimeRouter.post('/', requiresAuth(), validAdmin, showtimeValidationRules(), validate, controller.createShowtimes);
showtimeRouter.delete('/:showtimeId', requiresAuth(), validAdmin, showtimeIdParamValidationRules(), validate, controller.deleteShowtime);

export default showtimeRouter;
