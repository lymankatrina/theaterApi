import { ObjectId } from 'mongodb';

import type { AdmissionType } from './prices.types';

export const CART_STATUSES = ['active', 'checkout', 'completed', 'abandoned'] as const;

export type CartStatus = (typeof CART_STATUSES)[number];

export interface CartTicketItem {
  ticketId: ObjectId;
  admissionType: AdmissionType;
  priceInCents: number;
}

export interface CartConcessionItem {
  concessionId: ObjectId;
  quantity: number;
  priceInCents: number;
}
