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

const isDisabled = computed(() => props.disabled || props.loading)

const buttonClass = computed(() => {
  const classes = ['btn', 'app-btn']

  if (props.loading) {
    classes.push('app-btn--loading')
  }

  if (props.variant === 'outline') {
    classes.push('btn-outline', 'btn-primary')
  } else if (props.variant === 'ghost') {
    classes.push('btn-ghost')
  } else if (props.variant === 'link') {
    classes.push('btn-link')
  } else if (props.variant === 'danger') {
    classes.push('btn-error')
  } else if (props.variant === 'primary') {
    classes.push('btn-primary')
  } else {
    classes.push(`btn-${props.variant}`)
  }

  if (props.size === 'xs') {
    classes.push('btn-xs')
  } else if (props.size === 'sm') {
    classes.push('btn-sm')
  } else if (props.size === 'lg') {
    classes.push('btn-lg')
  }

  return classes
})

const handleClick = (event: MouseEvent) => {
  if (isDisabled.value) {
    event.preventDefault()
    return
  }
  emit('click', event)
}
</script>

<template>
  <button
    :class="buttonClass"
    :type="type"
    :disabled="isDisabled"
    :aria-busy="loading || undefined"
    @click="handleClick"
  >
    <span v-if="loading" class="loading loading-spinner loading-sm" aria-hidden="true" />
    <slot />
  </button>
</template>
