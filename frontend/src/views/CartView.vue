<template>
  <div>
    <h1>Корзина</h1>
    <p v-if="cart.items.length === 0" class="muted">Ваша корзина пуста.</p>
    <div v-else>
      <ul class="cart-list">
        <li v-for="item in cart.items" :key="item.productId" class="card cart-item">
          <img :src="item.imageUrl || 'https://picsum.photos/80'" alt="" />
          <div class="info">
            <strong>{{ item.name }}</strong>
            <p>${{ item.price.toFixed(2) }} за шт.</p>
          </div>
          <input
            type="number"
            :value="item.quantity"
            min="1"
            :max="item.stock"
            style="width: 70px"
            @change="updateQty(item.productId, +$event.target.value)"
          />
          <p class="line-total">${{ (item.price * item.quantity).toFixed(2) }}</p>
          <button class="btn-danger" @click="cart.removeItem(item.productId)">Удалить</button>
        </li>
      </ul>
      <div class="summary card">
        <p>Итого: <strong>${{ cart.total.toFixed(2) }}</strong></p>
        <button
          class="btn-primary"
          :disabled="checkoutLoading"
          @click="checkout"
        >
          {{ checkoutLoading ? 'Обработка...' : 'Оформить заказ' }}
        </button>
        <p v-if="error" class="error">{{ error }}</p>
        <p v-if="!auth.isAuthenticated" class="muted">
          <router-link to="/login">Войдите</router-link>, чтобы оформить заказ
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/api/client';
import { useCartStore } from '@/stores/cart';
import { useAuthStore } from '@/stores/auth';

const cart = useCartStore();
const auth = useAuthStore();
const router = useRouter();
const checkoutLoading = ref(false);
const error = ref('');

function updateQty(id, qty) {
  cart.updateQuantity(id, qty);
}

async function checkout() {
  if (!auth.isAuthenticated) {
    router.push({ name: 'login', query: { redirect: '/cart' } });
    return;
  }
  checkoutLoading.value = true;
  error.value = '';
  try {
    await api.put('/cart', {
      items: cart.items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      })),
    });
    const { data } = await api.post('/orders');
    router.push({ name: 'checkout', params: { orderId: data.order.id } });
  } catch (e) {
    error.value = e.response?.data?.error || 'Не удалось оформить заказ';
  } finally {
    checkoutLoading.value = false;
  }
}
</script>

<style scoped>
.cart-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.cart-item img {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 8px;
}

.info {
  flex: 1;
  min-width: 120px;
}

.summary {
  max-width: 400px;
}

.error {
  color: var(--danger);
  margin-top: 0.5rem;
}
</style>
