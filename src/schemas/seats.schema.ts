import type { Db } from 'mongodb';

import { COLLECTION_NAMES } from '../config/collectionNames';
import { SECTION_TYPES } from '../types/seats.types';
import { applySchemaValidator } from './schemaValidator';

export const applySchemaValidation = async (db: Db): Promise<void> => {
  const jsonSchema = {
    bsonType: 'object',
    required: ['_id', 'section', 'row', 'seat', 'isWheelchair'],
    additionalProperties: false,
    properties: {
      _id: {
        bsonType: 'objectId'
      },
      section: {
        bsonType: 'string',
        enum: SECTION_TYPES
      },
      row: {
        bsonType: 'int',
        minimum: 1,
        maximum: 19
      },
      seat: {
        bsonType: 'int',
        minimum: 1,
        maximum: 8
      },
      isWheelchair: {
        bsonType: 'bool'
      }
    }
  };

  await applySchemaValidator(db, COLLECTION_NAMES.seats, jsonSchema);
};
