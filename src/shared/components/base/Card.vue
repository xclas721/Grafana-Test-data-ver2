<script setup lang="ts">
defineProps<{
  title?: string
  subtitle?: string
}>()
</script>

<template>
  <div
    class="app-form-card card bg-base-100 border border-base-300/80 backdrop-blur-sm transition-shadow duration-300 hover:shadow-md"
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
