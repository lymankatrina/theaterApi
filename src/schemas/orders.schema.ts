import type { Db } from 'mongodb';

import { COLLECTION_NAMES } from '../config/collectionNames';
import { ADMISSION_TYPES } from '../types/prices.types';
import { ORDER_STATUSES } from '../types/orders.types';
import { SALES_CHANNELS } from '../types/salesChannels.types';
import { SECTION_TYPES } from '../types/seats.types';
import { applySchemaValidator } from './schemaValidator';

export const applySchemaValidation = async (db: Db): Promise<void> => {
  const jsonSchema = {
    bsonType: 'object',
    required: [
      '_id',
      'cartId',
      'ticketItems',
      'concessionItems',
      'orderStatus',
      'subtotalInCents',
      'taxInCents',
      'totalInCents',
      'salesChannel',
      'createdAt'
    ],
    additionalProperties: false,
    properties: {
      _id: {
        bsonType: 'objectId',
        description: 'Must be an ObjectId and is required'
      },
      cartId: {
        bsonType: 'objectId',
        description: 'Must be the mongoDB objectId of the cart'
      },
      ticketItems: {
        bsonType: 'array',
        items: {
          bsonType: 'object',
          required: [
            'ticketId',
            'showtimeId',
            'seatId',
            'movieTitle',
            'showDate',
            'showTime',
            'section',
            'row',
            'seat',
            'admissionType',
            'priceInCents',
            'taxRate',
            'taxInCents'
          ],
          additionalProperties: false,
          properties: {
            ticketId: {
              bsonType: 'objectId'
            },
            showtimeId: {
              bsonType: 'objectId'
            },
            seatId: {
              bsonType: 'objectId'
            },
            movieTitle: {
              bsonType: 'string'
            },
            showDate: {
              bsonType: 'string'
            },
            showTime: {
              bsonType: 'string'
            },
            section: {
              bsonType: 'string',
              enum: [...SECTION_TYPES]
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
            admissionType: {
              bsonType: 'string',
              enum: [...ADMISSION_TYPES]
            },
            priceInCents: {
              bsonType: 'int',
              minimum: 0
            },
            taxRate: {
              bsonType: 'number',
              minimum: 0
            },
            taxInCents: {
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
          required: ['concessionId', 'name', 'quantity', 'priceInCents', 'taxRate', 'taxInCents'],
          additionalProperties: false,
          properties: {
            concessionId: {
              bsonType: 'objectId'
            },
            name: {
              bsonType: 'string'
            },
            quantity: {
              bsonType: 'int',
              minimum: 1
            },
            priceInCents: {
              bsonType: 'int',
              minimum: 0
            },
            taxRate: {
              bsonType: 'number',
              minimum: 0
            },
            taxInCents: {
              bsonType: 'int',
              minimum: 0
            }
          }
        }
      },
      orderStatus: {
        bsonType: 'string',
        enum: [...ORDER_STATUSES],
        description: 'Order status must be a valid order status type'
      },
      subtotalInCents: {
        bsonType: 'int',
        minimum: 0,
        description: 'Subtotal before tax in cents'
      },
      taxInCents: {
        bsonType: 'int',
        minimum: 0,
        description: 'Total tax charged in cents'
      },
      totalInCents: {
        bsonType: 'int',
        minimum: 0,
        description: 'Final order total including tax in cents'
      },
      salesChannel: {
        bsonType: 'string',
        enum: [...SALES_CHANNELS],
        description: 'Sales channel must be a valid sales channel type'
      },
      createdAt: {
        bsonType: 'date',
        description: 'Date stamp when order is created is required'
      },
      userId: {
        bsonType: 'objectId',
        description: 'User ID is the mongoDB ObjectId of the authenticated user and is required if the sales channel is online'
      },
      employeeId: {
        bsonType: 'objectId',
        description:
          'Employee ID is the mongoDB ObjectId of the authenticated employee and is required if the sales channel is ticket-window or concession-stand'
      },
      squarePaymentId: {
        bsonType: 'string',
        description: 'Square payment ID associated with the completed payment'
      }
    }
  };

  await applySchemaValidator(db, COLLECTION_NAMES.orders, jsonSchema);
};
