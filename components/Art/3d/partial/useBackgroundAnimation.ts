import { ref } from 'vue'
import * as THREE from 'three'
import { presets, DEFAULT_PRESETS } from './preset'

export interface BackgroundAnimation {
  gridSize: { value: number }
  gridDensity: { value: number }
  repeat: { value: number }
  waveColor: { value: string }
  waveSpeed: { value: number }
  waveDuration: { value: number }
  waveInterval: { value: number }
  defaultCrossSize: { value: number }
  defaultCrossOpacity: { value: number }
}

export const useBackgroundAnimation = () => {
  const backgroundTexture = ref<THREE.CanvasTexture | null>(null)
  const backgroundAnimation = {
    lastUpdate: 0,
    waves: [] as Array<{
      x: number
      y: number
      radius: number
      opacity: number
      startTime: number
    }>,
    waveDuration: ref(presets.texture[DEFAULT_PRESETS.texture].waveDuration),
    lastWaveTime: 0,
    gridSize: ref(presets.texture[DEFAULT_PRESETS.texture].gridSize),
    gridDensity: ref(presets.texture[DEFAULT_PRESETS.texture].gridDensity),
    waveSpeed: ref(presets.texture[DEFAULT_PRESETS.texture].waveSpeed),
    defaultCrossOpacity: ref(presets.texture[DEFAULT_PRESETS.texture].defaultCrossOpacity),
    defaultCrossSize: ref(presets.texture[DEFAULT_PRESETS.texture].defaultCrossSize),
    defaultCrossColor: presets.texture[DEFAULT_PRESETS.texture].defaultCrossColor,
    waveColor: ref(presets.texture[DEFAULT_PRESETS.texture].waveColor),
    waveInterval: ref(presets.texture[DEFAULT_PRESETS.texture].waveInterval),
    repeat: ref(presets.texture[DEFAULT_PRESETS.texture].repeat),
  }

  // Create background pattern
  function createPatternCanvas(): HTMLCanvasElement | null {
    if (typeof window === 'undefined') return null

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    if (context) {
      context.imageSmoothingEnabled = false
      context.fillStyle = '#000'
      context.fillRect(0, 0, canvas.width, canvas.height)
    }

    return canvas
  }

  // 背景アニメーションの更新（外部から呼び出される）
  function updateBackgroundAnimation() {
    const now = performance.now()
    const canvas = backgroundTexture.value?.image as HTMLCanvasElement
    const context = canvas?.getContext('2d')

    if (!canvas || !context) return

    // フレームレート制限（60fps）
    if (now - backgroundAnimation.lastUpdate < 16) {
      return
    }
    backgroundAnimation.lastUpdate = now

    context.clearRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = '#000'
    context.fillRect(0, 0, canvas.width, canvas.height)

    const cellWidth = canvas.width / (backgroundAnimation.gridSize.value * backgroundAnimation.gridDensity.value)
    const cellHeight = canvas.height / (backgroundAnimation.gridSize.value * backgroundAnimation.gridDensity.value)

    // デフォルトの十字を描画
    for (let i = 0; i < backgroundAnimation.gridSize.value * backgroundAnimation.gridDensity.value; i++) {
      for (let j = 0; j < backgroundAnimation.gridSize.value * backgroundAnimation.gridDensity.value; j++) {
        const cellX = i * cellWidth + cellWidth / 2
        const cellY = j * cellHeight + cellHeight / 2

        context.font = `${backgroundAnimation.defaultCrossSize.value}px sans-serif`
        context.textAlign = 'center'
        context.textBaseline = 'middle'
        context.fillStyle = `rgba(255, 255, 255, ${backgroundAnimation.defaultCrossOpacity.value})`
        context.fillText('+', cellX, cellY)
      }
    }

    // 波紋の更新と描画（円形の波紋）
    const activeWaves = backgroundAnimation.waves.filter((wave) => {
      const elapsed = now - wave.startTime
      const progress = elapsed / backgroundAnimation.waveDuration.value

      if (progress >= 1) return false

      // 波紋の半径を拡大
      wave.radius = progress * backgroundAnimation.waveSpeed.value * 200
      wave.opacity = 1 - progress

      // 波紋の幅（リングの厚さ）
      const waveWidth = 30
      const innerRadius = Math.max(0, wave.radius - waveWidth / 2)
      const outerRadius = wave.radius + waveWidth / 2

      // 影響範囲のグリッドを計算
      const startGridX = Math.floor((wave.x - outerRadius) / cellWidth)
      const endGridX = Math.ceil((wave.x + outerRadius) / cellWidth)
      const startGridY = Math.floor((wave.y - outerRadius) / cellHeight)
      const endGridY = Math.ceil((wave.y + outerRadius) / cellHeight)

      for (let i = Math.max(0, startGridX); i < Math.min(backgroundAnimation.gridSize.value * backgroundAnimation.gridDensity.value, endGridX); i++) {
        for (let j = Math.max(0, startGridY); j < Math.min(backgroundAnimation.gridSize.value * backgroundAnimation.gridDensity.value, endGridY); j++) {
          const cellX = i * cellWidth + cellWidth / 2
          const cellY = j * cellHeight + cellHeight / 2

          const dx = cellX - wave.x
          const dy = cellY - wave.y
          const distanceFromCenter = Math.sqrt(dx * dx + dy * dy)

          // リング状の波紋を作成
          let cellOpacity = 0
          if (distanceFromCenter >= innerRadius && distanceFromCenter <= outerRadius) {
            // リングの端に向かってフェードアウト
            const edgeFade = 1 - Math.abs(distanceFromCenter - wave.radius) / (waveWidth / 2)
            cellOpacity = wave.opacity * edgeFade
          }

          if (cellOpacity > 0.01) {
            context.font = `${backgroundAnimation.defaultCrossSize.value}px sans-serif`
            context.textAlign = 'center'
            context.textBaseline = 'middle'

            // 波紋タイプによって色を変える
            const waveColor = wave.color || backgroundAnimation.waveColor.value

            // 波紋タイプによってエフェクトを変える
            if (wave.type === 'pulse') {
              // パルス：中心からの距離に応じてサイズを変える
              const sizeFactor = 1 + (1 - progress) * 0.5
              context.font = `${backgroundAnimation.defaultCrossSize.value * sizeFactor}px sans-serif`
            }
            else if (wave.type === 'shockwave') {
              // ショックウェーブ：回転する
              context.save()
              context.translate(cellX, cellY)
              context.rotate(progress * Math.PI * 2)
              context.translate(-cellX, -cellY)
            }

            context.fillStyle = `${waveColor}${Math.floor(cellOpacity * 255).toString(16).padStart(2, '0')}`
            context.fillText('+', cellX, cellY)

            if (wave.type === 'shockwave') {
              context.restore()
            }
          }
        }
      }

      return true
    })

    // アクティブな波紋のみを保持（完了した波紋は自動的に削除される）
    backgroundAnimation.waves = activeWaves

    if (backgroundTexture.value) {
      backgroundTexture.value.needsUpdate = true
    }
  }

  // 波紋を追加する関数（拡張版）
  function addWave(x: number, y: number, type?: 'ring' | 'pulse' | 'shockwave', color?: string) {
    const now = performance.now()
    if (now - backgroundAnimation.lastWaveTime < backgroundAnimation.waveInterval.value) return

    const cellWidth = window.innerWidth / (backgroundAnimation.gridSize.value * backgroundAnimation.gridDensity.value)
    const cellHeight = window.innerHeight / (backgroundAnimation.gridSize.value * backgroundAnimation.gridDensity.value)
    const gridX = Math.floor(x / cellWidth) * cellWidth + cellWidth / 2
    const gridY = Math.floor(y / cellHeight) * cellHeight + cellHeight / 2

    // ランダムな波紋タイプを選択
    const waveTypes: Array<'ring' | 'pulse' | 'shockwave'> = ['ring', 'pulse', 'shockwave']
    const selectedType = type || waveTypes[Math.floor(Math.random() * waveTypes.length)]

    // ランダムな色を選択（指定がない場合）
    const colors = ['#00ff41', '#ff00ff', '#00ffff', '#ff0080', '#ffff00']
    const selectedColor = color || colors[Math.floor(Math.random() * colors.length)]

    backgroundAnimation.waves.push({
      x: gridX,
      y: gridY,
      radius: 0,
      opacity: 1,
      startTime: now,
      type: selectedType,
      color: selectedColor,
    })

    backgroundAnimation.lastWaveTime = now
  }

  // テクスチャの繰り返し設定を更新する関数
  function updateTextureRepeat() {
    if (backgroundTexture.value) {
      const isRepeating = backgroundAnimation.repeat.value > 1
      backgroundTexture.value.wrapS = isRepeating ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping
      backgroundTexture.value.wrapT = isRepeating ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping
      backgroundTexture.value.repeat.set(backgroundAnimation.repeat.value, backgroundAnimation.repeat.value)
      backgroundTexture.value.offset.set(-0.5, -0.5)
      backgroundTexture.value.needsUpdate = true
    }
  }

  return {
    backgroundTexture,
    backgroundAnimation,
    createPatternCanvas,
    updateBackgroundAnimation,
    addWave,
    updateTextureRepeat,
  }
}
