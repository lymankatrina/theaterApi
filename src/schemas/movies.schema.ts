import * as mongoDB from 'mongodb';
import type { Db } from 'mongodb';
import { MOVIE_CERTIFICATIONS } from '../types/movies.types';
import { COLLECTION_NAMES } from '../config/collectionNames';

export async function applySchemaValidation(
  db: Db
): Promise<void> {
  const jsonSchema = {
    bsonType: 'object',
    required: [
      '_id', 
      'title', 
      'tagLine', 
      'overview', 
      'year', 
      'certification', 
      'releaseDate', 
      'genres', 
      'runtime', 
      'poster', 
      'trailer'
    ],
    additionalProperties: false,
    properties: {
      _id: {
        bsonType: 'objectId'
      },
      title: {
        bsonType: 'string',
        minLength: 1,
        maxLength: 85,
        description: 'Title is required and must be a string'
      },
      tagLine: {
        bsonType: 'string',
        minLength: 1,
        maxLength: 85,
        description: 'Tagline is required and must be a string'
      },
      overview: {
        bsonType: 'string',
        minLength: 1,
        maxLength: 850,
        description: 'Overview is required and must be a string'
      },
      year: {
        bsonType: 'int',
        minimum: 1888,
        maximum: 3000,
        description: 'Year must be a valid production year'
      },
      certification: {
        bsonType: 'string',
        enum: [...MOVIE_CERTIFICATIONS],
        description: 'Must be a valid movie certification'
      },
      releaseDate: {
        bsonType: 'string',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        description: 'Release date must be in YYYY-MM-DD format'
      },
      genres: {
        bsonType: 'string',
        minLength: 2,
        maxLength: 100,
        pattern: '^[A-Za-z]+(?: [A-Za-z]+)*(?:, [A-Za-z]+(?: [A-Za-z]+)*)*$',
        description: 'Genres must be a string'
      },
      runtime: {
        bsonType: 'string',
        pattern: '^[0-9]+h\\s+[0-5]?[0-9]m$',
        description: 'Runtime must be in hours and minutes such as 2h 16m'
      },
      poster: {
        bsonType: 'string',
        description: 'Poster must be a URL to a publicly shared image'
      },
      trailer: {
        bsonType: 'string',
        description: 'Trailer must be a url to an official trailer'
      },
      imdbScore: {
        bsonType: ['double', 'int' ],
        minimum: 0,
        maximum: 10,
        description: 'IMDB score should be a number between 0 and 10'
      },
      rottenTomatoes: {
        bsonType: 'string',
        pattern: '^(100|\\d{1,2})%$',
        description: 'Rotten tomatoes should be a percentage from 0% to 100%'
      },
      fandangoAudienceScore: {
        bsonType: 'string',
        pattern: '^(100|\\d{1,2})%$',
        description: 'Fandango audience score should be a percentage from 0% to 100%'
      }
    }
  };

  const collectionName = COLLECTION_NAMES.movies;

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
      error instanceof mongoDB.MongoServerError &&
      error.codeName === 'NamespaceNotFound'
    ) {
      await db.createCollection(
        collectionName,
        { validator }
      );
    } else {
      throw error;
    }
  }
}