<script setup lang="ts">
import { computed } from 'vue'
import Input from './Input.vue'

interface Props {
  modelValue?: string | number
  label: string
  placeholder?: string
  type?: string
  useRandom?: boolean
  randomizable?: boolean
  disabled?: boolean
  min?: number
  max?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  useRandom: false,
  randomizable: false,
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  'update:useRandom': [value: boolean]
}>()

const showInput = computed(() => !props.useRandom || !props.randomizable)
</script>

<template>
  <div class="form-control">
    <label class="label">
      <span class="label-text">{{ label }}</span>
      <label v-if="randomizable" class="label cursor-pointer gap-2 flex-row-reverse">
        <span class="label-text-alt">隨機</span>
        <input
          type="checkbox"
          :checked="useRandom"
          class="checkbox checkbox-sm"
          :disabled="disabled"
          @change="emit('update:useRandom', ($event.target as HTMLInputElement).checked)"
        />
      </label>
    </label>
    <Input
      v-if="showInput"
      :model-value="modelValue"
      :placeholder="placeholder"
      :type="type"
      :disabled="disabled"
      @update:model-value="emit('update:modelValue', $event)"
    />
    <div v-else class="text-xs text-base-content/60">測試時自動產生</div>
  </div>
</template>
