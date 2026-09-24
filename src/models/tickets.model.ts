import { ObjectId } from 'mongodb';
import type { TicketStatus } from '../types/tickets.types';

export interface Ticket {
  showtimeId: ObjectId;
  seatId: ObjectId;
  status: TicketStatus;
  buyerId?: ObjectId;
  addedAt?: Date;
  _id?: ObjectId;
}
