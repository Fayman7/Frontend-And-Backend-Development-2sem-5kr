import bcrypt from 'bcrypt';
import pool from '../db/pool.js';
import { signToken } from '../middleware/auth.js';

export async function registerUser(email, password) {
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [
    email,
  ]);
  if (existing.rows.length > 0) {
    const err = new Error('Email already registered');
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const { rows } = await pool.query(
    `INSERT INTO users (email, password_hash, role)
     VALUES ($1, $2, 'customer')
     RETURNING id, email, role`,
    [email, passwordHash]
  );
  const user = rows[0];
  const token = signToken({ sub: user.id, role: user.role, email: user.email });
  return { user, token };
}

export async function loginUser(email, password) {
  const { rows } = await pool.query(
    'SELECT id, email, password_hash, role FROM users WHERE email = $1',
    [email]
  );
  if (rows.length === 0) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }
  const user = rows[0];
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }
  const token = signToken({
    sub: user.id,
    role: user.role,
    email: user.email,
  });
  return {
    user: { id: user.id, email: user.email, role: user.role },
    token,
  };
}

export async function getUserById(id) {
  const { rows } = await pool.query(
    'SELECT id, email, role, created_at FROM users WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}
