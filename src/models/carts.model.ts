import { ObjectId } from 'mongodb';

import type { CartTicketItem, CartConcessionItem, CartStatus } from '../types/cart.types';
import type { SalesChannel } from '../types/salesChannels.types';

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
