<script>
  // Primer paso helper (spec: Focus Mode / One visible task + primer paso).
  // The user names a step that takes under two minutes; when they flag the
  // step as too big, the helper suggests splitting the task into 20-45
  // minute tramos — the countdown presets above are those tramos.
  import { copy } from '../../lib/i18n-copy/es.js';

  let { primerPaso = '', tooBig = false } = $props();
</script>

<section class="helper">
  <h3>{copy.focus.primerPasoTitle}</h3>
  <p class="hint">{copy.focus.primerPasoPrompt}</p>
  <p class="hint">{copy.focus.primerPasoHint}</p>
  <input
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
</section>

<style>
  .helper {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    padding: 1rem 1.1rem;
    border-radius: 0.9rem;
    background: var(--card-bg, #ffffff);
    box-shadow: var(--shadow-soft, 0 1px 4px rgba(15, 23, 42, 0.08));
    border: 1px solid var(--border, #e5e7eb);
  }

  h3 {
    margin: 0;
    font-size: 1.05rem;
  }

  .hint {
    margin: 0;
    font-size: 0.85rem;
    color: var(--text-soft, #6b7280);
  }

  .split-hint {
    margin: 0;
    padding: 0.6rem 0.75rem;
    border-radius: 0.6rem;
    background: var(--accent-soft, #eef2f7);
    font-size: 0.85rem;
    color: var(--text, #1f2937);
  }

  .ghost.active {
    background: var(--accent-soft, #eef2f7);
    border-color: var(--accent, #4f6b8a);
  }
</style>