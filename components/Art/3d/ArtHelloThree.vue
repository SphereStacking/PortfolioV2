<template>
  <TresCanvas clear-color="#000000" window-size>
    <!-- カメラ -->
    <TresPerspectiveCamera
      ref="cameraRef"
      :position="cameraPosition"
      :fov="75"
      :near="0.1"
      :far="100" />

    <!-- OrbitControls -->
    <OrbitControls
      ref="controlsRef"
      :enable-damping="true"
      :enabled="orbitControlsEnabled"
      :target="originalTarget" />

    <!-- ライティング -->
    <TresAmbientLight
      color="#FFFFFF"
      :intensity="0.5" />
    <TresDirectionalLight
      :position="[2, 2, 5]"
      color="#FFFFFF"
      :intensity="1" />

    <!-- 背景パターン -->
    <primitive
      v-if="backgroundTexture"
      :object="backgroundTexture"
      attach="background" />

    <!-- デバッグ用AxesHelper -->
    <TresAxesHelper
      v-if="showAxesHelper"
      :size="2" />

    <!-- オブジェクト群 -->
    <template v-for="(obj, index) in objects" :key="index">
      <TresMesh
        ref="obj.meshRef"
        :position="obj.position"
        :rotation="obj.rotation"
        :scale="[obj.scale, obj.scale, obj.scale]">
        <component
          :is="obj.geometry"
          v-bind="obj.geometryArgs" />
        <TresMeshNormalMaterial />
      </TresMesh>
    </template>
  </TresCanvas>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import * as THREE from 'three'
import { useMouse } from '@vueuse/core'
import { presets, DEFAULT_PRESETS, type TexturePresetName, type CameraPresetName } from './partial/preset'
import { useBackgroundAnimation } from './partial/useBackgroundAnimation'
import { useObjects } from './partial/useObjects'
import { useObjectAnimation } from './partial/useObjectAnimation'
import { useTweakpane } from './partial/useTweakpane'
import type { AnimationParams } from './partial/types'

// Camera refs
const cameraRef = ref()
const controlsRef = ref()

// Camera animation states
const orbitControlsEnabled = ref(false)
const cameraPosition = ref<[number, number, number]>([-10, -10, 5])
const originalTarget = [0, 0, 0] as [number, number, number]

// Animation parameters
const animationParams: AnimationParams = {
  // カメラアニメーション
  camera: {
    initialPosition: [-10, -10, 5] as [number, number, number],
    targetPosition: [0, 0, 0] as [number, number, number],
    // 波形パラメータ（chaosプリセットをデフォルトに）
    wave: {
      frequency: ref(presets.camera.chaos.frequency), // 周波数
      phase: ref(presets.camera.chaos.phase), // 位相
      amplitude: ref(presets.camera.chaos.amplitude), // 振幅
      radius: ref(presets.camera.chaos.radius), // 移動半径
      transitionSpeed: ref(presets.camera.chaos.transitionSpeed), // 遷移速度
      zoom: ref(presets.camera.chaos.zoom), // ズーム倍率
      zoomFrequency: ref(presets.camera.chaos.zoomFrequency), // ズームの周波数
      zoomAmplitude: ref(presets.camera.chaos.zoomAmplitude), // ズームの振幅
      frequencyThreshold: ref(presets.camera.chaos.frequencyThreshold), // 周波数の閾値
      isActive: ref(false), // アクティブ状態
    },
    // モニタリング用の値
    monitor: {
      frequencyWave: 0, // 周波数波形用の値
      zoomWave: 0, // ズーム波形用の値
      threshold: 0, // 閾値の表示用
    },
  },
  // オブジェクトアニメーション
  objects: {
    scaleRange: ref<[number, number]>([0.2, 1.5]),
    position: {
      radius: ref(10),
      exclusionRadius: ref(4),
    },
  },
}

// Mouse tracking
const { x: mouseX, y: mouseY } = useMouse()
const lastMouseMoveTime = ref(0)

// Debug
const showAxesHelper = ref(false)

// Background pattern
const { backgroundTexture, backgroundAnimation, createPatternCanvas, updateBackgroundAnimation, addWave, updateTextureRepeat } = useBackgroundAnimation()
const { objects, createObjects: generateObjects } = useObjects()
const { animateObjects } = useObjectAnimation()

