import { Router } from 'express';
import { requiresAuth } from 'express-openid-connect';
import { EventsController } from '../controllers/events.controller';
import { validAdmin } from '../middleware/permissions.middleware';
import {
  eventIdParamValidationRules,
  eventValidationRules,
  updateEventValidationRules,
  eventQueryValidationRules
} from '../middleware/validators/events.validator';

import { validate } from '../middleware/validators/validate';

export const eventRouter = Router();

const controller = new EventsController();

eventRouter.get('/', controller.getCurrentEvents);
eventRouter.get('/admin', requiresAuth(), validAdmin, eventQueryValidationRules(), validate, controller.getEvents);
eventRouter.get('/admin/:eventId', requiresAuth(), validAdmin, eventIdParamValidationRules(), validate, controller.getEventById);
eventRouter.post('/admin', requiresAuth(), validAdmin, eventValidationRules(), validate, controller.createEvent);
eventRouter.put(
  '/admin/:eventId',
  requiresAuth(),
  validAdmin,
  eventIdParamValidationRules(),
  updateEventValidationRules(),
  validate,
  controller.updateEventById
);
eventRouter.delete('/admin/:eventId', requiresAuth(), validAdmin, eventIdParamValidationRules(), validate, controller.deleteEventById);

export default eventRouter;
