import { Router } from 'express';
import { requiresAuth } from 'express-openid-connect';
import { TicketsController } from '../controllers/tickets.controller';
import { validAdmin } from '../middleware/permissions.middleware';
import { validate } from '../middleware/validators/validate';
import { showtimeIdParamValidationRules, showtimeIdQueryValidationRules } from '../middleware/validators/showtimes.validator';

const ticketsRouter = Router();
const controller = new TicketsController();

ticketsRouter.get('/', showtimeIdQueryValidationRules(), validate, controller.getTickets);

ticketsRouter.post(
  '/admin/:showtimeId',
  requiresAuth(),
  showtimeIdParamValidationRules(),
  validAdmin,
  validate,
  controller.generateTicketsFromShowtime
);

export { ticketsRouter };
