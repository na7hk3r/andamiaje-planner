import { describe, it, expect } from 'vitest';
import {
  setAnchorChecked,
  nextResumeAnchor,
  minutesOfDay,
} from '../recovery.js';

// Design D3 structural ban: an anchor value may only carry the keys from
// the design interfaces contract. Any extra key — day-lost flags, streaks,
// counters, or drift tracking — fails this shape check, which enforces
// the ban without relying on a vocabulary list.
const ALLOWED_ANCHOR_KEYS = ['id', 'time', 'checked', 'apagadoChecklist'];

function assertAllowedAnchorShape(value) {
  if (Array.isArray(value)) {
    value.forEach(assertAllowedAnchorShape);
    return;
  }
  if (value && typeof value === 'object') {
    for (const key of Object.keys(value)) {
      expect(ALLOWED_ANCHOR_KEYS).toContain(key);
    }
  }
}

const anchors = [
  { id: 'despertar', time: '08:00', checked: false },
  { id: 'primera_tarea', time: '12:30', checked: false },
  { id: 'movimiento', time: '19:00', checked: false },
  { id: 'apagado', time: '22:30', checked: false },
];

describe('minutesOfDay', () => {
  it('converts HH:mm to minutes of day', () => {
    expect(minutesOfDay('08:00')).toBe(480);
    expect(minutesOfDay('22:30')).toBe(1350);
  });
});

describe('setAnchorChecked — anchor independence', () => {
  it('changes only the target anchor (no cascade)', () => {
    const result = setAnchorChecked(anchors, 'despertar', true);
    expect(result[0]).toEqual({ id: 'despertar', time: '08:00', checked: true });
    // Untouched anchors keep their object identity: no cascade.
    expect(result[1]).toBe(anchors[1]);
    expect(result[2]).toBe(anchors[2]);
    expect(result[3]).toBe(anchors[3]);
    // Original array is not mutated.
    expect(anchors[0].checked).toBe(false);
  });

  it('leaves every other anchor available after one is missed', () => {
    const result = setAnchorChecked(anchors, 'despertar', false);
    expect(result[1].checked).toBe(false); // afternoon still available
    expect(result[2].checked).toBe(false); // evening still available
    expect(result[3].checked).toBe(false); // late anchor still available
  });

  it('produces anchors with only the contract keys (no day-lost, no counters)', () => {
    assertAllowedAnchorShape(setAnchorChecked(anchors, 'movimiento', true));
  });
});

describe('nextResumeAnchor', () => {
  const at = (hours, minutes) => new Date(2026, 8, 17, hours, minutes);

  it('returns the next scheduled anchor after a missed morning', () => {
    const result = nextResumeAnchor(anchors, at(10, 30));
    expect(result).toEqual({ id: 'primera_tarea', time: '12:30', checked: false });
  });

  it('skips checked anchors when picking the resume point', () => {
    const state = setAnchorChecked(anchors, 'primera_tarea', true);
    const result = nextResumeAnchor(state, at(13, 0));
    expect(result.id).toBe('movimiento');
  });

  it('returns the first anchor when now is before the day starts', () => {
    const result = nextResumeAnchor(anchors, at(7, 0));
    expect(result.id).toBe('despertar');
  });

  it('returns null when every anchor is already checked', () => {
    const allDone = anchors.map((a) => ({ ...a, checked: true }));
    expect(nextResumeAnchor(allDone, at(10, 30))).toBeNull();
  });

  it('returns null after the last anchor passed — no "mañana" restart', () => {
    expect(nextResumeAnchor(anchors, at(23, 0))).toBeNull();
  });

  it('reports resume points with only the contract keys', () => {
    const result = nextResumeAnchor(anchors, at(10, 30));
    assertAllowedAnchorShape(result);
  });
});