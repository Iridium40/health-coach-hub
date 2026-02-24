/**
 * Date helper utilities for the Coaching Amplifier app
 */

/**
 * Returns a YYYY-MM-DD string in the user's local timezone.
 * Unlike toISOString().split("T")[0] which converts to UTC first
 * (causing the date to shift forward for users in US timezones after ~4-7 PM).
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Calculate the program day number from a start date
 * Day 0 = start date, Day 1 = next day, etc.
 */
export function calculateProgramDay(startDate: Date | string): number {
  const start = new Date(startDate);
  const today = new Date();
  
  // Normalize to start of day for accurate day calculation
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  const diffTime = todayDay.getTime() - startDay.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays); // Ensure non-negative
}

/**
 * Check if a given program day is a milestone day
 * Milestones: Day 7 (1 week), Day 14 (2 weeks), Day 21 (3 weeks), Day 30 (1 month)
 */
export function isMilestoneDay(programDay: number): boolean {
  return [7, 14, 21, 30].includes(programDay);
}

/**
 * Get the phase label for a program day
 */
export function getProgramPhase(programDay: number): {
  label: string;
  phase: 'initial' | 'early' | 'establishing' | 'milestone' | 'maintenance';
} {
  if (programDay <= 3) {
    return { label: 'Getting Started', phase: 'initial' };
  } else if (programDay <= 7) {
    return { label: 'First Week', phase: 'early' };
  } else if (programDay <= 14) {
    return { label: 'Week 2', phase: 'establishing' };
  } else if (programDay <= 21) {
    return { label: 'Week 3', phase: 'establishing' };
  } else if (programDay <= 30) {
    return { label: 'Month 1', phase: 'milestone' };
  } else {
    return { label: `Day ${programDay}`, phase: 'maintenance' };
  }
}

/**
 * Format a date for display
 */
export function formatDisplayDate(date: Date | string, options?: {
  includeTime?: boolean;
  includeWeekday?: boolean;
}): string {
  const d = new Date(date);
  const { includeTime = false, includeWeekday = false } = options || {};
  
  const dateOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
  };
  
  if (includeWeekday) {
    dateOptions.weekday = 'short';
  }
  
  let result = d.toLocaleDateString('en-US', dateOptions);
  
  if (includeTime) {
    result += ' at ' + d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  }
  
  return result;
}

/**
 * Get days until a future date (negative if in the past)
 */
export function getDaysUntil(targetDate: Date | string): number {
  const target = new Date(targetDate);
  const today = new Date();
  
  // Normalize to start of day
  const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  const diffTime = targetDay.getTime() - todayDay.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if a date is today
 */
export function isToday(date: Date | string): boolean {
  const d = new Date(date);
  const today = new Date();
  
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

/**
 * Check if a date is in the past (before today)
 */
export function isPast(date: Date | string): boolean {
  return getDaysUntil(date) < 0;
}

/**
 * Check if a date is in the future (after today)
 */
export function isFuture(date: Date | string): boolean {
  return getDaysUntil(date) > 0;
}

/**
 * Get the next milestone day from a given program day
 */
export function getNextMilestone(currentDay: number): number {
  if (currentDay < 7) return 7;
  if (currentDay < 14) return 14;
  if (currentDay < 21) return 21;
  if (currentDay < 30) return 30;
  // After day 30, next milestone is at day 60, 90, etc.
  return Math.ceil(currentDay / 30) * 30 + 30;
}
