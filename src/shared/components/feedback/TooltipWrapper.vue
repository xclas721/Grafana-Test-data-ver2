<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  tip: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  position: 'top',
  class: ''
})

const wrapperClasses = computed(() => {
  const classes = ['tooltip']
  const positionClassMap: Record<NonNullable<Props['position']>, string> = {
    top: 'tooltip-top',
    bottom: 'tooltip-bottom',
    left: 'tooltip-left',
    right: 'tooltip-right'
  }
  classes.push(positionClassMap[props.position])
  if (props.class) classes.push(props.class)
  return classes.join(' ')
})
</script>

<template>
  <div :class="wrapperClasses" :data-tip="tip">
    <slot />
  </div>
</template>
