<template>
  <Transition name="fade">
    <div
      v-if="loading"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div class="bg-base-100 rounded-xl p-8 shadow-xl text-center">
        <span class="loading loading-spinner loading-lg text-primary mb-4 block mx-auto"></span>
        <div class="text-base-content font-medium">{{ message }}</div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useLoadingStore } from '@/stores/loading'
import { storeToRefs } from 'pinia'

const loadingStore = useLoadingStore()
const { loading, message } = storeToRefs(loadingStore)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
