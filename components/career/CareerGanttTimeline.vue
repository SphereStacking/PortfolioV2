<script setup lang="ts">
import type { Career, CareerProject } from '~/composables/useCareers'
import { useGanttCalculations, parseDate, monthsDiff } from '~/composables/useGanttCalculations'
import { useWindowScroll } from '@vueuse/core'

const props = defineProps<{
  careers: Career[]
}>()

// スムーズスクロール（VueUse）
const { y } = useWindowScroll({ behavior: 'smooth' })

const scrollToCareer = (careerId: string) => {
  const el = document.getElementById(`career-${careerId}`)
  if (!el) return
  const offset = 100 // header + gantt + margin
  y.value = el.offsetTop - offset
}

const scrollToProject = (projectId: string) => {
  const el = document.getElementById(`project-${projectId}-card`)
  if (!el) return
  const offset = 90
  y.value = el.offsetTop - offset
}

const careersRef = computed(() => props.careers)

const { timelineRange, calculateBarPosition, calculateYearPosition, calculateCurrentPosition } = useGanttCalculations(careersRef)

// キャリアにレーンを割り当て（重ならないものは同じ行に詰める）
interface CareerWithLane extends Career {
  lane: number
}

const calculateCareerLanes = (careers: Career[]): { careers: CareerWithLane[], laneCount: number } => {
  if (!careers.length) return { careers: [], laneCount: 0 }

  // 開始日でソート
  const sorted = [...careers].sort((a, b) => {
    return parseDate(a.date_start).getTime() - parseDate(b.date_start).getTime()
  })

  // 各レーンの終了日を追跡
  const laneEndDates: Date[] = []

  const careersWithLanes = sorted.map((career) => {
    const careerStart = parseDate(career.date_start)
    const careerEnd = career.date_end ? parseDate(career.date_end) : new Date()

    // 空いているレーンを探す
    let assignedLane = laneEndDates.findIndex(endDate => careerStart > endDate)

    if (assignedLane === -1) {
      assignedLane = laneEndDates.length
      laneEndDates.push(careerEnd)
    }
    else {
      laneEndDates[assignedLane] = careerEnd
    }

    return { ...career, lane: assignedLane }
  })

  const laneCount = careersWithLanes.length > 0
    ? Math.max(...careersWithLanes.map(c => c.lane)) + 1
    : 0

  return { careers: careersWithLanes, laneCount }
}

const careerLanes = computed(() => calculateCareerLanes(props.careers))

// キャリアを日付順にソート（新しい順 = 現在の企業が上）- 詳細カード用
const sortedCareers = computed(() => {
  return [...props.careers].sort((a, b) => {
    const dateA = new Date(a.date_start.replace('/', '-'))
    const dateB = new Date(b.date_start.replace('/', '-'))
    return dateB.getTime() - dateA.getTime()
  })
})

// ホバー状態を管理
const hoveredCareerId = ref<string | null>(null)

// プロジェクトの横バー位置を計算（左が現在、右が過去）
const calculateProjectBarPosition = (project: CareerProject) => {
  if (!timelineRange.value) {
    return { left: '0%', width: '5%' }
  }

  const range = timelineRange.value
  const startDate = parseDate(project.period_start)
  const endDate = project.period_end ? parseDate(project.period_end) : new Date()
  const rangeEnd = new Date(range.endYear, 0, 1)

  const endOffset = monthsDiff(endDate, rangeEnd)
  const duration = monthsDiff(startDate, endDate)

  const leftPercent = (endOffset / range.totalMonths) * 100
  const widthPercent = (duration / range.totalMonths) * 100

  return {
    left: `${leftPercent}%`,
    width: `${Math.max(widthPercent, 0.3)}%`,
  }
}

// プロジェクトのレーン（行）を計算（重ならないものは同じ行に詰める）
interface ProjectWithLane extends CareerProject {
  lane: number
}

const calculateProjectLanes = (projects: CareerProject[]): ProjectWithLane[] => {
  if (!projects.length) return []

  // 開始日でソート
  const sorted = [...projects].sort((a, b) => {
    return parseDate(a.period_start).getTime() - parseDate(b.period_start).getTime()
  })

  // 各レーンの終了日を追跡
  const laneEndDates: Date[] = []

  return sorted.map((project) => {
    const projectStart = parseDate(project.period_start)
    const projectEnd = project.period_end ? parseDate(project.period_end) : new Date()

    // 空いているレーンを探す（プロジェクト開始日がレーン終了日より後なら使える）
    let assignedLane = laneEndDates.findIndex(endDate => projectStart > endDate)

    if (assignedLane === -1) {
      // 空いているレーンがなければ新しいレーンを作成
      assignedLane = laneEndDates.length
      laneEndDates.push(projectEnd)
    }
    else {
      // 既存レーンの終了日を更新
      laneEndDates[assignedLane] = projectEnd
    }

    return { ...project, lane: assignedLane }
  })
}

