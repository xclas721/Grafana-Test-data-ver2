<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const mouseX = ref(50)
const mouseY = ref(50)
const containerRef = ref<HTMLElement | null>(null)

const handleMouseMove = (e: MouseEvent) => {
  if (!containerRef.value) return

  const rect = containerRef.value.getBoundingClientRect()
  const x = ((e.clientX - rect.left) / rect.width) * 100
  const y = ((e.clientY - rect.top) / rect.height) * 100

  mouseX.value = Math.max(0, Math.min(100, x))
  mouseY.value = Math.max(0, Math.min(100, y))
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
})
</script>

<template>
  <div
    ref="containerRef"
    class="app-mouse-gradient absolute inset-0 pointer-events-none z-0"
    :style="{
      '--mouse-x': `${mouseX}%`,
      '--mouse-y': `${mouseY}%`
    }"
  />
</template>
