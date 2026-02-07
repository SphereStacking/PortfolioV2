<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useClipboard } from '@vueuse/core'

definePageMeta({
  layout: 'tools',
})

// 状態管理
const functions = ref([
  { id: '1', expression: 'sin(x)', color: '#3b82f6', visible: true },
  { id: '2', expression: 'x^2', color: '#ef4444', visible: true },
])
const xMin = ref(-10)
const xMax = ref(10)
const yMin = ref(-10)
const yMax = ref(10)
const gridEnabled = ref(true)
const error = ref('')

// Canvas関連
const canvasRef = ref<HTMLCanvasElement>()
const canvasWidth = 600
const canvasHeight = 400

// 数式評価（簡易実装）
const evaluateExpression = (expression: string, x: number): number => {
  try {
    // 数式の前処理
    const expr = expression.toLowerCase()
      .replace(/\s/g, '')
      .replace(/sin/g, 'Math.sin')
      .replace(/cos/g, 'Math.cos')
      .replace(/tan/g, 'Math.tan')
      .replace(/log/g, 'Math.log10')
      .replace(/ln/g, 'Math.log')
      .replace(/sqrt/g, 'Math.sqrt')
      .replace(/abs/g, 'Math.abs')
      .replace(/exp/g, 'Math.exp')
      .replace(/pi/g, 'Math.PI')
      .replace(/e(?![xp])/g, 'Math.E')
      .replace(/\^/g, '**')
      .replace(/x/g, `(${x})`)

    // evalの代替（制限付き）
    const result = new Function('Math', `return ${expr}`)(Math)
    return isFinite(result) ? result : NaN
  }
  catch (e) {
    return NaN
  }
}

// グラフ描画
const drawGraph = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // クリア
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  // 背景
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)

  // スケール計算
  const xScale = canvasWidth / (xMax.value - xMin.value)
  const yScale = canvasHeight / (yMax.value - yMin.value)

  // グリッド描画
  if (gridEnabled.value) {
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 1

    // 縦線
    for (let x = Math.ceil(xMin.value); x <= xMax.value; x++) {
      const pixelX = (x - xMin.value) * xScale
      ctx.beginPath()
      ctx.moveTo(pixelX, 0)
      ctx.lineTo(pixelX, canvasHeight)
      ctx.stroke()
    }

    // 横線
    for (let y = Math.ceil(yMin.value); y <= yMax.value; y++) {
      const pixelY = canvasHeight - (y - yMin.value) * yScale
      ctx.beginPath()
      ctx.moveTo(0, pixelY)
      ctx.lineTo(canvasWidth, pixelY)
      ctx.stroke()
    }
  }

  // 軸描画
  ctx.strokeStyle = '#374151'
  ctx.lineWidth = 2

  // X軸
  if (yMin.value <= 0 && yMax.value >= 0) {
    const y0 = canvasHeight - (0 - yMin.value) * yScale
    ctx.beginPath()
    ctx.moveTo(0, y0)
    ctx.lineTo(canvasWidth, y0)
    ctx.stroke()
  }

  // Y軸
  if (xMin.value <= 0 && xMax.value >= 0) {
    const x0 = (0 - xMin.value) * xScale
    ctx.beginPath()
    ctx.moveTo(x0, 0)
    ctx.lineTo(x0, canvasHeight)
    ctx.stroke()
  }

  // 関数描画
  functions.value.forEach((func) => {
    if (!func.visible || !func.expression) return

    ctx.strokeStyle = func.color
    ctx.lineWidth = 2
    ctx.beginPath()

    let firstPoint = true
    const step = (xMax.value - xMin.value) / canvasWidth

    for (let pixelX = 0; pixelX <= canvasWidth; pixelX++) {
      const x = xMin.value + pixelX / xScale
      const y = evaluateExpression(func.expression, x)

      if (!isNaN(y) && isFinite(y)) {
        const pixelY = canvasHeight - (y - yMin.value) * yScale

        if (pixelY >= -10 && pixelY <= canvasHeight + 10) {
          if (firstPoint) {
            ctx.moveTo(pixelX, pixelY)
            firstPoint = false
          }
          else {
            ctx.lineTo(pixelX, pixelY)
          }
        }
        else {
          firstPoint = true
        }
      }
      else {
        firstPoint = true
      }
    }

    ctx.stroke()
  })

  // 軸ラベル
  ctx.fillStyle = '#374151'
  ctx.font = '12px sans-serif'

  // X軸ラベル
  for (let x = Math.ceil(xMin.value); x <= xMax.value; x += Math.max(1, Math.floor((xMax.value - xMin.value) / 10))) {
    const pixelX = (x - xMin.value) * xScale
    ctx.textAlign = 'center'
    ctx.fillText(x.toString(), pixelX, canvasHeight - 5)
  }

  // Y軸ラベル
  for (let y = Math.ceil(yMin.value); y <= yMax.value; y += Math.max(1, Math.floor((yMax.value - yMin.value) / 10))) {
    const pixelY = canvasHeight - (y - yMin.value) * yScale
    ctx.textAlign = 'right'
    ctx.fillText(y.toString(), 35, pixelY + 3)
  }
}

