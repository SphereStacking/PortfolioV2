<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

type TiltMode = 'follow' | 'reverse' | 'mirror' | 'opposite' | 'normal'

interface Props {
  sensitivity?: number
  hoverSensitivity?: number
  transitionDuration?: number
  perspective?: number
  mode?: TiltMode
}

const props = withDefaults(defineProps<Props>(), {
  sensitivity: 100,
  hoverSensitivity: 30,
  transitionDuration: 600,
  perspective: 1000,
  mode: 'follow',
})

const TiltCardRef = ref<HTMLDivElement | null>(null)
const rotate = ref({ x: 0, y: 0 })
const mousePosition = ref({ x: 0, y: 0 })
const isHovered = ref(false)

const handleMouseMove = (e: MouseEvent) => {
  if (!TiltCardRef.value) return

  const rect = TiltCardRef.value.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2

  const sensitivity = isHovered.value ? props.hoverSensitivity : props.sensitivity

  const angleX = (e.clientY - centerY) / sensitivity
  const angleY = (e.clientX - centerX) / sensitivity

  // モードに応じて回転を調整
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
  rotate.value = { x: 0, y: 0 }
  mousePosition.value = { x: 50, y: 50 }
  isHovered.value = false
}

onMounted(() => {
  if (TiltCardRef.value) {
    // ウィンドウ全体でマウスの動きを監視
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
      transition: `all ${transitionDuration}ms cubic-bezier(0.16, 1, 0.3, 1)`,
      willChange: 'transform',
    }">
    <slot></slot>
  </div>
</template>

<style scoped>
</style>
