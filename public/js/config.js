/**
 * Config parsing and validation. No DOM access, so it can be unit tested in Node.
 */
import { UNITS } from './countdown.js';

export const DEFAULTS = Object.freeze({
  title: 'Countdown',
  completedMessage: "Time's up!",
  units: UNITS,
  theme: Object.freeze({}),
});

const THEME_KEYS = Object.freeze(['background', 'text', 'accent']);

// Require a full date-time. Date-only strings ("2027-01-01") are parsed as UTC
// by JavaScript while date-times without an offset are parsed as local time,
// which is a confusing inconsistency we avoid by rejecting the former.
const ISO_DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})?$/;

export class ConfigError extends Error {
  /** @param {string[]} problems */
  constructor(problems) {
    super(`Invalid config:\n- ${problems.join('\n- ')}`);
    this.name = 'ConfigError';
    this.problems = problems;
  }
}

/**
 * Validate raw config (e.g. parsed JSON) and merge it with defaults.
 * Collects every problem before throwing so they can all be fixed at once.
 *
 * @param {unknown} raw
 * @returns {{ title: string, endDate: Date, completedMessage: string, units: string[], theme: Record<string, string> }}
 * @throws {ConfigError}
 */
export function parseConfig(raw) {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new ConfigError(['Config must be a JSON object.']);
  }

  const problems = [];
  const config = { ...DEFAULTS };

  if (typeof raw.endDate !== 'string' || !ISO_DATE_TIME.test(raw.endDate)) {
    problems.push(
      '"endDate" is required and must be an ISO 8601 date-time, e.g. "2027-01-01T00:00:00" (viewer\'s local time) or "2027-01-01T00:00:00Z" (UTC).',
    );
  } else {
    config.endDate = new Date(raw.endDate);
    if (Number.isNaN(config.endDate.getTime())) {
      problems.push(`"endDate" is not a real date: "${raw.endDate}".`);
    }
  }

  for (const key of ['title', 'completedMessage']) {
    if (raw[key] === undefined) continue;
    if (typeof raw[key] !== 'string') {
      problems.push(`"${key}" must be a string.`);
    } else {
      config[key] = raw[key];
    }
  }

  if (raw.units !== undefined) {
    const valid =
      Array.isArray(raw.units) &&
      raw.units.length > 0 &&
      raw.units.every((unit) => UNITS.includes(unit));
    if (!valid) {
      problems.push(`"units" must be a non-empty array containing any of: ${UNITS.join(', ')}.`);
    } else {
      config.units = UNITS.filter((unit) => raw.units.includes(unit));
    }
  }

  if (raw.theme !== undefined) {
    if (raw.theme === null || typeof raw.theme !== 'object' || Array.isArray(raw.theme)) {
      problems.push('"theme" must be an object.');
    } else {
      config.theme = {};
      for (const [key, value] of Object.entries(raw.theme)) {
        if (!THEME_KEYS.includes(key)) {
          problems.push(`Unknown theme key "${key}". Allowed: ${THEME_KEYS.join(', ')}.`);
        } else if (typeof value !== 'string') {
          problems.push(`"theme.${key}" must be a CSS color string.`);
        } else {
          config.theme[key] = value;
        }
      }
    }
  }

  if (problems.length > 0) throw new ConfigError(problems);
  return config;
}
