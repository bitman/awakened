<script setup lang="ts">
import { topics, type TopicSlug } from '@/content/site'

defineProps<{
  slugs: TopicSlug[]
}>()
</script>

<template>
  <p class="topics">
    <RouterLink v-for="slug in slugs" :key="slug" class="topic" :to="`/topics/${slug}`">
      {{ topics.find((topic) => topic.slug === slug)?.title }}
    </RouterLink>
  </p>
</template>

<style scoped>
.topics {
  margin: 0;
}
</style>
