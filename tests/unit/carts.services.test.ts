import { afterEach, expect, it, describe, vi } from 'vitest';
import { ObjectId } from 'mongodb';
import { getCartActivityUpdate, ownsCart } from '../../src/services/carts.services';
import type { Cart } from '../../src/models/carts.model';

afterEach(() => {
  vi.useRealTimers;
});

describe('ownsCart', () => {
  it('returns true when the cart userId matches the user', () => {
    const userId = new ObjectId();

    const cart: Cart = {
      ticketItems: [],
      concessionItems: [],
      status: 'active',
      salesChannel: 'online',
      createdAt: new Date(),
      updatedAt: new Date(),
      userId
    };

    const result = ownsCart(cart, userId);

    expect(result).toBe(true);
  });

  it('returns true when the cart employeeId matches the user', () => {
    const employeeId = new ObjectId();

    const cart: Cart = {
      ticketItems: [],
      concessionItems: [],
      status: 'active',
      salesChannel: 'ticket-window',
      createdAt: new Date(),
      updatedAt: new Date(),
      employeeId
    };

    const result = ownsCart(cart, employeeId);

    expect(result).toBe(true);
  });
  it('returns false when neither cart ID matches the user', () => {
    const cartUserId = new ObjectId();
    const cartEmployeeId = new ObjectId();
    const differentUserId = new ObjectId();

    const cart: Cart = {
      ticketItems: [],
      concessionItems: [],
      status: 'active',
      salesChannel: 'online',
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: cartUserId,
      employeeId: cartEmployeeId
    };

    const result = ownsCart(cart, differentUserId);

    expect(result).toBe(false);
  });
});

describe('getCartActivityUpdate', () => {
  it('returns updatedAt and expiresAt when the cart has tickets', () => {
    vi.useFakeTimers();

    const currentTime = new Date('2026-10-16T12:00:00Z');
    vi.setSystemTime(currentTime);

    const result = getCartActivityUpdate(true);

    expect(result).toEqual({
      updatedAt: new Date('2026-10-16T12:00:00Z'),
      expiresAt: new Date('2026-10-16T12:15:00Z')
    });
  });

  it('returns only updatedAt when the cart has no tickets', () => {
    vi.useFakeTimers();

    const currentTime = new Date('2026-10-16T12:00:00Z');
    vi.setSystemTime(currentTime);

    const result = getCartActivityUpdate(false);

    expect(result).toEqual({
      updatedAt: new Date('2026-10-16T12:00:00Z')
    });
  });
});
