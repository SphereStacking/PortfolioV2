<script setup lang="ts">
const props = defineProps<{
  stack: string
}>()

const { getStack } = useMyProfile()

const stackData = getStack(props.stack)
</script>

<template>
  <UTooltip v-if="stackData?.logo" :text="stackData?.name">
    <NuxtLink :to="stackData?.link" target="_blank">
      <img
        v-bind="$attrs"
        :src="stackData?.logo"
        :class="stackData?.class"
        :style="stackData?.style"
        @click="openLink(stackData?.link)">
    </NuxtLink>
  </UTooltip>
</template>
