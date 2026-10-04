import type { ObjectId } from 'mongodb';
import type { Cart } from '../models/carts.model';

export const ownsCart = (cart: Cart, userId: ObjectId): boolean => {
  return cart.userId?.equals(userId) || cart.employeeId?.equals(userId) || false;
};
