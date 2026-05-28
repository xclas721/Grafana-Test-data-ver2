<script setup lang="ts">
import { computed } from 'vue'

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

interface Props {
  modelValue?: string | number
  label?: string
  placeholder?: string
  options: SelectOption[]
  disabled?: boolean
  required?: boolean
  status?: 'pass' | 'fail' | null
  statusMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  required: false,
  status: null,
  statusMessage: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const selectClasses = computed(() => {
  const classes = ['select', 'select-bordered', 'w-full']
  if (props.status === 'pass') classes.push('select-success')
  if (props.status === 'fail') classes.push('select-error')
  return classes.join(' ')
})

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const value = target.value
  // 嘗試轉換為數字（如果原始值是數字）
  const numValue = Number(value)
  emit('update:modelValue', isNaN(numValue) ? value : numValue)
}
</script>

<template>
  <div class="form-control w-full">
    <label v-if="label" class="label">
      <span class="label-text">
        {{ label }}
        <span v-if="required" class="text-error">*</span>
      </span>
    </label>
    <select :value="modelValue" :disabled="disabled" :class="selectClasses" @change="handleChange">
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
        :disabled="option.disabled"
      >
        {{ option.label }}
      </option>
    </select>
    <label v-if="status && statusMessage" class="label">
      <span class="label-text-alt" :class="status === 'pass' ? 'text-success' : 'text-error'">
        {{ statusMessage }}
      </span>
    </label>
  </div>
</template>
