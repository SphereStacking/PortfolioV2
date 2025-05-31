import { ref } from 'vue'
import * as THREE from 'three'
import { presets } from './preset'

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
      opacity: number
      startTime: number
      direction: number
    }>,
    waveDuration: ref(2000),
    lastWaveTime: 0,
    gridSize: ref(presets.texture.default.gridSize),
    gridDensity: ref(presets.texture.default.gridDensity),
    waveSpeed: ref(presets.texture.default.waveSpeed),
    defaultCrossOpacity: ref(presets.texture.default.defaultCrossOpacity),
    defaultCrossSize: ref(presets.texture.default.defaultCrossSize),
    defaultCrossColor: 'rgba(255, 255, 255, 0.02)',
    waveColor: ref(presets.texture.default.waveColor),
    waveInterval: ref(presets.texture.default.waveInterval),
    repeat: ref(presets.texture.default.repeat),
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

  // 背景アニメーションの更新
  function updateBackgroundAnimation() {
    const now = performance.now()
    const canvas = backgroundTexture.value?.image as HTMLCanvasElement
    const context = canvas?.getContext('2d')

    if (!canvas || !context) return

    if (now - backgroundAnimation.lastUpdate < 16) {
      requestAnimationFrame(updateBackgroundAnimation)
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

    // 波紋の更新と描画
    const activeWaves = backgroundAnimation.waves.filter((wave) => {
      const elapsed = now - wave.startTime
      const progress = elapsed / backgroundAnimation.waveDuration.value

      if (progress >= 1) return false

      const distance = progress * backgroundAnimation.waveSpeed.value * 100
      const newX = wave.x + Math.cos(wave.direction) * distance
      const newY = wave.y + Math.sin(wave.direction) * distance
      wave.opacity = 1 - progress

      const influenceRadius = 20
      const startGridX = Math.floor((newX - influenceRadius) / cellWidth)
      const endGridX = Math.ceil((newX + influenceRadius) / cellWidth)
      const startGridY = Math.floor((newY - influenceRadius) / cellHeight)
      const endGridY = Math.ceil((newY + influenceRadius) / cellHeight)

      for (let i = Math.max(0, startGridX); i < Math.min(backgroundAnimation.gridSize.value * backgroundAnimation.gridDensity.value, endGridX); i++) {
        for (let j = Math.max(0, startGridY); j < Math.min(backgroundAnimation.gridSize.value * backgroundAnimation.gridDensity.value, endGridY); j++) {
          const cellX = i * cellWidth + cellWidth / 2
          const cellY = j * cellHeight + cellHeight / 2

          const dx = cellX - newX
          const dy = cellY - newY
          const distanceToWave = Math.sqrt(dx * dx + dy * dy)
          const cellOpacity = Math.max(0, wave.opacity * (1 - distanceToWave / influenceRadius))

          if (cellOpacity > 0.01) {
            context.font = `${backgroundAnimation.defaultCrossSize.value}px sans-serif`
            context.textAlign = 'center'
            context.textBaseline = 'middle'
            context.fillStyle = `${backgroundAnimation.waveColor.value}${Math.floor(cellOpacity * 255).toString(16).padStart(2, '0')}`
            context.fillText('+', cellX, cellY)
          }
        }
      }

      return true
    })

    backgroundAnimation.waves = activeWaves

    if (backgroundTexture.value) {
      backgroundTexture.value.needsUpdate = true
    }

    requestAnimationFrame(updateBackgroundAnimation)
  }

  // 波紋を追加する関数
  function addWave(x: number, y: number) {
    const now = performance.now()
    if (now - backgroundAnimation.lastWaveTime < backgroundAnimation.waveInterval.value) return

    const cellWidth = window.innerWidth / (backgroundAnimation.gridSize.value * backgroundAnimation.gridDensity.value)
    const cellHeight = window.innerHeight / (backgroundAnimation.gridSize.value * backgroundAnimation.gridDensity.value)
    const gridX = Math.floor(x / cellWidth) * cellWidth + cellWidth / 2
    const gridY = Math.floor(y / cellHeight) * cellHeight + cellHeight / 2

    const directions = Array.from({ length: 8 }, (_, i) => i * Math.PI / 4)
    directions.forEach((direction) => {
      backgroundAnimation.waves.push({
        x: gridX,
        y: gridY,
        opacity: 1,
        startTime: now,
        direction,
      })
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
