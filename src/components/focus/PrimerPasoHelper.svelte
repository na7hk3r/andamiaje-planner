<script>
  // Primer paso helper (spec: Focus Mode / Gentle helper banner). The user
  // names a step that takes under two minutes; when they flag the step as
  // too big, the helper suggests splitting the task into 20-45 minute
  // tramos — the countdown presets above are those tramos.
  import { copy } from '../../lib/i18n-copy/es.js';

  let { primerPaso = '', tooBig = false } = $props();
</script>

<section class="helper" aria-labelledby="helper-title">
  <div class="helper-icon" aria-hidden="true">
    <span class="material-symbols-outlined">lightbulb</span>
  </div>
  <div class="helper-body">
    <p class="helper-title" id="helper-title">{copy.focus.primerPasoTitle}</p>
    <p class="hint">{copy.focus.primerPasoHint}</p>
    <label class="visually-hidden" for="primer-paso">{copy.focus.primerPasoPrompt}</label>
    <input
      id="primer-paso"
      type="text"
      bind:value={primerPaso}
      placeholder={copy.focus.primerPasoPrompt}
    />
    <button
      class="ghost"
      class:active={tooBig}
      type="button"
      onclick={() => (tooBig = !tooBig)}
      aria-pressed={tooBig}
    >
      {copy.focus.primerPasoTooBig}
    </button>
    {#if tooBig}
      <p class="split-hint">{copy.focus.primerPasoSplit}</p>
    {/if}
  </div>
</section>

<style>
  .helper {
    display: flex;
    align-items: flex-start;
    gap: var(--space-md);
    padding: var(--space-md) var(--space-lg);
    border-radius: var(--radius-card);
    background: var(--surface-container);
    border: 1px solid var(--border);
  }

  .helper-icon {
    flex: 0 0 2rem;
    width: 2rem;
    height: 2rem;
    margin-top: 0.125rem;
    border-radius: 50%;
    background: var(--card-bg);
    color: var(--accent);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .helper-icon .material-symbols-outlined {
    font-size: 20px;
  }

  .helper-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .helper-title {
    margin: 0;
    font-size: var(--font-size-label-md);
    line-height: var(--line-height-label-md);
    letter-spacing: -0.01em;
    font-weight: var(--font-weight-semibold);
    color: var(--accent);
  }

  .hint {
    margin: 0;
    font-size: 0.85rem;
    color: var(--text-secondary);
  }

  .split-hint {
    margin: 0;
    padding: 0.6rem 0.75rem;
    border-radius: 0.6rem;
    background: var(--card-bg);
    font-size: 0.85rem;
    color: var(--text);
  }

  .ghost.active {
    background: var(--card-bg);
    border-color: var(--accent);
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