// キャリアごとのプロジェクトレーン情報をキャッシュ
const careerProjectLanes = computed(() => {
  const result: Record<string, { projects: ProjectWithLane[], laneCount: number }> = {}
  for (const career of props.careers) {
    const projectsWithLanes = calculateProjectLanes(career.projects)
    const laneCount = projectsWithLanes.length > 0
      ? Math.max(...projectsWithLanes.map(p => p.lane)) + 1
      : 0
    result[career.id] = { projects: projectsWithLanes, laneCount }
  }
  return result
})

// 各キャリアの高さを計算（キャリアバー + プロジェクトエリア）
const CAREER_BAR_HEIGHT = 48 // h-12
const PROJECT_LANE_HEIGHT = 24
const CAREER_GAP = 8 // gap between careers in the same lane

const getCareerBlockHeight = (careerId: string) => {
  const projectInfo = careerProjectLanes.value[careerId]
  const projectHeight = (projectInfo?.laneCount || 0) * PROJECT_LANE_HEIGHT
  return CAREER_BAR_HEIGHT + projectHeight + CAREER_GAP
}

// 各レーンの最大高さを計算
const laneHeights = computed(() => {
  const heights: number[] = []
  for (const career of careerLanes.value.careers) {
    const height = getCareerBlockHeight(career.id)
    if (!heights[career.lane] || heights[career.lane] < height) {
      heights[career.lane] = height
    }
  }
  return heights
})

// レーンのY座標オフセットを計算
const laneOffsets = computed(() => {
  const offsets: number[] = [0]
  for (let i = 1; i < laneHeights.value.length; i++) {
    offsets[i] = offsets[i - 1] + laneHeights.value[i - 1]
  }
  return offsets
})

// ガントチャート全体の高さ
const totalGanttHeight = computed(() => {
  return laneHeights.value.reduce((sum, h) => sum + h, 0)
})

// 5年刻みかどうか判定
const isMilestoneYear = (year: number) => year % 5 === 0
</script>

