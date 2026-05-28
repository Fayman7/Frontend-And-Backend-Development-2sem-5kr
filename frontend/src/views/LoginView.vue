<template>
  <div class="auth card">
    <h1>Вход</h1>
    <form @submit.prevent="submit">
      <label>Почта</label>
      <input v-model="email" type="email" required />
      <label>Пароль</label>
      <input v-model="password" type="password" required />
      <p v-if="auth.error" class="error">{{ auth.error }}</p>
      <button class="btn-primary" type="submit" :disabled="auth.loading">Войти</button>
    </form>
    <p class="muted">
      Нет аккаунта? <router-link to="/register">Зарегистрироваться</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();
const email = ref('');
const password = ref('');

async function submit() {
  await auth.login(email.value, password.value);
  router.push(route.query.redirect || '/');
}
</script>

<style scoped>
.auth {
  max-width: 400px;
  margin: 0 auto;
}

form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 1rem 0;
}

label {
  font-size: 0.9rem;
  color: var(--muted);
}

.error {
  color: var(--danger);
}
</style>
