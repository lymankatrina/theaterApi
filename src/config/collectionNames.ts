import { getEnv } from './env';

export const COLLECTION_NAMES = {
  movies: getEnv('MOVIES_COLLECTION_NAME')
} as const;
