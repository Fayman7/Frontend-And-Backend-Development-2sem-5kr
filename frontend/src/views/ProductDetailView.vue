<template>
  <div v-if="loading" class="muted">Loading...</div>
  <div v-else-if="product" class="detail card">
    <img :src="product.image_url || 'https://picsum.photos/600/400'" :alt="product.name" />
    <div class="info">
      <h1>{{ product.name }}</h1>
      <p class="muted">{{ product.category }}</p>
      <p>{{ product.description }}</p>
      <p class="price">${{ Number(product.price).toFixed(2) }}</p>
      <p>In stock: {{ product.stock }}</p>
      <div class="actions">
        <input v-model.number="qty" type="number" min="1" :max="product.stock" style="width: 80px" />
        <button class="btn-primary" :disabled="product.stock < 1" @click="add">Add to cart</button>
      </div>
    </div>
  </div>
  <p v-else>Product not found</p>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/api/client';
import { useCartStore } from '@/stores/cart';

const route = useRoute();
const cart = useCartStore();
const product = ref(null);
const loading = ref(true);
const qty = ref(1);

async function load() {
  loading.value = true;
  try {
    const { data } = await api.get(`/products/${route.params.id}`);
    product.value = data.product;
  } finally {
    loading.value = false;
  }
}

function add() {
  cart.addItem(product.value, qty.value);
}

onMounted(load);
</script>

<style scoped>
.detail {
  display: grid;
  gap: 2rem;
}

@media (min-width: 768px) {
  .detail {
    grid-template-columns: 1fr 1fr;
  }
}

.detail img {
  width: 100%;
  border-radius: var(--radius);
  max-height: 400px;
  object-fit: cover;
}

.price {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 1rem 0;
}

.actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}
</style>
