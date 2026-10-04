import { ObjectId } from 'mongodb';

import type { AdmissionType } from './prices.types';

export const CART_STATUSES = ['active', 'completed', 'abandoned'] as const;

export type CartStatus = (typeof CART_STATUSES)[number];

export const SALES_CHANNELS = ['online', 'ticket-window', 'concession-stand'] as const;

export type SalesChannel = (typeof SALES_CHANNELS)[number];

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
