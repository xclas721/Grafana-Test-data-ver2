<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterLink, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

interface BreadcrumbItem {
  label: string
  path: string
  isActive: boolean
  isClickable: boolean
}

interface BreadcrumbProps {
  /**
   * 自定義路徑到標籤的映射
   * 如果未提供，將自動從路由和 i18n 中獲取
   */
  pathLabelMap?: Record<string, string>
  /**
   * 自定義不可點擊的路徑列表
   * 如果路徑不存在對應路由，將自動設為不可點擊
   */
  nonClickablePaths?: string[]
  /**
   * i18n key 前綴，默認為 'page.'
   */
  i18nPrefix?: string
  /**
   * 首頁路徑
   */
  homePath?: string
}

const props = withDefaults(defineProps<BreadcrumbProps>(), {
  pathLabelMap: () => ({}),
  nonClickablePaths: () => [],
  i18nPrefix: 'page.',
  homePath: '/'
})

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

/**
 * 檢查路由是否存在
 */
const routeExists = (path: string): boolean => {
  try {
    const resolved = router.resolve(path)
    // 如果解析成功且不是 404 頁面，則認為路由存在
    if (resolved.name === '404' || resolved.matched.length === 0) {
      return false
    }
    // 檢查是否匹配到實際路由（排除 catch-all 路由）
    return resolved.matched.some((match) => {
      const routePath = match.path
      // 排除 catch-all 路由
      if (routePath.includes('*') || routePath.includes(':')) {
        // 對於動態路由，檢查是否實際匹配
        return match.name !== undefined
      }
      return routePath === path || path.startsWith(routePath + '/')
    })
  } catch {
    return false
  }
}

/**
 * 獲取路徑標籤
 */
const getPathLabel = (segment: string, fullPath: string): string => {
  // 優先使用自定義映射
  if (props.pathLabelMap[fullPath]) {
    return props.pathLabelMap[fullPath]
  }
  if (props.pathLabelMap[segment]) {
    return props.pathLabelMap[segment]
  }

  // 嘗試從 i18n 獲取（使用完整路徑）
  const i18nKeyFull = `${props.i18nPrefix}${fullPath.replace(/^\//, '').replace(/\//g, '.')}`
  if (t(i18nKeyFull) !== i18nKeyFull) {
    return t(i18nKeyFull)
  }

  // 嘗試從 i18n 獲取（使用段名）
  const i18nKeySegment = `${props.i18nPrefix}${segment}`
  if (t(i18nKeySegment) !== i18nKeySegment) {
    return t(i18nKeySegment)
  }

  // 回退到段名本身（首字母大寫）
  return segment.charAt(0).toUpperCase() + segment.slice(1)
}

const breadcrumbs = computed<BreadcrumbItem[]>(() => {
  const items: BreadcrumbItem[] = []
  const path = route.path

  // 首頁
  if (path === props.homePath) {
    return [
      {
        label: getPathLabel('home', props.homePath),
        path: props.homePath,
        isActive: true,
        isClickable: true
      }
    ]
  }

  // 加入首頁項目
  items.push({
    label: getPathLabel('home', props.homePath),
    path: props.homePath,
    isActive: false,
    isClickable: true
  })

  // 解析路徑
  const segments = path.split('/').filter(Boolean)

  // 構建麵包屑
  let currentPath = ''
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`
    const isLast = index === segments.length - 1

    // 獲取標籤
    const label = getPathLabel(segment, currentPath)

    // 檢查是否可點擊
    // 1. 如果是最後一項，不可點擊（當前頁面）
    // 2. 如果在不可點擊列表中，不可點擊
    // 3. 如果路由不存在，不可點擊
    const isClickable =
      !isLast && !props.nonClickablePaths.includes(currentPath) && routeExists(currentPath)

    items.push({
      label,
      path: currentPath,
      isActive: isLast,
      isClickable
    })
  })

  return items
})
</script>

<template>
  <nav v-if="breadcrumbs.length > 0" aria-label="breadcrumb">
    <ol class="breadcrumb my-0">
      <li v-for="item in breadcrumbs" :key="item.path" class="breadcrumb-item">
        <RouterLink v-if="!item.isActive && item.isClickable" :to="item.path">
          {{ item.label }}
        </RouterLink>
        <span v-else>{{ item.label }}</span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.breadcrumb {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.25rem;
  font-size: 0.875rem;
}

.breadcrumb-item {
  display: inline-flex;
  align-items: center;
  color: color-mix(in srgb, var(--color-base-content) 72%, transparent);
}

.breadcrumb-item + .breadcrumb-item::before {
  content: '/';
  margin: 0 0.5rem 0 0.25rem;
  color: color-mix(in srgb, var(--color-base-content) 40%, transparent);
}

.breadcrumb-item a {
  color: inherit;
  text-decoration: none;
}

.breadcrumb-item a:hover {
  color: var(--color-primary);
}

.breadcrumb-item:last-child span {
  color: var(--color-primary);
  font-weight: 600;
}
</style>
