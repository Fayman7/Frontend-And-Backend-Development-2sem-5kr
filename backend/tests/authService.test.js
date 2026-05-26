import { jest } from '@jest/globals';
import bcrypt from 'bcrypt';

const mockQuery = jest.fn();

jest.unstable_mockModule('../src/db/pool.js', () => ({
  default: { query: mockQuery },
}));

const { registerUser, loginUser } = await import('../src/services/authService.js');

describe('authService', () => {
  beforeEach(() => mockQuery.mockReset());

  test('registerUser creates user and token', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [{ id: 1, email: 'a@b.com', role: 'customer' }],
      });

    const result = await registerUser('a@b.com', 'secret1');
    expect(result.user.email).toBe('a@b.com');
    expect(result.token).toBeTruthy();
  });

  test('registerUser rejects duplicate email', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] });
    await expect(registerUser('a@b.com', 'secret1')).rejects.toMatchObject({
      status: 409,
    });
  });

  test('loginUser validates password', async () => {
    const hash = await bcrypt.hash('pass123', 10);
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 2,
          email: 'u@x.com',
          password_hash: hash,
          role: 'customer',
        },
      ],
    });

    const result = await loginUser('u@x.com', 'pass123');
    expect(result.token).toBeTruthy();
  });

  test('loginUser rejects bad password', async () => {
    const hash = await bcrypt.hash('pass123', 10);
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 2, email: 'u@x.com', password_hash: hash, role: 'customer' }],
    });
    await expect(loginUser('u@x.com', 'wrong')).rejects.toMatchObject({
      status: 401,
    });
  });
});
