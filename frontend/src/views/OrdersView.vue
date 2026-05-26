<template>
  <div>
    <h1>Order history</h1>
    <p v-if="loading" class="muted">Loading...</p>
    <ul v-else class="orders">
      <li v-for="o in orders" :key="o.id" class="card">
        <router-link :to="`/orders/${o.id}`">
          Order #{{ o.id }} — ${{ Number(o.total).toFixed(2) }}
        </router-link>
        <span :class="['badge', o.status]">{{ o.status }}</span>
        <p class="muted">{{ new Date(o.created_at).toLocaleString() }}</p>
      </li>
    </ul>
    <p v-if="!loading && orders.length === 0" class="muted">No orders yet.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/api/client';

const orders = ref([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const { data } = await api.get('/orders');
    orders.value = data.orders;
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.orders {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.75rem;
  margin-left: 0.5rem;
  text-transform: uppercase;
}

.badge.paid {
  background: rgba(52, 211, 153, 0.2);
  color: var(--success);
}

.badge.pending {
  background: rgba(61, 156, 245, 0.2);
  color: var(--accent);
}

.badge.failed {
  background: rgba(248, 113, 113, 0.2);
  color: var(--danger);
}
</style>
