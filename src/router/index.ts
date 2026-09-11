import { createRouter, createWebHistory } from 'vue-router'
import { useSessionStore } from '@/stores/session'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior() {
    return { top: 0 }
  },
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/about', name: 'about', component: () => import('../views/AboutView.vue') },
    { path: '/posts', name: 'posts', component: () => import('../views/PostsView.vue') },
    { path: '/posts/new', name: 'new-post', component: () => import('../views/NewPostView.vue') },
    { path: '/posts/:slug', name: 'post', component: () => import('../views/PostView.vue') },
    { path: '/group', name: 'group', component: () => import('../views/GroupView.vue') },
    { path: '/links', name: 'links', component: () => import('../views/LinksView.vue') },
    { path: '/topics/:slug?', name: 'topics', component: () => import('../views/TopicsView.vue') },
    {
      path: '/sign-in',
      name: 'sign-in',
      component: () => import('../views/LoginView.vue'),
      meta: { public: true },
    },
  ],
})

router.beforeEach(async (to) => {
  const session = useSessionStore()
  if (!session.ready) await session.init()

  if (to.meta.public) {
    if (session.isSignedIn && to.name === 'sign-in') return { name: 'home' }
    return true
  }

  if (!session.isSignedIn) {
    return { name: 'sign-in', query: { redirect: to.fullPath } }
  }

  return true
})

export default router
