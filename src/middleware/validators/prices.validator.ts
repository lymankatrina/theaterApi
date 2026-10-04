import { body, param } from 'express-validator';

import { ADMISSION_TYPES } from '../../types/prices.types';

export const priceIdParamValidationRules = () => {
  return [param('priceId').isMongoId().withMessage('Price ID must be a valid ObjectId')];
};

export const priceValidationRules = () => {
  return [
    body('admissionType')
      .isString()
      .withMessage('Admission type must be a string')
      .trim()
      .isIn([...ADMISSION_TYPES])
      .withMessage('Admission type must be a valid admission type'),
    body('priceInCents').isInt({ min: 0 }).withMessage('priceInCents must be a non-negative number')
  ];
};

export const updatePriceValidationRules = () => {
  return [body('priceInCents').isInt({ min: 0 }).withMessage('priceInCents must be a non-negative integer')];
};
