<script setup lang="ts">
import { site } from '@/content/site'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <p>&copy; {{ year }} {{ site.name }}</p>
    <p class="quiet">Members’ site. Sign-in will lock this down.</p>
  </footer>
</template>

<style scoped>
.footer {
  width: min(56rem, 100%);
  margin: 0 auto;
  padding: 2rem 1.25rem 2.5rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.5rem 1.5rem;
  color: var(--muted);
  font-size: 0.85rem;
  border-top: 1px solid var(--line);
}

p {
  margin: 0;
}

.quiet {
  color: #8a8e8d;
}
</style>
