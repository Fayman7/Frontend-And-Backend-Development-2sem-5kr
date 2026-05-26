import bcrypt from 'bcrypt';
import 'dotenv/config';
import pool from '../src/db/pool.js';

async function seed() {
  const adminHash = await bcrypt.hash('Admin123!', 10);

  await pool.query(
    `INSERT INTO users (email, password_hash, role)
     VALUES ($1, $2, 'admin')
     ON CONFLICT (email) DO NOTHING`,
    ['admin@shop.local', adminHash]
  );

  const products = [
    {
      name: 'Wireless Headphones',
      description: 'Noise-cancelling over-ear headphones',
      price: 129.99,
      category: 'electronics',
      stock: 25,
      image_url: 'https://picsum.photos/seed/headphones/400/300',
    },
    {
      name: 'Mechanical Keyboard',
      description: 'RGB mechanical keyboard with Cherry switches',
      price: 89.99,
      category: 'electronics',
      stock: 40,
      image_url: 'https://picsum.photos/seed/keyboard/400/300',
    },
    {
      name: 'Cotton T-Shirt',
      description: 'Comfortable organic cotton tee',
      price: 24.99,
      category: 'clothing',
      stock: 100,
      image_url: 'https://picsum.photos/seed/tshirt/400/300',
    },
    {
      name: 'Running Shoes',
      description: 'Lightweight shoes for daily runs',
      price: 79.99,
      category: 'clothing',
      stock: 30,
      image_url: 'https://picsum.photos/seed/shoes/400/300',
    },
    {
      name: 'Coffee Maker',
      description: 'Programmable drip coffee maker',
      price: 59.99,
      category: 'home',
      stock: 15,
      image_url: 'https://picsum.photos/seed/coffee/400/300',
    },
    {
      name: 'Desk Lamp',
      description: 'LED desk lamp with adjustable brightness',
      price: 34.99,
      category: 'home',
      stock: 50,
      image_url: 'https://picsum.photos/seed/lamp/400/300',
    },
  ];

  for (const p of products) {
    await pool.query(
      `INSERT INTO products (name, description, price, category, stock, image_url)
       SELECT $1::varchar, $2, $3, $4::varchar, $5, $6
       WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = $1::varchar)`,
      [p.name, p.description, p.price, p.category, p.stock, p.image_url]
    );
  }

  await pool.end();
  console.log('Seed complete');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
