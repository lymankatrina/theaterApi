import { ObjectId } from 'mongodb';
import { SquarePaymentService } from './square-payment.service';

import type { User } from '../../models/users.model';
import type { Order } from '../../models/orders.model';
import type { CompletePaymentInput } from '../../dto/payments.dto';
import type { PaymentProviderService } from './payment-provider.interface';
import type { PaymentProvider } from '../../types/payments.types';

import { collections, mongoClient } from '../database.services';
import { ownsOrder } from '../orders.services';
import { AppError } from '../../errors/app.error';

const squarePaymentService = new SquarePaymentService();
const getPaymentProvider = (paymentProvider: PaymentProvider): PaymentProviderService => {
  switch (paymentProvider) {
    case 'square':
      return squarePaymentService;
    default:
      throw new Error('Unsupported payment provider');
  }
};

export const completePayment = async (input: CompletePaymentInput, user: User): Promise<Order> => {
  if (!user._id) {
    throw new AppError('User ID is required', 401);
  }
  const userId = user._id;
  const order = await collections.orders.findOne({
    _id: new ObjectId(input.orderId)
  });
  if (!order) {
    throw new AppError('Order not found', 404);
  }
  if (!ownsOrder(order, userId) && user.role !== 'admin') {
    throw new AppError('Access denied', 403);
  }
  if (order.orderStatus === 'paid') {
    if (order.paymentProvider === input.paymentProvider && order.paymentId === input.paymentId) {
      return order;
    }
    throw new AppError('Order has already been paid with a different payment', 409);
  }
  if (order.orderStatus !== 'created') {
    throw new AppError('Order is not awaiting payment', 409);
  }
  const provider = getPaymentProvider(input.paymentProvider);
  const verification = await provider.verifyPayment(input.paymentId);
  if (verification.status !== 'completed') {
    throw new AppError('Payment has not been completed', 409);
  }
  if (verification.amountInCents !== order.totalInCents) {
    throw new AppError('Payment amount does not match order total', 409);
  }
  if (verification.paymentProvider !== input.paymentProvider) {
    throw new AppError('Payment provider does not match', 409);
  }
  if (verification.paymentId !== input.paymentId) {
    throw new AppError('Payment ID does not match', 409);
  }
  if (verification.orderReference !== order._id.toString()) {
    throw new AppError('Payment does not belong to this order', 409);
  }
  const session = mongoClient.startSession();
  try {
    let completedOrder: Order | undefined;
    await session.withTransaction(async () => {
      const currentOrder = await collections.orders.findOne(
        {
          _id: order._id,
          orderStatus: 'created'
        },
        { session }
      );
      if (!currentOrder) {
        throw new AppError('Order is no longer awaiting payment', 409);
      }
      const currentCart = await collections.carts.findOne(
        {
          _id: currentOrder.cartId,
          status: 'checkout'
        },
        { session }
      );
      if (!currentCart) {
        throw new AppError('Cart is no longer awaiting payment', 409);
      }
      const ticketIds = currentOrder.ticketItems.map((item) => item.ticketId);
      const reservedTickets = await collections.tickets
        .find(
          {
            _id: {
              $in: ticketIds
            },
            status: 'reserved'
          },
          { session }
        )
        .toArray();
      if (reservedTickets.length !== ticketIds.length) {
        throw new AppError('One or more tickets are no longer reserved', 409);
      }
      const ticketResult = await collections.tickets.updateMany(
        {
          _id: {
            $in: ticketIds
          },
          status: 'reserved'
        },
        {
          $set: {
            status: 'sold'
          }
        },
        { session }
      );
      if (ticketResult.modifiedCount !== ticketIds.length) {
        throw new Error('Unable to mark all tickets as sold');
      }
      const cartResult = await collections.carts.updateOne(
        {
          _id: currentCart._id,
          status: 'checkout'
        },
        {
          $set: {
            status: 'completed',
            updatedAt: new Date()
          },
          $unset: {
            expiresAt: ''
          }
        },
        { session }
      );
      if (cartResult.modifiedCount !== 1) {
        throw new Error('Unable to complete cart');
      }
      const orderResult = await collections.orders.updateOne(
        {
          _id: currentOrder._id,
          orderStatus: 'created'
        },
        {
          $set: {
            orderStatus: 'paid',
            paymentProvider: verification.paymentProvider,
            paymentId: verification.paymentId
          }
        },
        { session }
      );
      if (orderResult.modifiedCount !== 1) {
        throw new Error('Unable to mark order as paid');
      }
      completedOrder = {
        ...currentOrder,
        orderStatus: 'paid',
        paymentProvider: verification.paymentProvider,
        paymentId: verification.paymentId
      };
    });
    if (!completedOrder) {
      throw new Error('Payment could not be completed');
    }
    return completedOrder;
  } finally {
    await session.endSession();
  }
};
