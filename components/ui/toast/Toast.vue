<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { ToastAction, ToastClose, ToastDescription, ToastProvider, ToastRoot, ToastTitle, ToastViewport, type ToastRootEmits, type ToastRootProps } from 'reka-ui'
import { cn } from '@/lib/utils'

interface ToastProps extends ToastRootProps {
  class?: HTMLAttributes['class']
  variant?: 'default' | 'destructive'
  onOpenChange?: ((value: boolean) => void) | undefined
}

interface ToastEmits extends ToastRootEmits {}

const props = withDefaults(defineProps<ToastProps>(), {
  variant: 'default',
})

const delegatedProps = computed(() => {
  const { class: _, variant, ...delegated } = props
  return delegated
})

const emits = defineEmits<ToastEmits>()
</script>

<template>
  <ToastRoot
    v-bind="delegatedProps"
    :class="cn(
      'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all',
      'data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
      {
        'border bg-background text-foreground': variant === 'default',
        'destructive group border-destructive bg-destructive text-destructive-foreground': variant === 'destructive',
      },
      props.class,
    )"
    @update:open="emits('update:open', $event)"
    @escape-key-down="emits('escapeKeyDown', $event)"
    @pause="emits('pause', $event)"
    @resume="emits('resume', $event)"
    @swipe-start="emits('swipeStart', $event)"
    @swipe-move="emits('swipeMove', $event)"
    @swipe-cancel="emits('swipeCancel', $event)"
    @swipe-end="emits('swipeEnd', $event)">
    <slot></slot>
  </ToastRoot>
</template>
