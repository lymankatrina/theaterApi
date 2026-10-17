import { ObjectId } from 'mongodb';

import { collections, mongoClient } from './database.services';
import { getCartExpiration } from '../helpers/helpers';
import type { Cart } from '../models/carts.model';
import type { SalesChannel } from '../types/salesChannels.types';

export const ownsCart = (cart: Cart, userId: ObjectId): boolean => {
  return cart.userId?.equals(userId) || cart.employeeId?.equals(userId) || false;
};

export const getCartActivityUpdate = (hasTickets: boolean) => {
  return hasTickets
    ? {
        updatedAt: new Date(),
        expiresAt: getCartExpiration()
      }
    : {
        updatedAt: new Date()
      };
};

export const processExpiredCarts = async (): Promise<void> => {
  const now = new Date();
  const expiredCarts = await collections.carts
    .find({
      status: {
        $in: ['active', 'checkout']
      },
      expiresAt: {
        $lte: now
      }
    })
    .toArray();
  for (const cart of expiredCarts) {
    const ticketIds = cart.ticketItems.map((item) => item.ticketId);
    const session = mongoClient.startSession();
    try {
      await session.withTransaction(async () => {
        const ticketResult = await collections.tickets.updateMany(
          {
            _id: {
              $in: ticketIds
            },
            status: 'reserved'
          },
          {
            $set: {
              status: 'available'
            }
          },
          {
            session
          }
        );
        if (ticketResult.modifiedCount !== ticketIds.length) {
          throw new Error('Unable to release all tickets from expired cart');
        }
        if (cart.status === 'checkout') {
          const orderResult = await collections.orders.updateOne(
            {
              cartId: cart._id,
              orderStatus: 'created'
            },
            {
              $set: {
                orderStatus: 'cancelled'
              }
            },
            { session }
          );
          if (orderResult.modifiedCount !== 1) {
            throw new Error('Unable to cancel order for expired checkout');
          }
        }

        const cartResult = await collections.carts.updateOne(
          {
            _id: cart._id,
            status: {
              $in: ['active', 'checkout']
            }
          },
          {
            $set: {
              status: 'abandoned',
              updatedAt: new Date()
            },
            $unset: {
              expiresAt: ''
            }
          },
          {
            session
          }
        );
        if (cartResult.modifiedCount !== 1) {
          throw new Error('Unable to abandon expired cart');
        }
      });
    } catch (error) {
      console.error(`Error processing expired cart ${cart._id}:`, error);
    } finally {
      await session.endSession();
    }
  }
};

export const removeAbandonedCarts = async (ownerId: ObjectId, salesChannel: SalesChannel): Promise<void> => {
  if (salesChannel === 'online') {
    await collections.carts.deleteMany({
      userId: ownerId,
      salesChannel,
      status: 'abandoned'
    });
    return;
  }
  await collections.carts.deleteMany({
    employeeId: ownerId,
    salesChannel,
    status: 'abandoned'
  });
};
