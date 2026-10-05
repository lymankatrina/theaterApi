import * as mongoDB from 'mongodb';
import type { Db } from 'mongodb';

import { COLLECTION_NAMES } from '../config/collectionNames';
import { ADMISSION_TYPES } from '../types/prices.types';
import { CART_STATUSES, SALES_CHANNELS } from '../types/cart.types';

export const applySchemaValidation = async (db: Db): Promise<void> => {
  const jsonSchema = {
    bsonType: 'object',
    required: ['_id', 'ticketItems', 'concessionItems', 'status', 'salesChannel', 'createdAt', 'updatedAt'],
    additionalProperties: false,
    properties: {
      _id: {
        bsonType: 'objectId',
        description: 'Must be an ObjectId and is required'
      },
      ticketItems: {
        bsonType: 'array',
        items: {
          bsonType: 'object',
          required: ['ticketId', 'admissionType', 'priceInCents'],
          additionalProperties: false,
          properties: {
            ticketId: {
              bsonType: 'objectId'
            },
            admissionType: {
              bsonType: 'string',
              enum: [...ADMISSION_TYPES]
            },
            priceInCents: {
              bsonType: 'int',
              minimum: 0
            }
          }
        }
      },
      concessionItems: {
        bsonType: 'array',
        items: {
          bsonType: 'object',
          required: ['concessionId', 'quantity', 'priceInCents'],
          additionalProperties: false,
          properties: {
            concessionId: {
              bsonType: 'objectId'
            },
            quantity: {
              bsonType: 'int',
              minimum: 1
            },
            priceInCents: {
              bsonType: 'int',
              minimum: 0
            }
          }
        }
      },
      status: {
        bsonType: 'string',
        enum: [...CART_STATUSES],
        description: 'Cart status must be a valid cart status type'
      },
      salesChannel: {
        bsonType: 'string',
        enum: [...SALES_CHANNELS],
        description: 'Sales channel must be a valid sales channel type'
      },
      createdAt: {
        bsonType: 'date',
        description: 'Date stamp when cart is created is required'
      },
      updatedAt: {
        bsonType: 'date',
        description: 'Date stamp when cart is updated is required'
      },
      expiresAt: {
        bsonType: 'date',
        description: 'Date stamp when cart expires'
      },
      userId: {
        bsonType: 'objectId',
        description: 'User ID is the mongoDB ObjectId of the authenticated user and is required if the sales channel is online'
      },
      employeeId: {
        bsonType: 'objectId',
        description:
          'Employee ID is the mongoDB ObjectId of the authenticated employee and is required if the sales channel is ticket-window or concession-stand'
      }
    }
  };

  const collectionName = COLLECTION_NAMES.carts;
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
