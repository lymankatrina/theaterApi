import { getEnv } from './env';

export const COLLECTION_NAMES = {
  users: getEnv('USERS_COLLECTION_NAME'),
  movies: getEnv('MOVIES_COLLECTION_NAME'),
  seats: getEnv('SEATS_COLLECTION_NAME'),
  showtimes: getEnv('SHOWTIMES_COLLECTION_NAME'),
  tickets: getEnv('TICKETS_COLLECTION_NAME')
} as const;