// 関数操作
const addFunction = () => {
  const colors = ['#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1']
  const newId = Date.now().toString()
  functions.value.push({
    id: newId,
    expression: '',
    color: colors[functions.value.length % colors.length],
    visible: true,
  })
}

const removeFunction = (id: string) => {
  functions.value = functions.value.filter(f => f.id !== id)
}

const toggleFunction = (id: string) => {
  const func = functions.value.find(f => f.id === id)
  if (func) {
    func.visible = !func.visible
  }
}

// ズーム操作
const zoomIn = () => {
  const xCenter = (xMin.value + xMax.value) / 2
  const yCenter = (yMin.value + yMax.value) / 2
  const xRange = (xMax.value - xMin.value) / 2
  const yRange = (yMax.value - yMin.value) / 2

  xMin.value = xCenter - xRange * 0.8
  xMax.value = xCenter + xRange * 0.8
  yMin.value = yCenter - yRange * 0.8
  yMax.value = yCenter + yRange * 0.8
}

const zoomOut = () => {
  const xCenter = (xMin.value + xMax.value) / 2
  const yCenter = (yMin.value + yMax.value) / 2
  const xRange = (xMax.value - xMin.value) / 2
  const yRange = (yMax.value - yMin.value) / 2

  xMin.value = xCenter - xRange * 1.25
  xMax.value = xCenter + xRange * 1.25
  yMin.value = yCenter - yRange * 1.25
  yMax.value = yCenter + yRange * 1.25
}

const resetView = () => {
  xMin.value = -10
  xMax.value = 10
  yMin.value = -10
  yMax.value = 10
}

// プリセット関数
const presets = [
  { name: '三角関数', functions: ['sin(x)', 'cos(x)', 'tan(x)'] },
  { name: '多項式', functions: ['x', 'x^2', 'x^3'] },
  { name: '指数・対数', functions: ['exp(x)', 'ln(x)', 'log(x)'] },
  { name: '双曲線関数', functions: ['1/x', 'sqrt(x)', 'x^(1/2)'] },
]

const loadPreset = (preset: typeof presets[0]) => {
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6']
  functions.value = preset.functions.map((expr, index) => ({
    id: Date.now().toString() + index,
    expression: expr,
    color: colors[index % colors.length],
    visible: true,
  }))
}

