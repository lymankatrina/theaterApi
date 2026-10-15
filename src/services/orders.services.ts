import { ClientSession, ObjectId } from 'mongodb';

import { collections, mongoClient } from './database.services';
import { ownsCart } from './carts.services';
import type { User } from '../models/users.model';
import type { Order } from '../models/orders.model';
import type { CartConcessionItem, CartTicketItem } from '../types/cart.types';
import type { OrderConcessionItem, OrderTicketItem } from '../types/orders.types';
import { TAX_RATES } from '../types/tax.types';

export const ownsOrder = (order: Order, userId: ObjectId): boolean => {
  return order.userId?.equals(userId) || order.employeeId?.equals(userId) || false;
};

const buildOrderTicketItem = async (cartItem: CartTicketItem, session: ClientSession): Promise<OrderTicketItem> => {
  const ticket = await collections.tickets.findOne(
    {
      _id: cartItem.ticketId
    },
    { session }
  );
  if (!ticket) {
    throw new Error('Ticket not found');
  }
  if (ticket.status !== 'reserved') {
    throw new Error('Ticket is no longer reserved');
  }
  const showtime = await collections.showtimes.findOne(
    {
      _id: ticket.showtimeId
    },
    { session }
  );
  if (!showtime) {
    throw new Error('Showtime not found');
  }
  const movie = await collections.movies.findOne(
    {
      _id: showtime.movieId
    },
    { session }
  );
  if (!movie) {
    throw new Error('Movie not found');
  }
  const seat = await collections.seats.findOne(
    {
      _id: ticket.seatId
    },
    { session }
  );
  if (!seat) {
    throw new Error('Seat not found');
  }
  const taxRate = TAX_RATES.standard;
  const taxInCents = Math.round(cartItem.priceInCents * taxRate);
  return {
    ticketId: cartItem.ticketId,
    showtimeId: ticket.showtimeId,
    seatId: ticket.seatId,
    movieTitle: movie.title,
    showDate: showtime.date,
    showTime: showtime.time,
    section: seat.section,
    row: seat.row,
    seat: seat.seat,
    admissionType: cartItem.admissionType,
    priceInCents: cartItem.priceInCents,
    taxRate,
    taxInCents
  };
};

const buildOrderConcessionItem = async (cartItem: CartConcessionItem, session: ClientSession): Promise<OrderConcessionItem> => {
  const concessionItem = await collections.concessions.findOne(
    {
      _id: cartItem.concessionId
    },
    { session }
  );
  if (!concessionItem) {
    throw new Error('Concession Item not found');
  }
  const taxRate = TAX_RATES[concessionItem.taxType];
  const taxInCents = Math.round(cartItem.priceInCents * cartItem.quantity * taxRate);
  return {
    concessionId: cartItem.concessionId,
    name: concessionItem.name,
    quantity: cartItem.quantity,
    priceInCents: cartItem.priceInCents,
    taxRate,
    taxInCents
  };
};

export const createOrder = async (cartId: string, user: User): Promise<Order> => {
  if (!user._id) {
    throw new Error('User ID is required');
  }
  const userId = user._id;
  const session = mongoClient.startSession();
  try {
    let createdOrder: Order | undefined;
    await session.withTransaction(async () => {
      const cart = await collections.carts.findOne(
        {
          _id: new ObjectId(cartId)
        },
        { session }
      );
      if (!cart) {
        throw new Error('Cart not found');
      }
      if (!ownsCart(cart, userId) && user.role !== 'admin') {
        throw new Error('Access denied');
      }
      if (cart.status !== 'active') {
        throw new Error('Cart is not active');
      }
      if (cart.ticketItems.length === 0 && cart.concessionItems.length === 0) {
        throw new Error('Cart is empty');
      }
      const ticketItems: OrderTicketItem[] = [];
      for (const cartItem of cart.ticketItems) {
        const orderTicketItem = await buildOrderTicketItem(cartItem, session);
        ticketItems.push(orderTicketItem);
      }
      const concessionItems: OrderConcessionItem[] = [];
      for (const cartItem of cart.concessionItems) {
        const orderConcessionItem = await buildOrderConcessionItem(cartItem, session);
        concessionItems.push(orderConcessionItem);
      }
      const ticketSubtotalInCents = ticketItems.reduce((total, item) => total + item.priceInCents, 0);
      const concessionSubtotalInCents = concessionItems.reduce((total, item) => total + item.priceInCents * item.quantity, 0);
      const subtotalInCents = ticketSubtotalInCents + concessionSubtotalInCents;
      const ticketTaxInCents = ticketItems.reduce((total, item) => total + item.taxInCents, 0);
      const concessionItemTaxInCents = concessionItems.reduce((total, item) => total + item.taxInCents, 0);
      const taxInCents = ticketTaxInCents + concessionItemTaxInCents;
      const totalInCents = subtotalInCents + taxInCents;
      const newOrder: Order = {
        cartId: cart._id,
        ticketItems,
        concessionItems,
        subtotalInCents,
        taxInCents,
        totalInCents,
        salesChannel: cart.salesChannel,
        orderStatus: 'created',
        createdAt: new Date()
      };
      if (cart.userId) {
        newOrder.userId = cart.userId;
      }
      if (cart.employeeId) {
        newOrder.employeeId = cart.employeeId;
      }
      const result = await collections.orders.insertOne(newOrder, { session });
      const now = new Date();
      const checkoutExpiresAt = new Date(now.getTime() + 15 * 60 * 1000);
      const cartUpdateResult = await collections.carts.updateOne(
        {
          _id: cart._id,
          status: 'active'
        },
        {
          $set: {
            status: 'checkout',
            updatedAt: now,
            expiresAt: checkoutExpiresAt
          }
        },
        { session }
      );
      if (cartUpdateResult.modifiedCount !== 1) {
        throw new Error('Cart could not be moved to checkout');
      }
      createdOrder = {
        ...newOrder,
        _id: result.insertedId
      };
    });
    if (!createdOrder) {
      throw new Error('Order was not created');
    }
    return createdOrder;
  } finally {
    await session.endSession();
  }
};
