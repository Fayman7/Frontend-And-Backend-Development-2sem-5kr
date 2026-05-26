import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStock,
} from '../services/productService.js';

const router = Router();

router.use(authenticate, requireRole('admin'));

router.post('/products', async (req, res, next) => {
  try {
    const { name, price } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Name and price required' });
    }
    const product = await createProduct(req.body);
    res.status(201).json({ product });
  } catch (err) {
    next(err);
  }
});

router.put('/products/:id', async (req, res, next) => {
  try {
    const product = await updateProduct(Number(req.params.id), req.body);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ product });
  } catch (err) {
    next(err);
  }
});

router.patch('/products/:id/stock', async (req, res, next) => {
  try {
    const { stock } = req.body;
    if (stock === undefined || stock < 0) {
      return res.status(400).json({ error: 'Valid stock required' });
    }
    const product = await updateProductStock(Number(req.params.id), stock);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ product });
  } catch (err) {
    next(err);
  }
});

router.delete('/products/:id', async (req, res, next) => {
  try {
    const ok = await deleteProduct(Number(req.params.id));
    if (!ok) return res.status(404).json({ error: 'Product not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
