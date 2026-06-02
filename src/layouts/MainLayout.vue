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

      <header class="header header-sticky header-bar sticky top-0 z-30 p-0 mb-0">
        <div class="header-bar-inner border-b border-base-300 px-4">
          <label
            for="my-drawer-2"
            class="header-toggler header-toggler-button btn btn-square btn-ghost btn-sm lg:hidden"
          >
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
            <TopbarControls />
          </div>
        </div>
      </header>

      <main
        id="main-content"
        class="p-3 sm:p-4 md:p-6 flex-1 relative overflow-hidden page-safe-area"
        style="background: var(--app-main-bg)"
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

    <div class="drawer-side z-20">
      <label for="my-drawer-2" aria-label="close sidebar" class="drawer-overlay"></label>
      <aside
        class="app-sidebar w-60 h-full min-h-0 flex flex-col bg-base-100 text-base-content border-r border-base-300 overflow-x-hidden"
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
import { useRouter } from 'vue-router'
import { Breadcrumb, MouseGradient, SidebarMenu, TopbarControls } from '@/shared/components'

const router = useRouter()
const { t } = useI18n()

const isDrawerOpen = ref(false)
const DESKTOP_BREAKPOINT = 1024

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
  window.addEventListener('resize', syncDrawerViewportState)
  syncDrawerViewportState()
})

onUnmounted(() => {
  window.removeEventListener('resize', syncDrawerViewportState)
  document.body.style.overflow = ''
})
</script>
