import type { Db } from 'mongodb';

import { COLLECTION_NAMES } from '../config/collectionNames';
import { ADMISSION_TYPES } from '../types/prices.types';
import { applySchemaValidator } from './schemaValidator';

export const applySchemaValidation = async (db: Db): Promise<void> => {
  const jsonSchema = {
    bsonType: 'object',
    required: ['_id', 'admissionType', 'priceInCents'],
    additionalProperties: false,
    properties: {
      _id: {
        bsonType: 'objectId',
        description: 'Must be an ObjectId and is required'
      },
      admissionType: {
        bsonType: 'string',
        enum: [...ADMISSION_TYPES],
        description: 'Admission type must be valid and is required'
      },
      priceInCents: {
        bsonType: 'int',
        minimum: 0,
        description: 'Price must be a non-negative integer in cents'
      }
    }
  };

  await applySchemaValidator(db, COLLECTION_NAMES.prices, jsonSchema);
};
