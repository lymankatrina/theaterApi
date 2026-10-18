import type { Db } from 'mongodb';
import { applySchemaValidator } from './schemaValidator';
import { COLLECTION_NAMES } from '../config/collectionNames';

import { CONTENT_STATUSES, EVENT_TYPES } from '../types/events.types';

export async function applySchemaValidation(db: Db): Promise<void> {
  const jsonSchema = {
    bsonType: 'object',
    required: [
      '_id',
      'title',
      'tagline',
      'description',
      'startDate',
      'endDate',
      'startTime',
      'endTime',
      'image',
      'type',
      'postStartDate',
      'postEndDate',
      'status'
    ],
    additionalProperties: false,
    properties: {
      _id: {
        bsonType: 'objectId'
      },
      title: {
        bsonType: 'string',
        minLength: 1,
        maxLength: 85,
        description: "'title' is required and is a string"
      },
      tagline: {
        bsonType: 'string',
        minLength: 1,
        maxLength: 85,
        description: "'tagline' is required and is a string"
      },
      description: {
        bsonType: 'string',
        minLength: 1,
        maxLength: 850,
        description: "'description' is required and is a string"
      },
      startDate: {
        bsonType: 'string',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        description: 'Start date must be in YYYY-MM-DD format'
      },
      endDate: {
        bsonType: 'string',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        description: 'End date must be in YYYY-MM-DD format'
      },
      startTime: {
        bsonType: 'string',
        pattern: '^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$',
        description: 'Start time must be in hh:mm AM/PM format'
      },
      endTime: {
        bsonType: 'string',
        pattern: '^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$',
        description: 'End time must be in hh:mm AM/PM format'
      },
      image: {
        bsonType: 'string',
        description: 'Image must be a url link to a publicly shared image'
      },
      link: {
        bsonType: 'string',
        description: 'Link must be a url link to a shareable source'
      },
      type: {
        bsonType: 'string',
        enum: [...EVENT_TYPES],
        description: 'Type must be a valid event type'
      },
      postStartDate: {
        bsonType: 'string',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        description: 'Post start date must be in YYYY-MM-DD format'
      },
      postEndDate: {
        bsonType: 'string',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        description: 'Post end date must be in YYYY-MM-DD format'
      },
      status: {
        bsonType: 'string',
        enum: [...CONTENT_STATUSES],
        description: 'Status must be Public or Private'
      }
    }
  };

  await applySchemaValidator(db, COLLECTION_NAMES.events, jsonSchema);
}
