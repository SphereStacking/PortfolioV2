<script setup lang="ts">
import { useNavigation } from '~/composables/useNavigation'

// コンポーザブルからナビゲーション設定を取得
const {
  aboutComponents,
  contentsComponents,
  worksComponents,
  creativeComponents,
} = useNavigation()
</script>

<template>
  <NavigationMenu>
    <NavigationMenuList>
      <!-- About -->
      <NavigationMenuItem>
        <NavigationMenuTrigger>
          <Icon name="heroicons:user" class="w-4 h-4 mr-1.5" />
          <span class="hidden lg:inline">About</span>
        </NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul class="grid gap-3 p-4 w-[350px]">
            <li v-for="component in aboutComponents" :key="component.title">
              <NavigationMenuLink as-child>
                <NuxtLink
                  :href="component.href"
                  class="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                  <div class="flex items-center gap-2">
                    <Icon v-if="component.icon" :name="component.icon" class="w-4 h-4 text-muted-foreground" />
                    <span class="text-sm font-medium leading-none">{{ component.title }}</span>
                  </div>
                  <p class="line-clamp-2 text-sm leading-snug text-muted-foreground">
                    {{ component.description }}
                  </p>
                </NuxtLink>
              </NavigationMenuLink>
            </li>
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>

      <!-- Contents -->
      <NavigationMenuItem>
        <NavigationMenuTrigger>
          <Icon name="heroicons:document-text" class="w-4 h-4 mr-1.5" />
          <span class="hidden lg:inline">Contents</span>
        </NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul class="grid w-[350px] gap-3 p-4">
            <li v-for="component in contentsComponents" :key="component.title">
              <NavigationMenuLink as-child>
                <NuxtLink
                  :href="component.href"
                  class="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                  <div class="flex items-center gap-2">
                    <Icon v-if="component.icon" :name="component.icon" class="w-4 h-4 text-muted-foreground" />
                    <span class="text-sm font-medium leading-none">{{ component.title }}</span>
                  </div>
                  <p class="line-clamp-2 text-sm leading-snug text-muted-foreground">
                    {{ component.description }}
                  </p>
                </NuxtLink>
              </NavigationMenuLink>
            </li>
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>

      <!-- Works -->
      <NavigationMenuItem>
        <NavigationMenuTrigger>
          <Icon name="heroicons:folder" class="w-4 h-4 mr-1.5" />
          <span class="hidden lg:inline">Works</span>
        </NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul class="grid w-[350px] gap-3 p-4">
            <li v-for="component in worksComponents" :key="component.title">
              <NavigationMenuLink as-child>
                <NuxtLink
                  :href="component.href"
                  class="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                  <div class="flex items-center gap-2">
                    <Icon v-if="component.icon" :name="component.icon" class="w-4 h-4 text-muted-foreground" />
                    <span class="text-sm font-medium leading-none">{{ component.title }}</span>
                  </div>
                  <p class="line-clamp-2 text-sm leading-snug text-muted-foreground">
                    {{ component.description }}
                  </p>
                </NuxtLink>
              </NavigationMenuLink>
            </li>
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>

      <!-- Creative -->
      <NavigationMenuItem>
        <NavigationMenuTrigger>
          <Icon name="heroicons:beaker" class="w-4 h-4 mr-1.5" />
          <span class="hidden lg:inline">Creative</span>
        </NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul class="grid w-[350px] gap-3 p-4">
            <li v-for="component in creativeComponents" :key="component.title">
              <NavigationMenuLink as-child>
                <NuxtLink
                  :href="component.href"
                  class="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                  <div class="flex items-center gap-2">
                    <Icon v-if="component.icon" :name="component.icon" class="w-4 h-4 text-muted-foreground" />
                    <span class="text-sm font-medium leading-none">{{ component.title }}</span>
                  </div>
                  <p class="line-clamp-2 text-sm leading-snug text-muted-foreground">
                    {{ component.description }}
                  </p>
                </NuxtLink>
              </NavigationMenuLink>
            </li>
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>
    </NavigationMenuList>
  </NavigationMenu>
</template>

<style scoped>
</style>
