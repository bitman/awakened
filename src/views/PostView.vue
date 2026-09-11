<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { getPost } from '@/content/posts'
import { formatDate } from '@/lib/dates'
import TopicList from '@/components/TopicList.vue'

const route = useRoute()
const post = computed(() => getPost(String(route.params.slug)))
</script>

<template>
  <div class="page" v-if="post">
    <p class="lede">
      <RouterLink to="/posts">Posts</RouterLink>
      · {{ formatDate(post.date) }}
    </p>
    <h1>{{ post.title }}</h1>
    <TopicList :slugs="post.topics" />
    <div class="prose">
      <p v-for="(paragraph, index) in post.body" :key="index">{{ paragraph }}</p>
    </div>
    <figure v-for="image in post.images" :key="image" class="figure">
      <img :src="image" :alt="post.title" />
    </figure>
  </div>
  <div class="page" v-else>
    <h1>Not found</h1>
    <p class="muted">That post is not here.</p>
    <p><RouterLink to="/posts">Back to posts</RouterLink></p>
  </div>
</template>
