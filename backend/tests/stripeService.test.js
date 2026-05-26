import { jest } from '@jest/globals';

jest.unstable_mockModule('../src/db/pool.js', () => ({
  default: { query: jest.fn().mockResolvedValue({ rows: [] }) },
}));

jest.unstable_mockModule('../src/services/orderService.js', () => ({
  getOrderById: jest.fn(),
  updateOrderStatus: jest.fn(),
  restoreOrderStock: jest.fn(),
}));

const orderService = await import('../src/services/orderService.js');
const { createPaymentIntent, confirmMockPayment, setStripe } = await import(
  '../src/services/stripeService.js'
);

beforeEach(() => {
  setStripe(null);
  process.env.STRIPE_SECRET_KEY = 'sk_test_placeholder';
});

describe('stripeService', () => {
  test('createPaymentIntent mock mode', async () => {
    orderService.getOrderById.mockResolvedValueOnce({
      id: 5,
      status: 'pending',
      total: 25,
      user_id: 1,
      items: [],
    });

    const result = await createPaymentIntent(5, 1);
    expect(result.mock).toBe(true);
    expect(result.clientSecret).toContain('secret');
  });

  test('confirmMockPayment marks paid', async () => {
    orderService.getOrderById
      .mockResolvedValueOnce({
        id: 5,
        status: 'pending',
        stripe_payment_intent_id: 'pi_mock_5',
      })
      .mockResolvedValueOnce({ id: 5, status: 'paid' });
    orderService.updateOrderStatus.mockResolvedValueOnce({});

    const order = await confirmMockPayment(5, 1);
    expect(order.status).toBe('paid');
  });
});
