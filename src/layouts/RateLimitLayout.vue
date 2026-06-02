<script setup lang="ts">
import ApiConfigBar from '@/features/rate-limit/components/ApiConfigBar.vue'
</script>

<template>
  <div class="space-y-4">
    <div class="rounded-lg border border-base-300 bg-info/10 overflow-hidden shadow-sm">
      <ApiConfigBar />
    </div>
    <RouterView />
  </div>
</template>
