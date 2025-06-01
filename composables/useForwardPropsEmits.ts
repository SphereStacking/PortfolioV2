import { computed } from 'vue'

export function useForwardPropsEmits<T extends Record<string, any>, E = any>(
  props: T,
  emits: E,
) {
  return computed(() => ({
    ...props,
    onValueChange: (value: any) => {
      if (typeof emits === 'function') {
        emits('update:modelValue', value)
      }
    },
    onUpdate: (value: any) => {
      if (typeof emits === 'function') {
        emits('update:modelValue', value)
      }
    },
  }))
}
