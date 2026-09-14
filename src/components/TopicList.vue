<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { listTopics, topicTitle, type Topic } from '@/lib/topics'

const props = defineProps<{
  slugs: string[]
}>()

const catalog = ref<Topic[]>([])

onMounted(async () => {
  catalog.value = await listTopics()
})
</script>

<template>
  <p class="topics">
    <RouterLink v-for="slug in props.slugs" :key="slug" class="topic" :to="`/topics/${slug}`">
      {{ topicTitle(catalog, slug) }}
    </RouterLink>
  </p>
</template>

<style scoped>
.topics {
  margin: 0;
}
</style>
