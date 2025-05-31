export interface AnimationParams {
  camera: {
    initialPosition: [number, number, number]
    targetPosition: [number, number, number]
    wave: {
      frequency: { value: number }
      phase: { value: number }
      amplitude: { value: number }
      radius: { value: number }
      transitionSpeed: { value: number }
      zoom: { value: number }
      zoomFrequency: { value: number }
      zoomAmplitude: { value: number }
      frequencyThreshold: { value: number }
      isActive: { value: boolean }
    }
    monitor: {
      frequencyWave: number
      zoomWave: number
      threshold: number
    }
  }
  objects: {
    scaleRange: { value: [number, number] }
    position: {
      radius: { value: number }
      exclusionRadius: { value: number }
    }
  }
}