<template>
  <div class="w-full">
    <!-- 横型ガントチャート -->
    <div v-if="timelineRange">
      <!-- スクロール可能なガントチャートエリア（スティッキー） -->
      <div class="overflow-x-auto pb-6 sticky top-16 z-40 bg-background">
        <div class="min-w-[800px]" :style="{ minWidth: `${Math.max(800, timelineRange.totalMonths * 15)}px` }">
          <!-- 年軸（上部） -->
          <div class="relative h-8 mb-2">
            <!-- 年マーカー -->
            <div
              v-for="year in timelineRange.years"
              :key="'year-' + year"
              class="absolute top-0 flex flex-col items-center -translate-x-1/2"
              :style="{ left: calculateYearPosition(year) }">
              <!-- 年ラベル -->
              <span
                class="tabular-nums tracking-tight transition-all duration-300"
                :class="[
                  isMilestoneYear(year)
                    ? 'text-xs font-semibold text-foreground'
                    : 'text-[10px] text-muted-foreground/60',
                ]">
                {{ year }}
              </span>
            </div>
          </div>

          <!-- タイムライングリッド + バー -->
          <div class="relative" :style="{ height: `${totalGanttHeight}px` }">
            <!-- 背景グリッド線 -->
            <div
              v-for="year in timelineRange.years"
              :key="'grid-' + year"
              class="absolute top-0 bottom-0 w-px -translate-x-1/2"
              :class="isMilestoneYear(year) ? 'bg-border' : 'bg-border/30'"
              :style="{ left: calculateYearPosition(year) }"></div>

            <!-- 現在の縦線 -->
            <div
              class="absolute top-0 bottom-0 w-px bg-primary/60 -translate-x-1/2"
              :style="{ left: calculateCurrentPosition() }"></div>

            <!-- キャリアブロック -->
            <div
              v-for="career in careerLanes.careers"
              :key="career.id"
              class="absolute left-0 right-0"
              :style="{ top: `${laneOffsets[career.lane]}px` }"
              @mouseenter="hoveredCareerId = career.id"
              @mouseleave="hoveredCareerId = null">
              <!-- キャリアバー: 細いライン + 端点 -->
              <button
                type="button"
                class="group/bar absolute flex items-center cursor-pointer transition-all duration-200"
                :style="{
                  left: calculateBarPosition(career).left,
                  width: calculateBarPosition(career).width,
                  top: '16px',
                  height: '20px',
                }"
                @click="scrollToCareer(career.id)">
                <!-- メインライン -->
                <div
                  class="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 bg-foreground/80 transition-all duration-200"
                  :class="hoveredCareerId === career.id ? 'h-[5px] bg-foreground' : ''"></div>

                <!-- 左端点（終了） -->
                <div
                  class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 size-2 rounded-full border-2 border-foreground/80 bg-background transition-all duration-200"
                  :class="hoveredCareerId === career.id ? 'size-3 border-foreground' : ''"></div>

                <!-- 右端点（開始） -->
                <div
                  class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 size-2 rounded-full border-2 border-foreground/80 bg-background transition-all duration-200"
                  :class="hoveredCareerId === career.id ? 'size-3 border-foreground' : ''"></div>

                <!-- ラベル（バーの上） -->
                <span
                  class="absolute -top-5 left-0 text-xs font-medium text-foreground/70 whitespace-nowrap transition-all duration-200 truncate max-w-full"
                  :class="hoveredCareerId === career.id ? 'text-foreground' : ''">
                  {{ career.title }}
                </span>
              </button>

              <!-- プロジェクトバー: より細いライン -->
              <button
                v-for="project in careerProjectLanes[career.id]?.projects || []"
                :id="`project-${project.id}`"
                :key="project.id"
                type="button"
                class="group/proj absolute flex items-center cursor-pointer"
                :style="{
                  left: calculateProjectBarPosition(project).left,
                  width: calculateProjectBarPosition(project).width,
                  top: `${CAREER_BAR_HEIGHT + project.lane * PROJECT_LANE_HEIGHT}px`,
                  height: '16px',
                }"
                @click="scrollToProject(project.id)">
                <!-- プロジェクトライン -->
                <div
                  class="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 transition-all duration-200"
                  :class="[
                    hoveredCareerId === career.id
                      ? 'bg-muted-foreground/60 h-[2px]'
                      : 'bg-muted-foreground/30',
                    'group-hover/proj:bg-foreground group-hover/proj:h-[2px]',
                  ]"></div>

                <!-- 左端点 -->
                <div
                  class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 size-1 rounded-full transition-all duration-200"
                  :class="[
                    hoveredCareerId === career.id
                      ? 'bg-muted-foreground/60 size-1.5'
                      : 'bg-muted-foreground/30',
                    'group-hover/proj:bg-foreground group-hover/proj:size-2',
                  ]"></div>

                <!-- 右端点 -->
                <div
                  class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 size-1 rounded-full transition-all duration-200"
                  :class="[
                    hoveredCareerId === career.id
                      ? 'bg-muted-foreground/60 size-1.5'
                      : 'bg-muted-foreground/30',
                    'group-hover/proj:bg-foreground group-hover/proj:size-2',
                  ]"></div>

                <!-- ホバー時のラベル -->
                <span
                  class="absolute -top-4 left-0 text-[10px] text-muted-foreground whitespace-nowrap opacity-0 transition-all duration-200 group-hover/proj:opacity-100 truncate max-w-full">
                  {{ project.title }}
                </span>
              </button>
            </div>
          </div>

          <!-- NOW ラベル（バーの下、スティッキー内） -->
          <div class="relative h-6 mt-2">
            <div
              class="absolute -translate-x-1/2"
              :style="{ left: calculateCurrentPosition() }">
              <span class="text-[10px] font-medium text-primary tracking-wide">NOW</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 詳細カードセクション -->
      <div class="mt-16 space-y-12">
        <div
          v-for="career in sortedCareers"
          :id="`career-${career.id}`"
          :key="'detail-' + career.id"
          class="scroll-mt-[350px]">
          <!-- セクションヘッダー -->
          <div class="flex items-baseline gap-4 mb-6">
            <h3 class="text-lg font-semibold text-foreground tracking-tight">
              {{ career.title }}
            </h3>
            <span v-if="!career.date_end" class="text-xs font-medium text-primary tracking-wide">CURRENT</span>
            <div class="flex-1 h-px bg-border"></div>
          </div>

          <!-- プロジェクトカード -->
          <div class="grid gap-4 pl-0">
            <div
              v-for="project in career.projects"
              :id="`project-${project.id}-card`"
              :key="'card-' + project.id"
              class="scroll-mt-[350px]">
              <ProjectCard :data="project" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- モバイル: カード形式フォールバック（ガントが常時表示のため非表示） -->
    <div class="hidden space-y-8">
      <div
        v-for="career in sortedCareers"
        :key="career.id"
        class="space-y-4">
        <div class="flex items-baseline gap-3">
          <h3 class="font-semibold text-foreground">
            {{ career.title }}
          </h3>
          <span v-if="!career.date_end" class="text-[10px] font-medium text-primary tracking-wide">CURRENT</span>
        </div>
        <p class="text-xs text-muted-foreground tabular-nums">
          {{ career.date_start }} — {{ career.date_end || 'Present' }}
        </p>
        <div class="space-y-3">
          <ProjectCard
            v-for="project in career.projects"
            :key="project.id"
            :data="project" />
        </div>
      </div>
    </div>
  </div>
</template>
