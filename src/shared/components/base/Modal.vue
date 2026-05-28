<script setup lang="ts">
import { computed, watch } from 'vue'

interface Props {
  modelValue: boolean
  title?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full'
  closable?: boolean
  backdrop?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  closable: true,
  backdrop: true
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
}>()

const modalClasses = computed(() => {
  const classes = ['modal', 'z-[100]']
  if (props.modelValue) {
    classes.push('modal-open')
  }
  return classes.join(' ')
})

const modalBoxClasses = computed(() => {
  return `modal-box ${props.size !== 'md' ? `max-w-${props.size}` : ''}`
})

const close = () => {
  emit('update:modelValue', false)
  emit('close')
}

// 監聽 ESC 鍵
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && props.closable) {
          close()
        }
      }
      document.addEventListener('keydown', handleEsc)
      return () => {
        document.removeEventListener('keydown', handleEsc)
      }
    }
  }
)
</script>

<template>
  <Teleport to="body">
    <dialog :class="modalClasses">
      <div :class="modalBoxClasses">
        <!-- 標題 -->
        <div v-if="title || closable" class="flex items-center justify-between mb-4">
          <h3 v-if="title" class="font-bold text-lg">{{ title }}</h3>
          <button v-if="closable" class="btn btn-sm btn-circle btn-ghost" @click="close">✕</button>
        </div>

        <!-- 內容 -->
        <slot></slot>

        <!-- 底部操作按鈕 -->
        <div v-if="$slots.footer" class="modal-action">
          <slot name="footer"></slot>
        </div>
      </div>

      <!-- 背景遮罩 -->
      <form
        v-if="backdrop"
        method="dialog"
        class="modal-backdrop"
        @submit.prevent="closable && close()"
      >
        <button v-if="closable">關閉</button>
      </form>
    </dialog>
  </Teleport>
</template>
