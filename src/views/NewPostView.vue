<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { createPost } from '@/lib/posts'
import { listTopics, type Topic } from '@/lib/topics'

const router = useRouter()
const title = ref('')
const body = ref('')
const excerpt = ref('')
const selected = ref<string[]>([])
const catalog = ref<Topic[]>([])
const notice = ref('')
const pending = ref(false)

function toggleTopic(slug: string, checked: boolean) {
  if (checked) {
    selected.value = [...selected.value, slug]
    return
  }
  selected.value = selected.value.filter((topic) => topic !== slug)
}

async function onSubmit() {
  notice.value = ''
  pending.value = true
  try {
    const summary = excerpt.value.trim() || body.value.trim().slice(0, 180)
    const slug = await createPost({
      title: title.value.trim(),
      body: body.value.trim(),
      excerpt: summary,
      topics: selected.value,
    })
    await router.push(`/posts/${slug}`)
  } catch (error) {
    notice.value = error instanceof Error ? error.message : 'Could not publish.'
  } finally {
    pending.value = false
  }
}

onMounted(async () => {
  catalog.value = await listTopics()
})
</script>

<template>
  <div class="page">
    <p class="lede"><RouterLink to="/posts">Posts</RouterLink></p>
    <h1>Write a post</h1>
    <p class="muted">Long-form for the group. Separate paragraphs with a blank line.</p>

    <form class="form" @submit.prevent="onSubmit">
      <div class="field">
        <label for="title">Title</label>
        <input id="title" v-model="title" required maxlength="160" />
      </div>
      <div class="field">
        <label for="body">Body</label>
        <textarea id="body" v-model="body" required rows="12"></textarea>
      </div>
      <div class="field">
        <label for="excerpt">Short summary (optional)</label>
        <input id="excerpt" v-model="excerpt" maxlength="220" />
      </div>
      <fieldset class="field">
        <legend>Topics</legend>
        <p v-if="catalog.length === 0" class="muted">No topics yet. Admins can add them on the Topics page.</p>
        <label v-for="topic in catalog" :key="topic.slug" class="check">
          <input
            type="checkbox"
            :checked="selected.includes(topic.slug)"
            @change="toggleTopic(topic.slug, ($event.target as HTMLInputElement).checked)"
          />
          {{ topic.title }}
        </label>
      </fieldset>
      <button class="btn" type="submit" :disabled="pending">{{ pending ? 'Publishing…' : 'Publish' }}</button>
      <p v-if="notice" class="note">{{ notice }}</p>
    </form>
  </div>
</template>

<style scoped>
.form {
  margin-top: 1.5rem;
}

textarea {
  padding: 0.65rem 0.75rem;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fff;
  resize: vertical;
}

fieldset {
  border: 0;
  padding: 0;
}

legend {
  font-size: 0.85rem;
  color: var(--muted);
  margin-bottom: 0.35rem;
}

.check {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-right: 1rem;
  color: var(--text);
}

.btn:disabled {
  opacity: 0.7;
  cursor: wait;
}
</style>
