import { Router } from 'express';
import express from 'express';
import { handleStripeWebhook } from '../services/stripeService.js';

const router = Router();

router.post(
  '/',
  express.raw({ type: 'application/json' }),
  async (req, res, next) => {
    try {
      const signature = req.headers['stripe-signature'];
      const result = await handleStripeWebhook(req.body, signature);
      res.json(result);
    } catch (err) {
      err.status = 400;
      next(err);
    }
  }
);

export default router;
