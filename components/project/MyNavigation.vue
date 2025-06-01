<script setup lang="ts">
const meComponents: { title: string, href: string, description: string }[] = [
  {
    title: 'Stack',
    href: '/stack',
    description: '使用している技術スタックやツールの一覧',
  },
  {
    title: 'Career',
    href: '/career',
    description: 'これまでの職歴や経験したプロジェクト',
  },
]

const components: { title: string, href: string, description: string }[] = [
  {
    title: 'Blog',
    href: '/blog',
    description: '技術的な知見や学びを共有する場',
  },
  {
    title: 'My Projects',
    href: '/project',
    description: '個人開発や趣味で作成したプロジェクトの紹介',
  },
]

const artComponents: { title: string, href: string, description: string }[] = [
  {
    title: 'CSS Art',
    href: '/art/css',
    description: 'CSSで作成したアート作品の展示',
  },
  {
    title: '3D Art',
    href: '/art/3d',
    description: '3Dモデリングやデジタルアート作品の展示',
  },
]
</script>

<template>
  <NavigationMenu>
    <NavigationMenuList>
      <NavigationMenuItem>
        <NavigationMenuTrigger>Me</NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul class="grid gap-3 p-4 w-[300px]">
            <li v-for="component in meComponents" :key="component.title">
              <NavigationMenuLink as-child>
                <NuxtLink
                  :href="component.href"
                  class="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                  <div class="text-sm font-medium leading-none">{{ component.title }}</div>
                  <p class="line-clamp-2 text-sm leading-snug text-muted-foreground">
                    {{ component.description }}
                  </p>
                </NuxtLink>
              </NavigationMenuLink>
            </li>
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <NavigationMenuTrigger>Projects</NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul class="grid w-[300px] gap-3 p-4">
            <li v-for="component in components" :key="component.title">
              <NavigationMenuLink as-child>
                <NuxtLink
                  :href="component.href"
                  class="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                  <div class="text-sm font-medium leading-none">{{ component.title }}</div>
                  <p class="line-clamp-2 text-sm leading-snug text-muted-foreground">
                    {{ component.description }}
                  </p>
                </NuxtLink>
              </NavigationMenuLink>
            </li>
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <NavigationMenuTrigger>Art</NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul class="grid w-[300px] gap-3 p-4">
            <li v-for="component in artComponents" :key="component.title">
              <NavigationMenuLink as-child>
                <NuxtLink
                  :href="component.href"
                  class="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                  <div class="text-sm font-medium leading-none">{{ component.title }}</div>
                  <p class="line-clamp-2 text-sm leading-snug text-muted-foreground">
                    {{ component.description }}
                  </p>
                </NuxtLink>
              </NavigationMenuLink>
            </li>
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <NavigationMenuLink as-child>
          <NuxtLink
            href="/tools"
            class="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
            Tools
          </NuxtLink>
        </NavigationMenuLink>
      </NavigationMenuItem>
    </NavigationMenuList>
  </NavigationMenu>
</template>

<style scoped>
</style>
