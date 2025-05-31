import { ref, watch } from 'vue'
import * as THREE from 'three'
import { useMouse } from '@vueuse/core'
import { Pane } from 'tweakpane'
import { presets, type TexturePresetName, type CameraPresetName } from './preset'
import type { AnimationParams } from './types'
import type { BackgroundAnimation } from './useBackgroundAnimation'
import { useBackgroundAnimation } from './useBackgroundAnimation'
import { useCameraAnimation } from './useCameraAnimation'
import { useObjects } from './useObjects'
import { useObjectAnimation } from './useObjectAnimation'

// Mouse tracking
const { x: mouseX, y: mouseY } = useMouse()
const lastMouseMoveTime = ref(0)

// Background pattern
const { backgroundTexture, createPatternCanvas, updateBackgroundAnimation, addWave, updateTextureRepeat } = useBackgroundAnimation()
const { animateCamera, updateFrequencyWave } = useCameraAnimation()
const { objects, createObjects: generateObjects } = useObjects()
const { animateObjects } = useObjectAnimation()

objects.value = generateObjects()

// アニメーションループ
function animate(time: number) {
  updateBackgroundAnimation()
  animateCamera()
  animateObjects(objects.value, time)
  requestAnimationFrame(animate)
}

export function initTweakpane() {
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
      backgroundTexture.value.image = canvas
      // テクスチャの設定を再適用
      backgroundTexture.value.magFilter = THREE.NearestFilter
      backgroundTexture.value.minFilter = THREE.NearestFilter
      backgroundTexture.value.center.set(0.5, 0.5)
      updateTextureRepeat()
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
}

