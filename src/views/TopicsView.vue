<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { listPosts, type Post } from '@/lib/posts'
import { createTopic, listTopics, type Topic } from '@/lib/topics'
import { links, linksByTopic } from '@/content/links'
import { formatDate } from '@/lib/dates'
import { useSessionStore } from '@/stores/session'

const route = useRoute()
const session = useSessionStore()
const posts = ref<Post[]>([])
const catalog = ref<Topic[]>([])
const newTitle = ref('')
const notice = ref('')
const pending = ref(false)

const current = computed(() => catalog.value.find((topic) => topic.slug === route.params.slug))
const slug = computed(() => current.value?.slug)
const topicPosts = computed(() =>
  slug.value ? posts.value.filter((post) => post.topics.includes(slug.value as string)) : posts.value,
)
const topicLinks = computed(() => (slug.value ? linksByTopic(slug.value) : links))

async function loadTopics() {
  catalog.value = await listTopics()
}

async function onAddTopic() {
  pending.value = true
  notice.value = ''
  try {
    await createTopic(newTitle.value)
    newTitle.value = ''
    await loadTopics()
  } catch (error) {
    notice.value = error instanceof Error ? error.message : 'Could not add topic.'
  } finally {
    pending.value = false
  }
}

onMounted(async () => {
  await loadTopics()
  try {
    posts.value = await listPosts()
  } catch {
    posts.value = []
  }
})
</script>

<template>
  <div class="page">
    <p class="lede">Topics</p>
    <h1>{{ current?.title ?? 'Topics' }}</h1>
    <p class="filters">
      <RouterLink class="topic" :class="{ on: !current }" to="/topics">All</RouterLink>
      <RouterLink
        v-for="topic in catalog"
        :key="topic.slug"
        class="topic"
        :class="{ on: current?.slug === topic.slug }"
        :to="`/topics/${topic.slug}`"
      >
        {{ topic.title }}
      </RouterLink>
    </p>

    <form v-if="session.isAdmin" class="add" @submit.prevent="onAddTopic">
      <div class="field">
        <label for="new-topic">New topic</label>
        <input id="new-topic" v-model="newTitle" required maxlength="40" placeholder="e.g. Food" />
      </div>
      <button class="btn" type="submit" :disabled="pending">{{ pending ? 'Adding…' : 'Add topic' }}</button>
      <p v-if="notice" class="note">{{ notice }}</p>
    </form>

    <h2 class="section">Posts</h2>
    <p v-if="topicPosts.length === 0" class="empty">No posts in this topic yet.</p>
    <article v-for="post in topicPosts" :key="post.id" class="card">
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
  margin: 0 0 1.25rem;
}

.topic.on {
  background: var(--accent);
  color: #fff;
}

.add {
  margin: 0 0 1.75rem;
  max-width: 22rem;
}

.section {
  margin: 1.75rem 0 0.25rem;
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.btn:disabled {
  opacity: 0.7;
  cursor: wait;
}
</style>
