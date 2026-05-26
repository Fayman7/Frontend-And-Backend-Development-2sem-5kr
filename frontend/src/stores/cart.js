import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/api/client';
import { useAuthStore } from './auth';

const STORAGE_KEY = 'cart:v1';

function loadLocal() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveLocal(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export const useCartStore = defineStore('cart', () => {
  const items = ref(loadLocal());

  const count = computed(() =>
    items.value.reduce((sum, i) => sum + i.quantity, 0)
  );

  const total = computed(() =>
    items.value.reduce((sum, i) => sum + i.price * i.quantity, 0)
  );

  function persist() {
    saveLocal(items.value);
  }

  function addItem(product, quantity = 1) {
    const existing = items.value.find((i) => i.productId === product.id);
    const maxQty = product.stock ?? 99;
    if (existing) {
      existing.quantity = Math.min(existing.quantity + quantity, maxQty);
    } else {
      items.value.push({
        productId: product.id,
        name: product.name,
        price: Number(product.price),
        quantity: Math.min(quantity, maxQty),
        stock: product.stock,
        imageUrl: product.image_url,
      });
    }
    persist();
    syncIfAuth();
  }

  function updateQuantity(productId, quantity) {
    const item = items.value.find((i) => i.productId === productId);
    if (!item) return;
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    item.quantity = Math.min(quantity, item.stock ?? quantity);
    persist();
    syncIfAuth();
  }

  function removeItem(productId) {
    items.value = items.value.filter((i) => i.productId !== productId);
    persist();
    syncIfAuth();
  }

  function clear() {
    items.value = [];
    persist();
    syncIfAuth();
  }

  function setItems(newItems) {
    items.value = newItems.map((i) => ({
      productId: i.productId ?? i.product_id,
      name: i.name,
      price: Number(i.price),
      quantity: i.quantity,
      stock: i.stock,
      imageUrl: i.imageUrl ?? i.image_url,
    }));
    persist();
  }

  async function syncIfAuth() {
    const auth = useAuthStore();
    if (!auth.isAuthenticated) return;
    try {
      await api.put('/cart', {
        items: items.value.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      });
    } catch {
      /* ignore sync errors */
    }
  }

  async function syncWithServer() {
    const auth = useAuthStore();
    if (!auth.isAuthenticated) return;
    try {
      const local = [...items.value];
      if (local.length > 0) {
        const { data } = await api.post('/cart/sync', {
          items: local.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        });
        setItems(data.items);
      } else {
        const { data } = await api.get('/cart');
        if (data.items?.length) setItems(data.items);
      }
    } catch {
      /* ignore */
    }
  }

  async function loadFromServer() {
    const auth = useAuthStore();
    if (!auth.isAuthenticated) return;
    try {
      const { data } = await api.get('/cart');
      if (data.items?.length) setItems(data.items);
    } catch {
      /* ignore */
    }
  }

  return {
    items,
    count,
    total,
    addItem,
    updateQuantity,
    removeItem,
    clear,
    setItems,
    syncWithServer,
    loadFromServer,
    persist,
  };
});
