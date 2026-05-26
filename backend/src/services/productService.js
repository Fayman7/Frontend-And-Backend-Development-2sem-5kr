import pool from '../db/pool.js';

export async function listProducts({ page = 1, limit = 12, q, category, minPrice, maxPrice }) {
  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [];
  let idx = 1;

  if (q) {
    conditions.push(`name ILIKE $${idx}`);
    params.push(`%${q}%`);
    idx++;
  }
  if (category) {
    conditions.push(`category = $${idx}`);
    params.push(category);
    idx++;
  }
  if (minPrice !== undefined && minPrice !== '') {
    conditions.push(`price >= $${idx}`);
    params.push(Number(minPrice));
    idx++;
  }
  if (maxPrice !== undefined && maxPrice !== '') {
    conditions.push(`price <= $${idx}`);
    params.push(Number(maxPrice));
    idx++;
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total FROM products ${where}`,
    params
  );
  const total = countResult.rows[0].total;

  params.push(limit, offset);
  const { rows } = await pool.query(
    `SELECT id, name, description, price, category, stock, image_url, created_at
     FROM products ${where}
     ORDER BY created_at DESC
     LIMIT $${idx} OFFSET $${idx + 1}`,
    params
  );

  return { items: rows, total, page, limit };
}

export async function getProductById(id) {
  const { rows } = await pool.query(
    `SELECT id, name, description, price, category, stock, image_url, created_at
     FROM products WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}

export async function createProduct(data) {
  const { name, description, price, category, stock, image_url } = data;
  const { rows } = await pool.query(
    `INSERT INTO products (name, description, price, category, stock, image_url)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [name, description || '', price, category || 'general', stock ?? 0, image_url || null]
  );
  return rows[0];
}

export async function updateProduct(id, data) {
  const { name, description, price, category, stock, image_url } = data;
  const { rows } = await pool.query(
    `UPDATE products SET
       name = COALESCE($2, name),
       description = COALESCE($3, description),
       price = COALESCE($4, price),
       category = COALESCE($5, category),
       stock = COALESCE($6, stock),
       image_url = COALESCE($7, image_url)
     WHERE id = $1
     RETURNING *`,
    [id, name, description, price, category, stock, image_url]
  );
  return rows[0] || null;
}

export async function updateProductStock(id, stock) {
  const { rows } = await pool.query(
    `UPDATE products SET stock = $2 WHERE id = $1 RETURNING *`,
    [id, stock]
  );
  return rows[0] || null;
}

export async function deleteProduct(id) {
  const { rowCount } = await pool.query('DELETE FROM products WHERE id = $1', [id]);
  return rowCount > 0;
}

export async function getCategories() {
  const { rows } = await pool.query(
    'SELECT DISTINCT category FROM products ORDER BY category'
  );
  return rows.map((r) => r.category);
}
