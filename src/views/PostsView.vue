<script setup lang="ts">
import { site } from '@/content/site'
import { posts } from '@/content/posts'
import { formatDate } from '@/lib/dates'
import TopicList from '@/components/TopicList.vue'
</script>

<template>
  <div class="page">
    <p class="lede">Long-form</p>
    <h1>Posts</h1>
    <p class="note">{{ site.postsDisclaimer }} Members will be able to publish here once sign-in is in place.</p>

    <article v-for="post in posts" :key="post.slug" class="card">
      <p class="meta">{{ formatDate(post.date) }}</p>
      <h2>
        <RouterLink :to="`/posts/${post.slug}`">{{ post.title }}</RouterLink>
      </h2>
      <TopicList :slugs="post.topics" />
      <p class="muted">{{ post.excerpt }}</p>
    </article>
  </div>
</template>
