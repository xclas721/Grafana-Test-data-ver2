<template>
  <div class="flex flex-col h-full min-h-0 overflow-x-hidden min-w-0 px-4">
    <div
      class="flex-shrink-0 min-h-[59px] max-h-[59px] border-b border-base-300 flex justify-center items-center w-full min-w-0"
    >
      <span class="text-lg font-semibold text-primary truncate">{{ t('app.name') }}</span>
    </div>
    <div id="side-menu" class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden py-3 min-w-0">
      <ul class="list-none p-0 m-0 min-w-0">
        <li
          v-for="item in menuTree"
          :key="item.id"
          :class="menuCollapseIcon(item.isCollapsed)"
          class="list-none min-w-0"
        >
          <RouterLink
            v-if="!item.children"
            :to="item.path!"
            class="nav-link flex items-center gap-2 py-2.5 px-3 no-underline text-inherit hover:bg-black/5 rounded-lg transition-colors min-w-0"
          >
            <component :is="item.icon" class="w-5 h-5 shrink-0" aria-hidden="true" />
            <span class="min-w-0 truncate">{{ t(item.i18nCode) }}</span>
          </RouterLink>
          <template v-else>
            <a
              class="flex items-center gap-2 py-2.5 px-3 no-underline text-inherit hover:bg-black/5 rounded-lg cursor-pointer min-w-0"
              @click="toggleCollapse(item)"
            >
              <component :is="item.icon" class="w-5 h-5 shrink-0" aria-hidden="true" />
              <span class="flex-1 min-w-0 truncate">{{ t(item.i18nCode) }}</span>
              <ChevronRight
                class="arrow-icon w-4 h-4 ml-auto transition-transform duration-300 shrink-0"
                aria-hidden="true"
              />
            </a>
            <transition name="slide">
              <ul
                v-if="!item.isCollapsed && item.children?.length"
                class="pl-5 list-none m-0 min-w-0 overflow-hidden mt-0.5"
              >
                <li
                  v-for="child in item.children"
                  :key="child.id"
                  class="nav-item relative transition-[background,transform] duration-200 hover:bg-black/5 hover:translate-x-1.5 min-w-0"
                >
                  <RouterLink
                    :to="child.path"
                    class="nav-link flex items-center gap-2 py-2 px-3 text-sm no-underline text-inherit rounded-lg min-w-0"
                  >
                    <span class="inline-flex items-center mr-2 shrink-0">
                      <span
                        class="nav-icon-bullet w-1.5 h-1.5 rounded-full bg-base-content/40 shrink-0"
                      ></span>
                    </span>
                    <span class="min-w-0 truncate">{{ t(child.i18nCode) }}</span>
                  </RouterLink>
                </li>
              </ul>
            </transition>
          </template>
        </li>
      </ul>
    </div>
    <div
      class="flex-shrink-0 border-t border-base-300 w-full min-w-0 flex items-stretch mt-auto py-2"
    >
      <RouterLink
        to="/about"
        class="nav-link flex items-center gap-2 py-2.5 px-3 no-underline text-inherit hover:bg-black/5 rounded-lg w-full min-w-0"
      >
        <Info class="w-5 h-5 shrink-0" aria-hidden="true" />
        <span>{{ t('page.about') }}</span>
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Component } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { LayoutDashboard, Users, BookOpen, Box, Wrench, ChevronRight, Info } from 'lucide-vue-next'

const { t } = useI18n()
const route = useRoute()

interface MenuChild {
  id: string
  path: string
  i18nCode: string
}
interface MenuItem {
  id: string
  path?: string
  i18nCode: string
  icon: Component
  isCollapsed: boolean
  children?: MenuChild[]
}

const isGroupOpen = (item: MenuItem) => {
  if (!item.children?.length) return false
  const paths = item.children.map((c) => c.path)
  return paths.some(
    (p) =>
      route.path === p || (p !== '/tools' && p !== '/examples' && route.path.startsWith(p + '/'))
  )
}

