import { describe, expect, it } from 'vitest';

import { validDateString } from '../../src/helpers/validationHelpers';

describe('validDateString', () => {
  it('returns true for a valid date in YYYY-MM-DD format', () => {
    const result = validDateString('2026-10-16');
    expect(result).toBe(true);
  });
  it('throws an error when valid date is not in YYYY-MM-DD format', () => {
    expect(() => {
      validDateString('10-17-2026');
    }).toThrow('Date must be in YYYY-MM-DD format');
  });
  it('throws an error when date is not a valid date', () => {
    expect(() => {
      validDateString('2026-11-31');
    }).toThrow('Date must be a valid calendar date');
  });
  it('returns true for February 29 in a leap year', () => {
    const result = validDateString('2028-02-29');
    expect(result).toBe(true);
  });
  it('throws an error for February 29 in a non-leap year', () => {
    expect(() => {
      validDateString('2027-02-29');
    }).toThrow('Date must be a valid calendar date');
  });
});
