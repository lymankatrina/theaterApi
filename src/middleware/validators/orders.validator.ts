import { body, param } from 'express-validator';

export const orderValidationRules = () => {
  return [body('cartId').isMongoId().withMessage('Cart ID must be a valid ObjectId')];
};

export const orderIdParamValidationRules = () => {
  return [param('orderId').isMongoId().withMessage('Order ID must be a valid ObjectId')];
};
