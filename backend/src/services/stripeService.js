import Stripe from 'stripe';
import pool from '../db/pool.js';
import { getOrderById, updateOrderStatus, restoreOrderStock } from './orderService.js';

let stripeClient = null;

function isStripeConfigured(key) {
  if (!key) return false;
  const placeholders = ['your_key', 'placeholder', 'changeme', 'sk_test_xxx'];
  const lower = key.toLowerCase();
  return !placeholders.some((p) => lower.includes(p));
}

export function getStripe() {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!isStripeConfigured(key)) {
      return null;
    }
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

export function setStripe(client) {
  stripeClient = client;
}

export async function createPaymentIntent(orderId, userId) {
  const stripe = getStripe();
  const order = await getOrderById(orderId, userId);
  if (!order) {
    const err = new Error('Order not found');
    err.status = 404;
    throw err;
  }
  if (order.status !== 'pending') {
    const err = new Error('Order is not payable');
    err.status = 400;
    throw err;
  }

  if (!stripe) {
    const mockId = `pi_mock_${orderId}`;
    await pool.query(
      'UPDATE orders SET stripe_payment_intent_id = $2 WHERE id = $1',
      [orderId, mockId]
    );
    return {
      clientSecret: `${mockId}_secret_mock`,
      paymentIntentId: mockId,
      mock: true,
    };
  }

  const amountCents = Math.round(Number(order.total) * 100);
  const intent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency: 'usd',
    metadata: { orderId: String(orderId), userId: String(userId) },
    automatic_payment_methods: { enabled: true },
  });

  await pool.query(
    'UPDATE orders SET stripe_payment_intent_id = $2 WHERE id = $1',
    [orderId, intent.id]
  );

  return {
    clientSecret: intent.client_secret,
    paymentIntentId: intent.id,
  };
}

export async function handleStripeWebhook(rawBody, signature) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !secret || secret.includes('your_webhook')) {
    return { received: true, skipped: true };
  }

  const event = stripe.webhooks.constructEvent(rawBody, signature, secret);

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object;
    const orderId = Number(pi.metadata?.orderId);
    if (orderId) {
      await updateOrderStatus(orderId, 'paid', pi.id);
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const pi = event.data.object;
    const orderId = Number(pi.metadata?.orderId);
    if (orderId) {
      await updateOrderStatus(orderId, 'failed', pi.id);
      await restoreOrderStock(orderId);
    }
  }

  return { received: true };
}

export async function confirmMockPayment(orderId, userId) {
  const order = await getOrderById(orderId, userId);
  if (!order) {
    const err = new Error('Order not found');
    err.status = 404;
    throw err;
  }
  await updateOrderStatus(orderId, 'paid', order.stripe_payment_intent_id);
  return getOrderById(orderId, userId);
}
