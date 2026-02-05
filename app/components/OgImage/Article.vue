<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  tags?: { icon_name: string, label: string }[]
}>(), {
  title: 'title',
  tags: () => [],
})

const { name } = useMyProfile()
</script>

<template>
  <div
    class="size-full bg-black flex flex-col gap-2 grow justify-between py-10 px-20"
    :style="{
      backgroundImage: `
        linear-gradient(-30deg, rgba(16,152,173,0.1) 10%, rgb(16,152,173,0.4) 30%, rgb(64,169,152,0.5) 40%, rgb(111,186,130,0.4) 50%, rgba(16,152,173,0.1) 70%)
      `,
    }">
    <p class="text-4xl text-white/50 mx-auto text-center">
      {{ name }}
    </p>
    <div class="w-full h-auto">
      <h1 class="text-white w-full text-8xl">
        {{ title }}
      </h1>
      <ul class="text-white/50 text-xl flex items-center gap-2 mx-auto w-full">
        <li v-for="tag in tags" :key="tag">
          <div class="text-gray-300/80 text-3xl bg-white/10 px-4 pb-2 rounded-full font-bold">
            #{{ tag }}
          </div>
        </li>
      </ul>
    </div>
    <p class="text-white/50 text-4xl mx-auto text-center">
      READ MORE >>
    </p>
  </div>
</template>

<style scoped>
</style>
