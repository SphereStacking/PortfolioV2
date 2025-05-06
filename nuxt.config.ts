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
  ],
  devtools: {
    enabled: true,
    timeline: {
      enabled: true,
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
      'Zen+Maru+Gothic:400',
      'Zen+Maru+Gothic:700',
      'Zen+Maru+Gothic:900',
    ],
  },
  tres: {
    devtools: true,
    glsl: true,
  },
})
