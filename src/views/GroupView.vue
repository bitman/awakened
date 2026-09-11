<script setup lang="ts">
import { groupPosts } from '@/content/group'
import { formatDate } from '@/lib/dates'
</script>

<template>
  <div class="page">
    <p class="lede">WhatsApp</p>
    <h1>Group</h1>
    <p class="note">
      A curated feed from the WhatsApp group — not the whole chat, only what someone chooses to put on the site.
    </p>

    <p v-if="groupPosts.length === 0" class="empty">
      Nothing curated yet. When we start selecting messages, they will show here as short dated posts.
    </p>

    <article v-for="item in groupPosts" :key="item.id" class="card">
      <p class="meta">{{ formatDate(item.date) }}</p>
      <p>{{ item.body }}</p>
    </article>
  </div>
</template>
