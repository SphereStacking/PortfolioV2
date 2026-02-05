import { ref } from 'vue'

export interface ToastProps {
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
  duration?: number
}

interface Toast extends ToastProps {
  id: string
  open: boolean
}

const toasts = ref<Toast[]>([])

export const useToast = () => {
  const toast = (props: ToastProps) => {
    const id = Date.now().toString()
    const duration = props.duration ?? 3000

    const newToast: Toast = {
      ...props,
      id,
      open: true,
    }

    toasts.value.push(newToast)

    // 自動的に削除
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return {
      id,
      dismiss: () => removeToast(id),
    }
  }

  const removeToast = (id: string) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value[index].open = false
      setTimeout(() => {
        toasts.value = toasts.value.filter(t => t.id !== id)
      }, 200) // アニメーション時間
    }
  }

  return {
    toast,
    toasts: readonly(toasts),
  }
}
