import * as mongoDB from 'mongodb';
import type { Db } from 'mongodb';

import { COLLECTION_NAMES } from '../config/collectionNames';
import { ADMISSION_TYPES } from '../types/prices.types';

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

  const collectionName = COLLECTION_NAMES.prices;
  const validator = {
    $jsonSchema: jsonSchema
  };

  try {
    await db.command({
      collMod: collectionName,
      validator
    });
  } catch (error) {
    if (error instanceof mongoDB.MongoServerError && error.codeName === 'NamespaceNotFound') {
      await db.createCollection(collectionName, { validator });
    } else {
      throw error;
    }
  }
};
