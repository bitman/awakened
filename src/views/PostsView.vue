<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { site } from '@/content/site'
import { deletePost, listPosts, type Post } from '@/lib/posts'
import { formatDate, isMissingTable } from '@/lib/dates'
import { useSessionStore } from '@/stores/session'
import TopicList from '@/components/TopicList.vue'

const session = useSessionStore()
const posts = ref<Post[]>([])
const notice = ref('')
const loading = ref(true)

onMounted(async () => {
  try {
    posts.value = await listPosts()
  } catch (error) {
    notice.value = isMissingTable(error as { message?: string })
      ? 'Tables are not created yet. Run supabase/schema.sql in the Supabase SQL editor.'
      : error instanceof Error
        ? error.message
        : 'Could not load posts.'
  } finally {
    loading.value = false
  }
})

async function onDelete(post: Post) {
  if (!confirm(`Delete “${post.title}”?`)) return
  try {
    await deletePost(post.id)
    posts.value = posts.value.filter((item) => item.id !== post.id)
  } catch (error) {
    notice.value = error instanceof Error ? error.message : 'Could not delete.'
  }
}
</script>

<template>
  <div class="page">
    <p class="lede">Long-form</p>
    <div class="heading">
      <h1>Posts</h1>
      <RouterLink class="btn" to="/posts/new">Write</RouterLink>
    </div>
    <p class="note">{{ site.postsDisclaimer }}</p>
    <p v-if="loading" class="muted">Loading…</p>
    <p v-else-if="notice" class="empty">{{ notice }}</p>
    <p v-else-if="posts.length === 0" class="empty">No posts yet. Write the first one.</p>
    <article v-for="post in posts" :key="post.id" class="card">
      <p class="meta">
        {{ formatDate(post.date) }}
        <button v-if="session.isAdmin" class="remove" type="button" @click="onDelete(post)">Delete</button>
      </p>
      <h2>
        <RouterLink :to="`/posts/${post.slug}`">{{ post.title }}</RouterLink>
      </h2>
      <TopicList :slugs="post.topics" />
      <p class="muted">{{ post.excerpt }}</p>
    </article>
  </div>
</template>

<style scoped>
.heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.heading h1 {
  margin: 0;
}

.meta {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}
</style>
