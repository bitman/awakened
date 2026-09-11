<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getPostBySlug, type Post } from '@/lib/posts'
import { formatDate, paragraphs, isMissingTable } from '@/lib/dates'
import TopicList from '@/components/TopicList.vue'

const route = useRoute()
const post = ref<Post | null>(null)
const notice = ref('')
const loading = ref(true)

async function load() {
  loading.value = true
  notice.value = ''
  post.value = null
  try {
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
      <TopicList :slugs="post.topics" />
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
