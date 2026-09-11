<script setup lang="ts">
import { site } from '@/content/site'
import { posts } from '@/content/posts'
import { formatDate } from '@/lib/dates'
import TopicList from '@/components/TopicList.vue'
</script>

<template>
  <div class="page">
    <p class="lede">{{ site.domain }}</p>
    <h1>{{ site.tagline }}</h1>
    <p class="intro">{{ site.intro }} A closed group. Long-form writing and a curated WhatsApp feed live here.</p>

    <figure class="figure hero">
      <img src="/images/aw_members_1.jpg" alt="People gathered under a tree in the rain" />
    </figure>

    <section>
      <h2 class="section">Latest posts</h2>
      <article v-for="post in posts" :key="post.slug" class="card">
        <p class="meta">{{ formatDate(post.date) }}</p>
        <h2>
          <RouterLink :to="`/posts/${post.slug}`">{{ post.title }}</RouterLink>
        </h2>
        <TopicList :slugs="post.topics" />
        <p class="muted">{{ post.excerpt }}</p>
      </article>
    </section>
  </div>
</template>

<style scoped>
.intro {
  margin: 0 0 1.5rem;
  font-size: 1.15rem;
  color: var(--muted);
  max-width: 38rem;
}

.hero {
  margin-bottom: 2.5rem;
}

.section {
  margin: 0 0 0.5rem;
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
  font-weight: 600;
}

.card p:last-child {
  margin: 0.4rem 0 0;
}
</style>
