import pool from '../db/pool.js';

export async function getCart(userId) {
  const { rows } = await pool.query(
    `SELECT ci.product_id, ci.quantity, p.name, p.price, p.stock, p.image_url, p.category
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     WHERE ci.user_id = $1`,
    [userId]
  );
  return rows.map((r) => ({
    productId: r.product_id,
    quantity: r.quantity,
    name: r.name,
    price: Number(r.price),
    stock: r.stock,
    imageUrl: r.image_url,
    category: r.category,
  }));
}

export async function replaceCart(userId, items) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);

    for (const item of items) {
      const productId = item.productId || item.product_id;
      const qty = Math.max(1, item.quantity);
      const { rows: products } = await client.query(
        'SELECT stock FROM products WHERE id = $1',
        [productId]
      );
      if (products.length === 0) continue;
      const quantity = Math.min(qty, products[0].stock);
      if (quantity <= 0) continue;

      await client.query(
        `INSERT INTO cart_items (user_id, product_id, quantity)
         VALUES ($1, $2, $3)`,
        [userId, productId, quantity]
      );
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
  return getCart(userId);
}

export async function syncCart(userId, items) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const item of items) {
      const productId = item.productId || item.product_id;
      const addQty = Math.max(1, item.quantity);

      const { rows: products } = await client.query(
        'SELECT stock FROM products WHERE id = $1',
        [productId]
      );
      if (products.length === 0) continue;
      const maxStock = products[0].stock;

      await client.query(
        `INSERT INTO cart_items (user_id, product_id, quantity)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, product_id)
         DO UPDATE SET quantity = LEAST(cart_items.quantity + EXCLUDED.quantity, $4)`,
        [userId, productId, Math.min(addQty, maxStock), maxStock]
      );
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
  return getCart(userId);
}

export async function clearCart(userId) {
  await pool.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
}
