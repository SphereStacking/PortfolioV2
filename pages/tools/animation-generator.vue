<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useClipboard } from '@vueuse/core'

definePageMeta({
  layout: 'tools',
})

// 状態管理
const animationType = ref<'css' | 'svg'>('css')
const selectedAnimation = ref('fadeIn')
const duration = ref(1000)
const easing = ref('ease')
const iterationCount = ref('1')
const direction = ref('normal')
const fillMode = ref('none')
const delay = ref(0)
const customKeyframes = ref('')
const previewActive = ref(false)

// CSSアニメーションプリセット
const cssAnimations = [
  {
    id: 'fadeIn',
    name: 'フェードイン',
    keyframes: `@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}`,
  },
  {
    id: 'fadeOut',
    name: 'フェードアウト',
    keyframes: `@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}`,
  },
  {
    id: 'slideInLeft',
    name: 'スライドイン（左から）',
    keyframes: `@keyframes slideInLeft {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}`,
  },
  {
    id: 'slideInRight',
    name: 'スライドイン（右から）',
    keyframes: `@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}`,
  },
  {
    id: 'slideInUp',
    name: 'スライドイン（下から）',
    keyframes: `@keyframes slideInUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}`,
  },
  {
    id: 'bounce',
    name: 'バウンス',
    keyframes: `@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-30px);
  }
  60% {
    transform: translateY(-15px);
  }
}`,
  },
  {
    id: 'rotate',
    name: '回転',
    keyframes: `@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}`,
  },
  {
    id: 'pulse',
    name: 'パルス',
    keyframes: `@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}`,
  },
  {
    id: 'shake',
    name: 'シェイク',
    keyframes: `@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-10px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(10px);
  }
}`,
  },
  {
    id: 'flip',
    name: 'フリップ',
    keyframes: `@keyframes flip {
  from {
    transform: perspective(400px) rotateY(0);
  }
  to {
    transform: perspective(400px) rotateY(360deg);
  }
}`,
  },
  {
    id: 'zoomIn',
    name: 'ズームイン',
    keyframes: `@keyframes zoomIn {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}`,
  },
  {
    id: 'custom',
    name: 'カスタム',
    keyframes: '',
  },
]

// SVGアニメーションプリセット
const svgAnimations = [
  {
    id: 'pathDraw',
    name: 'パス描画',
    svg: `<svg width="200" height="200" viewBox="0 0 200 200">
  <path d="M50 100 Q100 50 150 100 T250 100" 
        stroke="currentColor" 
        stroke-width="3" 
        fill="none"
        stroke-dasharray="300"
        stroke-dashoffset="300">
    <animate attributeName="stroke-dashoffset" 
             from="300" 
             to="0" 
             dur="2s" 
             repeatCount="indefinite" />
  </path>
</svg>`,
  },
  {
    id: 'morphing',
    name: 'モーフィング',
    svg: `<svg width="200" height="200" viewBox="0 0 200 200">
  <path d="M50,100 a50,50 0 1,1 100,0 a50,50 0 1,1 -100,0" 
        fill="currentColor">
    <animate attributeName="d" 
             values="M50,100 a50,50 0 1,1 100,0 a50,50 0 1,1 -100,0;
                     M60,60 L140,60 L140,140 L60,140 Z;
                     M50,100 a50,50 0 1,1 100,0 a50,50 0 1,1 -100,0"
             dur="3s" 
             repeatCount="indefinite" />
  </path>
</svg>`,
  },
  {
    id: 'rotating',
    name: '回転',
    svg: `<svg width="200" height="200" viewBox="0 0 200 200">
  <rect x="75" y="75" width="50" height="50" fill="currentColor">
    <animateTransform attributeName="transform"
                      type="rotate"
                      from="0 100 100"
                      to="360 100 100"
                      dur="2s"
                      repeatCount="indefinite" />
  </rect>
</svg>`,
  },
  {
    id: 'scaling',
    name: 'スケール',
    svg: `<svg width="200" height="200" viewBox="0 0 200 200">
  <circle cx="100" cy="100" r="40" fill="currentColor">
    <animateTransform attributeName="transform"
                      type="scale"
                      values="1;1.5;1"
                      dur="2s"
                      repeatCount="indefinite" />
  </circle>
</svg>`,
  },
]

