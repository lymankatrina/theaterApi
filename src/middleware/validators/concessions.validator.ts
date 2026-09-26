import { body, param, query } from 'express-validator';

import { CONCESSION_CATEGORIES } from '../../types/concessions.types';

export const concessionsQueryValidationRules = () => {
  return [
    query('search')
      .optional()
      .isString()
      .withMessage('Search must be a string')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Search must be between 1 and 100 characters')
  ];
};

export const concessionsParamValidationRules = () => {
  return [param('concessionId').isMongoId().withMessage('Concession ID must be a valid ObjectId')];
};

const concessionFieldValidationRules = (isUpdate = false) => {
  const field = (name: string) => {
    const chain = body(name);
    return isUpdate ? chain.optional() : chain;
  };
  return [
    field('name')
      .isString()
      .withMessage('Name is required and must be a string')
      .bail()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    body('description')
      .optional()
      .isString()
      .withMessage('Description must be a string')
      .bail()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Description cannot exceed 200 characters'),
    field('category')
      .isString()
      .withMessage('Concession category must be a string')
      .bail()
      .trim()
      .toLowerCase()
      .isIn([...CONCESSION_CATEGORIES])
      .withMessage('Concession category must be valid'),
    field('priceInCents').isInt({ min: 0 }).withMessage('Price in cents must be a non negative integer'),
    field('isActive').isBoolean().withMessage('isActive must be true or false')
  ];
};

export const concessionValidationRules = () => {
  return concessionFieldValidationRules(false);
};

export const updateConcessionValidationRules = () => {
  return concessionFieldValidationRules(true);
};
