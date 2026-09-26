import { ObjectId } from 'mongodb';

import type { ConcessionCategory } from '../types/concessions.types';

export interface Concession {
  name: string;
  description?: string;
  category: ConcessionCategory;
  priceInCents: number;
  isActive: boolean;
  _id?: ObjectId;
}
