<template>
  <div class="layout">
    <header class="header">
      <router-link to="/" class="logo">Магазин</router-link>
      <nav class="nav">
        <router-link to="/">Каталог</router-link>
        <router-link to="/cart">Корзина ({{ cart.count }})</router-link>
        <router-link v-if="auth.isAuthenticated" to="/orders">Заказы</router-link>
        <router-link v-if="auth.isAdmin" to="/admin">Админ</router-link>
      </nav>
      <div class="auth-actions">
        <template v-if="auth.isAuthenticated">
          <span class="user-email">{{ auth.user?.email }}</span>
          <button class="btn-secondary" @click="logout">Выйти</button>
        </template>
        <template v-else>
          <router-link to="/login" class="btn-secondary btn">Войти</router-link>
          <router-link to="/register" class="btn-primary btn">Регистрация</router-link>
        </template>
      </div>
    </header>
    <main class="main">
      <router-view />
    </main>
    <footer class="footer">Демо-магазин — Vue + Express + PostgreSQL + Stripe</footer>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useCartStore } from '@/stores/cart';

const auth = useAuthStore();
const cart = useCartStore();
const router = useRouter();

onMounted(async () => {
  if (auth.token) {
    await auth.fetchMe();
    await cart.loadFromServer();
  }
});

function logout() {
  auth.logout();
  router.push('/');
}
</script>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem 2rem;
  background: var(--surface);
  border-bottom: 1px solid #334155;
  flex-wrap: wrap;
}

.logo {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--text);
}

.nav {
  display: flex;
  gap: 1.25rem;
  flex: 1;
}

.nav a.router-link-active {
  color: var(--accent);
}

.auth-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-email {
  color: var(--muted);
  font-size: 0.9rem;
}

.main {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.footer {
  text-align: center;
  padding: 1.5rem;
  color: var(--muted);
  font-size: 0.85rem;
}

@media (max-width: 640px) {
  .header {
    padding: 1rem;
  }
  .main {
    padding: 1rem;
  }
}
</style>
