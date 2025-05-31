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
import { presets, type TexturePresetName, type CameraPresetName } from './partial/preset'
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
    // 波形パラメータ
    wave: {
      frequency: ref(0.005), // 周波数
      phase: ref(0), // 位相
      amplitude: ref(1), // 振幅
      radius: ref(10), // 移動半径
      transitionSpeed: ref(0.1), // 遷移速度
      zoom: ref(1), // ズーム倍率
      zoomFrequency: ref(0.2), // ズームの周波数
      zoomAmplitude: ref(0.2), // ズームの振幅
      frequencyThreshold: ref(0.3), // 周波数の閾値
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

// 周波数波形の更新
function updateFrequencyWave() {
  let lastUpdateTime = 0
  const updateInterval = 100

  function update() {
    const now = performance.now()
    if (now - lastUpdateTime >= updateInterval) {
      const time = now / 1000
      const { frequency, phase, amplitude } = animationParams.camera.wave
      animationParams.camera.monitor.frequencyWave = Math.sin(time * frequency.value * Math.PI * 2 + phase.value) * amplitude.value
      lastUpdateTime = now
    }
    requestAnimationFrame(update)
  }

  update()
}

// プリセット自動変更の状態管理
const autoChangeEnabled = ref(true)
const presetChangeInterval = ref(5000) // 5秒ごとに変更
let presetChangeTimer: number | null = null

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
  const randomTexture = texturePresetNames[Math.floor(Math.random() * texturePresetNames.length)]
  const randomCamera = cameraPresetNames[Math.floor(Math.random() * cameraPresetNames.length)]

  // テクスチャとカメラのプリセットを個別に適用
  applyPreset('texture', randomTexture)
  applyPreset('camera', randomCamera)

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

const { initTweakpane, dispose } = useTweakpane(
  backgroundAnimation,
  animationParams,
  showAxesHelper,
  applyPreset,
  autoChangeEnabled, // 自動変更の状態を渡す
  presetChangeInterval, // インターバル設定を渡す
)

// オブジェクトの初期化
objects.value = generateObjects()

// アニメーションループ
function animate(time: number) {
  requestAnimationFrame(animate)
  updateBackgroundAnimation()
  animateCamera()
  animateObjects(objects.value, time)
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

  // ウィンドウサイズが変更された時にキャンバスを更新
  window.addEventListener('resize', () => {
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
  })

  animate(performance.now())
  initTweakpane()
  updateFrequencyWave() // 周波数波形の更新を開始

  // マウス移動の監視
  watch([mouseX, mouseY], ([x, y]) => {
    lastMouseMoveTime.value = performance.now()

    // マウスの位置に波紋を追加
    const canvas = backgroundTexture.value?.image as HTMLCanvasElement
    if (canvas) {
      addWave(x, y)
    }
  })
})

onUnmounted(() => {
  dispose()
  stopPresetAutoChange()
})
</script>

<style scoped>
</style>
