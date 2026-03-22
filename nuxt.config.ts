// https://nuxt.com/docs/api/configuration/nuxt-config
import glsl from 'vite-plugin-glsl'
import llmsConfig from './llms.config'

export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxt/image',
    '@tresjs/nuxt',
    'nuxt-og-image',
    'motion-v/nuxt',
    '@nuxt/scripts',
    '@nuxt/fonts',
    'nuxt-llms',
    '@barzhsieh/nuxt-content-mermaid',
  ],
  components: {
    dirs: ['~/components'],
  },
  imports: {
    autoImport: true,
  },
  devtools: {
    enabled: true,
    timeline: {
      enabled: true,
    },
  },
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width',
      title: 'SphereStacking Portfolio',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
      htmlAttrs: {
        lang: 'ja',
      },
    },
  },
  css: ['~/assets/css/tailwind.css'],
  content: {
    // TODO: ホットリロードのエラー問題(https://github.com/nuxt/nuxt/issues/15201)が発生しているため、一旦無効化
    // https://content.nuxt.com/docs/getting-started/configuration#watch
    watch: {
      // enabled: false,
    },
  },
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2025-02-06',
  nitro: {
    minify: true,
  },
  vite: {
    assetsInclude: ['**/*.glsl'],
    plugins: [
      glsl({
        include: [
          '**/*.glsl',
        ],
        defaultExtension: 'glsl',
      }),
    ],
    optimizeDeps: {
      include: ['monaco-editor'],
    },
  },
  eslint: {
    config: {
      stylistic: true,
    },
  },
  llms: llmsConfig,
  ogImage: {
    fonts: [
      'WDXL+Lubrifont+JP+N:400',
    ],
  },
  scripts: {
    registry: {
      googleAnalytics: {
        id: 'G-8BWRNH7DMP',
      },
    },
  },
  tres: {
    devtools: true,
    glsl: true,
  },
})
