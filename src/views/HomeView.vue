<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { site } from '@/content/site'
import { listPosts, type Post } from '@/lib/posts'
import { formatDate, isMissingTable } from '@/lib/dates'
import TopicList from '@/components/TopicList.vue'

const posts = ref<Post[]>([])
const notice = ref('')

onMounted(async () => {
  try {
    posts.value = (await listPosts()).slice(0, 5)
  } catch (error) {
    notice.value = isMissingTable(error as { message?: string })
      ? 'Tables are not created yet. Run supabase/schema.sql in the Supabase SQL editor.'
      : error instanceof Error
        ? error.message
        : 'Could not load posts.'
  }
})
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
      <p v-if="notice" class="empty">{{ notice }}</p>
      <p v-else-if="posts.length === 0" class="muted">No posts yet.</p>
      <article v-for="post in posts" :key="post.id" class="card">
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
