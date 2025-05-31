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

export type TexturePresetName = 'default' | 'dense' | 'sparse' | 'frenzy'
export type CameraPresetName = 'default' | 'smooth' | 'energetic' | 'pulse' | 'panorama' | 'intense' | 'circular' | 'vortex'

export type Presets = {
  texture: Record<TexturePresetName, TexturePreset>
  camera: Record<CameraPresetName, CameraPreset>
}

export const presets: Presets = {
  texture: {
    default: {
      repeat: 3,
      gridSize: 28,
      gridDensity: 1,
      defaultCrossSize: 14,
      defaultCrossOpacity: 0.025,
      waveSpeed: 1.8,
      waveDuration: 2000,
      waveInterval: 40,
      waveColor: '#bbffcc',
      defaultCrossColor: 'rgba(255, 255, 255, 0.02)',
    },
    dense: {
      repeat: 4,
      gridSize: 32,
      gridDensity: 1.5,
      defaultCrossSize: 12,
      defaultCrossOpacity: 0.03,
      waveSpeed: 2,
      waveDuration: 1500,
      waveInterval: 30,
      waveColor: '#bbffcc',
      defaultCrossColor: 'rgba(255, 255, 255, 0.02)',
    },
    sparse: {
      repeat: 2,
      gridSize: 16,
      gridDensity: 0.8,
      defaultCrossSize: 20,
      defaultCrossOpacity: 0.015,
      waveSpeed: 1,
      waveDuration: 3000,
      waveInterval: 100,
      waveColor: '#bbffcc',
      defaultCrossColor: 'rgba(255, 255, 255, 0.02)',
    },
    frenzy: {
      repeat: 5,
      gridSize: 40,
      gridDensity: 2,
      defaultCrossSize: 10,
      defaultCrossOpacity: 0.04,
      waveSpeed: 4,
      waveDuration: 800,
      waveInterval: 10,
      waveColor: '#ff3366',
      defaultCrossColor: 'rgba(255, 255, 255, 0.03)',
    },
  },
  camera: {
    default: {
      frequency: 0.005,
      phase: 0,
      amplitude: 0.5,
      radius: 8,
      transitionSpeed: 0.05,
      zoom: 1,
      zoomFrequency: 0.2,
      zoomAmplitude: 0.1,
      frequencyThreshold: 0.3,
    },
    smooth: {
      frequency: 0.003,
      phase: 0,
      amplitude: 0.4,
      radius: 12,
      transitionSpeed: 0.04,
      zoom: 1.1,
      zoomFrequency: 0.15,
      zoomAmplitude: 0.08,
      frequencyThreshold: 0.25,
    },
    energetic: {
      frequency: 0.008,
      phase: 0,
      amplitude: 1.0,
      radius: 15,
      transitionSpeed: 0.07,
      zoom: 1.3,
      zoomFrequency: 0.25,
      zoomAmplitude: 0.15,
      frequencyThreshold: 0.35,
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
    panorama: {
      frequency: 0.004,
      phase: 0,
      amplitude: 0.7,
      radius: 18,
      transitionSpeed: 0.05,
      zoom: 1.6,
      zoomFrequency: 0.2,
      zoomAmplitude: 0.12,
      frequencyThreshold: 0.28,
    },
    intense: {
      frequency: 0.012,
      phase: 0,
      amplitude: 1.4,
      radius: 20,
      transitionSpeed: 0.09,
      zoom: 1.8,
      zoomFrequency: 0.4,
      zoomAmplitude: 0.25,
      frequencyThreshold: 0.4,
    },
    circular: {
      frequency: 0.015,
      phase: 0,
      amplitude: 1.2,
      radius: 25,
      transitionSpeed: 0.1,
      zoom: 0.8,
      zoomFrequency: 0.5,
      zoomAmplitude: 0.3,
      frequencyThreshold: 0.45,
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
  },
}
