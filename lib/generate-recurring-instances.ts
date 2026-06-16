import type { ZoomCall } from "./types"

export interface RecurringInstanceData {
  title: string
  description: string | null
  call_type: "coach_only" | "with_clients"
  scheduled_at: string
  duration_minutes: number | null
  timezone: string
  is_recurring: boolean
  recurrence_pattern: string | null
  recurrence_day: string | null
  recurrence_end_date: string | null
  zoom_link: string | null
  zoom_meeting_id: string | null
  zoom_passcode: string | null
  recording_url: string | null
  recording_platform: string | null
  status: string
  created_by: string | null
  event_type?: string
  end_date?: string | null
  start_time?: string | null
  end_time?: string | null
  location?: string | null
  is_virtual?: boolean
  image_url?: string | null
  parent_id: string
  is_template: boolean
  occurrence_index: number
}

/**
 * Generates instance data for all occurrences of a recurring event.
 * Returns an array of instance objects ready to be inserted into the database.
 */
export function generateRecurringInstances(
  template: ZoomCall,
  templateId: string
): RecurringInstanceData[] {
  if (!template.is_recurring || !template.recurrence_pattern || !template.recurrence_day || !template.recurrence_end_date) {
    return []
  }

  const instances: RecurringInstanceData[] = []
  const startDate = new Date(template.scheduled_at)
  const endDate = new Date(template.recurrence_end_date)
  const targetDay = getDayNumber(template.recurrence_day)

  const hours = startDate.getHours()
  const minutes = startDate.getMinutes()

  let currentDate = new Date(startDate)

  // Find the first occurrence on the target day
  while (currentDate.getDay() !== targetDay) {
    currentDate.setDate(currentDate.getDate() + 1)
  }

  let occurrenceIndex = 1

  while (currentDate <= endDate) {
    const occurrenceDate = new Date(currentDate)
    occurrenceDate.setHours(hours, minutes, 0, 0)

    instances.push({
      title: template.title,
      description: template.description,
      call_type: template.call_type,
      scheduled_at: occurrenceDate.toISOString(),
      duration_minutes: template.duration_minutes,
      timezone: template.timezone,
      is_recurring: true,
      recurrence_pattern: template.recurrence_pattern,
      recurrence_day: template.recurrence_day,
      recurrence_end_date: template.recurrence_end_date,
      zoom_link: template.zoom_link,
      zoom_meeting_id: template.zoom_meeting_id,
      zoom_passcode: template.zoom_passcode,
      recording_url: null,
      recording_platform: null,
      status: "upcoming",
      created_by: template.created_by,
      event_type: template.event_type,
      end_date: template.end_date,
      start_time: template.start_time,
      end_time: template.end_time,
      location: template.location,
      is_virtual: template.is_virtual,
      image_url: template.image_url,
      parent_id: templateId,
      is_template: false,
      occurrence_index: occurrenceIndex,
    })

    occurrenceIndex++

    // Move to next occurrence based on pattern
    switch (template.recurrence_pattern) {
      case "weekly":
        currentDate.setDate(currentDate.getDate() + 7)
        break
      case "biweekly":
        currentDate.setDate(currentDate.getDate() + 14)
        break
      case "monthly":
        currentDate.setMonth(currentDate.getMonth() + 1)
        while (currentDate.getDay() !== targetDay) {
          currentDate.setDate(currentDate.getDate() + 1)
        }
        break
      default:
        currentDate.setDate(currentDate.getDate() + 7)
    }
  }

  return instances
}

/**
 * Generates instances for dates AFTER a given date (for "this and future" edits)
 */
export function generateFutureInstances(
  template: ZoomCall,
  templateId: string,
  afterDate: Date,
  startingIndex: number
): RecurringInstanceData[] {
  if (!template.is_recurring || !template.recurrence_pattern || !template.recurrence_day || !template.recurrence_end_date) {
    return []
  }

  const instances: RecurringInstanceData[] = []
  const endDate = new Date(template.recurrence_end_date)
  const targetDay = getDayNumber(template.recurrence_day)

  const startDate = new Date(template.scheduled_at)
  const hours = startDate.getHours()
  const minutes = startDate.getMinutes()

  let currentDate = new Date(afterDate)
  currentDate.setDate(currentDate.getDate() + 1) // Start from the day after

  // Find the next occurrence on the target day
  while (currentDate.getDay() !== targetDay) {
    currentDate.setDate(currentDate.getDate() + 1)
  }

  let occurrenceIndex = startingIndex

  while (currentDate <= endDate) {
    const occurrenceDate = new Date(currentDate)
    occurrenceDate.setHours(hours, minutes, 0, 0)

    instances.push({
      title: template.title,
      description: template.description,
      call_type: template.call_type,
      scheduled_at: occurrenceDate.toISOString(),
      duration_minutes: template.duration_minutes,
      timezone: template.timezone,
      is_recurring: true,
      recurrence_pattern: template.recurrence_pattern,
      recurrence_day: template.recurrence_day,
      recurrence_end_date: template.recurrence_end_date,
      zoom_link: template.zoom_link,
      zoom_meeting_id: template.zoom_meeting_id,
      zoom_passcode: template.zoom_passcode,
      recording_url: null,
      recording_platform: null,
      status: "upcoming",
      created_by: template.created_by,
      event_type: template.event_type,
      end_date: template.end_date,
      start_time: template.start_time,
      end_time: template.end_time,
      location: template.location,
      is_virtual: template.is_virtual,
      image_url: template.image_url,
      parent_id: templateId,
      is_template: false,
      occurrence_index: occurrenceIndex,
    })

    occurrenceIndex++

    switch (template.recurrence_pattern) {
      case "weekly":
        currentDate.setDate(currentDate.getDate() + 7)
        break
      case "biweekly":
        currentDate.setDate(currentDate.getDate() + 14)
        break
      case "monthly":
        currentDate.setMonth(currentDate.getMonth() + 1)
        while (currentDate.getDay() !== targetDay) {
          currentDate.setDate(currentDate.getDate() + 1)
        }
        break
      default:
        currentDate.setDate(currentDate.getDate() + 7)
    }
  }

  return instances
}

function getDayNumber(dayName: string): number {
  const days: Record<string, number> = {
    "Sunday": 0,
    "Monday": 1,
    "Tuesday": 2,
    "Wednesday": 3,
    "Thursday": 4,
    "Friday": 5,
    "Saturday": 6,
  }
  return days[dayName] ?? 1
}
