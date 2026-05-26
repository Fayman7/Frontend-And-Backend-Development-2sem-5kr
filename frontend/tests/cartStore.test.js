import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCartStore } from '../src/stores/cart';

vi.mock('../src/api/client.js', () => ({
  default: {
    put: vi.fn().mockResolvedValue({}),
    post: vi.fn().mockResolvedValue({ data: { items: [] } }),
    get: vi.fn().mockResolvedValue({ data: { items: [] } }),
  },
}));

vi.mock('../src/stores/auth', () => ({
  useAuthStore: () => ({ isAuthenticated: false }),
}));

describe('cart store', () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
  });

  it('adds item to cart', () => {
    const cart = useCartStore();
    cart.addItem({ id: 1, name: 'Test', price: 9.99, stock: 10 });
    expect(cart.count).toBe(1);
    expect(cart.total).toBeCloseTo(9.99);
  });

  it('updates quantity', () => {
    const cart = useCartStore();
    cart.addItem({ id: 1, name: 'Test', price: 10, stock: 10 }, 2);
    cart.updateQuantity(1, 3);
    expect(cart.items[0].quantity).toBe(3);
  });

  it('removes item', () => {
    const cart = useCartStore();
    cart.addItem({ id: 1, name: 'Test', price: 10, stock: 10 });
    cart.removeItem(1);
    expect(cart.count).toBe(0);
  });

  it('persists to localStorage', () => {
    const cart = useCartStore();
    cart.addItem({ id: 2, name: 'B', price: 5, stock: 1 });
    const stored = JSON.parse(localStorage.getItem('cart:v1'));
    expect(stored[0].productId).toBe(2);
  });
});
