import { MongoServerError } from 'mongodb';
import type { Db } from 'mongodb';

import { COLLECTION_NAMES } from '../config/collectionNames';
import { USER_ROLES } from '../types/users.types';

export async function applySchemaValidation(
  db: Db
): Promise<void> {
  const jsonSchema = {
    bsonType: 'object',
    required: [
      '_id', 
      'auth0Id',
      'firstName', 
      'lastName',
      'userName', 
      'email', 
      'role'
    ],
    additionalProperties: false,
    properties: {
      _id: {
        bsonType: 'objectId'
      },
      auth0Id: {
        bsonType: 'string',
        description: 'Auth0 user ID is required'
      },
      firstName: {
        bsonType: 'string',
        minLength: 1,
        maxLength: 75,
        description: 'First name must be between 1 and 75 characters'
      },
      lastName: {
        bsonType: 'string',
        minLength: 1,
        maxLength: 75,
        description: 'Last name must be between 1 and 75 characters'
      },
      userName: {
        bsonType: 'string',
        minLength: 1,
        maxLength: 75,
        description: 'User name must be between 1 and 75 characters'
      },
      email: {
        bsonType: 'string',
        description: 'Email is required and must be valid'
      },
      role: {
        bsonType: 'string',
        enum: [...USER_ROLES],
        description: 'User role must be a valid User Role'
      },
      // Optional fields
      phone: {
        bsonType: 'string',
        description: 'Phone must be a valid US phone number'
      }
    }
  };

    const collectionName = 
      COLLECTION_NAMES.users;
  
    const validator = {
      $jsonSchema: jsonSchema
    };

    try {
      await db.command({
        collMod: collectionName,
        validator
      });
    } catch (error) {
      if (
        error instanceof MongoServerError &&
        error.codeName === 'NamespaceNotFound'
      ){
        await db.createCollection(
          collectionName,
          { validator }
        );
      } else {  
      throw error;
    }
  }
  await db.collection(collectionName).createIndex(
    { auth0Id: 1 },
    { unique: true }
  );
  await db.collection(collectionName).createIndex(
    { email: 1 },
    { unique: true }
  );
}
