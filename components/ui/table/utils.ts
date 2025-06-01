import type { Updater } from '@tanstack/vue-table'
import type { Ref } from 'vue'

/**
 * Updates a Vue {@link Ref} value using either a direct value or an updater function.
 *
 * If {@link updaterOrValue} is a function, it is called with the current {@link ref.value} and the result is assigned back to {@link ref.value}. Otherwise, {@link updaterOrValue} is assigned directly.
 *
 * @param updaterOrValue - A new value or a function that computes the new value from the current {@link ref.value}.
 * @param ref - The Vue {@link Ref} whose value will be updated.
 */
export function valueUpdater<T extends Updater<any>>(updaterOrValue: T, ref: Ref) {
  ref.value
    = typeof updaterOrValue === 'function'
      ? updaterOrValue(ref.value)
      : updaterOrValue
}
