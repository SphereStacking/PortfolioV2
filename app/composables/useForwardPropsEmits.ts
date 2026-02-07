import { computed } from 'vue'

type EmitFunction = (event: string, ...args: unknown[]) => void

export function useForwardPropsEmits<T extends Record<string, unknown>, E extends EmitFunction>(
  props: T,
  emits: E,
) {
  return computed(() => ({
    ...props,
    onValueChange: (value: unknown) => {
      emits('update:modelValue', value)
    },
    onUpdate: (value: unknown) => {
      emits('update:modelValue', value)
    },
  }))
}
