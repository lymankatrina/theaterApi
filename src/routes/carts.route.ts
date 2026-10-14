import { Router } from 'express';
import { CartsController } from '../controllers/carts.controller';

import { requiresAuth } from 'express-openid-connect';
import { validUser } from '../middleware/permissions.middleware';
import { validate } from '../middleware/validators/validate';

import {
  addConcessionValidationRules,
  addTicketValidationRules,
  cartParamValidationRules,
  concessionIdParamValidationRules,
  createCartValidationRules,
  ticketIdParamValidationRules,
  updateConcessionQuantityValidationRules,
  updateTicketValidationRules
} from '../middleware/validators/carts.validator';

export const cartRouter = Router();

const controller = new CartsController();

cartRouter.get('/:cartId', requiresAuth(), validUser, cartParamValidationRules(), validate, controller.getCartById);

cartRouter.post('/', requiresAuth(), validUser, createCartValidationRules(), validate, controller.createCart);

cartRouter.post(
  '/:cartId/tickets',
  requiresAuth(),
  validUser,
  cartParamValidationRules(),
  addTicketValidationRules(),
  validate,
  controller.addTicketToCart
);

cartRouter.put(
  '/:cartId/tickets/:ticketId',
  requiresAuth(),
  validUser,
  cartParamValidationRules(),
  ticketIdParamValidationRules(),
  updateTicketValidationRules(),
  validate,
  controller.updateCartTicket
);

cartRouter.delete(
  '/:cartId/tickets/:ticketId',
  requiresAuth(),
  validUser,
  cartParamValidationRules(),
  ticketIdParamValidationRules(),
  validate,
  controller.removeTicketFromCart
);

cartRouter.post(
  '/:cartId/concessions',
  requiresAuth(),
  validUser,
  cartParamValidationRules(),
  addConcessionValidationRules(),
  validate,
  controller.addConcessionToCart
);

cartRouter.put(
  '/:cartId/concessions/:concessionId',
  requiresAuth(),
  validUser,
  cartParamValidationRules(),
  concessionIdParamValidationRules(),
  updateConcessionQuantityValidationRules(),
  validate,
  controller.updateConcessionQuantity
);

cartRouter.delete(
  '/:cartId/concessions/:concessionId',
  requiresAuth(),
  validUser,
  cartParamValidationRules(),
  concessionIdParamValidationRules(),
  validate,
  controller.removeConcessionFromCart
);
