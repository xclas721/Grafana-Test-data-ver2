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
    class="absolute inset-0 pointer-events-none z-0"
    :style="{
      background: `radial-gradient(
        circle 1200px at ${mouseX}% ${mouseY}%,
        rgba(139, 92, 246, 0.25) 0%,
        rgba(59, 130, 246, 0.15) 35%,
        rgba(6, 182, 212, 0.08) 65%,
        transparent 100%
      )`
    }"
  ></div>
</template>
