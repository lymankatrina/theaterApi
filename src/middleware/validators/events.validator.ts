import { body, param } from 'express-validator';

import { EVENT_TYPES, CONTENT_STATUSES } from '../../types/events.types';

import { validDateString } from '../../helpers/validationHelpers';

export const eventIdParamValidationRules = () => {
  return [param('eventId').isMongoId().withMessage('Event ID must be a valid ObjectId')];
};

const eventFieldValidationRules = (isUpdate = false) => {
  const field = (name: string) => {
    const chain = body(name);
    return isUpdate ? chain.optional() : chain;
  };
  return [
    field('title')
      .isString()
      .withMessage('Event title is required and must be a string')
      .trim()
      .isLength({ min: 1, max: 85 })
      .withMessage('Event title must be between 1 and 85 characters'),
    field('tagline')
      .isString()
      .withMessage('Tagline is required and must be a string')
      .trim()
      .isLength({ min: 1, max: 85 })
      .withMessage('Tagline must be between 1 and 85 characters'),
    field('description')
      .isString()
      .withMessage('Description is required and must be a string')
      .trim()
      .isLength({ min: 1, max: 850 })
      .withMessage('Description must be between 1 and 850 characters'),
    field('startDate').isString().withMessage('Start Date must be a string').trim().custom(validDateString),
    field('endDate').isString().withMessage('End Date must be a string').trim().custom(validDateString),
    field('startTime')
      .isString()
      .withMessage('Start time must be a string')
      .trim()
      .matches(/^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/)
      .withMessage('Start time must be in the hh:mm AM/PM format'),
    field('endTime')
      .isString()
      .withMessage('End time must be a string')
      .trim()
      .matches(/^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/)
      .withMessage('End time must be in the hh:mm AM/PM format'),
    field('image')
      .isString()
      .trim()
      .isURL({
        require_protocol: true,
        protocols: ['http', 'https']
      })
      .withMessage('Image must be a valid HTTP or HTTPS URL to a publicly shared image'),
    body('link')
      .optional()
      .isString()
      .trim()
      .isURL({
        require_protocol: true,
        protocols: ['http', 'https']
      })
      .withMessage('Link must be a valid HTTP or HTTPS URL to a shareable event link'),
    field('type')
      .trim()
      .isString()
      .withMessage('Type must be a string and is required')
      .isIn([...EVENT_TYPES])
      .withMessage('Type must be a valid event type'),
    field('postStartDate').isString().withMessage('Post start Date must be a string').trim().custom(validDateString),
    field('postEndDate').isString().withMessage('Post end Date must be a string').trim().custom(validDateString),
    field('status')
      .trim()
      .isString()
      .withMessage('Status must be a string and is required')
      .isIn([...CONTENT_STATUSES])
      .withMessage('Status must be a valid content status')
  ];
};

export const eventValidationRules = () => {
  return [
    ...eventFieldValidationRules(false),
    body('endDate').custom((endDate, { req }) => {
      if (endDate < req.body.startDate) {
        throw new Error('End date must be on or after start date');
      }
      return true;
    }),
    body('postEndDate').custom((postEndDate, { req }) => {
      if (postEndDate < req.body.postStartDate) {
        throw new Error('Post end date must be on or after post start date');
      }
      return true;
    })
  ];
};

export const updateEventValidationRules = () => {
  return eventFieldValidationRules(true);
};
