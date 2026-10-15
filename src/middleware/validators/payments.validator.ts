import { body } from 'express-validator';

import { PAYMENT_PROVIDERS } from '../../types/payments.types';

export const completePaymentValidationRules = () => [
  body('orderId').isMongoId().withMessage('Order ID must be a valid ObjectId'),
  body('paymentProvider').isString().withMessage('Payment provider must be a string').isIn(PAYMENT_PROVIDERS).withMessage('Invalid payment provider'),
  body('paymentId').isString().withMessage('Payment ID must be a string').notEmpty().withMessage('Payment ID is required')
];
