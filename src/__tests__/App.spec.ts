import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import App from '../App.vue'
import router from '../router'

describe('App', () => {
  it('renders the site name and primary tabs', async () => {
    await router.push('/')
    await router.isReady()

    const wrapper = mount(App, {
      global: { plugins: [router, createPinia()] },
    })

    expect(wrapper.text()).toContain('The Awakened')
    expect(wrapper.text()).toContain('Awake to our environment')
    for (const tab of ['Home', 'About', 'Posts', 'Group', 'Links', 'Topics']) {
      expect(wrapper.text()).toContain(tab)
    }
  })
})
