import * as mongoDB from 'mongodb';

import { getEnv } from '../config/env';

export let mongoClient: mongoDB.MongoClient;
export let database: mongoDB.Db;

export const connectToDatabase = 
  async (): Promise<void> => {
    mongoClient = new mongoDB.MongoClient(
      getEnv('DB_CONN_STRING')
    );
    
    await mongoClient.connect();
    database = mongoClient.db(
      getEnv('DB_NAME')
    );

    console.log(
      `Successfully connected to database: ${database.databaseName}`
    );
  };
