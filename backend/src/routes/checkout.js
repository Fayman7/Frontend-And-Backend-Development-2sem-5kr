import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  createPaymentIntent,
  confirmMockPayment,
} from '../services/stripeService.js';

const router = Router();

router.use(authenticate);

router.post('/payment-intent', async (req, res, next) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ error: 'orderId required' });
    const result = await createPaymentIntent(Number(orderId), req.user.sub);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/mock-confirm', async (req, res, next) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ error: 'orderId required' });
    const order = await confirmMockPayment(Number(orderId), req.user.sub);
    res.json({ order });
  } catch (err) {
    next(err);
  }
});

export default router;