const menuTree = ref<MenuItem[]>([
  {
    id: 'dashboard',
    path: '/dashboard',
    i18nCode: 'page.dashboard',
    icon: LayoutDashboard,
    isCollapsed: true
  },
  {
    id: 'management',
    i18nCode: 'page.management',
    icon: Users,
    isCollapsed: true,
    children: [
      { id: 'users', path: '/users', i18nCode: 'page.users' },
      { id: 'members', path: '/members', i18nCode: 'page.members' },
      { id: 'system-configs', path: '/system-configs', i18nCode: 'page.systemConfigs' }
    ]
  },
  {
    id: 'examples',
    i18nCode: 'page.examples',
    icon: BookOpen,
    isCollapsed: true,
    children: [
      { id: 'examples-guide', path: '/examples', i18nCode: 'page.examples.guide' },
      { id: 'examples-api', path: '/examples/api', i18nCode: 'page.api' },
      { id: 'examples-form', path: '/examples/form', i18nCode: 'page.form' },
      { id: 'examples-store', path: '/examples/store', i18nCode: 'page.store' }
    ]
  },
  {
    id: 'components',
    i18nCode: 'page.components',
    icon: Box,
    isCollapsed: true,
    children: [
      { id: 'components-guide', path: '/components/guide', i18nCode: 'page.components.guide' },
      {
        id: 'components-buttons',
        path: '/components/buttons',
        i18nCode: 'page.components.buttons'
      },
      { id: 'components-forms', path: '/components/forms', i18nCode: 'page.components.forms' },
      { id: 'components-data', path: '/components/data', i18nCode: 'page.components.data' },
      { id: 'components-modal', path: '/components/modal', i18nCode: 'page.components.modal' },
      {
        id: 'components-feedback',
        path: '/components/feedback',
        i18nCode: 'page.components.feedback'
      }
    ]
  },
  {
    id: 'tools',
    i18nCode: 'page.tools',
    icon: Wrench,
    isCollapsed: true,
    children: [
      { id: 'tools-guide', path: '/tools', i18nCode: 'page.tools.guide' },
      { id: 'tools-files', path: '/tools/files', i18nCode: 'page.files' },
      { id: 'tools-format', path: '/tools/format', i18nCode: 'page.format' },
      { id: 'tools-validation', path: '/tools/validation', i18nCode: 'page.validation' }
    ]
  }
])

// 依當前路由預開對應群組
menuTree.value.forEach((item) => {
  if (item.children?.length && isGroupOpen(item)) item.isCollapsed = false
})

function menuCollapseIcon(collapsed: boolean) {
  return collapsed ? 'nav-group' : 'nav-group show'
}

function toggleCollapse(item: MenuItem) {
  item.isCollapsed = !item.isCollapsed
}
</script>

<style scoped>
/* 隱藏捲軸，保留捲動 */
#side-menu {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
#side-menu::-webkit-scrollbar {
  display: none;
}

/* 展開/收合動畫 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}
.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}
.slide-enter-to,
.slide-leave-from {
  max-height: 500px;
  opacity: 1;
  transform: translateY(0);
}

.nav-group.show .arrow-icon {
  transform: rotate(90deg);
}

/* 子項左側色條（偽元素＋動畫） */
.nav-item:hover::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 2px;
  background: var(--color-primary);
  animation: line-grow 0.3s ease;
}
@keyframes line-grow {
  from {
    height: 0;
  }
  to {
    height: 100%;
  }
}

.nav-item .nav-link.router-link-active .nav-icon-bullet,
.nav-item:hover .nav-link .nav-icon-bullet {
  background: var(--color-primary);
}
.nav-link.router-link-active {
  background: color-mix(in srgb, var(--color-primary) 15%, transparent);
  color: var(--color-primary);
}
</style>