// イージング関数
const easingFunctions = [
  { value: 'linear', label: 'Linear' },
  { value: 'ease', label: 'Ease' },
  { value: 'ease-in', label: 'Ease In' },
  { value: 'ease-out', label: 'Ease Out' },
  { value: 'ease-in-out', label: 'Ease In Out' },
  { value: 'cubic-bezier(0.4, 0, 0.2, 1)', label: 'Material Design' },
  { value: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', label: 'Back' },
  { value: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', label: 'Bounce' },
  { value: 'cubic-bezier(0.6, -0.28, 0.735, 0.045)', label: 'Elastic' },
]

// 現在選択されているアニメーション
const currentAnimation = computed(() => {
  if (animationType.value === 'css') {
    return cssAnimations.find(a => a.id === selectedAnimation.value) || cssAnimations[0]
  }
  return svgAnimations.find(a => a.id === selectedAnimation.value) || svgAnimations[0]
})

// 生成されたCSSコード
const generatedCSS = computed(() => {
  if (animationType.value !== 'css') return ''

  const animation = currentAnimation.value
  const keyframes = animation.id === 'custom' ? customKeyframes.value : animation.keyframes

  const animationProperty = [
    selectedAnimation.value,
    `${duration.value}ms`,
    easing.value,
    delay.value > 0 ? `${delay.value}ms` : '',
    iterationCount.value,
    direction.value !== 'normal' ? direction.value : '',
    fillMode.value !== 'none' ? fillMode.value : '',
  ].filter(Boolean).join(' ')

  return `/* アニメーション定義 */
${keyframes}

/* 使用例 */
.animated-element {
  animation: ${animationProperty};
}

/* 個別プロパティ版 */
.animated-element {
  animation-name: ${selectedAnimation.value};
  animation-duration: ${duration.value}ms;
  animation-timing-function: ${easing.value};${delay.value > 0
    ? `
  animation-delay: ${delay.value}ms;`
    : ''}
  animation-iteration-count: ${iterationCount.value};${direction.value !== 'normal'
    ? `
  animation-direction: ${direction.value};`
    : ''}${fillMode.value !== 'none'
    ? `
  animation-fill-mode: ${fillMode.value};`
    : ''}
}`
})

// 生成されたSVGコード
const generatedSVG = computed(() => {
  if (animationType.value !== 'svg') return ''

  const animation = currentAnimation.value
  return animation.svg || ''
})

// JavaScript版のコード
const generatedJavaScript = computed(() => {
  if (animationType.value !== 'css') return ''

  return `// Web Animations API
element.animate([
  ${currentAnimation.value.id === 'fadeIn'
    ? `{ opacity: 0 },
  { opacity: 1 }`
    : ''}${currentAnimation.value.id === 'slideInLeft'
    ? `{ transform: 'translateX(-100%)', opacity: 0 },
  { transform: 'translateX(0)', opacity: 1 }`
    : ''}${currentAnimation.value.id === 'rotate'
    ? `{ transform: 'rotate(0deg)' },
  { transform: 'rotate(360deg)' }`
    : ''}${currentAnimation.value.id === 'bounce'
    ? `{ transform: 'translateY(0)' },
  { transform: 'translateY(-30px)', offset: 0.4 },
  { transform: 'translateY(-15px)', offset: 0.6 },
  { transform: 'translateY(0)' }`
    : ''}${currentAnimation.value.id === 'pulse'
    ? `{ transform: 'scale(1)', opacity: 1 },
  { transform: 'scale(1.1)', opacity: 0.8 },
  { transform: 'scale(1)', opacity: 1 }`
    : ''}
], {
  duration: ${duration.value},
  easing: '${easing.value}',${delay.value > 0
    ? `
  delay: ${delay.value},`
    : ''}
  iterations: ${iterationCount.value === 'infinite' ? 'Infinity' : iterationCount.value},${direction.value !== 'normal'
    ? `
  direction: '${direction.value}',`
    : ''}${fillMode.value !== 'none'
    ? `
  fill: '${fillMode.value}',`
    : ''}
});`
})

// プレビュー制御
const togglePreview = () => {
  previewActive.value = false
  setTimeout(() => {
    previewActive.value = true
  }, 100)
}

// アニメーション変更時にプレビューをリセット
watch([selectedAnimation, duration, easing, delay, iterationCount, direction, fillMode], () => {
  if (previewActive.value) {
    togglePreview()
  }
})

// カスタムキーフレームの例
const customKeyframesExample = `@keyframes customAnimation {
  0% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
  25% {
    transform: scale(1.2) rotate(90deg);
    opacity: 0.8;
  }
  50% {
    transform: scale(0.8) rotate(180deg);
    opacity: 0.6;
  }
  75% {
    transform: scale(1.1) rotate(270deg);
    opacity: 0.8;
  }
  100% {
    transform: scale(1) rotate(360deg);
    opacity: 1;
  }
}`

// クリップボード操作
const { copy } = useClipboard()
const { toast } = useToast()

const copyToClipboard = async (text: string) => {
  try {
    await copy(text)
    toast({
      description: 'クリップボードにコピーしました',
    })
  }
  catch (err) {
    console.error('Failed to copy:', err)
    toast({
      description: 'コピーに失敗しました',
      variant: 'destructive',
    })
  }
}

// リセット
const reset = () => {
  selectedAnimation.value = 'fadeIn'
  duration.value = 1000
  easing.value = 'ease'
  iterationCount.value = '1'
  direction.value = 'normal'
  fillMode.value = 'none'
  delay.value = 0
  customKeyframes.value = ''
  previewActive.value = false
}

// SEO設定
useSeoMeta({
  title: 'アニメーション生成 | Web開発ツール',
  description: 'CSS/SVGアニメーションを視覚的に作成。プレビュー機能付き。',
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold mb-2">
        アニメーション生成
      </h1>
      <p class="text-muted-foreground">
        CSS/SVGアニメーションを視覚的に作成・カスタマイズできます。
      </p>
    </div>

    <!-- アニメーションタイプ選択 -->
    <Card>
      <CardHeader>
        <CardTitle>アニメーションタイプ</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="flex gap-2">
          <Button
            v-for="type in ['css', 'svg']"
            :key="type"
            :variant="animationType === type ? 'default' : 'outline'"
            @click="animationType = type">
            {{ type.toUpperCase() }}アニメーション
          </Button>
        </div>
      </CardContent>
    </Card>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 設定パネル -->
      <div class="space-y-6">
        <!-- アニメーション選択 -->
        <Card>
          <CardHeader>
            <CardTitle>アニメーション選択</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-2">
                <Button
                  v-for="anim in (animationType === 'css' ? cssAnimations : svgAnimations)"
                  :key="anim.id"
                  :variant="selectedAnimation === anim.id ? 'default' : 'outline'"
                  size="sm"
                  @click="selectedAnimation = anim.id">
                  {{ anim.name }}
                </Button>
              </div>

              <div v-if="animationType === 'css' && selectedAnimation === 'custom'">
                <div class="flex items-center justify-between mb-2">
                  <label class="text-sm font-medium">カスタムキーフレーム</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    @click="customKeyframes = customKeyframesExample">
                    例を読み込む
                  </Button>
                </div>
                <textarea
                  v-model="customKeyframes"
                  placeholder="@keyframes customAnimation { ... }"
                  class="w-full h-48 p-3 font-mono text-sm border rounded-md bg-background resize-none"
                  spellcheck="false"></textarea>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- CSSアニメーション設定 -->
        <Card v-if="animationType === 'css'">
          <CardHeader>
            <CardTitle>アニメーション設定</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div>
                <label class="text-sm font-medium mb-2 block">
                  再生時間: {{ duration }}ms
                </label>
                <Slider
                  :model-value="[duration]"
                  :min="100"
                  :max="5000"
                  :step="100"
                  class="w-full"
                  @update:model-value="duration = $event?.[0] ?? duration" />
              </div>

              <div>
                <label class="text-sm font-medium mb-2 block">イージング</label>
                <select
                  v-model="easing"
                  class="w-full px-3 py-2 border rounded-md bg-background">
                  <option v-for="ease in easingFunctions" :key="ease.value" :value="ease.value">
                    {{ ease.label }}
                  </option>
                </select>
              </div>

              <div>
                <label class="text-sm font-medium mb-2 block">
                  遅延: {{ delay }}ms
                </label>
                <Slider
                  :model-value="[delay]"
                  :min="0"
                  :max="2000"
                  :step="100"
                  class="w-full"
                  @update:model-value="delay = $event?.[0] ?? delay" />
              </div>

              <div>
                <label class="text-sm font-medium mb-2 block">繰り返し回数</label>
                <Input
                  v-model="iterationCount"
                  placeholder="1, 2, 3... または infinite" />
              </div>

              <div>
                <label class="text-sm font-medium mb-2 block">再生方向</label>
                <select
                  v-model="direction"
                  class="w-full px-3 py-2 border rounded-md bg-background">
                  <option value="normal">
                    通常
                  </option>
                  <option value="reverse">
                    逆再生
                  </option>
                  <option value="alternate">
                    交互
                  </option>
                  <option value="alternate-reverse">
                    交互逆再生
                  </option>
                </select>
              </div>

              <div>
                <label class="text-sm font-medium mb-2 block">フィルモード</label>
                <select
                  v-model="fillMode"
                  class="w-full px-3 py-2 border rounded-md bg-background">
                  <option value="none">
                    なし
                  </option>
                  <option value="forwards">
                    終了時の状態を保持
                  </option>
                  <option value="backwards">
                    開始時の状態を適用
                  </option>
                  <option value="both">
                    両方
                  </option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- プレビューとコード -->
      <div class="space-y-6">
        <!-- プレビュー -->
        <Card>
          <CardHeader>
            <div class="flex items-center justify-between">
              <CardTitle>プレビュー</CardTitle>
              <Button
                size="sm"
                variant="outline"
                @click="togglePreview">
                <Icon name="heroicons:arrow-path" class="w-4 h-4 mr-2" />
                再生
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div class="h-64 flex items-center justify-center bg-muted rounded-md">
              <div v-if="animationType === 'css'">
                <div
                  class="w-24 h-24 bg-primary rounded-md"
                  :style="{
                    animation: previewActive && selectedAnimation !== 'custom'
                      ? `${selectedAnimation} ${duration}ms ${easing} ${delay}ms ${iterationCount} ${direction} ${fillMode}`
                      : undefined,
                  }">
                </div>
              </div>
              <!-- eslint-disable-next-line vue/no-v-html -->
              <div v-else class="text-primary" v-html="generatedSVG"></div>
            </div>
          </CardContent>
        </Card>

        <!-- 生成されたコード -->
        <Card v-if="animationType === 'css'">
          <CardHeader>
            <div class="flex items-center justify-between">
              <CardTitle>CSSコード</CardTitle>
              <Button
                size="sm"
                variant="ghost"
                @click="copyToClipboard(generatedCSS)">
                <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <pre class="p-3 bg-muted rounded-md overflow-x-auto text-sm"><code>{{ generatedCSS }}</code></pre>
          </CardContent>
        </Card>

        <Card v-if="animationType === 'css'">
          <CardHeader>
            <div class="flex items-center justify-between">
              <CardTitle>JavaScript版</CardTitle>
              <Button
                size="sm"
                variant="ghost"
                @click="copyToClipboard(generatedJavaScript)">
                <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <pre class="p-3 bg-muted rounded-md overflow-x-auto text-sm"><code>{{ generatedJavaScript }}</code></pre>
          </CardContent>
        </Card>

        <Card v-if="animationType === 'svg'">
          <CardHeader>
            <div class="flex items-center justify-between">
              <CardTitle>SVGコード</CardTitle>
              <Button
                size="sm"
                variant="ghost"
                @click="copyToClipboard(generatedSVG)">
                <Icon name="heroicons:clipboard-document" class="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <pre class="p-3 bg-muted rounded-md overflow-x-auto text-sm"><code>{{ generatedSVG }}</code></pre>
          </CardContent>
        </Card>

        <!-- リセット -->
        <div class="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            @click="reset">
            リセット
          </Button>
        </div>
      </div>
    </div>

    <!-- 説明 -->
    <Card>
      <CardHeader>
        <CardTitle>アニメーションについて</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4 text-muted-foreground">
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              パフォーマンスのヒント
            </h3>
            <ul class="list-disc list-inside space-y-1">
              <li>transform と opacity のアニメーションが最も高速</li>
              <li>will-change プロパティで事前に最適化可能</li>
              <li>大量の要素には CSS より JavaScript の方が効率的</li>
              <li>GPU アクセラレーションを活用する</li>
            </ul>
          </div>
          <div>
            <h3 class="font-semibold text-foreground mb-2">
              ブラウザ対応
            </h3>
            <ul class="list-disc list-inside space-y-1">
              <li>CSS アニメーション: 全モダンブラウザ対応</li>
              <li>Web Animations API: Chrome, Firefox, Safari 対応</li>
              <li>SVG アニメーション: 全モダンブラウザ対応</li>
              <li>ベンダープレフィックスは自動付与を推奨</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