export function useTweakpane(
  backgroundAnimation: BackgroundAnimation,
  animationParams: AnimationParams,
  showAxesHelper: { value: boolean },
  applyPreset: (category: 'texture' | 'camera', presetName: TexturePresetName | CameraPresetName) => void,
  autoChangeEnabled: { value: boolean },
  presetChangeInterval: { value: number },
) {
  let pane: Pane | null = null

  function initTweakpane() {
    pane = new Pane({
      title: 'Animation Parameters',
      expanded: false,
    })

    // パネルのスタイルを設定
    if (pane.element) {
      const style = pane.element.style
      style.position = 'fixed'
      style.top = '70px'
      style.right = '20px'
      style.maxHeight = '80vh'
      style.overflowY = 'auto'
      style.backgroundColor = 'rgba(0, 0, 0, 0.8)'
      style.color = '#fff'
    }

    // プリセット用のタブグループを追加
    const presetsTabs = pane.addTab({
      pages: [
        { title: 'Presets' },
      ],
    })
    // メインタブの作成
    const tabs = pane.addTab({
      pages: [
        { title: 'Texture' },
        { title: 'Camera' },
        { title: 'Debug' },
      ],
    })

    // 自動変更設定フォルダを追加
    const autoChangeFolder = presetsTabs.pages[0].addFolder({
      title: 'Auto Change',
      expanded: true,
    })

    autoChangeFolder.addBinding(autoChangeEnabled, 'value', {
      label: 'Enabled',
    })

    autoChangeFolder.addBinding(presetChangeInterval, 'value', {
      label: 'interval',
      min: 1000,
      max: 10000,
      step: 500,
    })

    const texturePresetsFolder = presetsTabs.pages[0].addFolder({
      title: 'Texture Presets',
      expanded: true,
    })

    // テクスチャプリセットボタンを動的に生成
    Object.entries(presets.texture).forEach(([key, _preset]) => {
      texturePresetsFolder.addButton({
        title: key.charAt(0).toUpperCase() + key.slice(1),
      }).on('click', () => applyPreset('texture', key as TexturePresetName))
    })

    const cameraPresetsFolder = presetsTabs.pages[0].addFolder({
      title: 'Camera Presets',
      expanded: true,
    })

    // カメラプリセットボタンを動的に生成
    Object.entries(presets.camera).forEach(([key, _preset]) => {
      cameraPresetsFolder.addButton({
        title: key.charAt(0).toUpperCase() + key.slice(1),
      }).on('click', () => applyPreset('camera', key as CameraPresetName))
    })

    // Textureタブ
    const texturePage = tabs.pages[0]
    // Grid Settingsフォルダ
    const gridFolder = texturePage.addFolder({
      title: 'Grid',
      expanded: true,
    })

    gridFolder.addBinding(backgroundAnimation.gridSize, 'value', {
      label: 'Size',
      min: 12,
      max: 48,
      step: 2,
    })

    gridFolder.addBinding(backgroundAnimation.gridDensity, 'value', {
      label: 'Density',
      min: 0.5,
      max: 3,
      step: 0.1,
    })

    gridFolder.addBinding(backgroundAnimation.repeat, 'value', {
      label: 'Repeat',
      min: 1,
      max: 20,
      step: 1,
    })

    // Wave Animationフォルダ
    const waveAnimationFolder = texturePage.addFolder({
      title: 'Wave',
      expanded: true,
    })

    waveAnimationFolder.addBinding(backgroundAnimation.waveColor, 'value', {
      label: 'Color',
    })

    waveAnimationFolder.addBinding(backgroundAnimation.waveSpeed, 'value', {
      label: 'Speed',
      min: 0.5,
      max: 3,
      step: 0.1,
    })

    waveAnimationFolder.addBinding(backgroundAnimation.waveDuration, 'value', {
      label: 'Duration',
      min: 500,
      max: 5000,
      step: 100,
    })

    waveAnimationFolder.addBinding(backgroundAnimation.waveInterval, 'value', {
      label: 'Interval',
      min: 10,
      max: 200,
      step: 10,
    })

    // Default Crossフォルダ
    const defaultCrossFolder = texturePage.addFolder({
      title: 'Default Cross',
      expanded: true,
    })

    defaultCrossFolder.addBinding(backgroundAnimation.defaultCrossSize, 'value', {
      label: 'Size',
      min: 8,
      max: 24,
      step: 1,
    })

    defaultCrossFolder.addBinding(backgroundAnimation.defaultCrossOpacity, 'value', {
      label: 'Opacity',
      min: 0.01,
      max: 0.1,
      step: 0.005,
    })

    // Cameraタブ
    const cameraPage = tabs.pages[1]

    // 波形パラメータのフォルダを追加
    const waveParamsFolder = cameraPage.addFolder({
      title: 'Position',
      expanded: true,
    })

    waveParamsFolder.addBinding(animationParams.camera.wave.frequency, 'value', {
      label: 'Frequency',
      min: 0,
      max: 0.5,
      step: 0.01,
    })

    waveParamsFolder.addBinding(animationParams.camera.monitor, 'frequencyWave', {
      label: 'Wave Monitor',
      readonly: true,
      view: 'graph',
      min: -1,
      max: 1,
    })

    waveParamsFolder.addBinding(animationParams.camera.wave.phase, 'value', {
      label: 'Phase',
      min: 0,
      max: Math.PI * 2,
      step: 0.1,
    })

    waveParamsFolder.addBinding(animationParams.camera.wave.amplitude, 'value', {
      label: 'Amplitude',
      min: 0.1,
      max: 2,
      step: 0.1,
    })

    waveParamsFolder.addBinding(animationParams.camera.wave.radius, 'value', {
      label: 'Radius',
      min: 5,
      max: 30,
      step: 1,
    })

    waveParamsFolder.addBinding(animationParams.camera.wave.transitionSpeed, 'value', {
      label: 'Transition Speed',
      min: 0.01,
      max: 0.5,
      step: 0.01,
    })

    // ズーム制御用のフォルダを追加
    const zoomFolder = cameraPage.addFolder({
      title: 'Zoom Control',
      expanded: true,
    })

    zoomFolder.addBinding(animationParams.camera.wave.zoom, 'value', {
      label: 'Base Zoom',
      min: 0.5,
      max: 2,
      step: 0.1,
    })

    zoomFolder.addBinding(animationParams.camera.wave.zoomFrequency, 'value', {
      label: 'Zoom Frequency',
      min: 0.05,
      max: 1,
      step: 0.05,
    })

    zoomFolder.addBinding(animationParams.camera.wave.zoomAmplitude, 'value', {
      label: 'Zoom Amplitude',
      min: 0,
      max: 0.5,
      step: 0.05,
    })

    zoomFolder.addBinding(animationParams.camera.monitor, 'zoomWave', {
      label: 'Zoom Monitor',
      readonly: true,
      view: 'graph',
      min: -0.5,
      max: 0.5,
    })

    zoomFolder.addBinding(animationParams.camera.monitor, 'threshold', {
      label: 'Zoom Threshold Line',
      readonly: true,
      view: 'graph',
      min: 0,
      max: 1,
    })

    zoomFolder.addBinding(animationParams.camera.wave.frequencyThreshold, 'value', {
      label: 'Zoom Threshold',
      min: 0,
      max: 1,
      step: 0.05,
    })

    zoomFolder.addBinding(animationParams.camera.wave.isActive, 'value', {
      label: 'Zoom Active',
      readonly: true,
    })

    // Debugタブ
    const debugPage = tabs.pages[2]
    debugPage.addBinding(showAxesHelper, 'value', {
      label: 'Axes Helper',
    })
  }

  function dispose() {
    if (pane) {
      pane.dispose()
    }
  }

  return {
    initTweakpane,
    dispose,
  }
}
