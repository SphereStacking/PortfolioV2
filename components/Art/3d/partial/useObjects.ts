import { ref } from 'vue'
import type * as THREE from 'three'

interface Object3D {
  geometry: string
  geometryArgs: { args: number[] }
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number
  meshRef?: THREE.Mesh | null
}

export const useObjects = () => {
  const objects = ref<Object3D[]>([])

  const animationParams = {
    objects: {
      scaleRange: ref<[number, number]>([0.2, 1.5]),
      position: {
        radius: ref(10),
        exclusionRadius: ref(4),
      },
    },
  }

  function createObjects(): Object3D[] {
    const objectArray: Object3D[] = []
    const objectCount = 50

    const geometryTypes = [
      { geometry: 'TresBoxGeometry', args: [0.8, 0.8, 0.8], weight: 2 },
      { geometry: 'TresSphereGeometry', args: [0.4, 32, 32], weight: 3 },
      { geometry: 'TresTorusGeometry', args: [0.3, 0.15, 32, 64], weight: 2 },
      { geometry: 'TresDodecahedronGeometry', args: [0.35, 0], weight: 1 },
      { geometry: 'TresOctahedronGeometry', args: [0.35, 0], weight: 1 },
      { geometry: 'TresTetrahedronGeometry', args: [0.35, 0], weight: 1 },
      { geometry: 'TresIcosahedronGeometry', args: [0.35, 0], weight: 1 },
      { geometry: 'TresConeGeometry', args: [0.3, 0.6, 32], weight: 1 },
      { geometry: 'TresCylinderGeometry', args: [0.25, 0.25, 0.5, 32], weight: 1 },
    ]

    for (let i = 0; i < objectCount; i++) {
      const totalWeight = geometryTypes.reduce((sum, type) => sum + type.weight, 0)
      let random = Math.random() * totalWeight
      let selectedType = geometryTypes[0]

      for (const type of geometryTypes) {
        random -= type.weight
        if (random <= 0) {
          selectedType = type
          break
        }
      }

      const scale = Math.random() * (animationParams.objects.scaleRange.value[1] - animationParams.objects.scaleRange.value[0]) + animationParams.objects.scaleRange.value[0]

      const radius = animationParams.objects.position.radius.value
      const layer = Math.floor(Math.random() * 3)
      const layerRadius = radius * (0.5 + layer * 0.25)
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const x = layerRadius * Math.sin(phi) * Math.cos(theta)
      const y = layerRadius * Math.sin(phi) * Math.sin(theta)
      const z = layerRadius * Math.cos(phi)

      objectArray.push({
        geometry: selectedType.geometry,
        geometryArgs: { args: selectedType.args },
        position: [x, y, z] as [number, number, number],
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
        scale,
        meshRef: null,
      })
    }

    return objectArray
  }

  return {
    objects,
    animationParams,
    createObjects,
  }
}
