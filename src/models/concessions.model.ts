import { ObjectId } from 'mongodb';

import type { ConcessionCategory } from '../types/concessions.types';
import type { TaxType } from '../types/tax.types';

export interface Concession {
  name: string;
  description?: string;
  category: ConcessionCategory;
  priceInCents: number;
  isActive: boolean;
  taxType: TaxType;
  _id?: ObjectId;
}
