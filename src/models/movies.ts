import type { ObjectId } from 'mongodb';
import type { MovieCertification } from '../types/movieCertifications';

export interface Movie {
  _id?: ObjectId;
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
