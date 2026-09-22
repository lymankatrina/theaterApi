import type { ObjectId } from 'mongodb';
import type { SectionType } from '../types/seats.types';

export interface Seat {
  section: SectionType;
  row: number;
  seat: number;
  isWheelchair: boolean;
  _id?: ObjectId;
}
