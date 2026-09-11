<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { topics, type TopicSlug } from '@/content/site'
import { posts, postsByTopic } from '@/content/posts'
import { links, linksByTopic } from '@/content/links'
import { formatDate } from '@/lib/dates'

const route = useRoute()
const current = computed(() => topics.find((topic) => topic.slug === route.params.slug))
const slug = computed(() => current.value?.slug as TopicSlug | undefined)
const topicPosts = computed(() => (slug.value ? postsByTopic(slug.value) : posts))
const topicLinks = computed(() => (slug.value ? linksByTopic(slug.value) : links))
</script>

<template>
  <div class="page">
    <p class="lede">Topics</p>
    <h1>{{ current?.title ?? 'Topics' }}</h1>
    <p class="filters">
      <RouterLink class="topic" :class="{ on: !current }" to="/topics">All</RouterLink>
      <RouterLink
        v-for="topic in topics"
        :key="topic.slug"
        class="topic"
        :class="{ on: current?.slug === topic.slug }"
        :to="`/topics/${topic.slug}`"
      >
        {{ topic.title }}
      </RouterLink>
    </p>

    <h2 class="section">Posts</h2>
    <p v-if="topicPosts.length === 0" class="empty">No posts in this topic yet.</p>
    <article v-for="post in topicPosts" :key="post.slug" class="card">
      <p class="meta">{{ formatDate(post.date) }}</p>
      <h2>
        <RouterLink :to="`/posts/${post.slug}`">{{ post.title }}</RouterLink>
      </h2>
      <p class="muted">{{ post.excerpt }}</p>
    </article>

    <h2 class="section">Links</h2>
    <p v-if="topicLinks.length === 0" class="empty">No links in this topic yet.</p>
    <article v-for="link in topicLinks" :key="link.slug" class="card">
      <p class="meta">{{ formatDate(link.date) }}</p>
      <h2>
        <a :href="link.url" target="_blank" rel="noopener noreferrer">{{ link.title }}</a>
      </h2>
      <p class="muted">{{ link.note }}</p>
    </article>
  </div>
</template>

<style scoped>
.filters {
  margin: 0 0 1.75rem;
}

.topic.on {
  background: var(--accent);
  color: #fff;
}

.section {
  margin: 1.75rem 0 0.25rem;
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}
</style>
