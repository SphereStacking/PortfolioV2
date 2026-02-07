<template>
  <div class="my-4 p-4 rounded-lg overflow-x-auto bg-[#e8e8e8]">
    <div v-if="rendered" class="flex justify-center items-center min-h-[200px]" v-html="renderedSvg"></div>
    <div v-else class="flex justify-center items-center min-h-[200px] text-muted-foreground italic">
      Loading diagram...
    </div>
  </div>
</template>

<script setup>
const slots = useSlots()
const rendered = ref(false)
const renderedSvg = ref('')
const { $mermaid } = useNuxtApp()

onMounted(async () => {
  try {
    // スロットからmermaidコードを取得
    const defaultSlot = slots.default?.()
    if (!defaultSlot || defaultSlot.length === 0) {
      console.warn('No mermaid content found')
      return
    }

    // テキストコンテンツを抽出
    const mermaidCode = defaultSlot
      .map(node => typeof node.children === 'string' ? node.children : '')
      .join('')
      .trim()

    if (!mermaidCode) {
      console.warn('Empty mermaid content')
      return
    }

    // mermaidを動的に読み込み（設定済み）
    const mermaid = await $mermaid()

    // SVGを生成
    const { svg } = await mermaid.render('mermaid-diagram-' + Date.now(), mermaidCode)
    renderedSvg.value = svg
    rendered.value = true
  }
  catch (error) {
    console.error('Failed to render mermaid:', error)
    renderedSvg.value = `<div class="text-destructive p-4 bg-destructive/10 border border-destructive/20 rounded-lg">Failed to render diagram: ${error.message}</div>`
    rendered.value = true
  }
})
</script>
