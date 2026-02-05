<template>
  <div ref="editorContainer" :style="{ width: '100%' }" class="border rounded-lg overflow-hidden"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

// Dynamically import monaco-editor only on client-side
let monaco: typeof import('monaco-editor') | null = null

// Type definitions for better TypeScript support
type IStandaloneCodeEditor = import('monaco-editor').editor.IStandaloneCodeEditor
type IEditorConstructionOptions = import('monaco-editor').editor.IEditorConstructionOptions

interface Props {
  modelValue: string
  language?: string
  theme?: string
  height?: string
  readOnly?: boolean
  options?: Partial<IEditorConstructionOptions>
}

const props = withDefaults(defineProps<Props>(), {
  language: 'json',
  theme: 'vs-dark',
  readOnly: false,
  options: () => ({}),
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'editor-mounted': [editor: IStandaloneCodeEditor]
}>()

const editorContainer = ref<HTMLElement>()
let monacoEditor: IStandaloneCodeEditor | null = null

onMounted(async () => {
  if (!editorContainer.value) return

  try {
    // Dynamically import monaco-editor only on client-side
    monaco = await import('monaco-editor')

    // Create editor
    monacoEditor = monaco.editor.create(editorContainer.value, {
      value: props.modelValue,
      language: props.language,
      theme: props.theme,
      readOnly: props.readOnly,
      automaticLayout: true,
      minimap: {
        enabled: false,
      },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      fontSize: 13,
      lineNumbers: 'on',
      renderLineHighlight: 'none',
      overviewRulerLanes: 0,
      hideCursorInOverviewRuler: true,
      overviewRulerBorder: false,
      scrollbar: {
        vertical: 'visible' as const,
        horizontal: 'visible' as const,
        useShadows: false,
        verticalScrollbarSize: 10,
        horizontalScrollbarSize: 10,
      },
      ...(props.options || {}),
    })

    // Watch for content changes
    monacoEditor.onDidChangeModelContent(() => {
      const value = monacoEditor?.getValue()
      if (value !== undefined) {
        emit('update:modelValue', value)
      }
    })

    // Auto-detect and apply theme based on current color scheme
    const isDark = document.documentElement.classList.contains('dark')
    monacoEditor.updateOptions({ theme: isDark ? 'vs-dark' : 'vs' })

    // Emit the editor instance for parent component to use
    emit('editor-mounted', monacoEditor)

    // Watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark')
          monacoEditor?.updateOptions({ theme: isDark ? 'vs-dark' : 'vs' })
        }
      })
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
  }
  catch (error) {
    console.error('Failed to load Monaco Editor:', error)
  }
})

// Watch for external value changes
watch(() => props.modelValue, (newValue) => {
  if (monacoEditor && monacoEditor.getValue() !== newValue) {
    monacoEditor.setValue(newValue)
  }
})

// Watch for language changes
watch(() => props.language, (newLanguage) => {
  if (monacoEditor && monaco) {
    const model = monacoEditor.getModel()
    if (model) {
      monaco.editor.setModelLanguage(model, newLanguage)
    }
  }
})

onUnmounted(() => {
  monacoEditor?.dispose()
})

// Expose editor instance for parent access
defineExpose({
  getEditor: () => monacoEditor,
})
</script>
