import * as mongoDB from 'mongodb';
import type { Db } from 'mongodb';

import { COLLECTION_NAMES } from '../config/collectionNames';
import { SHOWTIME_TYPES } from '../types/showtimes.types';

export const applySchemaValidation = async (db: Db): Promise<void> => {
  const jsonSchema = {
    bsonType: 'object',
    required: ['_id', 'movieId', 'date', 'time', 'showtimeType'],
    additionalProperties: false,
    properties: {
      _id: {
        bsonType: 'objectId'
      },
      movieId: {
        bsonType: 'objectId',
        description: 'Movie ID must reference a movie'
      },
      date: {
        bsonType: 'string',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        description: 'Date must be in YYYY-MM-DD format'
      },
      time: {
        bsonType: 'string',
        pattern: '^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$',
        description: 'Time must be in hh:mm AM/PM format'
      },
      showtimeType: {
        bsonType: 'string',
        enum: SHOWTIME_TYPES,
        description: 'Must be a valid showtime type'
      }
    }
  };
  const collectionName = COLLECTION_NAMES.showtimes;
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
