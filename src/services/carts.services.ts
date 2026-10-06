import { ObjectId } from 'mongodb';
import type { Cart } from '../models/carts.model';
import { collections } from './database.services';
import { mongoClient } from './database.services';
import { SalesChannel } from '../types/cart.types';

export const ownsCart = (cart: Cart, userId: ObjectId): boolean => {
  return cart.userId?.equals(userId) || cart.employeeId?.equals(userId) || false;
};

const CART_EXPIRATION_MINUTES = 15;

export const getCartExpiration = (): Date => {
  return new Date(Date.now() + CART_EXPIRATION_MINUTES * 60 * 1000);
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
      status: 'active',
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
        const cartResult = await collections.carts.updateOne(
          {
            _id: cart._id,
            status: 'active'
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
        if (cartResult.modifiedCount === 0) {
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
