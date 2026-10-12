import type { Db } from 'mongodb';

import { COLLECTION_NAMES } from '../config/collectionNames';
import { CONCESSION_CATEGORIES } from '../types/concessions.types';
import { TAX_TYPES } from '../types/tax.types';
import { applySchemaValidator } from './schemaValidator';

export const applySchemaValidation = async (db: Db): Promise<void> => {
  const jsonSchema = {
    bsonType: 'object',
    required: ['_id', 'name', 'category', 'priceInCents', 'taxType', 'isActive'],
    additionalProperties: false,
    properties: {
      _id: {
        bsonType: 'objectId'
      },
      name: {
        bsonType: 'string',
        description: 'Name describes the concession item and must be a string'
      },
      description: {
        bsonType: 'string',
        description: 'Optionally describes the concession item'
      },
      category: {
        bsonType: 'string',
        enum: CONCESSION_CATEGORIES,
        description: 'Must be a valid concession category type'
      },
      priceInCents: {
        bsonType: 'int',
        minimum: 0,
        description: 'Price must be a non-negative integer in cents'
      },
      taxType: {
        bsonType: 'string',
        enum: TAX_TYPES,
        description: 'Must be a valid tax type'
      },
      isActive: {
        bsonType: 'bool',
        description: 'Identifies if the item is active or discontinued'
      }
    }
  };

  await applySchemaValidator(db, COLLECTION_NAMES.concessions, jsonSchema);
};
