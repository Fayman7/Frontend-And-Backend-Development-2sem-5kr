<template>
  <div class="checkout card">
    <h1>Оплата</h1>
    <p v-if="order">Заказ №{{ order.id }} — ${{ Number(order.total).toFixed(2) }}</p>
    <p v-if="order" class="muted">Статус: {{ formatStatus(order.status) }}</p>

    <div v-if="mockMode" class="mock-pay">
      <p class="muted">Ключи Stripe не настроены — включён тестовый режим без оплаты.</p>
      <button class="btn-primary" :disabled="paying" @click="mockPay">
        {{ paying ? 'Обработка...' : 'Подтвердить тестовую оплату' }}
      </button>
    </div>

    <template v-else>
      <p class="muted test-hint">
        Тестовая карта: 4242 4242 4242 4242 · любая будущая дата · любой CVC
      </p>
      <div id="payment-element" class="stripe-element"></div>
      <button
        v-if="clientSecret"
        class="btn-primary"
        :disabled="paying"
        @click="pay"
      >
        {{ paying ? 'Обработка...' : 'Оплатить' }}
      </button>
    </template>
    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="success" class="success">Оплата прошла успешно!</p>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { loadStripe } from '@stripe/stripe-js';
import api from '@/api/client';

const route = useRoute();
const router = useRouter();
const order = ref(null);
const clientSecret = ref('');
const mockMode = ref(false);
const paying = ref(false);
const error = ref('');
const success = ref(false);
let stripe = null;
let elements = null;

function formatStatus(status) {
  if (status === 'paid') return 'оплачен';
  if (status === 'pending') return 'в обработке';
  if (status === 'failed') return 'ошибка';
  return status;
}

async function loadOrder() {
  const { data } = await api.get(`/orders/${route.params.orderId}`);
  order.value = data.order;
}

async function initPayment() {
  const { data } = await api.post('/checkout/payment-intent', {
    orderId: Number(route.params.orderId),
  });
  clientSecret.value = data.clientSecret;
  mockMode.value = !!data.mock;

  if (!data.mock) {
    const pk = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!pk || pk.includes('your_key') || pk.includes('placeholder')) {
      error.value =
        'Публичный ключ Stripe не задан. Добавьте VITE_STRIPE_PUBLISHABLE_KEY в .env и пересоберите проект.';
      mockMode.value = true;
      return;
    }
    stripe = await loadStripe(pk);
    await nextTick();
    elements = stripe.elements({
      clientSecret: data.clientSecret,
      appearance: { theme: 'night', variables: { colorPrimary: '#3d9cf5' } },
    });
    const paymentElement = elements.create('payment');
    paymentElement.mount('#payment-element');
  }
}

async function syncOrderStatus() {
  const { data } = await api.post('/checkout/sync-status', {
    orderId: Number(route.params.orderId),
  });
  order.value = data.order;
  return data.order;
}

async function pay() {
  paying.value = true;
  error.value = '';
  try {
    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/orders/${route.params.orderId}`,
      },
      redirect: 'if_required',
    });
    if (stripeError) {
      error.value = stripeError.message;
    } else {
      await syncOrderStatus();
      success.value = true;
      setTimeout(() => router.push(`/orders/${route.params.orderId}`), 1500);
    }
  } finally {
    paying.value = false;
  }
}

async function mockPay() {
  paying.value = true;
  error.value = '';
  try {
    await api.post('/checkout/mock-confirm', {
      orderId: Number(route.params.orderId),
    });
    success.value = true;
    router.push(`/orders/${route.params.orderId}`);
  } catch (e) {
    error.value = e.response?.data?.error || 'Оплата не выполнена';
  } finally {
    paying.value = false;
  }
}

onMounted(async () => {
  await loadOrder();
  await initPayment();
});
</script>

<style scoped>
.checkout {
  max-width: 520px;
  margin: 0 auto;
}

.stripe-element {
  margin: 1.5rem 0;
}

.mock-pay {
  margin: 1.5rem 0;
}

.test-hint {
  font-size: 0.85rem;
  margin-bottom: 1rem;
}

.error {
  color: var(--danger);
}

.success {
  color: var(--success);
}
</style>
