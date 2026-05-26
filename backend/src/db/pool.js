import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://shop:shop@localhost:5432/shop',
});

export default pool;
