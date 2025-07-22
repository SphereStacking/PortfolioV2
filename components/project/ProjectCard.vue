<script setup lang="ts">
const { $dayjs } = useNuxtApp()

const props = defineProps<{
  data: {
    id: string
    title: string
    description: string
    status: string
    tags: string[]
    icon: string
    period_start: string
    period_end?: string
    pinned: boolean
    stacks: string[]
    overview: string[]
    tasks: string[]
    team: string
    role: string
    career?: {
      title: string
      description: string
      tags: string[]
    }
    links?: {
      label: string
      url: string
    }[]
  }
}>()

const date_span = computed(() => {
  if (props.data.status === 'in_progress') {
    return `${props.data.period_start} ~ ${$dayjs().format('YYYY-MM')}`
  }
  return props.data.period_start + ' ~ ' + props.data.period_end
})

const isImageUrl = computed(() => {
  const icon = props.data.icon
  return icon.startsWith('http://')
    || icon.startsWith('https://')
    || icon.startsWith('/')
    || /\.(png|jpg|jpeg|svg|webp)$/i.test(icon)
})
</script>

<template>
  <Card
    :id="data.title"
    size="sm"
    :class="[
      'group relative flex flex-col gap-1 backdrop-blur-sm',
    ]">
    <CardHeader>
      <div class="flex items-center justify-between gap-2 flex-col md:flex-row">
        <h1 class="flex items-center gap-2">
          <span class="text-lg font-semibold ">
            {{ data.title }}
          </span>
        </h1>
        <div class="flex items-center gap-2">
          <Badge
            v-for="tag in data.tags"
            :key="tag"
            color="neutral">
            {{ tag }}
          </Badge>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div
        class="flex flex-col justify-center overflow-hidden rounded-lg">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div class="col-span-full flex items-start gap-4">
            <div
              class="flex items-center justify-center shrink-0 rounded-full border border-transparent shadow-md backdrop-blur-md size-20 group-hover:shadow-primary/20 transition-all duration-300">
              <img
                v-if="isImageUrl"
                :src="data.icon"
                :alt="data.title"
                class="size-12 object-contain">
              <Icon
                v-else
                :name="data.icon"
                class="text-white text-5xl" />
            </div>
            <p class="h-full text-sm flex flex-col justify-center">
              <template v-for="overview in data.overview" :key="overview">
                <span>
                  {{ overview }}
                </span>
              </template>
            </p>
          </div>

          <div class="col-span-1 flex items-center gap-2 border p-2 rounded-lg">
            <Badge
              color="neutral"
              class="w-20 flex-shrink-0 justify-center h-full"
              variant="outline">
              期間
            </Badge>
            <div class="whitespace-nowrap text-xs">
              {{ date_span }}
            </div>
          </div>
          <div class="col-span-1 flex items-center gap-2 border p-2 rounded-lg">
            <Badge
              color="neutral"
              class="w-20 flex-shrink-0 justify-center h-full"
              variant="outline">
              役割
            </Badge>
            <div class="text-sm">
              {{ data.role }}
            </div>
          </div>
          <div class="col-span-1 flex items-center gap-2 border p-2 rounded-lg">
            <Badge
              color="neutral"
              class="w-20 flex-shrink-0 justify-center h-full"
              variant="outline">
              体制
            </Badge>
            <div class="text-sm">
              {{ data.team }}
            </div>
          </div>
          <div class="col-span-full  h-full w-full flex items-center gap-2 border  p-2 rounded-lg">
            <Badge
              class="w-20 flex-shrink-0 justify-center h-full"
              color="neutral"
              variant="outline">
              担当
            </Badge>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="task in data.tasks"
                :key="task"
                class="text-sm">
                {{ task }}
              </span>
            </div>
          </div>
          <div class="col-span-full  h-full w-full flex items-center gap-2 border p-2 rounded-lg">
            <Badge
              class="w-20 flex-shrink-0 justify-center h-full"
              color="neutral"
              variant="outline">
              技術
            </Badge>
            <div class="flex flex-wrap gap-2">
              <SkillIcon
                v-for="stack in data.stacks"
                :key="stack"
                :stack="stack"
                class="h-10 min-w-10" />
            </div>
          </div>
          <div class="col-span-full flex flex-wrap gap-2 justify-end">
            <NuxtLink
              v-for="link in data.links"
              :key="link.label"
              :to="link.url"
              target="_blank"
              class="text-xs hover:underline hover:text-emerald-500">
              {{ link.label }} <Icon name="mdi:arrow-top-right-bold-box-outline" class="size-5" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
