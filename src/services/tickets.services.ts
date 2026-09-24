import type { ClientSession, ObjectId } from 'mongodb';
import type { Ticket } from '../models/tickets.model';
import { collections } from './database.services';

export const generateTicketsForShowtime = async (showtimeId: ObjectId, session?: ClientSession): Promise<number> => {
  const seats = await collections.seats.find({}, { session }).toArray();
  if (seats.length === 0) {
    throw new Error('No seats have been configured');
  }
  const existingTickets = await collections.tickets
    .find(
      {
        showtimeId
      },
      {
        session
      }
    )
    .toArray();
  const existingSeatIds = new Set(existingTickets.map((ticket) => ticket.seatId.toString()));
  const ticketsToInsert: Ticket[] = [];
  for (const seat of seats) {
    if (!seat._id) {
      continue;
    }
    if (existingSeatIds.has(seat._id.toString())) {
      continue;
    }
    ticketsToInsert.push({
      showtimeId,
      seatId: seat._id,
      status: 'available'
    });
  }
  if (ticketsToInsert.length === 0) {
    return 0;
  }
  const result = await collections.tickets.insertMany(ticketsToInsert, { session });
  return result.insertedCount;
};
