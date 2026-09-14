<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { deletePost, getPostBySlug, setPostTopics, type Post } from '@/lib/posts'
import { formatDate, paragraphs, isMissingTable } from '@/lib/dates'
import { listTopics, type Topic } from '@/lib/topics'
import { useSessionStore } from '@/stores/session'
import TopicList from '@/components/TopicList.vue'

const route = useRoute()
const router = useRouter()
const session = useSessionStore()
const post = ref<Post | null>(null)
const catalog = ref<Topic[]>([])
const notice = ref('')
const loading = ref(true)
const savingTopics = ref(false)

async function load() {
  loading.value = true
  notice.value = ''
  post.value = null
  try {
    catalog.value = await listTopics()
    post.value = await getPostBySlug(String(route.params.slug))
    if (!post.value) notice.value = 'That post is not here.'
  } catch (error) {
    notice.value = isMissingTable(error as { message?: string })
      ? 'Tables are not created yet. Run supabase/schema.sql in the Supabase SQL editor.'
      : error instanceof Error
        ? error.message
        : 'Could not load this post.'
  } finally {
    loading.value = false
  }
}

async function toggleTopic(slug: string, checked: boolean) {
  if (!post.value) return
  const next = checked
    ? [...post.value.topics, slug]
    : post.value.topics.filter((topic) => topic !== slug)
  savingTopics.value = true
  try {
    await setPostTopics(post.value.id, next)
    post.value = { ...post.value, topics: next }
  } catch (error) {
    notice.value = error instanceof Error ? error.message : 'Could not update topics.'
  } finally {
    savingTopics.value = false
  }
}

async function onDelete() {
  if (!post.value) return
  if (!confirm(`Delete “${post.value.title}”?`)) return
  try {
    await deletePost(post.value.id)
    await router.push('/posts')
  } catch (error) {
    notice.value = error instanceof Error ? error.message : 'Could not delete.'
  }
}

onMounted(load)
watch(() => route.params.slug, load)
</script>

<template>
  <div class="page">
    <p v-if="loading" class="muted">Loading…</p>
    <template v-else-if="post">
      <p class="lede">
        <RouterLink to="/posts">Posts</RouterLink>
        · {{ formatDate(post.date) }}
      </p>
      <h1>{{ post.title }}</h1>
      <p v-if="session.isAdmin" class="meta">
        <button class="remove" type="button" @click="onDelete">Delete</button>
      </p>
      <TopicList :slugs="post.topics" />
      <fieldset v-if="session.isAdmin" class="assign">
        <legend>Assign topics</legend>
        <label v-for="topic in catalog" :key="topic.slug" class="check">
          <input
            type="checkbox"
            :checked="post.topics.includes(topic.slug)"
            :disabled="savingTopics"
            @change="toggleTopic(topic.slug, ($event.target as HTMLInputElement).checked)"
          />
          {{ topic.title }}
        </label>
      </fieldset>
      <div class="prose">
        <p v-for="(paragraph, index) in paragraphs(post.body)" :key="index">{{ paragraph }}</p>
      </div>
      <figure v-for="image in post.images" :key="image" class="figure">
        <img :src="image" :alt="post.title" />
      </figure>
    </template>
    <template v-else>
      <h1>Not found</h1>
      <p class="muted">{{ notice }}</p>
      <p><RouterLink to="/posts">Back to posts</RouterLink></p>
    </template>
  </div>
</template>

<style scoped>
.assign {
  margin: 0.75rem 0 1.25rem;
  padding: 0;
  border: 0;
}

legend {
  font-size: 0.8rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 0.4rem;
}

.check {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin: 0 0.85rem 0.35rem 0;
  font-size: 0.95rem;
}
</style>
