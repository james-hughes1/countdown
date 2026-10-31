import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getTimeRemaining, pad } from '../public/js/countdown.js';

const NOW = new Date('2026-01-01T00:00:00Z');
const after = (ms) => new Date(NOW.getTime() + ms);

describe('getTimeRemaining', () => {
  it('splits remaining time into all units', () => {
    // 1 day, 2 hours, 3 minutes, 4 seconds
    const end = after(((1 * 24 + 2) * 60 + 3) * 60_000 + 4_000);
    assert.deepEqual(getTimeRemaining(end, NOW), {
      isComplete: false,
      parts: { days: 1, hours: 2, minutes: 3, seconds: 4 },
    });
  });

  it('is complete with all zeros once the end has passed', () => {
    assert.deepEqual(getTimeRemaining(NOW, after(5_000)), {
      isComplete: true,
      parts: { days: 0, hours: 0, minutes: 0, seconds: 0 },
    });
  });

  it('is complete exactly at the end time', () => {
    assert.equal(getTimeRemaining(NOW, NOW).isComplete, true);
  });

  it('rounds partial seconds up so it only hits zero at the end', () => {
    const result = getTimeRemaining(after(1), NOW);
    assert.equal(result.isComplete, false);
    assert.equal(result.parts.seconds, 1);
  });

  it('rolls omitted units into the next larger one shown', () => {
    const end = after(2 * 86_400_000 + 30 * 60_000); // 2 days 30 minutes
    assert.deepEqual(getTimeRemaining(end, NOW, ['hours', 'minutes']).parts, {
      hours: 48,
      minutes: 30,
    });
  });
});

describe('pad', () => {
  it('pads single digits to two characters', () => {
    assert.equal(pad(7), '07');
  });

  it('leaves longer numbers untouched', () => {
    assert.equal(pad(123), '123');
  });
});
