import { getEnv } from './env';

export const COLLECTION_NAMES = {
  users: getEnv('USERS_COLLECTION_NAME'),
  movies: getEnv('MOVIES_COLLECTION_NAME')
} as const;
