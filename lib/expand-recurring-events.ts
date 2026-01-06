import type { ZoomCall } from "./types"

export interface ExpandedZoomCall extends ZoomCall {
  // The actual date for this occurrence (may differ from scheduled_at for recurring events)
  occurrence_date: string
  // Whether this is an instance of a recurring event
  is_occurrence: boolean
  // The original event id (same as id for non-recurring, parent id for occurrences)
  parent_id: string
}

/**
 * Expands recurring events into individual occurrences based on their recurrence pattern.
 * Non-recurring events are returned as-is with occurrence_date set to their scheduled_at.
 */
export function expandRecurringEvents(events: ZoomCall[]): ExpandedZoomCall[] {
  const expandedEvents: ExpandedZoomCall[] = []

  for (const event of events) {
    if (!event.is_recurring || !event.recurrence_pattern || !event.recurrence_day || !event.recurrence_end_date) {
      // Non-recurring event or missing recurrence data - return as single occurrence
      expandedEvents.push({
        ...event,
        occurrence_date: event.scheduled_at,
        is_occurrence: false,
        parent_id: event.id,
      })
      continue
    }

    // Generate occurrences for recurring events
    const occurrences = generateOccurrences(event)
    expandedEvents.push(...occurrences)
  }

  // Sort by occurrence date
  return expandedEvents.sort((a, b) => 
    new Date(a.occurrence_date).getTime() - new Date(b.occurrence_date).getTime()
  )
}

/**
 * Generates all occurrences for a recurring event from its start date to end date.
 */
function generateOccurrences(event: ZoomCall): ExpandedZoomCall[] {
  const occurrences: ExpandedZoomCall[] = []
  
  const startDate = new Date(event.scheduled_at)
  const endDate = new Date(event.recurrence_end_date!)
  const targetDay = getDayNumber(event.recurrence_day!)
  
  // Get the time portion from the original scheduled_at
  const hours = startDate.getHours()
  const minutes = startDate.getMinutes()
  
  // Find the first occurrence (the day of the week specified)
  let currentDate = new Date(startDate)
  
  // If the start date is not the target day, find the next occurrence of that day
  while (currentDate.getDay() !== targetDay) {
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  // Generate occurrences until end date
  while (currentDate <= endDate) {
    // Create occurrence date with the original time
    const occurrenceDate = new Date(currentDate)
    occurrenceDate.setHours(hours, minutes, 0, 0)
    
    occurrences.push({
      ...event,
      occurrence_date: occurrenceDate.toISOString(),
      is_occurrence: true,
      parent_id: event.id,
    })
    
    // Move to next occurrence based on pattern
    switch (event.recurrence_pattern) {
      case "weekly":
        currentDate.setDate(currentDate.getDate() + 7)
        break
      case "biweekly":
        currentDate.setDate(currentDate.getDate() + 14)
        break
      case "monthly":
        // Move to the same day of week in the next month
        currentDate.setMonth(currentDate.getMonth() + 1)
        // Adjust to find the correct day of week
        while (currentDate.getDay() !== targetDay) {
          currentDate.setDate(currentDate.getDate() + 1)
        }
        break
      default:
        currentDate.setDate(currentDate.getDate() + 7) // Default to weekly
    }
  }
  
  return occurrences
}

/**
 * Converts day name to JavaScript day number (0 = Sunday, 1 = Monday, etc.)
 */
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
  return days[dayName] ?? 1 // Default to Monday if unknown
}

/**
 * Filters expanded events to only include those within a date range.
 */
export function filterEventsByDateRange(
  events: ExpandedZoomCall[],
  startDate: Date,
  endDate: Date
): ExpandedZoomCall[] {
  return events.filter((event) => {
    const eventDate = new Date(event.occurrence_date)
    return eventDate >= startDate && eventDate <= endDate
  })
}

/**
 * Filters expanded events to only include upcoming events (from today onwards).
 */
export function filterUpcomingEvents(events: ExpandedZoomCall[]): ExpandedZoomCall[] {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return events.filter((event) => new Date(event.occurrence_date) >= now)
}

/**
 * Gets events for a specific date.
 */
export function getEventsForDate(events: ExpandedZoomCall[], date: Date): ExpandedZoomCall[] {
  const targetDate = new Date(date)
  targetDate.setHours(0, 0, 0, 0)
  
  const nextDay = new Date(targetDate)
  nextDay.setDate(nextDay.getDate() + 1)
  
  return events.filter((event) => {
    const eventDate = new Date(event.occurrence_date)
    return eventDate >= targetDate && eventDate < nextDay
  })
}
