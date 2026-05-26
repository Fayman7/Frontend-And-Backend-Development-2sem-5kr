import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../src/stores/auth';

const mockPost = vi.fn();
const mockGet = vi.fn();

vi.mock('../src/api/client.js', () => ({
  default: {
    post: (...args) => mockPost(...args),
    get: (...args) => mockGet(...args),
  },
}));

vi.mock('../src/stores/cart', () => ({
  useCartStore: () => ({ syncWithServer: vi.fn() }),
}));

describe('auth store', () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
    mockPost.mockReset();
    mockGet.mockReset();
  });

  it('login sets session', async () => {
    mockPost.mockResolvedValueOnce({
      data: {
        token: 'tok',
        user: { id: 1, email: 'a@b.com', role: 'customer' },
      },
    });
    const auth = useAuthStore();
    await auth.login('a@b.com', 'pass');
    expect(auth.isAuthenticated).toBe(true);
    expect(localStorage.getItem('token')).toBe('tok');
  });

  it('logout clears session', () => {
    const auth = useAuthStore();
    auth.setSession('x', { id: 1, email: 'a@b.com', role: 'customer' });
    auth.logout();
    expect(auth.isAuthenticated).toBe(false);
  });

  it('isAdmin when role admin', () => {
    const auth = useAuthStore();
    auth.setSession('x', { id: 1, email: 'admin@x.com', role: 'admin' });
    expect(auth.isAdmin).toBe(true);
  });
});
