const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_DAY = 86400;
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Parse a `YYYY-MM-DD` string as local midnight.
 * @param {unknown} iso
 * @returns {Date | null} null when the string is malformed or not a real date
 */
export function parseLocalDate(iso) {
  if (typeof iso !== 'string') return null;
  const match = ISO_DATE.exec(iso.trim());
  if (!match) return null;
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(year, month - 1, day);
  const isRealDate = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  return isRealDate ? date : null;
}

/**
 * Whole units elapsed between two instants (each unit counted independently).
 * @param {Date} start
 * @param {Date} now
 * @returns {{ days: number, hours: number, minutes: number, seconds: number }}
 */
export function elapsedSince(start, now) {
  const seconds = Math.max(0, Math.floor((now.getTime() - start.getTime()) / MS_PER_SECOND));
  return {
    days: Math.floor(seconds / SECONDS_PER_DAY),
    hours: Math.floor(seconds / SECONDS_PER_HOUR),
    minutes: Math.floor(seconds / SECONDS_PER_MINUTE),
    seconds,
  };
}

/**
 * Completed calendar months between two dates.
 * @param {Date} start
 * @param {Date} now
 * @returns {number}
 */
export function wholeMonthsBetween(start, now) {
  const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  const adjusted = now.getDate() < start.getDate() ? months - 1 : months;
  return Math.max(0, adjusted);
}

/**
 * @param {number} value
 * @returns {string}
 */
export function formatCount(value) {
  return Math.floor(value).toLocaleString('en-US');
}
