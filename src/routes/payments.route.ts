import { Router } from 'express';
import { requiresAuth } from 'express-openid-connect';

import { PaymentsController } from '../controllers/payments.controller';
import { validUser } from '../middleware/permissions.middleware';
import { completePaymentValidationRules } from '../middleware/validators/payments.validator';
import { validate } from '../middleware/validators/validate';

export const paymentRouter = Router();

const controller = new PaymentsController();

paymentRouter.post('/complete', requiresAuth(), validUser, completePaymentValidationRules(), validate, controller.completePayment);

export default paymentRouter;
