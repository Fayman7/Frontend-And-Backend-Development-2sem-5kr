import 'dotenv/config';
import Stripe from 'stripe';
import { isStripeConfigured } from '../src/services/stripeService.js';

const secret = process.env.STRIPE_SECRET_KEY;
const webhook = process.env.STRIPE_WEBHOOK_SECRET;
const publishable = process.env.VITE_STRIPE_PUBLISHABLE_KEY;

console.log('Stripe configuration check\n');

if (!isStripeConfigured(secret)) {
  console.error('✗ STRIPE_SECRET_KEY is missing or still a placeholder');
  console.error('  Set sk_test_… in .env (https://dashboard.stripe.com/test/apikeys)');
  process.exit(1);
}

if (!isStripeConfigured(webhook)) {
  console.warn('⚠ STRIPE_WEBHOOK_SECRET not set — webhooks skipped');
  console.warn('  Run: stripe listen --forward-to localhost:3000/api/webhooks/stripe');
} else {
  console.log('✓ STRIPE_WEBHOOK_SECRET set');
}

if (publishable && !isStripeConfigured(publishable)) {
  console.warn('⚠ VITE_STRIPE_PUBLISHABLE_KEY is a placeholder');
} else if (publishable) {
  console.log('✓ VITE_STRIPE_PUBLISHABLE_KEY set');
}

try {
  const stripe = new Stripe(secret);
  const account = await stripe.accounts.retrieve();
  console.log(`✓ Secret key valid (account: ${account.id})`);
  process.exit(0);
} catch (err) {
  console.error('✗ Invalid STRIPE_SECRET_KEY:', err.message);
  process.exit(1);
}
