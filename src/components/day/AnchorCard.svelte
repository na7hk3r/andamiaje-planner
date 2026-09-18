<script>
  // One of the four daily anchors (spec: Day View / Four independent
  // anchors). Check state flips only this anchor; the time edit persists
  // through the store. The apagado anchor renders its embedded checklist.
  import { actions } from '../../lib/store/app-state.svelte.js';
  import { copy } from '../../lib/i18n-copy/es.js';
  import ApagadoChecklist from './ApagadoChecklist.svelte';

  let { anchor } = $props();

  function onCheck(event) {
    actions.setAnchorChecked(anchor.id, event.currentTarget.checked);
  }

  function onTime(event) {
    actions.setAnchorTime(anchor.id, event.currentTarget.value);
  }
</script>

<article class="anchor-card">
  <label class="row">
    <input
      type="checkbox"
      checked={anchor.checked}
      onchange={onCheck}
      aria-label={copy.day.taskDoneLabel}
    />
    <span class="name">{copy.day.anchors[anchor.id]}</span>
  </label>

  <label class="time-field">
    <span>{copy.day.anchorTimeLabel}</span>
    <input type="time" value={anchor.time} onchange={onTime} />
  </label>

  {#if anchor.apagadoChecklist}
    <ApagadoChecklist items={anchor.apagadoChecklist} />
  {/if}
</article>

<style>
  .anchor-card {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
    padding: 1rem 1.1rem;
    border-radius: 0.9rem;
    background: var(--card-bg, #ffffff);
    box-shadow: var(--shadow-soft, 0 1px 4px rgba(15, 23, 42, 0.08));
    border: 1px solid var(--border, #e5e7eb);
  }

  .row {
    display: flex;
    align-items: center;
    gap: 0.7rem;
  }

  .name {
    font-weight: 600;
  }

  .time-field {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 0.85rem;
    color: var(--text-soft, #6b7280);
  }

  input[type='time'] {
    background: var(--bg, #fafafa);
  }
</style>