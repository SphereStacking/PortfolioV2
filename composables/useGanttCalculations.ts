import type { Career } from '~/composables/useCareers'

export interface TimelineRange {
  startYear: number
  endYear: number
  years: number[]
  totalMonths: number
}

// 横型ガントチャート用のバー位置
export interface HorizontalBarPosition {
  left: string
  width: string
}

// 日付文字列をパース（"2024/03/15" or "2024-03-15" or "2024/03" 形式）
export const parseDate = (dateStr: string): Date => {
  const parts = dateStr.split(/[/-]/).map(Number)
  const year = parts[0]
  const month = parts[1]
  const day = parts[2] || 1 // 日がなければ1日
  return new Date(year, month - 1, day)
}

// 2つの日付間の月数を計算（日数ベースでより正確に）
export const monthsDiff = (start: Date, end: Date): number => {
  const diffTime = end.getTime() - start.getTime()
  const diffDays = diffTime / (1000 * 60 * 60 * 24)
  return diffDays / 30.44 // 平均月日数
}

export const useGanttCalculations = (careers: Ref<Career[] | null>) => {
  // タイムラインの範囲を計算
  const timelineRange = computed<TimelineRange | null>(() => {
    if (!careers.value?.length) return null

    const allDates = careers.value.flatMap((c) => {
      const dates = [parseDate(c.date_start)]
      if (c.date_end) {
        dates.push(parseDate(c.date_end))
      }
      else {
        dates.push(new Date())
      }
      return dates
    })

    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())))
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())))

    // 年単位に丸める
    const startYear = minDate.getFullYear()
    const endYear = maxDate.getFullYear() + 1

    // 年のリスト（左から右へ: 新しい→古い）
    const years = Array.from(
      { length: endYear - startYear + 1 },
      (_, i) => endYear - i,
    )

    return {
      startYear,
      endYear,
      years,
      totalMonths: (endYear - startYear) * 12,
    }
  })

  // 横型バーの位置と幅を計算
  const calculateBarPosition = (career: Career): HorizontalBarPosition => {
    if (!timelineRange.value) {
      return { left: '0%', width: '10%' }
    }

    const range = timelineRange.value
    const startDate = parseDate(career.date_start)
    const endDate = career.date_end ? parseDate(career.date_end) : new Date()

    const rangeEnd = new Date(range.endYear, 0, 1)

    const endOffset = monthsDiff(endDate, rangeEnd)
    const duration = monthsDiff(startDate, endDate)

    // 左から右へ（新しい→古い）: 左端が現在
    const leftPercent = (endOffset / range.totalMonths) * 100
    const widthPercent = (duration / range.totalMonths) * 100

    return {
      left: `${leftPercent}%`,
      width: `${Math.max(widthPercent, 0.5)}%`, // 最小幅0.5%（端点がずれないように小さく）
    }
  }

  // 年マーカーの位置を計算（横型: left）- 左が新しい、右が古い
  const calculateYearPosition = (year: number): string => {
    if (!timelineRange.value) return '0%'

    const range = timelineRange.value
    const monthsFromEnd = (range.endYear - year) * 12
    const percent = (monthsFromEnd / range.totalMonths) * 100

    return `${percent}%`
  }

  // 現在日の位置を計算（横型: left）
  const calculateCurrentPosition = (): string => {
    if (!timelineRange.value) return '0%'

    const range = timelineRange.value
    const now = new Date()
    const rangeEnd = new Date(range.endYear, 0, 1)
    const monthsFromEnd = monthsDiff(now, rangeEnd)
    const percent = (monthsFromEnd / range.totalMonths) * 100

    return `${Math.max(0, percent)}%`
  }

  return {
    timelineRange,
    calculateBarPosition,
    calculateYearPosition,
    calculateCurrentPosition,
  }
}
