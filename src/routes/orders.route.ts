import { Router } from 'express';
import { OrdersController } from '../controllers/orders.controller';

import { requiresAuth } from 'express-openid-connect';
import { validUser } from '../middleware/permissions.middleware';
import { validate } from '../middleware/validators/validate';

import { orderIdParamValidationRules, orderValidationRules } from '../middleware/validators/orders.validator';

export const orderRouter = Router();
const controller = new OrdersController();

orderRouter.post('/', requiresAuth(), validUser, orderValidationRules(), validate, controller.createOrder);

orderRouter.get('/:orderId', requiresAuth(), validUser, orderIdParamValidationRules(), validate, controller.getOrderById);
