import { ref, onMounted, onUnmounted } from 'vue'
import type { Ref } from 'vue'

export interface KeyEvent {
  key: string
  code: string
  keyCode: number
  altKey: boolean
  ctrlKey: boolean
  metaKey: boolean
  shiftKey: boolean
  timestamp: number
  combination: string
}

export interface UseKeyboardDisplayOptions {
  maxHistory?: number
}

export const useKeyboardDisplay = (options: UseKeyboardDisplayOptions = {}) => {
  const { maxHistory = 10 } = options

  const currentKey: Ref<KeyEvent | null> = ref(null)
  const keyHistory: Ref<KeyEvent[]> = ref([])
  const isKeyPressed = ref(false)

  const getKeyCombination = (event: KeyboardEvent): string => {
    const parts: string[] = []

    if (event.ctrlKey) parts.push('Ctrl')
    if (event.altKey) parts.push('Alt')
    if (event.shiftKey) parts.push('Shift')
    if (event.metaKey) parts.push('Meta')

    const key = event.key === ' ' ? 'Space' : event.key
    if (!['Control', 'Alt', 'Shift', 'Meta'].includes(key)) {
      parts.push(key)
    }

    return parts.join('+')
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    const keyEvent: KeyEvent = {
      key: event.key,
      code: event.code,
      keyCode: event.keyCode,
      altKey: event.altKey,
      ctrlKey: event.ctrlKey,
      metaKey: event.metaKey,
      shiftKey: event.shiftKey,
      timestamp: Date.now(),
      combination: getKeyCombination(event),
    }

    currentKey.value = keyEvent
    isKeyPressed.value = true

    keyHistory.value.unshift(keyEvent)
    if (keyHistory.value.length > maxHistory) {
      keyHistory.value = keyHistory.value.slice(0, maxHistory)
    }
  }

  const handleKeyUp = () => {
    isKeyPressed.value = false
  }

  const clearHistory = () => {
    keyHistory.value = []
  }

  const startListening = () => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
  }

  const stopListening = () => {
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('keyup', handleKeyUp)
  }

  onMounted(() => {
    startListening()
  })

  onUnmounted(() => {
    stopListening()
  })

  return {
    currentKey,
    keyHistory,
    isKeyPressed,
    clearHistory,
    startListening,
    stopListening,
  }
}