// 交点計算（簡易実装）
const findIntersections = computed(() => {
  const intersections: Array<{ x: number, y: number, f1: string, f2: string }> = []

  if (functions.value.length < 2) return intersections

  const step = 0.01
  const visibleFunctions = functions.value.filter(f => f.visible && f.expression)

  for (let i = 0; i < visibleFunctions.length - 1; i++) {
    for (let j = i + 1; j < visibleFunctions.length; j++) {
      const f1 = visibleFunctions[i]
      const f2 = visibleFunctions[j]

      for (let x = xMin.value; x < xMax.value; x += step) {
        const y1a = evaluateExpression(f1.expression, x)
        const y2a = evaluateExpression(f2.expression, x)
        const y1b = evaluateExpression(f1.expression, x + step)
        const y2b = evaluateExpression(f2.expression, x + step)

        if (!isNaN(y1a) && !isNaN(y2a) && !isNaN(y1b) && !isNaN(y2b)) {
          if ((y1a - y2a) * (y1b - y2b) < 0) {
            // 二分法で精度を上げる
            let left = x
            let right = x + step
            for (let k = 0; k < 10; k++) {
              const mid = (left + right) / 2
              const y1 = evaluateExpression(f1.expression, mid)
              const y2 = evaluateExpression(f2.expression, mid)
              if ((y1a - y2a) * (y1 - y2) < 0) {
                right = mid
              }
              else {
                left = mid
              }
            }
            const finalX = (left + right) / 2
            const finalY = evaluateExpression(f1.expression, finalX)

            if (finalX >= xMin.value && finalX <= xMax.value
              && finalY >= yMin.value && finalY <= yMax.value) {
              intersections.push({
                x: Math.round(finalX * 1000) / 1000,
                y: Math.round(finalY * 1000) / 1000,
                f1: f1.expression,
                f2: f2.expression,
              })
            }
          }
        }
      }
    }
  }

  return intersections
})

// グラフのエクスポート
const exportGraph = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  canvas.toBlob((blob) => {
    if (blob) {
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'graph.png'
      link.click()
      URL.revokeObjectURL(url)
    }
  })
}

// 監視と再描画
watch([functions, xMin, xMax, yMin, yMax, gridEnabled], () => {
  nextTick(() => drawGraph())
}, { deep: true })

onMounted(() => {
  drawGraph()
})

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

