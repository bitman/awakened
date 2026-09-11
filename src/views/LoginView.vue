<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/session'

const route = useRoute()
const router = useRouter()
const session = useSessionStore()

const email = ref('')
const password = ref('')
const notice = ref('')
const pending = ref(false)

async function onSubmit() {
  notice.value = ''
  pending.value = true
  try {
    await session.signIn(email.value, password.value)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    await router.replace(redirect)
  } catch (error) {
    notice.value = error instanceof Error ? error.message : 'Could not sign in.'
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <div class="page">
    <p class="lede">Members</p>
    <h1>Sign in</h1>
    <p class="muted">This site is for the group. Ask an admin if you need an account.</p>

    <form class="form" @submit.prevent="onSubmit">
      <div class="field">
        <label for="email">Email</label>
        <input id="email" v-model="email" type="email" autocomplete="username" required />
      </div>
      <div class="field">
        <label for="password">Password</label>
        <input id="password" v-model="password" type="password" autocomplete="current-password" required />
      </div>
      <button class="btn" type="submit" :disabled="pending">{{ pending ? 'Signing in…' : 'Sign in' }}</button>
      <p v-if="notice" class="note">{{ notice }}</p>
    </form>
  </div>
</template>

<style scoped>
.form {
  margin-top: 1.5rem;
  max-width: 22rem;
}

.note {
  margin-top: 1rem;
}

.btn:disabled {
  opacity: 0.7;
  cursor: wait;
}
</style>
