import { body, param } from 'express-validator';

import { ADMISSION_TYPES } from '../../types/prices.types';
import { SALES_CHANNELS } from '../../types/cart.types';

export const cartParamValidationRules = () => {
  return [param('cartId').isMongoId().withMessage('Cart ID must be a valid ObjectId')];
};

export const createCartValidationRules = () => {
  return [
    body('salesChannel')
      .isString()
      .withMessage('Sales channel must be a string')
      .isIn(SALES_CHANNELS)
      .withMessage('Sales channel must be a valid sales channel')
  ];
};

export const addTicketValidationRules = () => {
  return [
    body('ticketId').isMongoId().withMessage('Ticket ID must be a valid MongoDB ObjectId'),
    body('admissionType').isString().withMessage('Admission type must be a string').isIn(ADMISSION_TYPES).withMessage('Admission type must be valid')
  ];
};

export const updateTicketValidationRules = () => {
  return [
    body('admissionType').isString().withMessage('Admission type must be a string').isIn(ADMISSION_TYPES).withMessage('Admission type must be valid')
  ];
};

export const ticketIdParamValidationRules = () => {
  return [param('ticketId').isMongoId().withMessage('Ticket ID must be a valid MongoDB ObjectId')];
};

export const addConcessionValidaitonRules = () => {
  return [
    body('concessionId').isMongoId().withMessage('Concession ID must be a valid MongoDB ObjectId'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be an integer of at least 1')
  ];
};

export const concessionIdParamValidationRules = () => {
  return [param('concessionId').isMongoId().withMessage('Concession ID must be a valid MongoDB ObjectId')];
};

export const updateConcessionQuantityValidationRules = () => {
  return [body('quantity').isInt({ min: 1 }).withMessage('Quantity must be an integer of at least 1')];
};
