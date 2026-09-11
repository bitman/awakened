<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { createGroupPost, deleteGroupPost, listGroupPosts, unfurlText, type GroupPost } from '@/lib/groupPosts'
import { formatDateTime, isMissingTable } from '@/lib/dates'
import { linkParts } from '@/lib/links'
import { useSessionStore } from '@/stores/session'

const session = useSessionStore()

const items = ref<GroupPost[]>([])
const body = ref('')
const notice = ref('')
const loading = ref(true)
const pending = ref(false)

async function load() {
  loading.value = true
  try {
    items.value = await listGroupPosts()
    notice.value = ''
  } catch (error) {
    notice.value = isMissingTable(error as { message?: string })
      ? 'Run supabase/previews.sql in the SQL editor if you just added link columns.'
      : error instanceof Error
        ? error.message
        : 'Could not load the group feed.'
  } finally {
    loading.value = false
  }
}

async function onSubmit() {
  pending.value = true
  try {
    const text = body.value.trim()
    const preview = await unfurlText(text)
    await createGroupPost(text, preview)
    body.value = ''
    await load()
  } catch (error) {
    notice.value = error instanceof Error ? error.message : 'Could not publish.'
  } finally {
    pending.value = false
  }
}

async function onRemove(id: string) {
  try {
    await deleteGroupPost(id)
    items.value = items.value.filter((item) => item.id !== id)
  } catch (error) {
    notice.value = error instanceof Error ? error.message : 'Could not remove.'
  }
}

onMounted(load)
</script>

<template>
  <div class="page">
    <p class="lede">WhatsApp</p>
    <h1>Group</h1>
    <p class="note">
      Messages from the WhatsApp group land here. For now we show everything; later we can pick which ones stay.
    </p>

    <form class="compose" @submit.prevent="onSubmit">
      <div class="field">
        <label for="group-body">Add an excerpt</label>
        <textarea id="group-body" v-model="body" rows="4" required></textarea>
      </div>
      <button class="btn" type="submit" :disabled="pending">{{ pending ? 'Saving…' : 'Add to feed' }}</button>
    </form>

    <p v-if="loading" class="muted">Loading…</p>
    <p v-else-if="notice" class="empty">{{ notice }}</p>
    <p v-else-if="items.length === 0" class="empty">Nothing curated yet.</p>

    <article v-for="item in items" :key="item.id" class="card">
      <p class="meta">
        <span>
          {{ formatDateTime(item.date) }}
          <template v-if="item.author"> · {{ item.author }}</template>
        </span>
        <button v-if="session.isAdmin" class="remove" type="button" @click="onRemove(item.id)">Remove</button>
      </p>
      <div class="excerpt">
        <a
          v-if="item.linkImage"
          class="thumb"
          :href="item.linkUrl"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img :src="item.linkImage" :alt="item.linkTitle || 'Link'" />
        </a>
        <div>
          <p>
            <template v-for="(part, index) in linkParts(item.body)" :key="index">
              <a v-if="part.type === 'link'" :href="part.value" target="_blank" rel="noopener noreferrer">{{
                part.value
              }}</a>
              <template v-else>{{ part.value }}</template>
            </template>
          </p>
          <p v-if="item.linkTitle && item.linkUrl" class="link-title">
            <a :href="item.linkUrl" target="_blank" rel="noopener noreferrer">{{ item.linkTitle }}</a>
          </p>
        </div>
      </div>
    </article>
  </div>
</template>

<style scoped>
.compose {
  margin: 0 0 1.75rem;
}

.meta {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.excerpt {
  display: flex;
  gap: 0.85rem;
  align-items: flex-start;
}

.excerpt p {
  margin: 0;
}

.thumb {
  flex: 0 0 4.5rem;
  width: 4.5rem;
  height: 4.5rem;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid var(--line);
  background: var(--bg-soft);
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.link-title {
  margin-top: 0.35rem;
  font-size: 0.9rem;
}

.btn:disabled {
  opacity: 0.7;
  cursor: wait;
}
</style>
