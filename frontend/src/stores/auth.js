import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/api/client';
import { useCartStore } from './cart';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const token = ref(localStorage.getItem('token') || '');
  const loading = ref(false);
  const error = ref('');

  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === 'admin');

  function setSession(newToken, newUser) {
    token.value = newToken;
    user.value = newUser;
    localStorage.setItem('token', newToken);
  }

  function clearSession() {
    token.value = '';
    user.value = null;
    localStorage.removeItem('token');
  }

  async function register(email, password) {
    loading.value = true;
    error.value = '';
    try {
      const { data } = await api.post('/auth/register', { email, password });
      setSession(data.token, data.user);
      const cartStore = useCartStore();
      await cartStore.syncWithServer();
      return data;
    } catch (e) {
      error.value = e.response?.data?.error || 'Registration failed';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function login(email, password) {
    loading.value = true;
    error.value = '';
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setSession(data.token, data.user);
      const cartStore = useCartStore();
      await cartStore.syncWithServer();
      return data;
    } catch (e) {
      error.value = e.response?.data?.error || 'Login failed';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function fetchMe() {
    if (!token.value) return;
    try {
      const { data } = await api.get('/auth/me');
      user.value = data.user;
    } catch {
      clearSession();
    }
  }

  function logout() {
    clearSession();
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    register,
    login,
    fetchMe,
    logout,
    setSession,
    clearSession,
  };
});
