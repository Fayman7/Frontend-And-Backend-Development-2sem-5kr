import { jest } from '@jest/globals';

const mockQuery = jest.fn();

jest.unstable_mockModule('../src/db/pool.js', () => ({
  default: { query: mockQuery },
}));

const {
  listProducts,
  getProductById,
  createProduct,
  deleteProduct,
} = await import('../src/services/productService.js');

describe('productService', () => {
  beforeEach(() => mockQuery.mockReset());

  test('listProducts returns paginated items', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ total: 2 }] })
      .mockResolvedValueOnce({
        rows: [
          { id: 1, name: 'A', price: '10.00', stock: 5 },
          { id: 2, name: 'B', price: '20.00', stock: 3 },
        ],
      });

    const result = await listProducts({ page: 1, limit: 12, q: 'test' });
    expect(result.total).toBe(2);
    expect(result.items).toHaveLength(2);
    expect(mockQuery.mock.calls[0][0]).toContain('ILIKE');
  });

  test('getProductById returns product', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, name: 'X' }] });
    const p = await getProductById(1);
    expect(p.name).toBe('X');
  });

  test('getProductById returns null', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });
    expect(await getProductById(99)).toBeNull();
  });

  test('createProduct inserts row', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 3, name: 'New' }] });
    const p = await createProduct({
      name: 'New',
      price: 9.99,
      stock: 1,
    });
    expect(p.id).toBe(3);
  });

  test('deleteProduct returns boolean', async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 1 });
    expect(await deleteProduct(1)).toBe(true);
    mockQuery.mockResolvedValueOnce({ rowCount: 0 });
    expect(await deleteProduct(2)).toBe(false);
  });
});
