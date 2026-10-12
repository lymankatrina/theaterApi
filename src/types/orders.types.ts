import type { ObjectId } from 'mongodb';
import type { SectionType } from './seats.types';
import type { AdmissionType } from './prices.types';

export const ORDER_STATUSES = ['created', 'paid'] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface OrderTicketItem {
  ticketId: ObjectId;
  showtimeId: ObjectId;
  seatId: ObjectId;
  movieTitle: string;
  showDate: string;
  showTime: string;
  section: SectionType;
  row: number;
  seat: number;
  admissionType: AdmissionType;
  priceInCents: number;
  taxRate: number;
  taxInCents: number;
}

export interface OrderConcessionItem {
  concessionId: ObjectId;
  name: string;
  quantity: number;
  priceInCents: number;
  taxRate: number;
  taxInCents: number;
}
