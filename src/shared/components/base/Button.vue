<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'success' | 'info' | 'warning' | 'danger' | 'outline' | 'ghost' | 'link'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  type: 'button'
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonClass = computed(() => {
  const classes = ['btn']

  // Variants
  if (props.variant === 'outline') {
    classes.push('btn-outline')
  } else if (props.variant === 'ghost') {
    classes.push('btn-ghost')
  } else if (props.variant === 'link') {
    classes.push('btn-link')
  } else {
    // 實心按鈕：添加白色文字
    classes.push('text-white')

    if (props.variant === 'danger') {
      classes.push('btn-error') // DaisyUI 使用 btn-error
    } else if (props.variant !== 'primary') {
      classes.push(`btn-${props.variant}`)
    } else {
      classes.push('btn-primary') // Default primary
    }
  }

  // Sizes - DaisyUI 支援: btn-xs, btn-sm, btn-lg (預設為中等，無需類別)
  if (props.size === 'xs') {
    classes.push('btn-xs')
  } else if (props.size === 'sm') {
    classes.push('btn-sm')
  } else if (props.size === 'lg') {
    classes.push('btn-lg')
  }
  // md 為預設尺寸，不需要添加類別

  return classes
})

const handleClick = (event: MouseEvent) => {
  if (props.disabled || props.loading) {
    event.preventDefault()
    return
  }
  emit('click', event)
}
</script>

<template>
  <button :class="buttonClass" :type="type" :disabled="disabled" @click="handleClick">
    <span v-if="loading" class="loading loading-spinner"></span>
    <slot />
  </button>
</template>
