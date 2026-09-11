<script setup lang="ts">
import { ref } from 'vue'

const email = ref('')
const password = ref('')
const notice = ref('')

function onSubmit() {
  notice.value =
    'Sign-in is not wired yet. Next step is a separate Supabase organisation and password accounts for members.'
}
</script>

<template>
  <div class="page">
    <p class="lede">Members</p>
    <h1>Sign in</h1>
    <p class="muted">This site will be for the group only. Accounts come after we stand up Supabase on its own org.</p>

    <form class="form" @submit.prevent="onSubmit">
      <div class="field">
        <label for="email">Email</label>
        <input id="email" v-model="email" type="email" autocomplete="username" required />
      </div>
      <div class="field">
        <label for="password">Password</label>
        <input id="password" v-model="password" type="password" autocomplete="current-password" required />
      </div>
      <button class="btn" type="submit">Sign in</button>
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
</style>
