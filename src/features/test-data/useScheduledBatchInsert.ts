import { onBeforeUnmount, ref } from 'vue'

export function useScheduledBatchInsert(options: {
  batchInsert: () => Promise<void>
  setBatchDays: (days: string) => void
}) {
  const scheduleEnabled = ref(false)
  const scheduleIntervalSeconds = ref(60)
  const scheduleRunning = ref(false)
  const scheduleBusy = ref(false)
  const nextRunInSeconds = ref(0)
  let scheduleTimer: number | null = null

  function clearScheduleTimer() {
    if (scheduleTimer !== null) {
      window.clearInterval(scheduleTimer)
      scheduleTimer = null
    }
  }

  async function runScheduledBatch() {
    if (scheduleBusy.value) return
    scheduleBusy.value = true
    try {
      await options.batchInsert()
    } finally {
      scheduleBusy.value = false
    }
  }

  function startSchedule() {
    if (!scheduleEnabled.value || scheduleRunning.value) return
    options.setBatchDays('0')
    scheduleRunning.value = true
    nextRunInSeconds.value = Math.max(1, Math.floor(scheduleIntervalSeconds.value || 1))
    void runScheduledBatch()
    clearScheduleTimer()
    scheduleTimer = window.setInterval(() => {
      if (!scheduleRunning.value) return
      if (nextRunInSeconds.value <= 1) {
        nextRunInSeconds.value = Math.max(1, Math.floor(scheduleIntervalSeconds.value || 1))
        void runScheduledBatch()
        return
      }
      nextRunInSeconds.value -= 1
    }, 1000)
  }

  function stopSchedule() {
    scheduleRunning.value = false
    clearScheduleTimer()
  }

  function onToggleScheduleEnabled(value: boolean) {
    scheduleEnabled.value = value
    if (value) {
      options.setBatchDays('0')
    } else {
      stopSchedule()
    }
  }

  function onUpdateScheduleIntervalSeconds(value: number) {
    scheduleIntervalSeconds.value = Math.max(1, Math.floor(value || 1))
    if (scheduleRunning.value) {
      nextRunInSeconds.value = scheduleIntervalSeconds.value
    }
  }

  onBeforeUnmount(() => {
    stopSchedule()
  })

  return {
    scheduleEnabled,
    scheduleIntervalSeconds,
    scheduleRunning,
    scheduleBusy,
    nextRunInSeconds,
    onToggleScheduleEnabled,
    onUpdateScheduleIntervalSeconds,
    startSchedule,
    stopSchedule
  }
}
