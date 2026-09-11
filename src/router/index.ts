import { createRouter, createWebHistory } from 'vue-router'
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
    { path: '/posts/:slug', name: 'post', component: () => import('../views/PostView.vue') },
    { path: '/group', name: 'group', component: () => import('../views/GroupView.vue') },
    { path: '/links', name: 'links', component: () => import('../views/LinksView.vue') },
    { path: '/topics/:slug?', name: 'topics', component: () => import('../views/TopicsView.vue') },
    { path: '/sign-in', name: 'sign-in', component: () => import('../views/LoginView.vue') },
  ],
})

export default router
