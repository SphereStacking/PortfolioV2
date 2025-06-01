import { computed } from 'vue'

/**
 * Returns a computed property that merges the given props with standardized event handlers for model value updates.
 *
 * The returned object includes all original {@link props} and two handlers, `onValueChange` and `onUpdate`, which emit the `'update:modelValue'` event using the provided {@link emits} function if it is callable.
 *
 * @returns A Vue computed property combining {@link props} with `onValueChange` and `onUpdate` event handlers.
 */
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
