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
      <div class="header-bar sticky top-0 z-30">
        <div class="header-bar-inner border-b border-base-200 px-4">
          <label for="my-drawer-2" class="header-toggler btn btn-square btn-ghost btn-sm lg:hidden">
            <Menu class="inline-block w-6 h-6" />
          </label>
          <div class="header-breadcrumb">
            <Breadcrumb
              :home-path="'/'"
              :path-label-map="{
                '/test-data': 'Test Data',
                '/test-data/input': 'Test Data Input'
              }"
            />
          </div>
          <div class="header-actions-wrapper ms-auto">
            <TopbarControls :current-time="currentTime" />
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
import { Breadcrumb, MouseGradient, SidebarMenu, TopbarControls } from '@/shared/components'

const router = useRouter()
const { t } = useI18n()
const appStore = useAppStore()

const isDrawerOpen = ref(false)
const DESKTOP_BREAKPOINT = 1024

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

<style scoped>
.header-bar {
  background: color-mix(in srgb, var(--color-base-100) 88%, transparent);
  backdrop-filter: blur(10px);
}

.header-bar-inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  min-height: 59px;
  gap: 0.5rem;
}

.header-breadcrumb {
  flex: 1;
  min-width: 0;
}

.header-actions-wrapper {
  min-width: 0;
}

.header-toggler {
  margin-inline-start: -8px;
}

@media (max-width: 991.98px) {
  .header-bar-inner {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    grid-template-areas:
      'toggler actions'
      'breadcrumb breadcrumb';
    align-items: center;
    min-height: auto;
    row-gap: 0.375rem;
    column-gap: 0.5rem;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }

  .header-toggler {
    grid-area: toggler;
    margin-inline-start: -4px;
  }

  .header-breadcrumb {
    grid-area: breadcrumb;
    width: 100%;
  }

  .header-actions-wrapper {
    grid-area: actions;
    margin-left: auto;
  }
}
</style>
