// Delta-based countdown logic (design D2). Pure module: no Svelte, no DOM,
// no timers of its own. The tab's clock (Date.now) is the single source of
// truth: remaining = max(0, duration − elapsed). Background throttling only
// delays reads, so the state stays consistent when the tab returns.

export const TIMER_PRESETS_MIN = [20, 30, 45];

export const TIMER_STATES = Object.freeze({
  IDLE: 'idle',
  RUNNING: 'running',
  DONE: 'done',
});

// Formats milliseconds as mm:ss. A partial second rounds up so the clock
// reaches 00:00 exactly when the duration ends.
export function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(minutes)}:${pad(seconds)}`;
}

// Factory with an injectable clock (defaults to Date.now) so tests and the
// future store can drive fake time. Custom durations are supported by
// passing any durationMs to start().
export function createTimer(now = () => Date.now()) {
  let state = TIMER_STATES.IDLE;
  let durationMs = 0;
  let startAt = 0;

  function remaining(at = now()) {
    if (state === TIMER_STATES.DONE) return 0;
    if (state !== TIMER_STATES.RUNNING) return durationMs;
    const elapsed = Math.max(0, at - startAt);
    const rem = Math.max(0, durationMs - elapsed);
    if (rem === 0) state = TIMER_STATES.DONE;
    return rem;
  }

  return {
    get state() {
      return state;
    },
    get durationMs() {
      return durationMs;
    },
    presets: TIMER_PRESETS_MIN,
    start(duration, at = now()) {
      const safeDuration = Math.max(0, duration);
      durationMs = safeDuration;
      startAt = at;
      state = TIMER_STATES.RUNNING;
      return remaining(at);
    },
    remaining,
    format: formatDuration,
    reset() {
      state = TIMER_STATES.IDLE;
      durationMs = 0;
      startAt = 0;
    },
  };
}