// SEO設定
useSeoMeta({
  title: '数式グラフ描画 | Web開発ツール',
  description: '数式を入力してグラフを描画。複数関数の同時表示、ズーム機能付き。',
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold mb-2">
        数式グラフ描画
      </h1>
      <p class="text-muted-foreground">
        数式を入力してグラフを描画します。複数の関数を同時に表示可能。
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 設定パネル -->
      <div class="space-y-6">
        <!-- 関数入力 -->
        <Card>
          <CardHeader>
            <div class="flex items-center justify-between">
              <CardTitle>関数</CardTitle>
              <Button size="sm" @click="addFunction">
                <Icon name="heroicons:plus" class="w-4 h-4 mr-2" />
                追加
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div class="space-y-3">
              <div
                v-for="func in functions"
                :key="func.id"
                class="flex items-center gap-2">
                <input
                  v-model="func.color"
                  type="color"
                  class="w-8 h-8 rounded cursor-pointer">
                <Input
                  v-model="func.expression"
                  placeholder="例: sin(x), x^2, ln(x)"
                  class="flex-1"
                  :disabled="!func.visible" />
                <Button
                  size="sm"
                  variant="ghost"
                  @click="toggleFunction(func.id)">
                  <Icon
                    :name="func.visible ? 'heroicons:eye' : 'heroicons:eye-slash'"
                    class="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  @click="removeFunction(func.id)">
                  <Icon name="heroicons:trash" class="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div class="mt-4">
              <label class="text-sm font-medium mb-2 block">プリセット</label>
              <div class="grid grid-cols-2 gap-2">
                <Button
                  v-for="preset in presets"
                  :key="preset.name"
                  variant="outline"
                  size="sm"
                  @click="loadPreset(preset)">
                  {{ preset.name }}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- 表示範囲 -->
        <Card>
          <CardHeader>
            <CardTitle>表示範囲</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="text-sm font-medium">X最小</label>
                  <Input v-model.number="xMin" type="number" />
                </div>
                <div>
                  <label class="text-sm font-medium">X最大</label>
                  <Input v-model.number="xMax" type="number" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="text-sm font-medium">Y最小</label>
                  <Input v-model.number="yMin" type="number" />
                </div>
                <div>
                  <label class="text-sm font-medium">Y最大</label>
                  <Input v-model.number="yMax" type="number" />
                </div>
              </div>

              <div class="flex items-center gap-2">
                <Button size="sm" variant="outline" @click="zoomIn">
                  <Icon name="heroicons:magnifying-glass-plus" class="w-4 h-4 mr-2" />
                  拡大
                </Button>
                <Button size="sm" variant="outline" @click="zoomOut">
                  <Icon name="heroicons:magnifying-glass-minus" class="w-4 h-4 mr-2" />
                  縮小
                </Button>
                <Button size="sm" variant="outline" @click="resetView">
                  <Icon name="heroicons:arrow-path" class="w-4 h-4 mr-2" />
                  リセット
                </Button>
              </div>

              <label class="flex items-center gap-2">
                <input
                  v-model="gridEnabled"
                  type="checkbox"
                  class="w-4 h-4 rounded border-zinc-300 text-primary">
                グリッドを表示
              </label>
            </div>
          </CardContent>
        </Card>

        <!-- 交点 -->
        <Card v-if="findIntersections.length > 0">
          <CardHeader>
            <CardTitle>交点</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-2 text-sm">
              <div
                v-for="(point, index) in findIntersections.slice(0, 10)"
                :key="index"
                class="p-2 bg-muted rounded">
                <div class="font-medium">
                  ({{ point.x }}, {{ point.y }})
                </div>
                <div class="text-xs text-muted-foreground">
                  {{ point.f1 }} ∩ {{ point.f2 }}
                </div>
              </div>
              <div v-if="findIntersections.length > 10" class="text-xs text-muted-foreground text-center">
                他 {{ findIntersections.length - 10 }} 個の交点
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- グラフ表示 -->
      <div class="lg:col-span-2">
        <Card>
          <CardHeader>
            <div class="flex items-center justify-between">
              <CardTitle>グラフ</CardTitle>
              <Button size="sm" variant="outline" @click="exportGraph">
                <Icon name="heroicons:arrow-down-tray" class="w-4 h-4 mr-2" />
                画像保存
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div class="border rounded-md bg-white p-4">
              <canvas
                ref="canvasRef"
                :width="canvasWidth"
                :height="canvasHeight"
                class="w-full"
                style="max-width: 100%; height: auto;">
              </canvas>
            </div>

            <Alert v-if="error" variant="destructive" class="mt-4">
              <Icon name="heroicons:exclamation-circle" class="w-4 h-4" />
              <AlertDescription>{{ error }}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <!-- 使い方 -->
        <Card>
          <CardHeader>
            <CardTitle>使用可能な関数</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 class="font-medium mb-1">
                  基本演算
                </h4>
                <ul class="space-y-1 text-muted-foreground">
                  <li><code>x + 2</code> 加算</li>
                  <li><code>x - 3</code> 減算</li>
                  <li><code>x * 2</code> 乗算</li>
                  <li><code>x / 2</code> 除算</li>
                  <li><code>x^2</code> べき乗</li>
                </ul>
              </div>
              <div>
                <h4 class="font-medium mb-1">
                  三角関数
                </h4>
                <ul class="space-y-1 text-muted-foreground">
                  <li><code>sin(x)</code> 正弦</li>
                  <li><code>cos(x)</code> 余弦</li>
                  <li><code>tan(x)</code> 正接</li>
                </ul>
              </div>
              <div>
                <h4 class="font-medium mb-1">
                  その他の関数
                </h4>
                <ul class="space-y-1 text-muted-foreground">
                  <li><code>sqrt(x)</code> 平方根</li>
                  <li><code>abs(x)</code> 絶対値</li>
                  <li><code>exp(x)</code> 指数関数</li>
                  <li><code>ln(x)</code> 自然対数</li>
                  <li><code>log(x)</code> 常用対数</li>
                </ul>
              </div>
            </div>
            <div class="mt-4 text-sm text-muted-foreground">
              <p>定数: <code>pi</code> (円周率), <code>e</code> (自然対数の底)</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
