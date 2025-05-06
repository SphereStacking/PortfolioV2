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

export const useObjectAnimation = () => {
  const animationParams = {
    objects: {
      rotationSpeed: ref(0.001),
      scaleSpeed: ref(0.0005),
      scaleRange: ref<[number, number]>([0.2, 1.5]),
      position: {
        radius: ref(10),
        exclusionRadius: ref(4),
      },
    },
  }

  function animateObjects(objects: Object3D[], time: number) {
    objects.forEach((obj) => {
      if (!obj.meshRef) return

      // 回転アニメーション
      obj.meshRef.rotation.x += animationParams.objects.rotationSpeed.value
      obj.meshRef.rotation.y += animationParams.objects.rotationSpeed.value * 0.5
      obj.meshRef.rotation.z += animationParams.objects.rotationSpeed.value * 0.3

      // スケールアニメーション
      const scale = Math.sin(time * animationParams.objects.scaleSpeed.value + obj.position[0]) * 0.1 + 1
      obj.meshRef.scale.set(scale, scale, scale)
    })
  }

  return {
    animationParams,
    animateObjects,
  }
}
