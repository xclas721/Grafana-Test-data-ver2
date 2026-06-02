import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { replaceWith500IfNeeded } from '@/shared/router/replaceWith500IfNeeded'
import i18n from '@/locales'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    /** i18n key 用於設定 document.title，例如 'page.dashboard' */
    title?: string
  }
}

const Layout = () => import('@/layouts/MainLayout.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/test-data/input'
  },
  {
    path: '/',
    component: Layout,
    children: [
      {
        path: 'test-data/input',
        name: 'test-data-input',
        meta: { title: 'page.testData.input' },
        component: () => import('@/pages/TestDataInputPage.vue')
      },
      {
        path: 'rate-limit-test',
        component: () => import('@/layouts/RateLimitLayout.vue'),
        meta: { title: 'page.rateLimit.group' },
        children: [
          { path: '', redirect: { name: 'rate-limit-test-areq-card' } },
          {
            path: 'areq-card',
            name: 'rate-limit-test-areq-card',
            meta: { title: 'page.rateLimit.areqCard' },
            component: () => import('@/features/rate-limit/DDoSAreqCardTest.vue')
          },
          {
            path: 'areq-merchant',
            name: 'rate-limit-test-areq-merchant',
            meta: { title: 'page.rateLimit.areqMerchant' },
            component: () => import('@/features/rate-limit/DDoSAreqMerchantTest.vue')
          },
          {
            path: 'creq-checkpoint1',
            name: 'rate-limit-test-creq-checkpoint1',
            meta: { title: 'page.rateLimit.creqCheckpoint1' },
            component: () => import('@/features/rate-limit/DDoSCreqCheckpoint1Test.vue')
          },
          {
            path: 'creq-checkpoint2',
            name: 'rate-limit-test-creq-checkpoint2',
            meta: { title: 'page.rateLimit.creqCheckpoint2' },
            component: () => import('@/features/rate-limit/DDoSCreqCheckpoint2Test.vue')
          },
          {
            path: '3dsmethod',
            name: 'rate-limit-test-3dsmethod',
            meta: { title: 'page.rateLimit.threeDSMethod' },
            component: () => import('@/features/rate-limit/DDoS3DSMethodTest.vue')
          }
        ]
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

function getAppDisplayName(): string {
  return i18n.global.t('app.name')
}

router.afterEach((to) => {
  const brand = getAppDisplayName()
  const titleKey = to.meta.title as string | undefined
  if (titleKey) {
    const t = i18n.global.t(titleKey)
    document.title = t !== titleKey ? `${t} | ${brand}` : brand
  } else {
    document.title = brand
  }
})

router.beforeEach((_to) => {
  return true
})

// 路由層級錯誤保底，避免動態載入失敗造成白屏
router.onError((error) => {
  console.error('[RouterError]', error)
  replaceWith500IfNeeded(router)
})

export default router
