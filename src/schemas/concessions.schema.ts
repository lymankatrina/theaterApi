import * as mongoDB from 'mongodb';
import type { Db } from 'mongodb';

import { COLLECTION_NAMES } from '../config/collectionNames';
import { CONCESSION_CATEGORIES } from '../types/concessions.types';

export const applySchemaValidation = async (db: Db): Promise<void> => {
  const jsonSchema = {
    bsonType: 'object',
    required: ['_id', 'name', 'category', 'priceInCents', 'isActive'],
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
      isActive: {
        bsonType: 'bool',
        description: 'Identifies if the item is active or discontinued'
      }
    }
  };
  const collectionName = COLLECTION_NAMES.concessions;
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
