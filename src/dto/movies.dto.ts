import type { MovieCertification } from '../types/movies.types';

export interface CreateMovieInput {
  title: string;
  tagLine: string;
  overview: string;
  year: number;
  certification: MovieCertification;
  releaseDate: string;
  genres: string;
  runtime: string;
  imdbScore?: number;
  rottenTomatoes?: string;
  fandangoAudienceScore?: string;
  poster: string;
  trailer: string;
}

export type UpdateMovieInput = Partial<CreateMovieInput>;