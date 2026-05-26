import pool from '../db/pool.js';
import { clearCart, getCart } from './cartService.js';

export async function createOrder(userId) {
  const cart = await getCart(userId);
  if (cart.length === 0) {
    const err = new Error('Cart is empty');
    err.status = 400;
    throw err;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let total = 0;
    const lineItems = [];

    for (const item of cart) {
      const { rows } = await client.query(
        'SELECT id, name, price, stock FROM products WHERE id = $1 FOR UPDATE',
        [item.productId]
      );
      if (rows.length === 0) {
        throw Object.assign(new Error(`Product ${item.productId} not found`), {
          status: 400,
        });
      }
      const product = rows[0];
      if (product.stock < item.quantity) {
        throw Object.assign(
          new Error(`Insufficient stock for ${product.name}`),
          { status: 400 }
        );
      }
      total += Number(product.price) * item.quantity;
      lineItems.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: Number(product.price),
      });
    }

    const { rows: orderRows } = await client.query(
      `INSERT INTO orders (user_id, status, total)
       VALUES ($1, 'pending', $2)
       RETURNING *`,
      [userId, total]
    );
    const order = orderRows[0];

    for (const line of lineItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [order.id, line.productId, line.quantity, line.unitPrice]
      );

      const { rowCount } = await client.query(
        `UPDATE products SET stock = stock - $1
         WHERE id = $2 AND stock >= $1`,
        [line.quantity, line.productId]
      );
      if (rowCount === 0) {
        throw Object.assign(new Error('Stock update failed'), { status: 400 });
      }
    }

    await client.query('COMMIT');
    await clearCart(userId);
    return getOrderById(order.id, userId);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function listOrders(userId) {
  const { rows } = await pool.query(
    `SELECT id, status, total, stripe_payment_intent_id, created_at
     FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return rows.map((r) => ({
    ...r,
    total: Number(r.total),
  }));
}

export async function getOrderById(orderId, userId, isAdmin = false) {
  const params = [orderId];
  let userFilter = '';
  if (!isAdmin && userId) {
    userFilter = ' AND o.user_id = $2';
    params.push(userId);
  }

  const { rows } = await pool.query(
    `SELECT o.id, o.user_id, o.status, o.total, o.stripe_payment_intent_id, o.created_at
     FROM orders o WHERE o.id = $1${userFilter}`,
    params
  );
  if (rows.length === 0) return null;

  const order = rows[0];
  const { rows: items } = await pool.query(
    `SELECT oi.product_id, oi.quantity, oi.unit_price, p.name, p.image_url
     FROM order_items oi
     JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = $1`,
    [orderId]
  );

  return {
    ...order,
    total: Number(order.total),
    items: items.map((i) => ({
      productId: i.product_id,
      quantity: i.quantity,
      unitPrice: Number(i.unit_price),
      name: i.name,
      imageUrl: i.image_url,
    })),
  };
}

export async function updateOrderStatus(orderId, status, paymentIntentId = null) {
  const { rows } = await pool.query(
    `UPDATE orders SET status = $2,
       stripe_payment_intent_id = COALESCE($3, stripe_payment_intent_id)
     WHERE id = $1 RETURNING *`,
    [orderId, status, paymentIntentId]
  );
  return rows[0] || null;
}

export async function restoreOrderStock(orderId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: items } = await client.query(
      'SELECT product_id, quantity FROM order_items WHERE order_id = $1',
      [orderId]
    );
    for (const item of items) {
      await client.query(
        'UPDATE products SET stock = stock + $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
