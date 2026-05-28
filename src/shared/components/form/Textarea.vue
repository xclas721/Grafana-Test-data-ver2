<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue?: string
  label?: string
  placeholder?: string
  rows?: number
  disabled?: boolean
  required?: boolean
  status?: 'pass' | 'fail' | null
  statusMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  rows: 4,
  disabled: false,
  required: false,
  status: null,
  statusMessage: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const textareaClasses = computed(() => {
  const classes = ['textarea', 'textarea-bordered', 'w-full']
  if (props.status === 'pass') classes.push('textarea-success')
  if (props.status === 'fail') classes.push('textarea-error')
  return classes.join(' ')
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
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
    <textarea
      :value="modelValue ?? ''"
      :placeholder="placeholder"
      :rows="rows"
      :disabled="disabled"
      :class="textareaClasses"
      @input="handleInput"
    ></textarea>
    <label v-if="status && statusMessage" class="label">
      <span class="label-text-alt" :class="status === 'pass' ? 'text-success' : 'text-error'">
        {{ statusMessage }}
      </span>
    </label>
  </div>
</template>
