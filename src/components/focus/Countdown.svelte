<script>
  // Full-screen countdown (spec: Focus Mode / Full-screen countdown).
  // All timing math lives in the pure delta-based timer (D2): this
  // component starts it via the store action, ticks it on an interval, and
  // re-syncs when the tab becomes visible again. On completion the store
  // marks the task done and sets the reward reference; the parent then
  // swaps to the reward step. The visible-tab limitation is documented
  // in-app with i18n copy while the countdown runs.
  import { appState, focus, actions, resolveDefaultPreset } from '../../lib/store/app-state.svelte.js';
  import { copy } from '../../lib/i18n-copy/es.js';
  import { formatDuration, TIMER_STATES } from '../../lib/logic/timer.js';

  let customMin = $state('');

  const running = $derived(focus.timerState === TIMER_STATES.RUNNING);
  const display = $derived(formatDuration(focus.timerRemainingMs));

  // Settings s2: the preset matching settings.defaultTimerMin is preselected
  // (highlighted); when the default falls outside the fixed presets the
  // nearest one reflects it. The setting itself is edited in SettingsView.
  const defaultPreset = $derived(resolveDefaultPreset(appState.settings.defaultTimerMin));

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

  function startPreset(min) {
    // Accepting the preselected default starts through the store's no-arg
    // fallback, so the run always honors appState.settings.defaultTimerMin
    // (the preset chip is only the visible reflection of that setting).
    if (min === defaultPreset) {
      actions.startTimer();
      return;
    }
    actions.startTimer(min * 60_000);
  }

  function startCustom() {
    const min = Number(customMin);
    if (Number.isFinite(min) && min > 0) actions.startTimer(min * 60_000);
  }
</script>

{#if running}
  <div class="overlay" role="timer">
    <p class="time">{display}</p>
    <p class="note">{copy.focus.timerVisibleNote}</p>
    <button class="ghost" onclick={actions.timerReset}>{copy.focus.timerReset}</button>
  </div>
{:else}
  <section class="countdown-card card">
    <h3>{copy.focus.timerTitle}</h3>

    {#if focus.timerDurationMs > 0}
      <p class="time idle-time">{display}</p>
    {/if}

    <div class="presets">
      {#each actions.timerPresets() as min (min)}
        <button
          class="preset"
          class:default={min === defaultPreset}
          type="button"
          aria-pressed={min === defaultPreset}
          onclick={() => startPreset(min)}
        >
          {copy.focus.timerPresets[String(min)]}
        </button>
      {/each}
    </div>

    <div class="custom">
      <label for="custom-minutes">{copy.focus.timerCustomMinutes}</label>
      <input
        id="custom-minutes"
        type="number"
        min="1"
        max="120"
        bind:value={customMin}
        aria-label={copy.focus.timerCustomMinutes}
      />
      <button
        class="primary"
        type="button"
        onclick={startCustom}
        disabled={!(Number(customMin) > 0)}
      >
        {copy.focus.timerStart}
      </button>
    </div>

    {#if focus.timerDurationMs > 0}
      <button class="ghost" type="button" onclick={actions.timerReset}>
        {copy.focus.timerReset}
      </button>
    {/if}
  </section>
{/if}

<style>
  .card {
    padding: 1rem 1.1rem;
    border-radius: 0.9rem;
    background: var(--card-bg, #ffffff);
    box-shadow: var(--shadow-soft, 0 1px 4px rgba(15, 23, 42, 0.08));
    border: 1px solid var(--border, #e5e7eb);
  }

  h3 {
    margin: 0 0 0.85rem;
    font-size: 1.05rem;
  }

  .overlay {
    position: fixed;
    inset: 0;
    z-index: 30;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.25rem;
    background: var(--card-bg, #ffffff);
  }

  .time {
    margin: 0;
    font-variant-numeric: tabular-nums;
    font-size: 4rem;
    font-weight: 700;
    letter-spacing: 0.02em;
  }

  .idle-time {
    font-size: 2rem;
    color: var(--text-soft, #6b7280);
    margin-bottom: 0.6rem;
  }

  .note {
    margin: 0;
    font-size: 0.85rem;
    color: var(--text-soft, #6b7280);
    max-width: 22rem;
    text-align: center;
  }

  .presets {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 0.85rem;
  }

  .preset {
    flex: 1;
    min-width: 5.5rem;
  }

  .preset.default {
    border-color: var(--accent, #4f6b8a);
    background: var(--accent-soft, #eef2f7);
    font-weight: 600;
    color: var(--accent, #4f6b8a);
  }

  .custom {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: var(--text-soft, #6b7280);
  }

  .custom input {
    width: 5rem;
  }
</style>