<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Menu, ChevronDown } from 'lucide-vue-next'
import { useFrontAuthStore } from '@/stores/frontAuth'
import { useAppStore } from '@/stores/app'
import { DateTime } from 'luxon'
import { Button, TopbarControls } from '@/shared/components'

const router = useRouter()
const { t } = useI18n()
const frontAuthStore = useFrontAuthStore()
const appStore = useAppStore()

const currentTime = ref('')
let timeInterval: number | null = null
const updateCurrentTime = () => {
  currentTime.value = DateTime.now().setZone(appStore.timeZone).toFormat('yyyy-MM-dd HH:mm:ss')
}

/** 後台管理員登入（/login） */
const goBackendLogin = () => {
  void router.push({ path: '/login', query: { redirect: '/dashboard' } })
}

/** 會員登入（/front/login） */
const goFrontLogin = () => {
  void router.push({ path: '/front/login', query: { redirect: '/front' } })
}

const goFront = () => {
  void router.push('/front')
}

const logout = () => {
  frontAuthStore.logout()
  void router.replace('/')
}

onMounted(() => {
  updateCurrentTime()
  timeInterval = window.setInterval(updateCurrentTime, 1000)
})

onUnmounted(() => {
  if (timeInterval !== null) {
    clearInterval(timeInterval)
  }
})
</script>

<template>
  <header class="navbar bg-base-100 border-b border-base-200 px-4 md:px-6 min-h-14">
    <div class="flex-1">
      <RouterLink to="/" class="text-xl font-bold text-base-content hover:opacity-80">
        {{ t('landing.title') }}
      </RouterLink>
    </div>
    <nav class="flex-none flex items-center gap-2">
      <TopbarControls :current-time="currentTime" />
      <div class="dropdown dropdown-end sm:hidden">
        <label tabindex="0" class="btn btn-ghost btn-sm btn-square">
          <Menu class="w-5 h-5" />
        </label>
        <ul
          tabindex="0"
          class="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52 border border-base-200"
        >
          <li v-if="!frontAuthStore.isAuthenticated">
            <a @click="goBackendLogin">{{ t('topbar.backendLogin') }}</a>
          </li>
          <li v-if="!frontAuthStore.isAuthenticated">
            <a @click="goFrontLogin">{{ t('topbar.frontLogin') }}</a>
          </li>
          <template v-else>
            <li>
              <a @click="goFront">{{ t('topbar.memberStatus') }}</a>
            </li>
            <li>
              <a @click="logout">{{ t('ui.logout') }}</a>
            </li>
          </template>
        </ul>
      </div>
      <div class="divider divider-horizontal mx-0 hidden sm:flex"></div>
      <!-- 桌面：單一「登入」dropdown，展開為後台登入 / 會員登入 -->
      <div v-if="!frontAuthStore.isAuthenticated" class="hidden sm:block dropdown dropdown-end">
        <label tabindex="0" class="btn btn-primary btn-sm">
          {{ t('page.login') }}
          <ChevronDown class="w-4 h-4" />
        </label>
        <ul
          tabindex="0"
          class="mt-2 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-48 border border-base-200"
        >
          <li>
            <a @click="goBackendLogin">{{ t('topbar.backendLogin') }}</a>
          </li>
          <li>
            <a @click="goFrontLogin">{{ t('topbar.frontLogin') }}</a>
          </li>
        </ul>
      </div>
      <template v-else>
        <Button variant="ghost" class="btn-sm hidden sm:inline-flex" @click="goFront">
          {{ t('topbar.memberStatus') }}
        </Button>
        <Button variant="ghost" class="btn-sm hidden sm:inline-flex" @click="logout">
          {{ t('ui.logout') }}
        </Button>
      </template>
    </nav>
  </header>
</template>
