import { Router } from 'express';

import { requiresAuth } from 'express-openid-connect';

import { ConcessionsController } from '../controllers/concessions.controller';

import { validAdmin } from '../middleware/permissions.middleware';
import {
  concessionsParamValidationRules,
  concessionsQueryValidationRules,
  concessionValidationRules,
  updateConcessionValidationRules
} from '../middleware/validators/concessions.validator';
import { validate } from '../middleware/validators/validate';

export const concessionRouter = Router();

const controller = new ConcessionsController();

concessionRouter.get('/', concessionsQueryValidationRules(), validate, controller.getConcessions);

concessionRouter.get('/admin', requiresAuth(), validAdmin, concessionsQueryValidationRules(), validate, controller.getAllConcessions);

concessionRouter.get('/:concessionId', concessionsParamValidationRules(), validate, controller.getConcessionById);

concessionRouter.post('/', requiresAuth(), validAdmin, concessionValidationRules(), validate, controller.createConcession);

concessionRouter.put(
  '/:concessionId',
  requiresAuth(),
  validAdmin,
  concessionsParamValidationRules(),
  updateConcessionValidationRules(),
  validate,
  controller.updateConcessionById
);

export default concessionRouter;
