<script>
  // Apagado ritual checklist (Stitch "Vista Día": Ritual de Apagado). Rows
  // are day-scoped wind-down steps with a discreet, non-pressuring progress
  // hint ("2 de 6 completado") — positive completion inside today, never a
  // streak or loss counter. State stays embedded in the apagado anchor;
  // toggling one item persists through the existing store action.
  import { actions } from '../../lib/store/app-state.svelte.js';
  import { copy } from '../../lib/i18n-copy/es.js';

  let { items } = $props();

  const doneCount = $derived(items.filter((item) => item.checked).length);
  const total = $derived(items.length);
  const progressLabel = $derived(
    `${doneCount} ${copy.day.apagadoProgressOf} ${total} ${copy.day.apagadoProgressDone}`,
  );

  function toggle(item) {
    actions.toggleApagadoItem(item.id);
  }
</script>

<fieldset class="checklist">
  <legend class="visually-hidden">{copy.day.apagadoChecklistTitle}</legend>
  <div class="progress-row">
    <span class="progress-chip" aria-live="polite">{progressLabel}</span>
  </div>
  <ul>
    {#each items as item (item.id)}
      <li>
        <label class="row" class:is-done={item.checked}>
          <span class="envelope">
            <input type="checkbox" checked={item.checked} onchange={() => toggle(item)} />
          </span>
          <span class="text">{item.hint}</span>
        </label>
      </li>
    {/each}
  </ul>
</fieldset>

<style>
  .checklist {
    border: none;
    margin: 0;
    padding: 0;
  }

  /* Screen-reader-only legend: the section header already names the ritual */
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
    border: 0;
  }

  .progress-row {
    display: flex;
    justify-content: flex-end;
  }

  .progress-chip {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.75rem;
    border-radius: var(--radius-button, 9999px);
    background: var(--card-bg, #ffffff);
    border: 1px solid color-mix(in srgb, var(--success, #2f7d4f) 35%, #ffffff);
    color: var(--success, #2f7d4f);
    font-size: var(--font-size-label-sm, 12px);
    line-height: var(--line-height-label-sm, 16px);
    letter-spacing: var(--letter-spacing-label-sm, 0.02em);
    font-weight: var(--font-weight-medium, 500);
  }

  ul {
    list-style: none;
    margin: var(--space-sm, 0.5rem) 0 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.25rem 0.5rem 0.25rem 0.25rem;
    border-radius: var(--radius-field, 12px);
    border: 1px solid transparent;
    cursor: pointer;
    transition: var(--transition-gentle, all 180ms ease-out);
  }

  .row:hover {
    background: var(--accent-soft, #eff4fa);
  }

  .envelope {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    width: 44px;
    height: 44px;
  }

  .envelope input {
    width: 22px;
    height: 22px;
    padding: 0;
    accent-color: var(--success, #2f7d4f);
    cursor: pointer;
  }

  .text {
    font-size: var(--font-size-body-md, 16px);
    line-height: var(--line-height-body-md, 26px);
    color: var(--text, #1f2937);
  }

  .is-done .text {
    text-decoration: line-through;
    color: var(--text-soft, #6b7280);
  }
</style>