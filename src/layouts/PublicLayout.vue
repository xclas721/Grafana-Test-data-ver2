<script setup lang="ts">
import { RouterView } from 'vue-router'
import { Topbar } from '@/shared/components'
</script>

<template>
  <div class="min-h-screen flex flex-col bg-base-200 overflow-x-hidden">
    <Topbar />
    <main class="flex-1 min-w-0 page-safe-area">
      <RouterView />
    </main>
  </div>
</template>
