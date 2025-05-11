<script setup lang="ts">
const myProfile = useMyProfile()
</script>

<template>
  <div
    class="size-full pt-10 pb-1 px-2 bg-black relative top-0 left-0"
    :style="{
      backgroundImage: `
        linear-gradient(-30deg, rgba(16,152,173,0.1) 10%, rgb(16,152,173,0.4) 30%, rgb(64,169,152,0.5) 40%, rgb(111,186,130,0.4) 50%, rgba(16,152,173,0.1) 70%)
      `,
    }">
    <div class="flex flex-row gap-2 grow">
      <div class="flex justify-center items-center overflow-hidden w-2/5">
        <img :src="myProfile.profileImagePath" alt="logo" class="object-contain w-full h-full">
      </div>
      <div class="flex flex-col gap-2 w-3/5 my-auto">
        <h1 class="text-8xl font-black text-white mx-auto font-monomaniac-one">
          {{ myProfile.name }}
        </h1>
        <p class="h-10 text-white text-4xl mx-auto">
          <template v-for="(part, index) in myProfile.description" :key="index">
            <span :class="part.class">{{ part.text }}</span>
          </template>
        </p>
        <div class="flex flex-col gap-2 items-left mx-auto mt-7">
          <div v-for="link in Object.values(myProfile.links)" :key="link.name" class="flex flex-row items-center gap-2">
            <div class="flex items-center justify-center rounded-full bg-teal-700/50 size-15">
              <img :src="link.ogImage" class="size-full p-3" alt="logo">
            </div>
            <span class="text-2xl text-gray-400/80">{{ link.url }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="flex flex-row h-10 ml-16 mr-22 absolute bottom-0 left-0">
      <p class="text-white/50 text-xl w-2/5 flex justify-center items-center">
        It's a pleasure to meet you.
      </p>
      <p class="text-white/50 text-xl transition-transform w-3/5 flex justify-end items-center">
        READ MORE >>
      </p>
    </div>
  </div>
</template>

<style scoped></style>
