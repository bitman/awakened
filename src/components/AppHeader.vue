<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { site } from '@/content/site'
import { useSessionStore } from '@/stores/session'

const route = useRoute()
const router = useRouter()
const session = useSessionStore()

const links = computed(() => {
  const items = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/posts', label: 'Posts' },
    { to: '/group', label: 'Group' },
    { to: '/links', label: 'Links' },
    { to: '/topics', label: 'Topics' },
  ]
  if (session.isAdmin) items.push({ to: '/members', label: 'Members' })
  return items
})

async function onSignOut() {
  await session.signOut()
  await router.push({ name: 'sign-in' })
}
</script>

<template>
  <header class="header">
    <div class="bar">
      <RouterLink class="brand" to="/">{{ site.name }}</RouterLink>
      <nav v-if="session.isSignedIn" class="nav" aria-label="Primary">
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="nav-link"
          :class="{ current: route.path === link.to }"
        >
          {{ link.label }}
        </RouterLink>
      </nav>
      <button v-if="session.isSignedIn" class="signin" type="button" @click="onSignOut">Sign out</button>
      <RouterLink v-else class="signin" to="/sign-in">Sign in</RouterLink>
    </div>
  </header>
</template>

<style scoped>
.header {
  border-bottom: 1px solid var(--line);
  background: #fff;
}

.bar {
  width: min(56rem, 100%);
  margin: 0 auto;
  padding: 0.9rem 1.25rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem 1.25rem;
}

.brand {
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--text);
  text-decoration: none;
  margin-right: 0.5rem;
}

.nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.15rem 1rem;
  flex: 1;
}

.nav-link {
  color: var(--muted);
  text-decoration: none;
  font-size: 0.95rem;
}

.nav-link:hover,
.current {
  color: var(--text);
  text-decoration: none;
}

.signin {
  margin-left: auto;
  color: var(--text);
  font-size: 0.9rem;
  font-weight: 550;
  text-decoration: none;
  background: none;
  border: 0;
  padding: 0;
  cursor: pointer;
}

.signin:hover {
  color: var(--accent);
}
</style>
