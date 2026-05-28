<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue?: File | File[] | null
  label?: string
  placeholder?: string
  accept?: string
  multiple?: boolean
  disabled?: boolean
  required?: boolean
  status?: 'pass' | 'fail' | null
  statusMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false,
  disabled: false,
  required: false,
  status: null,
  statusMessage: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: File | File[] | null]
}>()

const inputClasses = computed(() => {
  const classes = ['file-input', 'file-input-bordered', 'w-full']
  if (props.status === 'pass') classes.push('file-input-success')
  if (props.status === 'fail') classes.push('file-input-error')
  return classes.join(' ')
})

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    if (props.multiple) {
      emit('update:modelValue', Array.from(target.files))
    } else {
      emit('update:modelValue', target.files[0] || null)
    }
  }
}

const fileNames = computed(() => {
  if (!props.modelValue) return ''
  if (Array.isArray(props.modelValue)) {
    return props.modelValue.map((f) => f.name).join(', ')
  }
  return props.modelValue.name
})
</script>

<template>
  <div class="form-control w-full">
    <label v-if="label" class="label">
      <span class="label-text">
        {{ label }}
        <span v-if="required" class="text-error">*</span>
      </span>
    </label>
    <input
      type="file"
      :accept="accept"
      :multiple="multiple"
      :disabled="disabled"
      :class="inputClasses"
      @change="handleChange"
    />
    <label v-if="fileNames" class="label">
      <span class="label-text-alt text-base-content/60">{{ fileNames }}</span>
    </label>
    <label v-if="status && statusMessage" class="label">
      <span class="label-text-alt" :class="status === 'pass' ? 'text-success' : 'text-error'">
        {{ statusMessage }}
      </span>
    </label>
  </div>
</template>
