import { ObjectId } from 'mongodb';

import { SalesChannel } from '../types/salesChannels.types';
import { OrderTicketItem, OrderConcessionItem, OrderStatus } from '../types/orders.types';

export interface Order {
  userId?: ObjectId;
  employeeId?: ObjectId;
  cartId: ObjectId;
  ticketItems: OrderTicketItem[];
  concessionItems: OrderConcessionItem[];
  subtotalInCents: number;
  taxInCents: number;
  totalInCents: number;
  salesChannel: SalesChannel;
  orderStatus: OrderStatus;
  squarePaymentId?: string;
  createdAt: Date;
  _id?: ObjectId;
}
