import * as mongoDB from 'mongodb';

import { getEnv } from '../config/env';
import { COLLECTION_NAMES } from '../config/collectionNames';

import { applySchemaValidation as applyUserSchemaValidation } from '../schemas/users.schema';
import { applySchemaValidation as applyMovieSchemaValidation } from '../schemas/movies.schema';
import { applySchemaValidation as applySeatSchemaValidation } from '../schemas/seats.schema';
import { applySchemaValidation as applyShowtimeSchemaValidation } from '../schemas/showtimes.schema';
import { applySchemaValidation as applyTicketSchemaValidation } from '../schemas/tickets.schema';
import { applySchemaValidation as applyConcessionSchemaValidation } from '../schemas/concessions.schema';

import type { User } from '../models/users.model';
import type { Movie } from '../models/movies.model';
import type { Seat } from '../models/seats.model';
import type { Showtime } from '../models/showtimes.model';
import type { Ticket } from '../models/tickets.model';
import type { Concession } from '../models/concessions.model';

export let mongoClient: mongoDB.MongoClient;
export let database: mongoDB.Db;

export const collections = {} as {
  users: mongoDB.Collection<User>;
  movies: mongoDB.Collection<Movie>;
  seats: mongoDB.Collection<Seat>;
  showtimes: mongoDB.Collection<Showtime>;
  tickets: mongoDB.Collection<Ticket>;
  concessions: mongoDB.Collection<Concession>;
};

export const connectToDatabase = async (): Promise<void> => {
  mongoClient = new mongoDB.MongoClient(getEnv('DB_CONN_STRING'));

  await mongoClient.connect();

  database = mongoClient.db(getEnv('DB_NAME'));

  await applyUserSchemaValidation(database);
  await applyMovieSchemaValidation(database);
  await applySeatSchemaValidation(database);
  await applyShowtimeSchemaValidation(database);
  await applyTicketSchemaValidation(database);
  await applyConcessionSchemaValidation(database);

  collections.users = database.collection<User>(COLLECTION_NAMES.users);
  collections.movies = database.collection<Movie>(COLLECTION_NAMES.movies);
  collections.seats = database.collection<Seat>(COLLECTION_NAMES.seats);
  collections.showtimes = database.collection<Showtime>(COLLECTION_NAMES.showtimes);
  collections.tickets = database.collection<Ticket>(COLLECTION_NAMES.tickets);
  collections.concessions = database.collection<Concession>(COLLECTION_NAMES.concessions);

  await collections.seats.createIndex(
    {
      section: 1,
      row: 1,
      seat: 1
    },
    {
      unique: true
    }
  );

  await collections.showtimes.createIndex(
    {
      date: 1,
      time: 1
    },
    {
      unique: true
    }
  );

  await collections.tickets.createIndex(
    {
      showtimeId: 1,
      seatId: 1
    },
    {
      unique: true
    }
  );

  await collections.concessions.createIndex(
    { name: 1 },
    {
      unique: true,
      collation: {
        locale: 'en',
        strength: 2
      }
    }
  );

  console.log(`Successfully connected to database: ${database.databaseName}`);
};
