import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { ConfigError, DEFAULTS, parseConfig } from '../public/js/config.js';

/** Assert that parsing throws a ConfigError whose problems mention `fragment`. */
function assertProblem(raw, fragment) {
  assert.throws(
    () => parseConfig(raw),
    (error) =>
      error instanceof ConfigError && error.problems.some((problem) => problem.includes(fragment)),
  );
}

describe('parseConfig', () => {
  it('applies defaults when only endDate is given', () => {
    const config = parseConfig({ endDate: '2027-01-01T00:00:00Z' });
    assert.equal(config.title, DEFAULTS.title);
    assert.equal(config.completedMessage, DEFAULTS.completedMessage);
    assert.deepEqual(config.units, DEFAULTS.units);
    assert.equal(config.endDate.toISOString(), '2027-01-01T00:00:00.000Z');
  });

  it('accepts dates with an explicit offset', () => {
    const config = parseConfig({ endDate: '2027-01-01T00:00:00+02:00' });
    assert.equal(config.endDate.toISOString(), '2026-12-31T22:00:00.000Z');
  });

  it('accepts the shipped config.json', async () => {
    const raw = JSON.parse(await readFile(new URL('../config.json', import.meta.url), 'utf8'));
    assert.doesNotThrow(() => parseConfig(raw));
  });

  it('rejects non-object configs', () => {
    for (const raw of [null, [], 'nope', 42]) {
      assertProblem(raw, 'JSON object');
    }
  });

  it('requires endDate', () => {
    assertProblem({}, '"endDate"');
  });

  it('rejects date-only and malformed endDate values', () => {
    for (const endDate of ['2027-01-01', 'tomorrow', '01/01/2027 00:00']) {
      assertProblem({ endDate }, '"endDate"');
    }
  });

  it('rejects impossible dates', () => {
    assertProblem({ endDate: '2027-13-45T00:00:00Z' }, 'not a real date');
  });

  it('normalises unit order and rejects unknown units', () => {
    const config = parseConfig({ endDate: '2027-01-01T00:00:00Z', units: ['seconds', 'days'] });
    assert.deepEqual(config.units, ['days', 'seconds']);
    assertProblem({ endDate: '2027-01-01T00:00:00Z', units: ['weeks'] }, '"units"');
    assertProblem({ endDate: '2027-01-01T00:00:00Z', units: [] }, '"units"');
  });

  it('validates theme keys and values', () => {
    const config = parseConfig({ endDate: '2027-01-01T00:00:00Z', theme: { accent: 'tomato' } });
    assert.deepEqual(config.theme, { accent: 'tomato' });
    assertProblem({ endDate: '2027-01-01T00:00:00Z', theme: { font: 'serif' } }, 'Unknown theme key');
    assertProblem({ endDate: '2027-01-01T00:00:00Z', theme: { accent: 1 } }, '"theme.accent"');
  });

  it('reports every problem at once', () => {
    assert.throws(
      () => parseConfig({ title: 1, completedMessage: false }),
      (error) => error instanceof ConfigError && error.problems.length === 3,
    );
  });
});
