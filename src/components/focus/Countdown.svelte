<script>
  // Serene circular countdown (spec: Focus Mode / Circular timer).
  // All timing math lives in the pure delta-based timer (D2): this
  // component drives ticks, renders store state and owns the in-session
  // controls — presets while idle, pause/resume + complete tramo while a
  // run is active. The SVG ring is decorative (aria-hidden); the MM:SS
  // text is the real content, and a visually-hidden live region announces
  // only meaningful transitions (start/pause/resume), never the per-second
  // ticks. Space toggles pause/resume without hijacking form controls.
  import { onMount } from 'svelte';
  import { appState, focus, actions, resolveDefaultPreset } from '../../lib/store/app-state.svelte.js';
  import { copy } from '../../lib/i18n-copy/es.js';
  import { uiState } from '../../lib/store/capture.svelte.js';
  import { formatDuration, TIMER_STATES } from '../../lib/logic/timer.js';

  let { onexit = () => {} } = $props();

  const RING_RADIUS = 104;
  const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

  const running = $derived(focus.timerState === TIMER_STATES.RUNNING);
  const paused = $derived(focus.timerState === TIMER_STATES.PAUSED);
  const inRun = $derived(running || paused);
  const display = $derived(formatDuration(focus.timerRemainingMs));

  // Settings s2: the preset matching settings.defaultTimerMin is preselected
  // (highlighted); when the default falls outside the fixed presets the
  // nearest one reflects it. The setting itself is edited in SettingsView.
  const defaultPreset = $derived(resolveDefaultPreset(appState.settings.defaultTimerMin));

  // Ring progress: full circle at start, empty at zero. Static position
  // updates are safe under prefers-reduced-motion (the transition below is
  // neutralized by the global reduced-motion rule).
  const fraction = $derived(
    focus.timerDurationMs > 0
      ? Math.min(1, Math.max(0, focus.timerRemainingMs / focus.timerDurationMs))
      : 0,
  );
  const dashOffset = $derived(RING_CIRCUMFERENCE * (1 - fraction));

  let liveMessage = $state('');

  $effect(() => {
    if (!running) return;
    const id = setInterval(() => actions.timerTick(), 250);
    const onVisible = () => {
      if (document.visibilityState === 'visible') actions.timerTick();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  });

  function announce(message) {
    liveMessage = message;
  }

  function startPreset(min) {
    // Accepting the preselected default starts through the store's no-arg
    // fallback, so the run always honors appState.settings.defaultTimerMin.
    if (min === defaultPreset) actions.startTimer();
    else actions.startTimer(min * 60_000);
    announce(copy.focus.startedAnnounce);
  }

  function togglePause() {
    if (paused) {
      actions.resumeTimer();
      announce(copy.focus.resumedAnnounce);
    } else if (running) {
      actions.pauseTimer();
      announce(copy.focus.pausedAnnounce);
    }
  }

  // Space toggles pause/resume while a run is active. Form controls keep
  // their native Space behavior (typing, button activation), the capture
  // modal is left alone, and auto-repeat is ignored so holding Space cannot
  // toggle-storm the timer.
  onMount(() => {
    function onKeydown(event) {
      if (event.code !== 'Space' || event.repeat) return;
      const target = event.target;
      const formControl =
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.tagName === 'BUTTON' ||
          target.tagName === 'A' ||
          target.isContentEditable);
      if (formControl || uiState.captureOpen || !inRun) return;
      event.preventDefault();
      togglePause();
    }
    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  });
</script>

