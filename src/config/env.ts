import * as dotenv from 'dotenv';

dotenv.config();

export const getEnv = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}`
    );
  }

  return value;
};