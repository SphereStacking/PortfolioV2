<script setup>
const CyberpunkGradient = defineAsyncComponent(() => import('./css/CyberpunkGradient.vue'))
const HolographicGradient = defineAsyncComponent(() => import('./css/HolographicGradient.vue'))
const NeoBrutalismGradient = defineAsyncComponent(() => import('./css/NeoBrutalismGradient.vue'))
const RippleGradient = defineAsyncComponent(() => import('./css/RippleGradient.vue'))
const CosmosGradient = defineAsyncComponent(() => import('./css/CosmosGradient.vue'))
const RetrowaveGradient = defineAsyncComponent(() => import('./css/RetrowaveGradient.vue'))
const MistGradient = defineAsyncComponent(() => import('./css/MistGradient.vue'))
const MoireGradient = defineAsyncComponent(() => import('./css/MoireGradient.vue'))
const FrostGlassGradient = defineAsyncComponent(() => import('./css/FrostGlassGradient.vue'))
const FireGradient = defineAsyncComponent(() => import('./css/FireGradient.vue'))
const BlackholeGradient = defineAsyncComponent(() => import('./css/BlackholeGradient.vue'))
const AuroraGradient = defineAsyncComponent(() => import('./css/AuroraGradient.vue'))
const MagmaGradient = defineAsyncComponent(() => import('./css/MagmaGradient.vue'))
const BlueFireGradient = defineAsyncComponent(() => import('./css/BlueFireGradient.vue'))
const InkSplashGradient = defineAsyncComponent(() => import('./css/InkSplashGradient.vue'))
const GlitchArtGradient = defineAsyncComponent(() => import('./css/GlitchArtGradient.vue'))
const CrystalGradient = defineAsyncComponent(() => import('./css/CrystalGradient.vue'))
const CloudyGradient = defineAsyncComponent(() => import('./css/CloudyGradient.vue'))
const NeonCityGradient = defineAsyncComponent(() => import('./css/NeonCityGradient.vue'))
const UrbanGradient = defineAsyncComponent(() => import('./css/UrbanGradient.vue'))
const TechGradient = defineAsyncComponent(() => import('./css/TechGradient.vue'))
const DeepOceanGradient = defineAsyncComponent(() => import('./css/DeepOceanGradient.vue'))
const SakuraBlizzardGradient = defineAsyncComponent(() => import('./css/SakuraBlizzardGradient.vue'))
const QuantumRealmGradient = defineAsyncComponent(() => import('./css/QuantumRealmGradient.vue'))

// 選択されているグラデーションのインデックス
const selectedIndex = ref(0)

const examples = [
  {
    name: 'テクノロジー',
    component: TechGradient,
  },
  {
    name: '深海',
    component: DeepOceanGradient,
  },
  {
    name: 'サイバーパンク',
    component: CyberpunkGradient,
  },
  {
    name: 'ホログラフィック',
    component: HolographicGradient,
  },
  {
    name: 'ネオブルータリズム',
    component: NeoBrutalismGradient,
  },
  {
    name: '波紋',
    component: RippleGradient,
  },
  {
    name: 'コスモス',
    component: CosmosGradient,
  },
  {
    name: 'レトロウェイブ',
    component: RetrowaveGradient,
  },
  {
    name: 'ミスト',
    component: MistGradient,
  },
  {
    name: 'モアレパターン',
    component: MoireGradient,
  },
  {
    name: 'フロストガラス',
    component: FrostGlassGradient,
  },
  {
    name: 'ファイア',
    component: FireGradient,
  },

  {
    name: 'ブラックホール',
    component: BlackholeGradient,
  },
  {
    name: 'オーロラ',
    component: AuroraGradient,
  },
  {
    name: 'マグマ',
    component: MagmaGradient,
  },
  {
    name: 'ブルーファイア',
    component: BlueFireGradient,
  },
  {
    name: 'インクスプラッシュ',
    component: InkSplashGradient,
  },
  {
    name: 'グリッチアート',
    component: GlitchArtGradient,
  },
  {
    name: 'クリスタル',
    component: CrystalGradient,
  },
  {
    name: '曇り空',
    component: CloudyGradient,
  },
  {
    name: 'ネオンシティ',
    component: NeonCityGradient,
  },
  {
    name: 'アーバン',
    component: UrbanGradient,
  },
  {
    name: '桜吹雪',
    component: SakuraBlizzardGradient,
  },
  {
    name: '量子の世界',
    component: QuantumRealmGradient,
  },

]
</script>

<template>
  <div class="p-6 rounded-lg text-white min-h-screen">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="(example, index) in examples"
        :key="index"
        class="relative cursor-pointer transition-all duration-300 hover:scale-105 h-64"
        @click="selectedIndex = index">
        <IntersectionObserver>
          <component :is="example.component" />
        </IntersectionObserver>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* グローバルスタイル */
</style>
