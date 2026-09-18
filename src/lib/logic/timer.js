// Delta-based countdown logic (design D2). Pure module: no Svelte, no DOM,
// no timers of its own. The tab's clock (Date.now) is the single source of
// truth: remaining = max(0, duration − elapsed). Background throttling only
// delays reads, so the state stays consistent when the tab returns.

export const TIMER_PRESETS_MIN = [20, 30, 45];

export const TIMER_STATES = Object.freeze({
  IDLE: 'idle',
  RUNNING: 'running',
  PAUSED: 'paused',
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
  let pausedRemainingMs = 0;

  function remaining(at = now()) {
    if (state === TIMER_STATES.DONE) return 0;
    if (state === TIMER_STATES.PAUSED) return pausedRemainingMs;
    if (state !== TIMER_STATES.RUNNING) return durationMs;
    const elapsed = Math.max(0, at - startAt);
    const rem = Math.max(0, durationMs - elapsed);
    if (rem === 0) state = TIMER_STATES.DONE;
    return rem;
  }

  function startCountdown(duration, at) {
    const safeDuration = Math.max(0, duration);
    durationMs = safeDuration;
    startAt = at;
    pausedRemainingMs = 0;
    state = TIMER_STATES.RUNNING;
    return remaining(at);
  }

  // Freezes the countdown at its current remaining time (state -> PAUSED).
  // A pause is NOT a reset: the frozen remainder survives until resume and
  // the wall clock moving meanwhile never erodes it. When the remaining
  // time is already zero the run completes instead — a pause at 00:00 must
  // not resurrect an expired timer.
  function pause(at = now()) {
    if (state !== TIMER_STATES.RUNNING) return remaining(at);
    const rem = remaining(at);
    if (state === TIMER_STATES.DONE) return 0;
    pausedRemainingMs = rem;
    state = TIMER_STATES.PAUSED;
    return rem;
  }

  // Resumes by restarting the countdown over exactly the frozen remaining
  // time: delta math stays drift-immune because the elapsed clock restarts
  // at the resume instant, and the run only ever counts what is left.
  function resume(at = now()) {
    if (state !== TIMER_STATES.PAUSED) return remaining(at);
    const rem = pausedRemainingMs;
    startCountdown(rem, at);
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
      return startCountdown(duration, at);
    },
    remaining,
    pause,
    resume,
    format: formatDuration,
    reset() {
      state = TIMER_STATES.IDLE;
      durationMs = 0;
      startAt = 0;
      pausedRemainingMs = 0;
    },
  };
}