<section class="timer-card" aria-labelledby="timer-heading">
  <h2 id="timer-heading" class="visually-hidden">{copy.focus.timerTitle}</h2>

  <div class="ring-wrap">
    <svg class="ring-svg" viewBox="0 0 240 240" aria-hidden="true">
      <circle class="ring-track" cx="120" cy="120" r="104" />
      <circle
        class="ring-progress"
        cx="120"
        cy="120"
        r="104"
        stroke-dasharray={RING_CIRCUMFERENCE}
        stroke-dashoffset={dashOffset}
      />
    </svg>
    <div class="ring-center">
      <p class="time" role="timer">{display}</p>
      <p class="ring-label">{copy.focus.sustainedFocus}</p>
    </div>
  </div>

  {#if inRun}
    <div class="controls">
      <button
        class="primary control-pause"
        type="button"
        onclick={togglePause}
        aria-keyshortcuts="Space"
      >
        <span class="material-symbols-outlined" aria-hidden="true">
          {paused ? 'play_arrow' : 'pause'}
        </span>
        {paused ? copy.focus.resume : copy.focus.pause}
      </button>
      <button class="ghost control-complete" type="button" onclick={actions.completeFocusTramo}>
        <span class="material-symbols-outlined control-check" aria-hidden="true">check</span>
        {copy.focus.completeTramo}
      </button>
      <button class="exit-link" type="button" onclick={onexit} aria-keyshortcuts="Escape">
        {copy.focus.exitCalmly}
      </button>
    </div>
    <div class="kbd-hint">
      <p>
        {copy.focus.shortcutsLead}
        <kbd>{copy.focus.keys.space}</kbd>
        {copy.focus.shortcutsPause}
        <span class="kbd-sep">{copy.focus.shortcutsSep}</span>
        <kbd>{copy.focus.keys.escape}</kbd>
        {copy.focus.shortcutsExit}
      </p>
    </div>
  {:else}
    <div class="presets" role="radiogroup" aria-label={copy.focus.durationLabel}>
      {#each actions.timerPresets() as min (min)}
        <button
          class="preset"
          class:default={min === defaultPreset}
          type="button"
          role="radio"
          aria-checked={min === defaultPreset}
          onclick={() => startPreset(min)}
        >
          <span class="preset-label">{copy.focus.timerPresetShort[String(min)]}</span>
          {#if min === 30}
            <span class="recommended">{copy.focus.recommended}</span>
          {/if}
        </button>
      {/each}
    </div>
  {/if}

  <span class="visually-hidden" aria-live="polite">{liveMessage}</span>
</section>

<style>
  .timer-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-lg);
    border-radius: var(--radius-card);
    background: var(--card-bg);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-soft);
    text-align: center;
  }

  .ring-wrap {
    position: relative;
    width: 16rem;
    height: 16rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  @media (min-width: 48rem) {
    .ring-wrap {
      width: 18rem;
      height: 18rem;
    }
  }

  .ring-svg {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  }

  .ring-track {
    fill: none;
    stroke: var(--surface-container);
    stroke-width: 6;
  }

  .ring-progress {
    fill: none;
    stroke: var(--accent);
    stroke-width: 6;
    stroke-linecap: round;
    transition: stroke-dashoffset 320ms ease-out;
  }

  .ring-center {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-xs);
  }

  .time {
    margin: 0;
    font-family: var(--font-display);
    font-size: var(--font-size-display-timer-mobile);
    line-height: var(--line-height-display-timer-mobile);
    letter-spacing: var(--letter-spacing-display-timer);
    font-weight: var(--font-weight-medium);
    font-variant-numeric: tabular-nums;
  }

  @media (min-width: 48rem) {
    .time {
      font-size: var(--font-size-display-timer);
      line-height: var(--line-height-display-timer);
    }
  }

  .ring-label {
    margin: 0;
    font-size: var(--font-size-label-sm);
    line-height: var(--line-height-label-sm);
    letter-spacing: var(--letter-spacing-label-sm);
    font-weight: var(--font-weight-medium);
    color: var(--text-soft);
  }

  .presets {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: var(--space-sm);
  }

  .preset {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.125rem;
    min-width: 5.5rem;
    min-height: 44px;
    padding: 0.5rem 0.875rem;
    border-radius: var(--radius-button);
    color: var(--text-secondary);
  }

  .preset-label {
    font-size: var(--font-size-label-md);
    line-height: var(--line-height-label-md);
    font-weight: var(--font-weight-medium);
  }

  .preset.default {
    border-color: var(--accent);
    background: var(--accent-soft);
    font-weight: var(--font-weight-semibold);
    color: var(--accent);
  }

  .recommended {
    font-size: var(--font-size-label-sm);
    line-height: var(--line-height-label-sm);
    letter-spacing: var(--letter-spacing-label-sm);
    font-weight: var(--font-weight-semibold);
    color: var(--accent);
    background: var(--surface-container);
    border-radius: var(--radius-button);
    padding: 0 0.5rem;
  }

  .controls {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-sm);
    width: 100%;
    max-width: 24rem;
  }

  @media (min-width: 48rem) {
    .controls {
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: center;
    }

    .control-pause,
    .control-complete {
      flex: 1;
    }

    .exit-link {
      flex-basis: 100%;
    }
  }

  .control-pause,
  .control-complete {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    min-height: 48px;
  }

  .control-check {
    color: var(--success);
    font-size: var(--font-size-label-lg);
  }

  .exit-link {
    background: transparent;
    border: none;
    margin-top: var(--space-xs);
    color: var(--text-secondary);
    font-size: var(--font-size-label-sm);
    line-height: var(--line-height-label-sm);
    letter-spacing: var(--letter-spacing-label-sm);
    font-weight: var(--font-weight-medium);
    text-decoration: underline;
    text-underline-offset: 3px;
    min-height: 44px;
  }

  .kbd-hint {
    width: 100%;
    margin-top: var(--space-xs);
    padding-top: var(--space-md);
    border-top: 1px solid var(--border);
  }

  .kbd-hint p {
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    font-size: var(--font-size-label-sm);
    line-height: var(--line-height-label-sm);
    color: var(--text-soft);
  }

  .kbd-sep {
    margin-inline: 0.125rem;
  }

  kbd {
    font-family: var(--font-body);
    font-size: var(--font-size-label-sm);
    line-height: var(--line-height-label-sm);
    padding: 0.125rem 0.375rem;
    border-radius: 0.375rem;
    background: var(--surface-container);
    color: var(--text);
    border: 1px solid var(--border);
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    border: 0;
    clip-path: inset(50%);
    overflow: hidden;
    white-space: nowrap;
  }
</style>