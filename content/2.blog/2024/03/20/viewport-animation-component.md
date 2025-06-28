---
title: "viewportに入った時にイケてる演出できるコンポーネント"
description: "viewportに入った時だけアニメーションを適用してほしくてvueのtransitionのwrapperコンポーネントを作成した"
navigation: true
draft: false
created: 2024-03-20
updated:
image: 
tags:
  - "Vue.js"
  - "Animation"
  - "Component"
  - "TailwindCSS"
icons:
  - "devicon:vuejs"
  - "devicon:tailwindcss"
---

## 概要

viewportに入った時だけアニメーションを適用してほしくて
vueの[transition](https://ja.vuejs.org/guide/built-ins/transition)のwrapperコンポーネントを作成した。

viewportに入った時とでた時に演出を持たせられるコンポーネント

## 出来上がったもの

<XPost x-post-id="1770356585497591891" />

## ちょっとつまったところ

slotで受けとったものがisVisibleの値を参照しfalseのときは`v-if`によってdomからいなくなるため高さが亡くなってしまうので
isVisibleを監視してtrueになった時だけ親要素の高さをへんこうするようにした。

<XPost x-post-id="1770361367842959804" />

## 改善点

- IntersectionObserverのoptionは親からpropsで受け取るようにするともっといろんなパターンで使えるかも

## コンポーネントソース

``` vue
<script setup>
import { ref, onMounted, watch } from 'vue'

const isVisible = ref(false)
const containerRef = ref(null)

onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      isVisible.value = entry.isIntersecting
    })
  }, {
    threshold: 0.5
  })

  watch([containerRef], ([newContainerRef]) => {
    if (newContainerRef) observer.observe(newContainerRef)
  }, { immediate: true })
})
watch(isVisible, async (newVal) => {
  if (newVal) {
    await nextTick()
    let contentHeight = 0
    for (const child of containerRef.value.children) {
      contentHeight += child.offsetHeight
    }
    containerRef.value.style.height = `${contentHeight}px`
  }
})
</script>

<template>
  <div ref="containerRef">
    <span></span>
    <transition v-bind="$attrs">
      <slot v-if="isVisible"></slot>
    </transition>
  </div>
</template>

```

### 使い方

例1 四角のが横から回りながら出現

```vue
<TransitionInViewportObserver
class="absolute bottom-2 right-5 h-32 w-32"
enter-active-class="transition-all duration-1000 rotate-90"
leave-active-class="transition-all duration-1000"
enter-from-class="-translate-x-20 opacity-0 rotate-90"
leave-to-class="opacity-0">
<div class=" rotate-12 bg-sky-200/10"></div>
</TransitionInViewportObserver>
```

例2 左右からslideしながら出現

```vue
<TransitionInViewportObserver
  v-for="(feature, index) in featureBanners"
  :key="feature.title"
  class="h-52"
  enter-active-class="transition-all duration-1000"
  leave-active-class="transition-all duration-1000"
  :enter-from-class="index % 2 === 0 ? 'translate-x-20 opacity-0' : '-translate-x-20 opacity-0'"
  leave-to-class="opacity-0">
  <div class="bg-base-300 p-4 ">
    {{ feature.title }}
    {{ feature.description }}
  </div>
</TransitionInViewportObserver>
```

例3 下からslideしながら出現

```vue
<TransitionInViewportObserver
  enter-active-class="transition-all duration-1000"
  leave-active-class="transition-all duration-1000"
  enter-from-class="translate-y-20 opacity-0"
  leave-to-class="opacity-0">
  <div class="chat chat-start">
    <div class="avatar chat-image">
      <div class="w-10 rounded-full">
        <img alt="profile" :src="feedback.profile_photo">
      </div>
    </div>
    <div class="chat-bubble">
      {{ feedback.description }}
    </div>
  </div>
</TransitionInViewportObserver>
```
