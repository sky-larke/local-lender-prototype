import { describe, expect, it } from 'vitest';
import { formatCurrency } from './formatCurrency';

describe('formatCurrency', () => {
  it('formats USD amounts without cents', () => {
    expect(formatCurrency(12)).toBe('$12');
  });
});
