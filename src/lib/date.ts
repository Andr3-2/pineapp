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

/**
 * Streak = consecutive completed days walking backward from today.
 * Today counts if completed, but an incomplete today does not break the streak.
 */
export function computeStreak(
  completedByMonth: Record<string, number[]>,
  today: Date,
): number {
  const isDone = (d: Date) => {
    const key = monthKey(d.getFullYear(), d.getMonth());
    return (completedByMonth[key] ?? []).includes(d.getDate());
  };

  let streak = 0;
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  if (!isDone(cursor)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (isDone(cursor)) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function sessionsInMonth(
  completedByMonth: Record<string, number[]>,
  year: number,
  month: number,
): number {
  return (completedByMonth[monthKey(year, month)] ?? []).length;
}
