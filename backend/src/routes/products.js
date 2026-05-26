import { Router } from 'express';
import {
  listProducts,
  getProductById,
  getCategories,
} from '../services/productService.js';

const router = Router();

router.get('/categories/list', async (_req, res, next) => {
  try {
    const categories = await getCategories();
    res.json({ categories });
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));
    const result = await listProducts({
      page,
      limit,
      q: req.query.q,
      category: req.query.category,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const product = await getProductById(Number(req.params.id));
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ product });
  } catch (err) {
    next(err);
  }
});

export default router;
