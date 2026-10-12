import type { ConcessionCategory } from '../types/concessions.types';
import type { TaxType } from '../types/tax.types';

export interface CreateConcessionInput {
  name: string;
  description?: string;
  category: ConcessionCategory;
  priceInCents: number;
  taxType: TaxType;
  isActive: boolean;
}

export type UpdateConcessionInput = Partial<CreateConcessionInput>;
