<script setup lang="ts">
import { links } from '@/content/links'
import { formatDate } from '@/lib/dates'
import TopicList from '@/components/TopicList.vue'
</script>

<template>
  <div class="page">
    <p class="lede">From the group</p>
    <h1>Links</h1>
    <p class="note">Videos and pieces the group has pointed at.</p>

    <article v-for="link in links" :key="link.slug" class="card">
      <p class="meta">{{ formatDate(link.date) }}</p>
      <h2>
        <a :href="link.url" target="_blank" rel="noopener noreferrer">{{ link.title }}</a>
      </h2>
      <TopicList :slugs="link.topics" />
      <p class="muted">{{ link.note }}</p>
    </article>
  </div>
</template>
