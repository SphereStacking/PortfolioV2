<script setup>
import CyberpunkGradient from './css/CyberpunkGradient.vue'
import LiquidGradient from './css/LiquidGradient.vue'
import HolographicGradient from './css/HolographicGradient.vue'
import NeoBrutalismGradient from './css/NeoBrutalismGradient.vue'
import RippleGradient from './css/RippleGradient.vue'
import CosmosGradient from './css/CosmosGradient.vue'
import RetrowaveGradient from './css/RetrowaveGradient.vue'
import MistGradient from './css/MistGradient.vue'
import MoireGradient from './css/MoireGradient.vue'
import FrostGlassGradient from './css/FrostGlassGradient.vue'
import FireGradient from './css/FireGradient.vue'
import PastelDreamGradient from './css/PastelDreamGradient.vue'
import DynamicArtGradient from './css/DynamicArtGradient.vue'

// 追加のグラデーション - コスモス、ファイア、ダイナミックアート系
import BlackholeGradient from './css/BlackholeGradient.vue'
import AuroraGradient from './css/AuroraGradient.vue'
import MagmaGradient from './css/MagmaGradient.vue'
import BlueFireGradient from './css/BlueFireGradient.vue'
import InkSplashGradient from './css/InkSplashGradient.vue'
import GlitchArtGradient from './css/GlitchArtGradient.vue'

// 追加のグラデーション - 自然系、抽象芸術系、工業/都市系
import CrystalGradient from './css/CrystalGradient.vue'
import CloudyGradient from './css/CloudyGradient.vue'
import NeonCityGradient from './css/NeonCityGradient.vue'
import UrbanGradient from './css/UrbanGradient.vue'
import TechGradient from './css/TechGradient.vue'

// 追加のグラデーション - 水中/海洋系、四季/季節系
import DeepOceanGradient from './css/DeepOceanGradient.vue'

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
    name: '液体',
    component: LiquidGradient,
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
    name: 'パステルドリーム',
    component: PastelDreamGradient,
  },
  {
    name: 'ダイナミックアート',
    component: DynamicArtGradient,
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

]
</script>

<template>
  <div class="p-6 rounded-lg text-white min-h-screen">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="(example, index) in examples"
        :key="index"
        class="relative cursor-pointer transition-all duration-300 hover:scale-105"
        @click="selectedIndex = index">
        <component :is="example.component" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* グローバルスタイル */
</style>
