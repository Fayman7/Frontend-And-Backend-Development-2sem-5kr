import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  createOrder,
  listOrders,
  getOrderById,
} from '../services/orderService.js';

const router = Router();

router.use(authenticate);

router.post('/', async (req, res, next) => {
  try {
    const order = await createOrder(req.user.sub);
    res.status(201).json({ order });
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const orders = await listOrders(req.user.sub);
    res.json({ orders });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const order = await getOrderById(
      Number(req.params.id),
      req.user.sub,
      isAdmin
    );
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ order });
  } catch (err) {
    next(err);
  }
});

export default router;
