import { afterEach, describe, expect, it, vi } from 'vitest';

import { getCartExpiration, getDatesBetween } from '../../src/helpers/helpers';

afterEach(() => {
  vi.useRealTimers();
});

describe('getCartExpiration', () => {
  it('returns a date 15 minutes in the future', () => {
    vi.useFakeTimers();

    const currentTime = new Date('2026-10-15T12:00:00Z');
    vi.setSystemTime(currentTime);
    const expiration = getCartExpiration();
    const expectedExpiration = new Date('2026-10-15T12:15:00Z');

    expect(expiration).toEqual(expectedExpiration);
  });
});

describe('getDatesBetween', () => {
  it('returns all dates between and including the start and end dates', () => {
    const dates = getDatesBetween('2026-10-15', '2026-10-18');
    expect(dates).toEqual(['2026-10-15', '2026-10-16', '2026-10-17', '2026-10-18']);
  });
  it('returns one date when the start and end dates are equal', () => {
    const dates = getDatesBetween('2026-10-15', '2026-10-15');
    expect(dates).toEqual(['2026-10-15']);
  });
  it('returns dates correctly across a month boundary', () => {
    const dates = getDatesBetween('2026-10-29', '2026-11-04');
    expect(dates).toEqual(['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04']);
  });
  it('returns dates correctly across a year boundary', () => {
    const dates = getDatesBetween('2026-12-29', '2027-01-02');
    expect(dates).toEqual(['2026-12-29', '2026-12-30', '2026-12-31', '2027-01-01', '2027-01-02']);
  });
  it('returns an empty set when the start date falls after the end date', () => {
    const dates = getDatesBetween('2026-10-20', '2026-10-15');
    expect(dates).toEqual([]);
  });
});
