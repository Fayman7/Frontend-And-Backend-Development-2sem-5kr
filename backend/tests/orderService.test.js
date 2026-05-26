import { jest } from '@jest/globals';

const mockQuery = jest.fn();
const mockClient = {
  query: jest.fn(),
  release: jest.fn(),
};

jest.unstable_mockModule('../src/db/pool.js', () => ({
  default: {
    query: mockQuery,
    connect: jest.fn().mockResolvedValue(mockClient),
  },
}));

jest.unstable_mockModule('../src/services/cartService.js', () => ({
  getCart: jest.fn(),
  clearCart: jest.fn(),
}));

const cartService = await import('../src/services/cartService.js');
const { listOrders, createOrder } = await import('../src/services/orderService.js');

describe('orderService', () => {
  beforeEach(() => {
    mockQuery.mockReset();
    mockClient.query.mockReset();
    cartService.getCart.mockReset();
    cartService.clearCart.mockReset();
  });

  test('listOrders returns user orders', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 1, status: 'paid', total: '50.00', created_at: new Date() }],
    });
    const orders = await listOrders(1);
    expect(orders[0].total).toBe(50);
  });

  test('createOrder rejects empty cart', async () => {
    cartService.getCart.mockResolvedValueOnce([]);
    await expect(createOrder(1)).rejects.toMatchObject({ status: 400 });
  });
});
