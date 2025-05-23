// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/ui',
    '@tresjs/nuxt',
    'dayjs-nuxt',
    'nuxt-og-image',
    'motion-v/nuxt',
    '@nuxt/scripts',
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
  css: ['~/assets/css/main.css'],
  colorMode: {
    // TODO: デフォルトをDarkにする いつか両方対応したい
    preference: 'dark',
  },
  content: {
    // TODO: ホットリロードのエラー問題(https://github.com/nuxt/nuxt/issues/15201)が発生しているため、一旦無効化
    // https://content.nuxt.com/docs/getting-started/configuration#watch
    watch: {
      enabled: false,
    },
  },
  compatibilityDate: '2024-11-01',
  nitro: {
    minify: true,
  },
  vite: {
    assetsInclude: ['**/*.glsl'],
  },
  eslint: {
    config: {
      stylistic: true,
    },
  },
  ogImage: {
    fonts: [
      'Monomaniac+One:400',
      'Monomaniac+One:700',
      'Monomaniac+One:900',
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
  tres: {
    devtools: true,
    glsl: true,
  },
})
