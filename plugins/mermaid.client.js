export default defineNuxtPlugin(async (nuxtApp) => {
  nuxtApp.provide('mermaid', async () => {
    try {
      console.log('Loading mermaid from CDN...')

      // CDNからMermaidを動的に読み込み
      if (!window.mermaid) {
        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js'
        script.async = true

        await new Promise((resolve, reject) => {
          script.onload = resolve
          script.onerror = reject
          document.head.appendChild(script)
        })
      }

      const mermaid = window.mermaid

      if (!mermaid.isInitialized) {
        console.log('Initializing mermaid...')
        mermaid.initialize()
        mermaid.isInitialized = true
        console.log('Mermaid initialized successfully')
      }

      return mermaid
    }
    catch (error) {
      console.error('Failed to load mermaid:', error)
      throw error
    }
  })
})
