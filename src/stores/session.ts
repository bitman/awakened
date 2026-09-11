import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export type MemberRole = 'member' | 'admin'

export const useSessionStore = defineStore('session', () => {
  const user = ref<User | null>(null)
  const role = ref<MemberRole>('member')
  const ready = ref(false)

  const isSignedIn = computed(() => Boolean(user.value))
  const isAdmin = computed(() => role.value === 'admin')

  async function loadRole(userId: string | undefined) {
    if (!userId) {
      role.value = 'member'
      return
    }

    const { data, error } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle()
    role.value = !error && data?.role === 'admin' ? 'admin' : 'member'
  }

  async function init() {
    if (ready.value) return

    const { data } = await supabase.auth.getSession()
    user.value = data.session?.user ?? null
    await loadRole(user.value?.id)

    supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user ?? null
      void loadRole(session?.user?.id)
    })

    ready.value = true
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    user.value = null
    role.value = 'member'
  }

  return { user, role, ready, isSignedIn, isAdmin, init, signIn, signOut }
})
