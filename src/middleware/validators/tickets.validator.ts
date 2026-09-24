import { body, param } from 'express-validator';
import { TICKET_STATUS_TYPES } from '../../types/tickets.types';

const ticketIdParamValidationRules = () => {
  return [param('ticketId').isMongoId().withMessage('Ticket ID must be a valid ObjectId')];
};

const updateTicketValidationRules = () => {
  return [
    body('status')
      .optional()
      .isString()
      .withMessage('Ticket status must be a string')
      .bail()
      .trim()
      .toLowerCase()
      .isIn([...TICKET_STATUS_TYPES])
      .withMessage('Status must be a valid Ticket Status type')
  ];
};

export { ticketIdParamValidationRules, updateTicketValidationRules };
