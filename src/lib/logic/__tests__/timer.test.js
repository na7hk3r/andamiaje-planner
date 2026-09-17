import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createTimer, formatDuration, TIMER_PRESETS_MIN } from '../timer.js';

describe('formatDuration', () => {
  it('formats milliseconds as mm:ss', () => {
    expect(formatDuration(0)).toBe('00:00');
    expect(formatDuration(61_000)).toBe('01:01');
    expect(formatDuration(1_200_000)).toBe('20:00');
  });

  it('rounds a partial second up so the clock never shows 00:00 early', () => {
    expect(formatDuration(59_999)).toBe('01:00');
  });

  it('clamps negative values to zero', () => {
    expect(formatDuration(-500)).toBe('00:00');
  });
});

describe('createTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts idle with zero remaining', () => {
    const timer = createTimer();
    expect(timer.state).toBe('idle');
    expect(timer.remaining()).toBe(0);
  });

  it('exposes the 20/30/45 presets in minutes', () => {
    const timer = createTimer();
    expect(timer.presets).toEqual([20, 30, 45]);
    expect(TIMER_PRESETS_MIN).toEqual([20, 30, 45]);
  });

  it('starts running with the full duration remaining', () => {
    const timer = createTimer();
    timer.start(1_200_000);
    expect(timer.state).toBe('running');
    expect(timer.remaining()).toBe(1_200_000);
  });

  it('ticks down with elapsed time (delta math, drift-immune)', () => {
    const timer = createTimer();
    timer.start(60_000);
    vi.advanceTimersByTime(10_000);
    expect(timer.remaining()).toBe(50_000);
    vi.advanceTimersByTime(30_000);
    expect(timer.remaining()).toBe(20_000);
  });

  it('zeroes at the end of the duration and never goes negative', () => {
    const timer = createTimer();
    timer.start(60_000);
    vi.advanceTimersByTime(61_000);
    expect(timer.remaining()).toBe(0);
    expect(timer.state).toBe('done');
    vi.advanceTimersByTime(10_000);
    expect(timer.remaining()).toBe(0);
    expect(timer.state).toBe('done');
  });

  it('supports custom durations outside the presets', () => {
    const timer = createTimer();
    timer.start(25 * 60_000);
    expect(timer.remaining()).toBe(1_500_000);
    vi.advanceTimersByTime(5 * 60_000);
    expect(timer.remaining()).toBe(1_200_000);
  });

  it('marks the timer done when returning after background throttling', () => {
    const timer = createTimer();
    timer.start(10 * 60_000);
    vi.advanceTimersByTime(30 * 60_000); // tab throttled; clock jumped ahead
    expect(timer.remaining()).toBe(0);
    expect(timer.state).toBe('done');
  });

  it('resets to idle with zero remaining', () => {
    const timer = createTimer();
    timer.start(60_000);
    timer.reset();
    expect(timer.state).toBe('idle');
    expect(timer.remaining()).toBe(0);
  });
});