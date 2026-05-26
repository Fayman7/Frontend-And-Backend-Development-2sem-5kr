import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getCart,
  replaceCart,
  syncCart,
  clearCart,
} from '../services/cartService.js';

const router = Router();

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const items = await getCart(req.user.sub);
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

router.put('/', async (req, res, next) => {
  try {
    const items = await replaceCart(req.user.sub, req.body.items || []);
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

router.post('/sync', async (req, res, next) => {
  try {
    const items = await syncCart(req.user.sub, req.body.items || []);
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

router.delete('/', async (req, res, next) => {
  try {
    await clearCart(req.user.sub);
    res.json({ items: [] });
  } catch (err) {
    next(err);
  }
});

export default router;
