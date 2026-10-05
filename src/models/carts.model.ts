import { ObjectId } from 'mongodb';

import type { CartTicketItem, CartConcessionItem, CartStatus, SalesChannel } from '../types/cart.types';

export interface Cart {
  ticketItems: CartTicketItem[];
  concessionItems: CartConcessionItem[];
  status: CartStatus;
  salesChannel: SalesChannel;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  _id?: ObjectId;
  userId?: ObjectId;
  employeeId?: ObjectId;
}
