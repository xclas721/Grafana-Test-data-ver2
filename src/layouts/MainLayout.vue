<template>
  <div class="drawer lg:drawer-open">
    <input id="my-drawer-2" v-model="isDrawerOpen" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content flex flex-col bg-base-100">
      <a
        href="#main-content"
        class="absolute left-4 top-4 z-50 -translate-y-16 rounded bg-primary px-4 py-2 text-primary-content no-underline opacity-0 transition focus:translate-y-0 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary-focus focus:ring-offset-2"
      >
        {{ t('a11y.skipToContent') }}
      </a>
      <!-- Header -->
      <div
        class="navbar bg-base-100/80 backdrop-blur-md border-b border-base-200 px-3 md:px-4 h-16 min-h-[4rem] sticky top-0 z-30"
      >
        <!-- Mobile Drawer Toggle -->
        <label for="my-drawer-2" class="btn btn-square btn-ghost btn-sm lg:hidden mr-2">
          <Menu class="inline-block w-6 h-6" />
        </label>

        <!-- Breadcrumb (Left) -->
        <div class="flex-1 flex items-center overflow-hidden">
          <Breadcrumb :home-path="'/dashboard'" class="!mb-0" />
        </div>

        <!-- Actions (Right) -->
        <div class="flex-none flex items-center gap-1 sm:gap-2">
          <TopbarControls :current-time="currentTime" />

          <!-- User Dropdown -->
          <div class="dropdown dropdown-end ml-1 sm:ml-2">
            <label tabindex="0" class="btn btn-ghost btn-circle avatar">
              <div
                class="w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center"
              >
                <span class="text-sm font-bold">UI</span>
              </div>
            </label>
            <ul
              tabindex="0"
              class="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52 border border-base-200"
            >
              <li class="menu-title px-4 py-2 border-b border-base-200/50 mb-1">
                <div class="font-bold text-base-content">Frontend Only</div>
                <div class="font-normal text-xs text-base-content/60">No backend auth</div>
              </li>
              <li>
                <a class="py-2" @click="handleNotImplemented">
                  {{ t('page.components.guide') }}
                </a>
              </li>
              <li>
                <a class="py-2" @click="handleNotImplemented">
                  {{ t('page.tools.guide') }}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <main
        id="main-content"
        class="p-3 sm:p-4 md:p-6 flex-1 relative overflow-hidden bg-base-200/30 page-safe-area"
        tabindex="-1"
      >
        <MouseGradient />
        <div class="relative z-10">
          <RouterView v-slot="{ Component }">
            <Transition name="fade-slide" mode="out-in">
              <component :is="Component" />
            </Transition>
          </RouterView>
        </div>
      </main>
    </div>

    <!-- Sidebar -->
    <div class="drawer-side z-20">
      <label for="my-drawer-2" aria-label="close sidebar" class="drawer-overlay"></label>
      <aside
        class="w-60 h-full min-h-0 flex flex-col bg-base-100 text-base-content border-r border-base-300 overflow-x-hidden"
      >
        <SidebarMenu />
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { Menu } from 'lucide-vue-next'
import { RouterView } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { DateTime } from 'luxon'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { message } from '@/shared/utils/message'
import { Breadcrumb, MouseGradient, SidebarMenu, TopbarControls } from '@/shared/components'

const router = useRouter()
const { t } = useI18n()
const appStore = useAppStore()

const isDrawerOpen = ref(false)
const DESKTOP_BREAKPOINT = 1024

const handleNotImplemented = () => {
  message.info(t('message.comingSoon'))
}

// 當前時間（實時更新）
const currentTime = ref('')
let timeInterval: number | null = null

const updateCurrentTime = () => {
  currentTime.value = DateTime.now().setZone(appStore.timeZone).toFormat('yyyy-MM-dd HH:mm:ss')
}

// 監聽時區變化，立即更新時間
watch(
  () => appStore.timeZone,
  () => {
    updateCurrentTime()
  }
)

watch(
  () => router.currentRoute.value.path,
  () => {
    isDrawerOpen.value = false
  }
)

const syncDrawerViewportState = () => {
  if (window.innerWidth >= DESKTOP_BREAKPOINT) {
    if (isDrawerOpen.value) {
      isDrawerOpen.value = false
    }
    document.body.style.overflow = ''
    return
  }

  document.body.style.overflow = isDrawerOpen.value ? 'hidden' : ''
}

watch(isDrawerOpen, () => {
  syncDrawerViewportState()
})

onMounted(() => {
  updateCurrentTime()
  // 每秒更新一次
  timeInterval = window.setInterval(updateCurrentTime, 1000)
  window.addEventListener('resize', syncDrawerViewportState)
  syncDrawerViewportState()
})

onUnmounted(() => {
  if (timeInterval !== null) {
    clearInterval(timeInterval)
  }
  window.removeEventListener('resize', syncDrawerViewportState)
  document.body.style.overflow = ''
})
</script>
