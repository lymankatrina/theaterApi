import * as mongoDB from 'mongodb';
import type { Db } from 'mongodb';

export const applySchemaValidator = async (db: Db, collectionName: string, jsonSchema: object): Promise<void> => {
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
