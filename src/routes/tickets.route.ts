import { Router } from 'express';
import { requiresAuth } from 'express-openid-connect';
import { TicketsController } from '../controllers/tickets.controller';
import { validAdmin } from '../middleware/permissions.middleware';
import { validate } from '../middleware/validators/validate';
import { showtimeIdParamValidationRules } from '../middleware/validators/showtimes.validator';

const ticketsRouter = Router();
const controller = new TicketsController();

ticketsRouter.post(
  '/generate/:showtimeId',
  requiresAuth(),
  showtimeIdParamValidationRules(),
  validAdmin,
  validate,
  controller.generateTicketsFromShowtime
);

export { ticketsRouter };
