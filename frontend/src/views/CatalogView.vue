<template>
  <div>
    <h1>Catalog</h1>
    <div class="filters card">
      <input v-model="filters.q" placeholder="Search products..." @input="debouncedFetch" />
      <select v-model="filters.category" @change="fetchProducts">
        <option value="">All categories</option>
        <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
      </select>
      <input v-model.number="filters.minPrice" type="number" placeholder="Min price" @change="fetchProducts" />
      <input v-model.number="filters.maxPrice" type="number" placeholder="Max price" @change="fetchProducts" />
    </div>
    <p v-if="loading" class="muted">Loading...</p>
    <div v-else class="grid grid-products">
      <article v-for="p in products" :key="p.id" class="card product-card">
        <img :src="p.image_url || 'https://picsum.photos/400/300'" :alt="p.name" />
        <h3>
          <router-link :to="`/product/${p.id}`">{{ p.name }}</router-link>
        </h3>
        <p class="muted">{{ p.category }} · Stock: {{ p.stock }}</p>
        <p class="price">${{ Number(p.price).toFixed(2) }}</p>
        <button class="btn-primary" :disabled="p.stock < 1" @click="addToCart(p)">
          Add to cart
        </button>
      </article>
    </div>
    <div v-if="totalPages > 1" class="pagination">
      <button :disabled="page <= 1" @click="page--; fetchProducts()">Prev</button>
      <span>Page {{ page }} / {{ totalPages }}</span>
      <button :disabled="page >= totalPages" @click="page++; fetchProducts()">Next</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '@/api/client';
import { useCartStore } from '@/stores/cart';

const cart = useCartStore();
const products = ref([]);
const categories = ref([]);
const loading = ref(false);
const page = ref(1);
const total = ref(0);
const limit = 12;

const filters = ref({ q: '', category: '', minPrice: null, maxPrice: null });

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit)));

let debounceTimer;
function debouncedFetch() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    page.value = 1;
    fetchProducts();
  }, 300);
}

async function fetchProducts() {
  loading.value = true;
  try {
    const params = { page: page.value, limit };
    if (filters.value.q) params.q = filters.value.q;
    if (filters.value.category) params.category = filters.value.category;
    if (filters.value.minPrice) params.minPrice = filters.value.minPrice;
    if (filters.value.maxPrice) params.maxPrice = filters.value.maxPrice;
    const { data } = await api.get('/products', { params });
    products.value = data.items;
    total.value = data.total;
  } finally {
    loading.value = false;
  }
}

async function loadCategories() {
  const { data } = await api.get('/products/categories/list');
  categories.value = data.categories;
}

function addToCart(p) {
  cart.addItem(p);
}

onMounted(() => {
  loadCategories();
  fetchProducts();
});
</script>

<style scoped>
h1 {
  margin-bottom: 1.25rem;
}

.filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.product-card img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 0.75rem;
}

.price {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0.5rem 0;
}

.muted {
  color: var(--muted);
  font-size: 0.9rem;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}
</style>
