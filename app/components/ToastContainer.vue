<script setup lang="ts">
import { ToastProvider, ToastViewport, ToastRoot, ToastTitle, ToastDescription, ToastClose } from 'reka-ui'
import { X } from 'lucide-vue-next'

const { toasts } = useToast()
</script>

<template>
  <ToastProvider>
    <TransitionGroup name="toast">
      <ToastRoot
        v-for="toast in toasts"
        :key="toast.id"
        v-model:open="toast.open"
        :class="[
          'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all',
          'data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
          {
            'border bg-background text-foreground': toast.variant === 'default' || !toast.variant,
            'destructive group border-destructive bg-destructive text-destructive-foreground': toast.variant === 'destructive',
          },
        ]">
        <div class="grid gap-1">
          <ToastTitle v-if="toast.title" class="text-sm font-semibold">
            {{ toast.title }}
          </ToastTitle>
          <ToastDescription v-if="toast.description" class="text-sm opacity-90">
            {{ toast.description }}
          </ToastDescription>
        </div>
        <ToastClose class="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600">
          <X class="h-4 w-4" />
        </ToastClose>
      </ToastRoot>
    </TransitionGroup>
    <ToastViewport class="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]" />
  </ToastProvider>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.2s ease;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
