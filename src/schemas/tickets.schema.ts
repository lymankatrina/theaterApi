import * as mongoDB from 'mongodb';
import type { Db } from 'mongodb';
import { TICKET_STATUS_TYPES } from '../types/tickets.types';
import { COLLECTION_NAMES } from '../config/collectionNames';

const collectionName = COLLECTION_NAMES.tickets;

export async function applySchemaValidation(db: Db): Promise<void> {
  const jsonSchema = {
    bsonType: 'object',
    required: ['_id', 'showtimeId', 'seatId', 'status'],
    additionalProperties: false,
    properties: {
      _id: {
        bsonType: 'objectId',
        description: 'Unique identifier automatically assigned by MongoDB'
      },
      showtimeId: {
        bsonType: 'objectId',
        description: 'Showtime ID must be the ObjectId of the showtime'
      },
      seatId: {
        bsonType: 'objectId',
        description: 'Seat ID must be the ObjectId of the physical seat'
      },
      status: {
        bsonType: 'string',
        enum: [...TICKET_STATUS_TYPES],
        description: 'Status should be a valid ticket status'
      },
      buyerId: {
        bsonType: 'objectId',
        description: 'Buyer Id must be the ObjectId of the user'
      },
      addedAt: {
        bsonType: 'date',
        description: 'Date and time when the reservation was made'
      }
    }
  };

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
}
