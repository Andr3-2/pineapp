const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTH_LABELS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
const DAY_LABELS_LONG = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
];

export const weekdayHeaderLabels = WEEKDAY_LABELS;

export function monthKey(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Offset of the month's first day from Monday (0 = Monday ... 6 = Sunday). */
export function firstWeekdayOffset(year: number, month: number): number {
  const jsDay = new Date(year, month, 1).getDay(); // 0 = Sunday
  return (jsDay + 6) % 7;
}

export function monthLabel(year: number, month: number): string {
  return `${MONTH_LABELS[month]} ${year}`;
}

export function monthLabelShort(month: number): string {
  return MONTH_LABELS_SHORT[month];
}

export function addMonths(year: number, month: number, delta: number): { year: number; month: number } {
  const total = year * 12 + month + delta;
  return { year: Math.floor(total / 12), month: ((total % 12) + 12) % 12 };
}

export function isSameMonth(a: Date, year: number, month: number): boolean {
  return a.getFullYear() === year && a.getMonth() === month;
}

export function formatKicker(date: Date): string {
  const weekday = DAY_LABELS_LONG[date.getDay()];
  return `${weekday}, ${date.getDate()} ${MONTH_LABELS_SHORT[date.getMonth()]}`;
}

/** Formats a total minutes count as the calmer-minutes card's headline value, e.g. "30min" or "1h30". */
export function formatMinutesCalmer(totalMinutes: number): string {
  if (totalMinutes < 60) return `${totalMinutes}min`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes === 0 ? `${hours}h` : `${hours}h${String(minutes).padStart(2, '0')}`;
}

export function sessionsInMonth(
  completedByMonth: Record<string, number[]>,
  year: number,
  month: number,
): number {
  return (completedByMonth[monthKey(year, month)] ?? []).length;
}

/** Assumed duration for a completed day with no matching session record (e.g. history from before per-session logging existed). */
const ASSUMED_MINUTES_WITHOUT_RECORD = 5;

/**
 * Sums actual logged session minutes for the given month. A day marked complete in
 * `completedByMonth` but with no matching entry in `sessions` (data from before
 * per-session logging existed) contributes the assumed default instead of nothing.
 */
export function minutesInMonth(
  sessions: Array<{ completedAt: number; minutes: number }>,
  completedByMonth: Record<string, number[]>,
  year: number,
  month: number,
): number {
  const daysWithRecords = new Set<number>();
  let total = 0;

  for (const session of sessions) {
    const at = new Date(session.completedAt);
    if (at.getFullYear() === year && at.getMonth() === month) {
      total += session.minutes;
      daysWithRecords.add(at.getDate());
    }
  }

  const completedDays = completedByMonth[monthKey(year, month)] ?? [];
  for (const day of completedDays) {
    if (!daysWithRecords.has(day)) total += ASSUMED_MINUTES_WITHOUT_RECORD;
  }

  return total;
}
