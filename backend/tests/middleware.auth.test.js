import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import { authenticate, requireRole, signToken } from '../src/middleware/auth.js';

describe('auth middleware', () => {
  test('signToken creates valid jwt', () => {
    const token = signToken({ sub: 1, role: 'customer' });
    const decoded = jwt.verify(token, 'test-secret');
    expect(decoded.sub).toBe(1);
  });

  test('authenticate rejects missing header', () => {
    const req = { headers: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('authenticate accepts valid token', () => {
    const token = signToken({ sub: 2, role: 'admin' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    authenticate(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user.role).toBe('admin');
  });

  test('requireRole blocks wrong role', () => {
    const middleware = requireRole('admin');
    const req = { user: { role: 'customer' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('requireRole allows admin', () => {
    const middleware = requireRole('admin');
    const req = { user: { role: 'admin' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
