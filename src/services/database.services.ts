import * as mongoDB from 'mongodb';

import { getEnv } from '../config/env';
import { COLLECTION_NAMES } from '../config/collectionNames';

import { applySchemaValidation as applyUserSchemaValidation } from '../schemas/users.schema';
import { applySchemaValidation as applyMovieSchemaValidation } from '../schemas/movies.schema';

import type { User } from '../models/users.model';
import type { Movie } from '../models/movies.model';

export let mongoClient: mongoDB.MongoClient;
export let database: mongoDB.Db;

export const collections = {} as {
  users: mongoDB.Collection<User>;
  movies: mongoDB.Collection<Movie>;
};

export const connectToDatabase = 
  async (): Promise<void> => {
    mongoClient = new mongoDB.MongoClient(
      getEnv('DB_CONN_STRING')
    );
    
    await mongoClient.connect();
    
    database = mongoClient.db(
      getEnv('DB_NAME')
    );

    await applyUserSchemaValidation(database);
    await applyMovieSchemaValidation(database);

    collections.users = 
      database.collection<User>(
        COLLECTION_NAMES.users
      );
    collections.movies = 
      database.collection<Movie>(
        COLLECTION_NAMES.movies
      );

    console.log(
      `Successfully connected to database: ${database.databaseName}`
    );
  };