let lastUpdateTime = 0

// カメラアニメーション
function animateCamera() {
  const now = performance.now()
  const camera = cameraRef.value
  const updateInterval = 1000 / 60 // 60fpsに固定

  if (camera && now - lastUpdateTime >= updateInterval) {
    const { frequency, phase, amplitude, radius, transitionSpeed, zoom, zoomFrequency, zoomAmplitude, frequencyThreshold, isActive } = animationParams.camera.wave
    const time = now / 1000

    const currentFrequency = Math.abs(Math.sin(time * frequency.value * Math.PI * 2 + phase.value))
    isActive.value = currentFrequency > frequencyThreshold.value

    const waveValue = isActive.value
      ? Math.sin(time * frequency.value * Math.PI * 2 + phase.value) * amplitude.value
      : 0

    const zoomWave = isActive.value
      ? Math.sin(time * zoomFrequency.value * Math.PI * 2) * zoomAmplitude.value
      : 0
    const currentZoom = zoom.value + zoomWave

    const theta = time * frequency.value * Math.PI * 2
    const phi = (waveValue + 1) * Math.PI / 2
    const currentRadius = radius.value * currentZoom

    const x = currentRadius * Math.sin(phi) * Math.cos(theta)
    const y = currentRadius * Math.sin(phi) * Math.sin(theta)
    const z = currentRadius * Math.cos(phi)

    const targetPosition = new THREE.Vector3(x, y, z)

    // よりスムーズな補間のためにtransitionSpeedを調整
    const smoothTransitionSpeed = Math.min(transitionSpeed.value * (updateInterval / 16), 1)
    camera.position.lerp(targetPosition, smoothTransitionSpeed)
    camera.lookAt(...animationParams.camera.targetPosition)

    if (now % 100 < updateInterval) {
      animationParams.camera.monitor.frequencyWave = waveValue
      animationParams.camera.monitor.zoomWave = zoomWave
      animationParams.camera.monitor.threshold = frequencyThreshold.value
    }

    lastUpdateTime = now
  }
}

// 周波数波形の更新（メインアニメーションループに統合）
function updateFrequencyWave() {
  const now = performance.now()
  if (now - lastUpdateTime >= 100) {
    const time = now / 1000
    const { frequency, phase, amplitude } = animationParams.camera.wave
    animationParams.camera.monitor.frequencyWave = Math.sin(time * frequency.value * Math.PI * 2 + phase.value) * amplitude.value
  }
}

// プリセット自動変更の状態管理
const autoChangeEnabled = ref(true)
const presetChangeInterval = ref(200) // 0.3秒ごとに変更（より動的に）
let presetChangeTimer: number | null = null

// アイドル時のエフェクト管理
const idleEffectInterval = 5000 // 5秒間操作がない場合
let idleEffectTimer: number | null = null

// 利用可能なプリセット名を取得
const texturePresetNames = Object.keys(presets.texture) as TexturePresetName[]
const cameraPresetNames = Object.keys(presets.camera) as CameraPresetName[]

// プリセットを適用する関数
function applyPreset(
  category: 'texture' | 'camera',
  presetName: TexturePresetName | CameraPresetName,
) {
  if (category === 'texture') {
    const texturePreset = presets.texture[presetName as TexturePresetName]

    // テクスチャの更新を一時停止
    if (backgroundTexture.value) {
      backgroundTexture.value.needsUpdate = false
    }

    // パラメータを更新
    backgroundAnimation.repeat.value = texturePreset.repeat
    backgroundAnimation.gridSize.value = texturePreset.gridSize
    backgroundAnimation.gridDensity.value = texturePreset.gridDensity
    backgroundAnimation.defaultCrossSize.value = texturePreset.defaultCrossSize
    backgroundAnimation.defaultCrossOpacity.value = texturePreset.defaultCrossOpacity
    backgroundAnimation.waveSpeed.value = texturePreset.waveSpeed
    backgroundAnimation.waveDuration.value = texturePreset.waveDuration
    backgroundAnimation.waveInterval.value = texturePreset.waveInterval

    // テクスチャを再生成
    const canvas = createPatternCanvas()
    if (canvas && backgroundTexture.value) {
      backgroundTexture.value.image = canvas
      backgroundTexture.value.needsUpdate = true
    }

    updateTextureRepeat()
  }
  else {
    const cameraPreset = presets.camera[presetName as CameraPresetName]

    // カメラパラメータを直接設定
    animationParams.camera.wave.frequency.value = cameraPreset.frequency
    animationParams.camera.wave.phase.value = cameraPreset.phase
    animationParams.camera.wave.amplitude.value = cameraPreset.amplitude
    animationParams.camera.wave.radius.value = cameraPreset.radius
    animationParams.camera.wave.transitionSpeed.value = cameraPreset.transitionSpeed
    animationParams.camera.wave.zoom.value = cameraPreset.zoom
    animationParams.camera.wave.zoomFrequency.value = cameraPreset.zoomFrequency
    animationParams.camera.wave.zoomAmplitude.value = cameraPreset.zoomAmplitude
    animationParams.camera.wave.frequencyThreshold.value = cameraPreset.frequencyThreshold
  }
}

