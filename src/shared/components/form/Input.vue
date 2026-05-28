<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue?: string | number | undefined
  label?: string
  placeholder?: string
  type?: string
  status?: 'pass' | 'fail' | null
  statusMessage?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  disabled: false,
  status: null,
  statusMessage: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const inputClasses = computed(() => {
  const classes = ['input', 'input-bordered', 'w-full']

  if (props.status === 'pass') classes.push('input-success')
  if (props.status === 'fail') classes.push('input-error')

  return classes
})
</script>

<template>
  <div class="form-control w-full">
    <label v-if="label" class="label">
      <span class="label-text">{{ label }}</span>
    </label>
    <div class="join w-full">
      <input
        :type="type"
        :value="modelValue ?? ''"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="inputClasses"
        class="join-item"
        @input="handleInput"
      />
      <div
        v-if="$slots.append"
        class="join-item btn btn-disabled bg-base-200 border-base-300 text-base-content"
      >
        <slot name="append" />
      </div>
    </div>
    <label v-if="status && statusMessage" class="label">
      <span class="label-text-alt" :class="status === 'pass' ? 'text-success' : 'text-error'">
        {{ statusMessage }}
      </span>
    </label>
  </div>
</template>
