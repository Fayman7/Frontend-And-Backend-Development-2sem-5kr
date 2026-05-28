<template>
  <div class="auth card">
    <h1>Регистрация</h1>
    <form @submit.prevent="submit">
      <label>Почта</label>
      <input v-model="email" type="email" required />
      <label>Пароль (минимум 6 символов)</label>
      <input v-model="password" type="password" minlength="6" required />
      <p v-if="auth.error" class="error">{{ auth.error }}</p>
      <button class="btn-primary" type="submit" :disabled="auth.loading">Зарегистрироваться</button>
    </form>
    <p class="muted">
      Уже есть аккаунт? <router-link to="/login">Войти</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const router = useRouter();
const email = ref('');
const password = ref('');

async function submit() {
  await auth.register(email.value, password.value);
  router.push('/');
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
