import { ref } from 'vue'
import * as THREE from 'three'

export const useCameraAnimation = () => {
  const cameraRef = ref()
  const controlsRef = ref()
  const orbitControlsEnabled = ref(false)
  const cameraPosition = ref<[number, number, number]>([-10, -10, 5])
  const originalTarget = [0, 0, 0] as [number, number, number]
  let lastUpdateTime = 0
  let animationFrameId: number | null = null

  const animationParams = {
    camera: {
      initialPosition: [-10, -10, 5] as [number, number, number],
      targetPosition: [0, 0, 0] as [number, number, number],
      wave: {
        frequency: ref(0.005),
        phase: ref(0),
        amplitude: ref(1),
        radius: ref(10),
        transitionSpeed: ref(0.1),
        zoom: ref(1),
        zoomFrequency: ref(0.2),
        zoomAmplitude: ref(0.2),
        frequencyThreshold: ref(0.3),
        isActive: ref(false),
      },
      monitor: {
        frequencyWave: 0,
        zoomWave: 0,
        threshold: 0,
      },
    },
  }

  function animateCamera() {
    const updateInterval = 16 // 約60fps

    function updateCamera() {
      const now = performance.now()
      const camera = cameraRef.value

      if (!camera) {
        console.warn('Camera reference is not set')
        animationFrameId = requestAnimationFrame(updateCamera)
        return
      }

      if (now - lastUpdateTime >= updateInterval) {
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

        camera.position.lerp(targetPosition, transitionSpeed.value)
        camera.lookAt(...animationParams.camera.targetPosition)

        if (now % 100 < updateInterval) {
          animationParams.camera.monitor.frequencyWave = waveValue
          animationParams.camera.monitor.zoomWave = zoomWave
          animationParams.camera.monitor.threshold = frequencyThreshold.value
        }

        lastUpdateTime = now
      }

      animationFrameId = requestAnimationFrame(updateCamera)
    }

    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
    }

    updateCamera()
  }

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

  return {
    cameraRef,
    controlsRef,
    orbitControlsEnabled,
    cameraPosition,
    originalTarget,
    animationParams,
    animateCamera,
    updateFrequencyWave,
  }
}
