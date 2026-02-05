// プリセットの型定義を修正
export type TexturePreset = {
  repeat: number
  gridSize: number
  gridDensity: number
  defaultCrossSize: number
  defaultCrossOpacity: number
  waveSpeed: number
  waveDuration: number
  waveInterval: number
  waveColor: string
  defaultCrossColor: string
}

export type CameraPreset = {
  frequency: number
  phase: number
  amplitude: number
  radius: number
  transitionSpeed: number
  zoom: number
  zoomFrequency: number
  zoomAmplitude: number
  frequencyThreshold: number
}

export type TexturePresetName = 'matrix' | 'neon' | 'quantum' | 'glitch' | 'cyber' | 'void'
export type CameraPresetName = 'orbital' | 'pendulum' | 'helix' | 'chaos' | 'vortex' | 'pulse' | 'calm'

export type Presets = {
  texture: Record<TexturePresetName, TexturePreset>
  camera: Record<CameraPresetName, CameraPreset>
}

// デフォルトプリセットの設定
export const DEFAULT_PRESETS = {
  texture: 'void' as TexturePresetName,
  camera: 'calm' as CameraPresetName,
}

export const presets: Presets = {
  texture: {
    matrix: {
      repeat: 6,
      gridSize: 48,
      gridDensity: 1.2,
      defaultCrossSize: 8,
      defaultCrossOpacity: 0.01,
      waveSpeed: 2.5,
      waveDuration: 4000,
      waveInterval: 50,
      waveColor: '#00ff41',
      defaultCrossColor: 'rgba(0, 255, 65, 0.01)',
    },
    neon: {
      repeat: 3,
      gridSize: 24,
      gridDensity: 1.5,
      defaultCrossSize: 16,
      defaultCrossOpacity: 0.005,
      waveSpeed: 3,
      waveDuration: 2500,
      waveInterval: 20,
      waveColor: '#ff00ff',
      defaultCrossColor: 'rgba(255, 0, 255, 0.005)',
    },
    quantum: {
      repeat: 7,
      gridSize: 36,
      gridDensity: 1.8,
      defaultCrossSize: 12,
      defaultCrossOpacity: 0.02,
      waveSpeed: 1.5,
      waveDuration: 3500,
      waveInterval: 60,
      waveColor: '#00ffff',
      defaultCrossColor: 'rgba(0, 255, 255, 0.01)',
    },
    glitch: {
      repeat: 4,
      gridSize: 30,
      gridDensity: 1.3,
      defaultCrossSize: 14,
      defaultCrossOpacity: 0.035,
      waveSpeed: 5,
      waveDuration: 600,
      waveInterval: 15,
      waveColor: '#ff0080',
      defaultCrossColor: 'rgba(255, 255, 255, 0.02)',
    },
    cyber: {
      repeat: 5,
      gridSize: 42,
      gridDensity: 1.6,
      defaultCrossSize: 11,
      defaultCrossOpacity: 0.008,
      waveSpeed: 3.5,
      waveDuration: 1200,
      waveInterval: 25,
      waveColor: '#00ff88',
      defaultCrossColor: 'rgba(0, 255, 136, 0.008)',
    },
    void: {
      repeat: 2,
      gridSize: 20,
      gridDensity: 0.7,
      defaultCrossSize: 18,
      defaultCrossOpacity: 0.003,
      waveSpeed: 0.8,
      waveDuration: 5000,
      waveInterval: 80,
      waveColor: '#9945ff',
      defaultCrossColor: 'rgba(153, 69, 255, 0.003)',
    },
  },
  camera: {
    orbital: {
      frequency: 0.007,
      phase: Math.PI / 4,
      amplitude: 0.8,
      radius: 14,
      transitionSpeed: 0.08,
      zoom: 1.2,
      zoomFrequency: 0.1,
      zoomAmplitude: 0.05,
      frequencyThreshold: 0.2,
    },
    pendulum: {
      frequency: 0.009,
      phase: Math.PI / 2,
      amplitude: 1.5,
      radius: 16,
      transitionSpeed: 0.06,
      zoom: 1.0,
      zoomFrequency: 0.18,
      zoomAmplitude: 0.3,
      frequencyThreshold: 0.4,
    },
    helix: {
      frequency: 0.011,
      phase: 0,
      amplitude: 1.3,
      radius: 20,
      transitionSpeed: 0.1,
      zoom: 1.5,
      zoomFrequency: 0.35,
      zoomAmplitude: 0.15,
      frequencyThreshold: 0.35,
    },
    chaos: {
      frequency: 0.015,
      phase: Math.PI / 3,
      amplitude: 1.2,
      radius: 18,
      transitionSpeed: 0.08,
      zoom: 1.1,
      zoomFrequency: 0.4,
      zoomAmplitude: 0.25,
      frequencyThreshold: 0.3,
    },
    vortex: {
      frequency: 0.01,
      phase: 0,
      amplitude: 1.8,
      radius: 22,
      transitionSpeed: 0.12,
      zoom: 0.6,
      zoomFrequency: 0.6,
      zoomAmplitude: 0.4,
      frequencyThreshold: 0.5,
    },
    pulse: {
      frequency: 0.006,
      phase: 0,
      amplitude: 0.6,
      radius: 10,
      transitionSpeed: 0.06,
      zoom: 1.4,
      zoomFrequency: 0.3,
      zoomAmplitude: 0.2,
      frequencyThreshold: 0.3,
    },
    calm: {
      frequency: 0.004, // ゆっくりした回転
      phase: 0,
      amplitude: 0.5, // 適度な振幅
      radius: 14, // 適度な距離
      transitionSpeed: 0.03, // 滑らかな遷移
      zoom: 1.0,
      zoomFrequency: 0.02, // ゆっくりしたズーム
      zoomAmplitude: 0.06, // 控えめなズーム変化
      frequencyThreshold: 0.15,
    },
  },
}
