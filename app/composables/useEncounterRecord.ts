import dayjs from 'dayjs'

interface MeetingRecord {
  where: string
  firstEncounter: string
  lastEncounter: string
  howManyTimes: number
}

const STORAGE_KEY = 'sphere-stacking-crossed'
const DEFAULT_WHERE = 'in a web search'

const parseStoredData = (storedData: string | null): MeetingRecord | null => {
  if (!storedData) return null
  try {
    return JSON.parse(storedData)
  }
  catch (error) {
    console.error('Failed to parse meeting record:', error)
    return null
  }
}

const isSameDay = (date1: string, date2: string): boolean => {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  return d1.getFullYear() === d2.getFullYear()
    && d1.getMonth() === d2.getMonth()
    && d1.getDate() === d2.getDate()
}

const createInitialRecord = (at: string): MeetingRecord => ({
  where: at || DEFAULT_WHERE,
  firstEncounter: new Date().toISOString(),
  lastEncounter: new Date().toISOString(),
  howManyTimes: 1,
})

const updateRecord = (currentRecord: MeetingRecord): MeetingRecord => {
  const now = new Date().toISOString()
  return {
    ...currentRecord,
    lastEncounter: now,
    howManyTimes: isSameDay(currentRecord.lastEncounter, now)
      ? currentRecord.howManyTimes
      : currentRecord.howManyTimes + 1,
  }
}

export const useEncounterRecord = () => {
  const where = ref<string | null>(null)
  const firstEncounter = ref<string | null>(null)
  const lastEncounter = ref<string | null>(null)
  const howManyTimes = ref<number>(0)

  const saveRecord = (at: string | undefined) => {
    if (!import.meta.client) return

    const storedData = localStorage.getItem(STORAGE_KEY)
    const currentRecord = parseStoredData(storedData)

    try {
      const newRecord = currentRecord
        ? updateRecord(currentRecord)
        : createInitialRecord(at || DEFAULT_WHERE)

      localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecord))
    }
    catch (error) {
      console.error('Failed to update meeting record:', error)
    }
  }

  const loadStoredData = () => {
    if (!import.meta.client) return

    const storedData = localStorage.getItem(STORAGE_KEY)
    const record = parseStoredData(storedData)

    if (record) {
      where.value = record.where
      firstEncounter.value = record.firstEncounter
      lastEncounter.value = record.lastEncounter
      howManyTimes.value = record.howManyTimes
    }
  }

  loadStoredData()

  const encounterMessage = computed(() => {
    return `first encountered ${where.value} on ${dayjs(firstEncounter.value).format('YYYY/MM/DD')}`
  })

  return {
    where,
    firstEncounter,
    lastEncounter,
    howManyTimes,
    saveRecord,
    encounterMessage,
  }
}
