/**
 * Pure countdown logic. No DOM access, so it can be unit tested in Node.
 */

/** Supported display units, largest first. */
export const UNITS = Object.freeze(['days', 'hours', 'minutes', 'seconds']);

const SECONDS_PER_UNIT = Object.freeze({
  days: 86_400,
  hours: 3_600,
  minutes: 60,
  seconds: 1,
});

/**
 * Break the time between `now` and `end` into the requested units.
 *
 * Remaining time is rounded *up* to the whole second so the display reaches
 * zero exactly when the target moment arrives. Any unit that is omitted rolls
 * its value into the next larger unit shown (e.g. without "days", hours can
 * exceed 23).
 *
 * @param {Date} end
 * @param {Date} now
 * @param {readonly string[]} [units] subset of UNITS to include
 * @returns {{ isComplete: boolean, parts: Record<string, number> }}
 */
export function getTimeRemaining(end, now, units = UNITS) {
  let remaining = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 1000));
  const isComplete = remaining === 0;
  const parts = {};

  for (const unit of UNITS) {
    if (!units.includes(unit)) continue;
    parts[unit] = Math.floor(remaining / SECONDS_PER_UNIT[unit]);
    remaining -= parts[unit] * SECONDS_PER_UNIT[unit];
  }

  return { isComplete, parts };
}

/**
 * Zero-pad a number to at least two digits.
 * @param {number} value
 * @returns {string}
 */
export function pad(value) {
  return String(value).padStart(2, '0');
}
