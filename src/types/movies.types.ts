export const MOVIE_CERTIFICATIONS = [
  'G',
  'PG',
  'PG-13',
  'R',
  'NC-17',
  'Not Rated'
] as const;

export type MovieCertification =
  typeof MOVIE_CERTIFICATIONS[number];
