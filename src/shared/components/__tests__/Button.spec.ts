import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from '../base/Button.vue'

/**
 * Button（base）
 * 結構：渲染／互動／props 分組（§4.0）。
 */
describe('Button', () => {
  describe('渲染', () => {
    it('應顯示 slot 文字', () => {
      const wrapper = mount(Button, {
        slots: {
          default: 'Click me'
        }
      })
      expect(wrapper.text()).toContain('Click me')
    })

    it('variant=primary 應套用主色樣式 class', () => {
      const wrapper = mount(Button, {
        props: {
          variant: 'primary'
        }
      })
      expect(wrapper.classes()).toContain('btn-primary')
      expect(wrapper.classes()).toContain('text-white')
    })

    it('size=lg 與 type=submit 應反映於 DOM', () => {
      const wrapper = mount(Button, {
        props: {
          size: 'lg',
          type: 'submit'
        }
      })
      expect(wrapper.classes()).toContain('btn-lg')
      expect(wrapper.attributes('type')).toBe('submit')
    })
  })

  describe('點擊與狀態', () => {
    it('一般狀態點擊應 emit click', async () => {
      const wrapper = mount(Button)
      await wrapper.trigger('click')
      expect(wrapper.emitted('click')).toBeTruthy()
      expect(wrapper.emitted('click')?.length).toBe(1)
    })

    it('disabled 時不應 emit click', async () => {
      const wrapper = mount(Button, {
        props: { disabled: true }
      })
      await wrapper.trigger('click')
      expect(wrapper.emitted('click')).toBeFalsy()
    })

    it('loading 時不應 emit click 且顯示 spinner', async () => {
      const wrapper = mount(Button, {
        props: { loading: true },
        slots: { default: 'Saving...' }
      })
      await wrapper.trigger('click')
      expect(wrapper.emitted('click')).toBeFalsy()
      expect(wrapper.find('.loading.loading-spinner').exists()).toBe(true)
    })
  })
})
