import { describe, it, expect } from 'vitest';
import { formatPrice } from '../src/utils/formatPrice.js';

describe('formatPrice', () => {
  it('formats number', () => {
    expect(formatPrice(10)).toBe('$10.00');
  });

  it('formats string', () => {
    expect(formatPrice('19.9')).toBe('$19.90');
  });

  it('handles invalid', () => {
    expect(formatPrice('abc')).toBe('$0.00');
  });
});
