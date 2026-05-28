<script setup lang="ts">
import { computed } from 'vue'
import { dateFormat } from '@/shared/utils/format'

interface Props {
  modelValue?: string | Date | number
  label?: string
  placeholder?: string
  type?: 'date' | 'datetime-local' | 'time'
  disabled?: boolean
  required?: boolean
  status?: 'pass' | 'fail' | null
  statusMessage?: string
  min?: string
  max?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'date',
  disabled: false,
  required: false,
  status: null,
  statusMessage: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputClasses = computed(() => {
  const classes = ['input', 'input-bordered', 'w-full']
  if (props.status === 'pass') classes.push('input-success')
  if (props.status === 'fail') classes.push('input-error')
  return classes.join(' ')
})

// 將 modelValue 轉換為 input 需要的格式
const inputValue = computed({
  get: () => {
    if (!props.modelValue) return ''
    if (props.type === 'date') {
      // 日期格式：YYYY-MM-DD
      if (props.modelValue instanceof Date) {
        return props.modelValue.toISOString().split('T')[0]
      }
      if (typeof props.modelValue === 'number') {
        return dateFormat(props.modelValue, 'yyyy-MM-dd') || ''
      }
      if (typeof props.modelValue === 'string') {
        // 嘗試解析日期字串
        const date = new Date(props.modelValue)
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0]
        }
        return props.modelValue
      }
    } else if (props.type === 'datetime-local') {
      // 日期時間格式：YYYY-MM-DDTHH:mm
      if (props.modelValue instanceof Date) {
        return props.modelValue.toISOString().slice(0, 16)
      }
      if (typeof props.modelValue === 'number') {
        return dateFormat(props.modelValue, "yyyy-MM-dd'T'HH:mm") || ''
      }
      if (typeof props.modelValue === 'string') {
        const date = new Date(props.modelValue)
        if (!isNaN(date.getTime())) {
          return date.toISOString().slice(0, 16)
        }
        return props.modelValue
      }
    } else if (props.type === 'time') {
      // 時間格式：HH:mm
      if (props.modelValue instanceof Date) {
        return props.modelValue.toTimeString().slice(0, 5)
      }
      if (typeof props.modelValue === 'string') {
        return props.modelValue
      }
    }
    return ''
  },
  set: (value: string) => {
    emit('update:modelValue', value)
  }
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  inputValue.value = target.value
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
    <input
      :type="type"
      :value="inputValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :min="min"
      :max="max"
      :class="inputClasses"
      @input="handleInput"
    />
    <label v-if="status && statusMessage" class="label">
      <span class="label-text-alt" :class="status === 'pass' ? 'text-success' : 'text-error'">
        {{ statusMessage }}
      </span>
    </label>
  </div>
</template>
