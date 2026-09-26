import type { ConcessionCategory } from '../types/concessions.types';

export interface CreateConcessionInput {
  name: string;
  description?: string;
  category: ConcessionCategory;
  priceInCents: number;
  isActive: boolean;
}

export type UpdateConcessionInput = Partial<CreateConcessionInput>;
