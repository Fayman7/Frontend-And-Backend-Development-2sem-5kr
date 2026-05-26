<template>
  <div>
    <h1>Admin — Products</h1>
    <form class="card form" @submit.prevent="save">
      <h2>{{ editing ? 'Edit' : 'Add' }} product</h2>
      <input v-model="form.name" placeholder="Name" required />
      <textarea v-model="form.description" placeholder="Description" rows="2" />
      <input v-model.number="form.price" type="number" step="0.01" placeholder="Price" required />
      <input v-model="form.category" placeholder="Category" />
      <input v-model.number="form.stock" type="number" placeholder="Stock" />
      <input v-model="form.image_url" placeholder="Image URL" />
      <div class="form-actions">
        <button class="btn-primary" type="submit">{{ editing ? 'Update' : 'Create' }}</button>
        <button v-if="editing" type="button" class="btn-secondary" @click="resetForm">Cancel</button>
      </div>
      <p v-if="error" class="error">{{ error }}</p>
    </form>

    <table class="table card">
      <thead>
        <tr>
          <th>Name</th>
          <th>Price</th>
          <th>Stock</th>
          <th>Category</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in products" :key="p.id">
          <td>{{ p.name }}</td>
          <td>${{ Number(p.price).toFixed(2) }}</td>
          <td>
            <input
              type="number"
              :value="p.stock"
              min="0"
              style="width: 70px"
              @change="updateStock(p.id, +$event.target.value)"
            />
          </td>
          <td>{{ p.category }}</td>
          <td>
            <button class="btn-secondary" @click="edit(p)">Edit</button>
            <button class="btn-danger" @click="remove(p.id)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/api/client';

const products = ref([]);
const editing = ref(false);
const editId = ref(null);
const error = ref('');
const form = ref({
  name: '',
  description: '',
  price: 0,
  category: 'general',
  stock: 0,
  image_url: '',
});

async function load() {
  const { data } = await api.get('/products', { params: { limit: 100 } });
  products.value = data.items;
}

function resetForm() {
  editing.value = false;
  editId.value = null;
  form.value = {
    name: '',
    description: '',
    price: 0,
    category: 'general',
    stock: 0,
    image_url: '',
  };
}

function edit(p) {
  editing.value = true;
  editId.value = p.id;
  form.value = { ...p, image_url: p.image_url || '' };
}

async function save() {
  error.value = '';
  try {
    if (editing.value) {
      await api.put(`/admin/products/${editId.value}`, form.value);
    } else {
      await api.post('/admin/products', form.value);
    }
    resetForm();
    await load();
  } catch (e) {
    error.value = e.response?.data?.error || 'Save failed';
  }
}

async function updateStock(id, stock) {
  await api.patch(`/admin/products/${id}/stock`, { stock });
  await load();
}

async function remove(id) {
  if (!confirm('Delete product?')) return;
  await api.delete(`/admin/products/${id}`);
  await load();
}

onMounted(load);
</script>

<style scoped>
.form {
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
}

.table {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #334155;
}

.error {
  color: var(--danger);
}
</style>
