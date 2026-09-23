import type { ObjectId } from 'mongodb';
import type { ShowtimeType } from '../types/showtimes.types';

export interface Showtime {
  movieId: ObjectId;
  date: string;
  time: string;
  showtimeType: ShowtimeType;
  _id?: ObjectId;
}
