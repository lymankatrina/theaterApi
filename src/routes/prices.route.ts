import { Router } from 'express';
import { requiresAuth } from 'express-openid-connect';
import { PricesController } from '../controllers/prices.controller';
import { validAdmin } from '../middleware/permissions.middleware';
import { priceIdParamValidationRules, priceValidationRules, updatePriceValidationRules } from '../middleware/validators/prices.validator';
import { validate } from '../middleware/validators/validate';

export const priceRouter = Router();

const controller = new PricesController();

priceRouter.get('/', controller.getPrices);
priceRouter.get('/:priceId', priceIdParamValidationRules(), validate, controller.getPriceById);
priceRouter.post('/', requiresAuth(), validAdmin, priceValidationRules(), validate, controller.createPrice);
priceRouter.put(
  '/:priceId',
  requiresAuth(),
  validAdmin,
  priceIdParamValidationRules(),
  updatePriceValidationRules(),
  validate,
  controller.updatePriceById
);

export default priceRouter;