// ランダムなプリセットを選択して適用
function getRandomPreset() {
  // 相性の良いコンビネーションを定義
  const presetCombinations = [
    { texture: 'glitch', camera: 'chaos' }, // グリッチ × カオス（デフォルト）
    { texture: 'matrix', camera: 'orbital' }, // マトリックス × 軌道
    { texture: 'neon', camera: 'pulse' }, // ネオン × パルス
    { texture: 'quantum', camera: 'helix' }, // 量子 × ヘリックス
    { texture: 'cyber', camera: 'vortex' }, // サイバー × 渦
    { texture: 'void', camera: 'pendulum' }, // ヴォイド × 振り子
    { texture: 'glitch', camera: 'helix' }, // グリッチ × ヘリックス
    { texture: 'matrix', camera: 'chaos' }, // マトリックス × カオス
  ]

  // ランダムまたはコンビネーションから選択
  const useCombo = Math.random() > 0.3 // 70%の確率でコンビネーションを使用

  let randomTexture: TexturePresetName
  let randomCamera: CameraPresetName

  if (useCombo && presetCombinations.length > 0) {
    const combo = presetCombinations[Math.floor(Math.random() * presetCombinations.length)]
    randomTexture = combo.texture as TexturePresetName
    randomCamera = combo.camera as CameraPresetName
  }
  else {
    randomTexture = texturePresetNames[Math.floor(Math.random() * texturePresetNames.length)]
    randomCamera = cameraPresetNames[Math.floor(Math.random() * cameraPresetNames.length)]
  }

  // テクスチャとカメラのプリセットを個別に適用
  applyPreset('texture', randomTexture)
  applyPreset('camera', randomCamera)

  // Tweakpaneの値も更新
  const paneInstance = pane()
  if (paneInstance) {
    paneInstance.refresh()
  }

  console.log(`Applied preset combination: ${randomTexture} + ${randomCamera}`)

  return {
    texture: randomTexture,
    camera: randomCamera,
  }
}

// プリセット自動変更の開始
function startPresetAutoChange() {
  if (presetChangeTimer) return

  autoChangeEnabled.value = true
  presetChangeTimer = window.setInterval(() => {
    const nextPreset = getRandomPreset()
    console.log('Applying preset:', nextPreset)
  }, presetChangeInterval.value)
}

// プリセット自動変更の停止
function stopPresetAutoChange() {
  if (presetChangeTimer) {
    clearInterval(presetChangeTimer)
    presetChangeTimer = null
  }
  autoChangeEnabled.value = false
}

// プリセット自動変更の状態監視
watch(autoChangeEnabled, (newValue) => {
  if (newValue) {
    startPresetAutoChange()
  }
  else {
    stopPresetAutoChange()
  }
})

const { initTweakpane, dispose, pane } = useTweakpane(
  backgroundAnimation,
  animationParams,
  showAxesHelper,
  applyPreset,
  autoChangeEnabled, // 自動変更の状態を渡す
  presetChangeInterval, // インターバル設定を渡す
)

// オブジェクトの初期化
objects.value = generateObjects()

// アニメーションループの管理
let animationId: number | null = null

