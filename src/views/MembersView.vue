<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { createMember, listMembers, setMemberRole, type Member } from '@/lib/members'
import type { MemberRole } from '@/stores/session'

const members = ref<Member[]>([])
const email = ref('')
const password = ref('')
const role = ref<MemberRole>('member')
const notice = ref('')
const createdPassword = ref('')
const loading = ref(true)
const pending = ref(false)

async function load() {
  loading.value = true
  try {
    members.value = await listMembers()
    notice.value = ''
  } catch (error) {
    notice.value = error instanceof Error ? error.message : 'Could not load members.'
  } finally {
    loading.value = false
  }
}

async function onAdd() {
  pending.value = true
  createdPassword.value = ''
  try {
    const result = await createMember({
      email: email.value.trim(),
      password: password.value.trim() || undefined,
      role: role.value,
    })
    email.value = ''
    password.value = ''
    role.value = 'member'
    if (result.password) createdPassword.value = result.password
    await load()
  } catch (error) {
    notice.value = error instanceof Error ? error.message : 'Could not add user.'
  } finally {
    pending.value = false
  }
}

async function onRole(member: Member, next: string) {
  const value: MemberRole = next === 'admin' ? 'admin' : 'member'
  try {
    await setMemberRole(member.id, value)
    member.role = value
  } catch (error) {
    notice.value = error instanceof Error ? error.message : 'Could not change role.'
    await load()
  }
}

onMounted(load)
</script>

<template>
  <div class="page">
    <p class="lede">Admins</p>
    <h1>Members</h1>
    <p class="muted">Add people and choose whether they are an admin or a normal member. Tell them the password yourself.</p>

    <form class="form" @submit.prevent="onAdd">
      <div class="field">
        <label for="member-email">Email</label>
        <input id="member-email" v-model="email" type="email" required autocomplete="off" />
      </div>
      <div class="field">
        <label for="member-password">Password (blank = we generate one)</label>
        <input id="member-password" v-model="password" type="text" minlength="8" autocomplete="off" />
      </div>
      <div class="field">
        <label for="member-role">Role</label>
        <select id="member-role" v-model="role">
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <button class="btn" type="submit" :disabled="pending">{{ pending ? 'Adding…' : 'Add user' }}</button>
    </form>

    <p v-if="createdPassword" class="note">
      Generated password (copy it now): <strong>{{ createdPassword }}</strong>
    </p>
    <p v-if="notice" class="empty">{{ notice }}</p>
    <p v-if="loading" class="muted">Loading…</p>

    <article v-for="member in members" :key="member.id" class="card row">
      <p class="email">{{ member.email }}</p>
      <label class="role">
        <span class="sr">Role</span>
        <select :value="member.role" @change="onRole(member, ($event.target as HTMLSelectElement).value)">
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
      </label>
    </article>
  </div>
</template>

<style scoped>
.form {
  margin: 1.25rem 0 1.75rem;
  max-width: 24rem;
}

select {
  padding: 0.55rem 0.7rem;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fff;
  font: inherit;
}

.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem 1rem;
}

.email {
  margin: 0;
}

.role {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}

.btn:disabled {
  opacity: 0.7;
  cursor: wait;
}
</style>
