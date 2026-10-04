import type { AdmissionType } from '../types/prices.types';

export interface CreatePriceInput {
  admissionType: AdmissionType;
  priceInCents: number;
}

export interface UpdatePriceInput {
  priceInCents: number;
}
