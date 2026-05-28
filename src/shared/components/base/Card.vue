<script setup lang="ts">
defineProps<{
  title?: string
  subtitle?: string
}>()
</script>

<template>
  <div
    class="card bg-base-100/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 border border-base-200/50"
  >
    <div class="card-body p-6">
      <div v-if="title || subtitle" class="mb-4">
        <h2 v-if="title" class="card-title text-base-content">{{ title }}</h2>
        <p v-if="subtitle" class="text-base-content/60 text-sm">{{ subtitle }}</p>
      </div>
      <slot />
    </div>
  </div>
</template>
