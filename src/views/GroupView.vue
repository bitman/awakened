<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { createGroupPost, deleteGroupPost, listGroupPosts, type GroupPost } from '@/lib/groupPosts'
import { formatDate, isMissingTable } from '@/lib/dates'

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
      ? 'Tables are not created yet. Run supabase/schema.sql in the Supabase SQL editor.'
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
    await createGroupPost(body.value.trim())
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
      A curated feed from the WhatsApp group — not the whole chat, only what someone chooses to put on the site.
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
        {{ formatDate(item.date) }}
        <button class="remove" type="button" @click="onRemove(item.id)">Remove</button>
      </p>
      <p>{{ item.body }}</p>
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

.remove {
  background: none;
  border: 0;
  padding: 0;
  color: var(--muted);
  cursor: pointer;
  font: inherit;
  font-size: 0.8rem;
}

.remove:hover {
  color: var(--text);
}

.btn:disabled {
  opacity: 0.7;
  cursor: wait;
}
</style>
