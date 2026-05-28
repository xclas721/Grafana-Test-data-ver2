<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<template>
  <div class="mb-6 sm:mb-8 md:mb-10">
    <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div class="min-w-0 text-center md:text-left">
        <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold text-base-content tracking-tight">
          {{ title }}
        </h1>
        <p
          v-if="subtitle"
          class="mt-2 text-sm sm:text-base text-base-content/60 max-w-2xl md:max-w-3xl"
        >
          {{ subtitle }}
        </p>
      </div>

      <div v-if="$slots.actions" class="w-full md:w-auto">
        <div class="flex flex-col sm:flex-row gap-2 md:justify-end">
          <slot name="actions"></slot>
        </div>
      </div>
    </div>
    <div class="divider w-20 md:w-24 mx-auto md:mx-0 mt-4 md:mt-6 divider-primary"></div>
  </div>
</template>
