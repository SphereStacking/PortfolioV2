<script setup lang="ts">
import { useDeviceOrientation } from '@vueuse/core'

type TiltMode = 'follow' | 'reverse' | 'mirror' | 'opposite' | 'normal'

interface Props {
  sensitivity?: number
  hoverSensitivity?: number
  gyroSensitivity?: number
  transitionDuration?: number
  perspective?: number
  mode?: TiltMode
  enableGyro?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  sensitivity: 100,
  hoverSensitivity: 30,
  gyroSensitivity: 2,
  transitionDuration: 600,
  perspective: 1000,
  mode: 'follow',
  enableGyro: true,
})

const TiltCardRef = ref<HTMLDivElement | null>(null)
const rotate = ref({ x: 0, y: 0 })
const mousePosition = ref({ x: 50, y: 50 })
const isHovered = ref(false)

// ジャイロセンサー
const { alpha: _alpha, beta, gamma, isSupported: isGyroSupported } = useDeviceOrientation()

// タッチデバイス判定
const isTouchDevice = ref(false)

onMounted(() => {
  isTouchDevice.value = 'ontouchstart' in window || navigator.maxTouchPoints > 0
})

// ジャイロによる傾き（スマホ用）
watch([beta, gamma], ([newBeta, newGamma]) => {
  if (!props.enableGyro || !isTouchDevice.value || !isGyroSupported.value) return
  if (newBeta === null || newGamma === null) return

  // beta: 前後の傾き (-180 to 180)
  // gamma: 左右の傾き (-90 to 90)
  const clampedBeta = Math.max(-30, Math.min(30, newBeta - 45)) // 45度を基準に
  const clampedGamma = Math.max(-30, Math.min(30, newGamma))

  const angleX = clampedBeta / props.gyroSensitivity
  const angleY = clampedGamma / props.gyroSensitivity

  switch (props.mode) {
    case 'follow':
      rotate.value = { x: -angleX, y: angleY }
      break
    case 'reverse':
      rotate.value = { x: angleX, y: -angleY }
      break
    case 'mirror':
      rotate.value = { x: angleX, y: angleY }
      break
    case 'opposite':
      rotate.value = { x: -angleX, y: -angleY }
      break
    case 'normal':
      rotate.value = { x: angleX, y: angleY }
      break
  }

  // マウス位置も更新（グラデーション用）
  mousePosition.value = {
    x: 50 + clampedGamma,
    y: 50 + clampedBeta,
  }
})

const handleMouseMove = (e: MouseEvent) => {
  if (!TiltCardRef.value || isTouchDevice.value) return

  const rect = TiltCardRef.value.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2

  const sensitivity = isHovered.value ? props.hoverSensitivity : props.sensitivity

  const angleX = (e.clientY - centerY) / sensitivity
  const angleY = (e.clientX - centerX) / sensitivity

  switch (props.mode) {
    case 'follow':
      rotate.value = { x: -angleX, y: angleY }
      break
    case 'reverse':
      rotate.value = { x: angleX, y: -angleY }
      break
    case 'mirror':
      rotate.value = { x: angleX, y: angleY }
      break
    case 'opposite':
      rotate.value = { x: -angleX, y: -angleY }
      break
    case 'normal':
      rotate.value = { x: angleX, y: angleY }
      break
  }

  mousePosition.value = {
    x: (e.clientX - rect.left) / rect.width * 100,
    y: (e.clientY - rect.top) / rect.height * 100,
  }
}

const handleMouseEnter = () => {
  isHovered.value = true
}

const handleMouseLeave = () => {
  if (!isTouchDevice.value) {
    rotate.value = { x: 0, y: 0 }
    mousePosition.value = { x: 50, y: 50 }
  }
  isHovered.value = false
}

onMounted(() => {
  if (TiltCardRef.value) {
    window.addEventListener('mousemove', handleMouseMove)
    TiltCardRef.value.addEventListener('mouseenter', handleMouseEnter)
    TiltCardRef.value.addEventListener('mouseleave', handleMouseLeave)
  }
})

onUnmounted(() => {
  if (TiltCardRef.value) {
    window.removeEventListener('mousemove', handleMouseMove)
    TiltCardRef.value.removeEventListener('mouseenter', handleMouseEnter)
    TiltCardRef.value.removeEventListener('mouseleave', handleMouseLeave)
  }
})

defineExpose({
  rotate,
  mousePosition,
  isHovered,
})
</script>

<template>
  <div
    ref="TiltCardRef"
    :style="{
      transform: `perspective(${perspective}px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
      transformStyle: 'preserve-3d',
      backfaceVisibility: 'hidden',
      transition: isTouchDevice ? 'all 150ms ease-out' : `all ${transitionDuration}ms cubic-bezier(0.16, 1, 0.3, 1)`,
      willChange: 'transform',
    }">
    <slot></slot>
  </div>
</template>
