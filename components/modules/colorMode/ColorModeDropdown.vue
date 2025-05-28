<script setup lang="ts">
import { useColorMode } from '@vueuse/core'

type ColorMode = 'light' | 'dark'

const colorMode = useColorMode({
  initialValue: 'dark',
  modes: {
    light: 'light',
    dark: 'dark',
  },
})

const setColorMode = (newMode: ColorMode) => {
  colorMode.value = newMode
}

const colorModes = {
  light: {
    icon: 'line-md:sunny-filled-loop-to-moon-filled-loop-transition',
  },
  dark: {
    icon: 'line-md:moon-filled-alt-to-sunny-filled-loop-transition',
  },
} as const
const currentColorMode = computed(() => colorModes[colorMode.value as keyof typeof colorModes])
const changeColorMode = () => {
  setColorMode(colorMode.value === 'light' ? 'dark' : 'light')
}
</script>

<template>
  <Button
    variant="ghost" size="icon" @click="changeColorMode">
    <Icon :name="currentColorMode.icon" class="transition-all duration-300" />
  </Button>
</template>