// アイドル時のランダムエフェクト
function createIdleEffect() {
  const canvas = backgroundTexture.value?.image as HTMLCanvasElement
  if (!canvas) return

  // ランダムな位置に波紋を生成
  const x = Math.random() * window.innerWidth
  const y = Math.random() * window.innerHeight

  // ランダムな波紋タイプと色を選択
  const types: Array<'ring' | 'pulse' | 'shockwave'> = ['ring', 'pulse', 'shockwave']
  const colors = ['#00ff41', '#ff00ff', '#00ffff', '#ff0080', '#ffff00']
  const type = types[Math.floor(Math.random() * types.length)]
  const color = colors[Math.floor(Math.random() * colors.length)]

  addWave(x, y, type, color)
}

// アイドル状態のチェック
function checkIdleState() {
  const now = performance.now()
  const timeSinceLastMove = now - lastMouseMoveTime.value

  if (timeSinceLastMove >= idleEffectInterval) {
    // 5秒以上操作がない場合、ランダムエフェクトを発生
    createIdleEffect()

    // 次のエフェクトまでのタイマーをリセット（1-3秒のランダム間隔）
    if (idleEffectTimer) {
      clearTimeout(idleEffectTimer)
    }
    idleEffectTimer = window.setTimeout(checkIdleState, 1000 + Math.random() * 2000)
  }
}

// アニメーションループ
function animate(time: number) {
  animationId = requestAnimationFrame(animate)
  updateBackgroundAnimation()
  animateCamera()
  animateObjects(objects.value, time)
  updateFrequencyWave() // 統合
}

// アニメーションの停止
function stopAnimation() {
  if (animationId !== null) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
}

// ウィンドウサイズ変更ハンドラの定義（クリーンアップ用）
const handleResize = () => {
  const canvas = createPatternCanvas()
  if (canvas && backgroundTexture.value) {
    // テクスチャの更新を一時停止
    backgroundTexture.value.needsUpdate = false

    // 新しいキャンバスを設定
    backgroundTexture.value.image = canvas

    // テクスチャの設定を再適用
    backgroundTexture.value.magFilter = THREE.NearestFilter
    backgroundTexture.value.minFilter = THREE.NearestFilter
    backgroundTexture.value.center.set(0.5, 0.5)
    updateTextureRepeat()

    // テクスチャの更新を再開
    backgroundTexture.value.needsUpdate = true
  }
}

// Event handlers
onMounted(() => {
  const canvas = createPatternCanvas()
  if (canvas) {
    const texture = new THREE.CanvasTexture(canvas)
    // テクスチャの繰り返し設定
    updateTextureRepeat()
    texture.magFilter = THREE.NearestFilter
    texture.minFilter = THREE.NearestFilter
    // テクスチャの中心を設定
    texture.center.set(0.5, 0.5)
    backgroundTexture.value = texture
    updateBackgroundAnimation()
  }

  // 初期マウス位置を設定
  lastMouseMoveTime.value = performance.now()
  window.addEventListener('resize', handleResize)

  // デフォルトプリセットを適用
  applyPreset('texture', DEFAULT_PRESETS.texture)
  applyPreset('camera', DEFAULT_PRESETS.camera)
  animate(performance.now())
  initTweakpane()

  // アイドル状態のチェックを開始
  idleEffectTimer = window.setTimeout(checkIdleState, idleEffectInterval)

  // マウス移動の監視
  watch([mouseX, mouseY], ([x, y]) => {
    lastMouseMoveTime.value = performance.now()

    // アイドルタイマーをリセット
    if (idleEffectTimer) {
      clearTimeout(idleEffectTimer)
    }
    idleEffectTimer = window.setTimeout(checkIdleState, idleEffectInterval)

    // マウスの位置に波紋を追加
    const canvas = backgroundTexture.value?.image as HTMLCanvasElement
    if (canvas) {
      addWave(x, y)
    }
  })
})

onUnmounted(() => {
  // アニメーションの停止
  stopAnimation()

  // イベントリスナーの削除
  window.removeEventListener('resize', handleResize)

  // Tweakpaneのクリーンアップ
  dispose()

  // プリセット自動変更の停止
  stopPresetAutoChange()

  // アイドルエフェクトタイマーの停止
  if (idleEffectTimer) {
    clearTimeout(idleEffectTimer)
    idleEffectTimer = null
  }

  // テクスチャの破棄
  if (backgroundTexture.value) {
    backgroundTexture.value.dispose()
    backgroundTexture.value = null
  }
})
</script>

<style scoped>
</style>
