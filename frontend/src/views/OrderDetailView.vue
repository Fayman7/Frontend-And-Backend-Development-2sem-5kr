<template>
  <div v-if="loading" class="muted">Loading...</div>
  <div v-else-if="order" class="card">
    <h1>Order #{{ order.id }}</h1>
    <p>Status: <span :class="['badge', order.status]">{{ order.status }}</span></p>
    <p>Total: <strong>${{ Number(order.total).toFixed(2) }}</strong></p>
    <p class="muted">{{ new Date(order.created_at).toLocaleString() }}</p>
    <h2>Items</h2>
    <ul class="items">
      <li v-for="item in order.items" :key="item.productId">
        {{ item.name }} × {{ item.quantity }} — ${{ item.unitPrice.toFixed(2) }}
      </li>
    </ul>
    <router-link to="/orders">Back to orders</router-link>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/api/client';

const route = useRoute();
const order = ref(null);
const loading = ref(true);

onMounted(async () => {
  try {
    const { data } = await api.get(`/orders/${route.params.id}`);
    order.value = data.order;
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.items {
  list-style: none;
  margin: 1rem 0;
}

.items li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #334155;
}

.badge {
  text-transform: uppercase;
  font-weight: 600;
}

.badge.paid {
  color: var(--success);
}

.badge.pending {
  color: var(--accent);
}

.badge.failed {
  color: var(--danger);
}
</style>
