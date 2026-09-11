import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia } from 'pinia'

const { getSession } = vi.hoisted(() => ({
  getSession: vi.fn<() => Promise<{ data: { session: null } }>>(),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession,
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe() {} } },
      }),
      signInWithPassword: vi.fn<() => Promise<void>>(),
      signOut: vi.fn<() => Promise<void>>(),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: () => Promise.resolve({ data: null }),
        }),
      }),
    }),
  },
}))

import App from '../App.vue'
import router from '../router'

describe('App', () => {
  beforeEach(() => {
    getSession.mockReset()
    getSession.mockResolvedValue({ data: { session: null } })
  })

  it('sends visitors to sign-in when there is no session', async () => {
    const wrapper = mount(App, {
      global: { plugins: [createPinia(), router] },
    })

    await router.push('/')
    await router.isReady()
    await flushPromises()

    expect(wrapper.text()).toContain('The Awakened')
    expect(wrapper.text()).toContain('Sign in')
    expect(wrapper.text()).not.toContain('Awake to our environment')
  })
})
