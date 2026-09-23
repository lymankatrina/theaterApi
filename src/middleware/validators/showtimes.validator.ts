import { body, param } from 'express-validator';

import { SHOWTIME_TYPES } from '../../types/showtimes.types';
import { validDateString } from '../../helpers/validationHelpers';

const showtimeIdParamValidationRules = () => {
  return [param('showtimeId').isMongoId().withMessage('Showtime ID must be a valid ObjectId')];
};

const showtimeValidationRules = () => {
  return [
    body('movieId').notEmpty().withMessage('Movie ID is required').bail().isMongoId().withMessage('Movie ID must be a valid ObjectId'),
    body('startDate').isString().withMessage('Start date must be a string').bail().trim().custom(validDateString),
    body('endDate')
      .isString()
      .withMessage('End date must be a string')
      .bail()
      .trim()
      .custom(validDateString)
      .bail()
      .custom((endDate, { req }) => {
        const startDate = req.body.startDate;
        if (startDate && endDate < startDate) {
          throw new Error('End date must be on or after the start date');
        }
        return true;
      }),
    body('time')
      .isString()
      .withMessage('Time must be a string')
      .bail()
      .trim()
      .matches(/^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/)
      .withMessage('Time should be in the hh:mm AM/PM format'),
    body('showtimeType')
      .isString()
      .withMessage('Showtime type must be a string')
      .bail()
      .trim()
      .toLowerCase()
      .isIn([...SHOWTIME_TYPES])
      .withMessage('Showtime type must be valid')
  ];
};

const updateShowtimeValidationRules = () => {
  return [
    body('movieId').optional().isMongoId().withMessage('Movie ID must be a valid ObjectId'),
    body('date').optional().isString().withMessage('Date must be a string').bail().trim().custom(validDateString),
    body('time')
      .optional()
      .isString()
      .withMessage('Time must be a string')
      .bail()
      .trim()
      .matches(/^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/)
      .withMessage('Time should be in the hh:mm AM/PM format'),
    body('showtimeType')
      .optional()
      .isString()
      .withMessage('Showtime type must be a string')
      .bail()
      .trim()
      .toLowerCase()
      .isIn([...SHOWTIME_TYPES])
      .withMessage('Showtime type must be valid')
  ];
};

export { showtimeValidationRules, updateShowtimeValidationRules, showtimeIdParamValidationRules };
