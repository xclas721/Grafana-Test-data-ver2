<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <div class="ddos-section border border-base-300 rounded-lg p-4 bg-base-200/50">
    <div class="flex items-center gap-2 mb-3 pb-2 border-b border-base-300">
      <span class="text-sm font-semibold text-base-content">{{ title }}</span>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <slot />
    </div>
  </div>
</template>
