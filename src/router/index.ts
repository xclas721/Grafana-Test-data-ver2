import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { replaceWith500IfNeeded } from '@/shared/router/replaceWith500IfNeeded'
import { useAuthStore } from '@/stores/auth'
import { useFrontAuthStore } from '@/stores/frontAuth'
import i18n from '@/locales'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    /** i18n key 用於設定 document.title，例如 'page.dashboard' */
    title?: string
  }
}

const Layout = () => import('@/layouts/MainLayout.vue')

const PublicLayout = () => import('@/layouts/PublicLayout.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: PublicLayout,
    children: [
      {
        path: '',
        name: 'landing',
        meta: { title: 'landing.title' },
        component: () => import('@/pages/LandingPage.vue')
      },
      {
        path: 'front/login',
        name: 'frontLogin',
        meta: { title: 'page.login' },
        component: () => import('@/pages/FrontLoginPage.vue')
      },
      {
        path: 'front',
        name: 'front',
        meta: { requiresAuth: true, title: 'page.front' },
        component: () => import('@/pages/FrontPage.vue')
      },
      {
        path: 'login',
        name: 'login',
        meta: { title: 'page.login' },
        component: () => import('@/pages/LoginPage.vue')
      }
    ]
  },
  {
    path: '/',
    component: Layout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        meta: { title: 'page.dashboard' },
        component: () => import('@/pages/HomePage.vue')
      },
      {
        path: 'components/guide',
        name: 'components-guide',
        meta: { title: 'page.components.guide' },
        component: () => import('@/pages/ComponentsGuidePage.vue')
      },
      {
        path: 'components',
        name: 'components',
        meta: { title: 'page.components.guide' },
        component: () => import('@/pages/ComponentsGuidePage.vue')
      },
      {
        path: 'components/buttons',
        name: 'components-buttons',
        meta: { title: 'page.components.buttons' },
        component: () => import('@/pages/ComponentsButtonsPage.vue')
      },
      {
        path: 'components/forms',
        name: 'components-forms',
        meta: { title: 'page.components.forms' },
        component: () => import('@/pages/ComponentsFormsPage.vue')
      },
      {
        path: 'components/data',
        name: 'components-data',
        meta: { title: 'page.components.data' },
        component: () => import('@/pages/ComponentsDataPage.vue')
      },
      {
        path: 'components/modal',
        name: 'components-modal',
        meta: { title: 'page.components.modal' },
        component: () => import('@/pages/ComponentsModalPage.vue')
      },
      {
        path: 'components/feedback',
        name: 'components-feedback',
        meta: { title: 'page.components.feedback' },
        component: () => import('@/pages/ComponentsFeedbackPage.vue')
      },
      {
        path: 'tools',
        name: 'tools',
        meta: { title: 'page.tools.guide' },
        component: () => import('@/pages/ToolsGuidePage.vue')
      },
      {
        path: 'tools/files',
        name: 'tools-files',
        meta: { title: 'page.files' },
        component: () => import('@/pages/FilePage.vue')
      },
      {
        path: 'tools/format',
        name: 'tools-format',
        meta: { title: 'page.format' },
        component: () => import('@/pages/FormatPage.vue')
      },
      {
        path: 'tools/validation',
        name: 'tools-validation',
        meta: { title: 'page.validation' },
        component: () => import('@/pages/ValidationPage.vue')
      },
      {
        path: 'users',
        name: 'users',
        meta: { requiresAuth: true, title: 'page.users' },
        component: () => import('@/pages/UserPage.vue')
      },
      {
        path: 'members',
        name: 'members',
        meta: { requiresAuth: true, title: 'page.members' },
        component: () => import('@/pages/MemberPage.vue')
      },
      {
        path: 'system-configs',
        name: 'system-configs',
        meta: { requiresAuth: true, title: 'page.systemConfigs' },
        component: () => import('@/pages/SystemConfigPage.vue')
      },
      {
        path: 'examples',
        name: 'examples',
        meta: { title: 'page.examples.guide' },
        component: () => import('@/pages/ExamplesGuidePage.vue')
      },
      {
        path: 'examples/api',
        name: 'examples-api',
        meta: { requiresAuth: true, title: 'page.api' },
        component: () => import('@/pages/ApiPage.vue')
      },
      {
        path: 'examples/form',
        name: 'examples-form',
        meta: { requiresAuth: true, title: 'page.form' },
        component: () => import('@/pages/FormPage.vue')
      },
      {
        path: 'examples/store',
        name: 'examples-store',
        meta: { requiresAuth: true, title: 'page.store' },
        component: () => import('@/pages/StorePage.vue')
      },
      {
        path: 'about',
        name: 'about',
        meta: { title: 'page.about' },
        component: () => import('@/pages/AboutPage.vue')
      }
    ]
  },
  {
    path: '/404',
    name: '404',
    meta: { title: 'error.404.title' },
    component: () => import('@/pages/Error404Page.vue')
  },
  {
    path: '/401',
    name: '401',
    meta: { title: 'error.401.title' },
    component: () => import('@/pages/Error401Page.vue')
  },
  {
    path: '/500',
    name: '500',
    meta: { title: 'error.500.title' },
    component: () => import('@/pages/Error500Page.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

const DEFAULT_DOCUMENT_TITLE = 'Brainwave Platform'

router.afterEach((to) => {
  const titleKey = to.meta.title as string | undefined
  if (titleKey) {
    const t = i18n.global.t(titleKey)
    document.title = t !== titleKey ? `${t} | Brainwave` : DEFAULT_DOCUMENT_TITLE
  } else {
    document.title = DEFAULT_DOCUMENT_TITLE
  }
})

router.beforeEach((to) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  if (!requiresAuth) return true

  const isFront = to.path.startsWith('/front')
  const store = isFront ? useFrontAuthStore() : useAuthStore()
  if (!store.isAuthenticated) {
    return {
      path: isFront ? '/front/login' : '/login',
      query: { redirect: to.fullPath }
    }
  }

  return true
})

// 路由層級錯誤保底，避免動態載入失敗造成白屏
router.onError((error) => {
  console.error('[RouterError]', error)
  replaceWith500IfNeeded(router)
})

export default router
