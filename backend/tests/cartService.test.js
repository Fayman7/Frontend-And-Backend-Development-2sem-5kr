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

const { getCart, clearCart } = await import('../src/services/cartService.js');

describe('cartService', () => {
  beforeEach(() => {
    mockQuery.mockReset();
    mockClient.query.mockReset();
  });

  test('getCart maps rows', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          product_id: 1,
          quantity: 2,
          name: 'Item',
          price: '10.50',
          stock: 5,
          image_url: null,
          category: 'x',
        },
      ],
    });
    const cart = await getCart(1);
    expect(cart[0].productId).toBe(1);
    expect(cart[0].price).toBe(10.5);
  });

  test('clearCart deletes items', async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 1 });
    await clearCart(1);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('DELETE'),
      [1]
    );
  });
});
