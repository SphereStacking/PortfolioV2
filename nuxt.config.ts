// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'
import glsl from 'vite-plugin-glsl'
import llmsConfig from './llms.config'

export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxt/image',
    '@tresjs/nuxt',
    'dayjs-nuxt',
    'nuxt-og-image',
    'motion-v/nuxt',
    '@nuxt/scripts',
    'shadcn-nuxt',
    '@nuxt/fonts',
    'nuxt-llms',
  ],
  devtools: {
    enabled: true,
    timeline: {
      enabled: true,
    },
  },
  app: {
    head: {
      charset: 'utf-16',
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
  compatibilityDate: '2024-11-01',
  nitro: {
    minify: true,
  },
  vite: {
    assetsInclude: ['**/*.glsl'],
    plugins: [
      tailwindcss(),
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
      'WDXL+Lubrifont+JP+N:700',
      'WDXL+Lubrifont+JP+N:900',
      'Zen+Maru+Gothic:700',
    ],
  },
  scripts: {
    registry: {
      googleAnalytics: {
        id: 'G-8BWRNH7DMP',
      },
    },
  },
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: './components/ui',
  },
  tres: {
    devtools: true,
    glsl: true,
  },
})
