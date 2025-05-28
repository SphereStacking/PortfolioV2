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
  // {
  //   title: 'Art',
  //   href: '/art',
  //   description: '3Dモデリングやデジタルアート作品の展示',
  // },
  {
    title: 'My Projects',
    href: '/project',
    description: '個人開発や趣味で作成したプロジェクトの紹介',
  },
]
</script>

<template>
  <NavigationMenu>
    <NavigationMenuList>
      <NavigationMenuItem>
        <NavigationMenuTrigger>Me</NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul class="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[minmax(0,.75fr)_minmax(0,1fr)]">
            <li class="row-span-4">
              <NavigationMenuLink as-child>
                <a
                  class="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                  href="/">
                  <img src="/images/me.png" class="objtect-contain">
                </a>
              </NavigationMenuLink>
            </li>
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
          <ul class="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
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
    </NavigationMenuList>
  </NavigationMenu>
</template>

<style scoped>
</style>
