<script>
  // Weekly priorities (Stitch "Ritual Semanal": 3 Prioridades). The cap is
  // enforced by the store action and by the add button state; the calm
  // "Límite de 3 alcanzado con calma" note replaces the input row when the
  // cup is reached — protective wording, never a loss counter. Each chip
  // carries a remove icon with a 44×44 target.
  import { appState, actions, PRIORITIES_MAX } from '../../lib/store/app-state.svelte.js';
  import { copy } from '../../lib/i18n-copy/es.js';

  let newTitle = $state('');

  const atLimit = $derived(appState.week.priorities.length >= PRIORITIES_MAX);

  function add() {
    if (!newTitle.trim()) return;
    actions.addPriority(newTitle);
    newTitle = '';
  }
</script>

<div class="priorities">
  {#if appState.week.priorities.length > 0}
    <ul class="chip-list">
      {#each appState.week.priorities as priority, i (priority.id)}
        <li class="chip chip-{(i % 3) + 1}">
          <span class="dot" aria-hidden="true"></span>
          <span class="chip-title">{priority.title}</span>
          <button
            class="remove"
            type="button"
            aria-label={copy.week.removePriorityAria.replace('{n}', i + 1)}
            onclick={() => actions.removePriority(priority.id)}
          >
            <span class="material-symbols-outlined" aria-hidden="true">close</span>
          </button>
        </li>
      {/each}
    </ul>
  {/if}

  {#if atLimit}
    <p class="limit-note">
      <span class="material-symbols-outlined" aria-hidden="true">lock</span>
      <span>{copy.week.prioritiesCalmLimit}</span>
    </p>
  {:else}
    <div class="add-row">
      <input
        type="text"
        bind:value={newTitle}
        placeholder={copy.day.tasksPlaceholder}
        aria-label={copy.week.prioritiesTitle}
        onkeydown={(e) => e.key === 'Enter' && add()}
      />
      <button class="primary" type="button" onclick={add} disabled={!newTitle.trim()}>
        <span class="material-symbols-outlined" aria-hidden="true">add</span>
        {copy.common.add}
      </button>
    </div>
  {/if}

  <p class="protect-note">
    <span class="material-symbols-outlined" aria-hidden="true">shield</span>
    <span>{copy.week.prioritiesProtection}</span>
  </p>
</div>

<style>
  .priorities {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm, 0.5rem);
  }

  .chip-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-sm, 0.5rem);
  }

  /* Chip rows are interactive removes: min 44px high, icon target 44×44 */
  .chip {
    display: flex;
    align-items: center;
    gap: var(--space-sm, 0.5rem);
    min-height: 44px;
    padding: 0.4rem 0.4rem 0.4rem 0.75rem;
    border-radius: var(--radius-field, 12px);
    background: var(--accent-soft, #eff4fa);
    border: 1px solid var(--border, #dbe3eb);
    transition: var(--transition-gentle, all 180ms ease-out);
  }

  .chip:hover {
    background: var(--surface-container, #f0f4f8);
  }

  .dot {
    flex: 0 0 auto;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--accent, #4f6b8a);
  }

  .chip-2 .dot {
    background: var(--success, #2f7d4f);
  }

  .chip-3 .dot {
    background: var(--danger, #92400e);
  }

  .chip-title {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: var(--font-size-body-md, 16px);
    line-height: var(--line-height-body-md, 26px);
    color: var(--text, #1f2937);
  }

  .remove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    width: 44px;
    height: 44px;
    min-height: 44px;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--text-secondary, #4b5563);
    border-radius: 50%;
  }

  .remove:hover {
    background: color-mix(in srgb, var(--danger, #92400e) 12%, #ffffff);
    color: var(--danger, #92400e);
  }

  .remove .material-symbols-outlined {
    font-size: 18px;
  }

  .add-row {
    display: flex;
    gap: var(--space-sm, 0.5rem);
  }

  .add-row input {
    flex: 1;
    min-width: 0;
  }

  .add-row .primary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    flex: 0 0 auto;
    padding-inline: 1rem;
  }

  .add-row .primary .material-symbols-outlined {
    font-size: 20px;
  }

  /* Calm cap message (non-punitive) replaces the add row at the limit */
  .limit-note {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm, 0.5rem);
    margin: 0;
    padding: 0.7rem var(--space-md, 1rem);
    border: 1px dashed var(--border, #dbe3eb);
    border-radius: var(--radius-field, 12px);
    background: var(--bg, #fafafa);
    color: var(--text-secondary, #4b5563);
    font-size: var(--font-size-label-sm, 12px);
    line-height: var(--line-height-label-sm, 16px);
  }

  .limit-note .material-symbols-outlined {
    font-size: 18px;
    color: var(--accent, #4f6b8a);
  }

  .protect-note {
    display: flex;
    align-items: flex-start;
    gap: var(--space-sm, 0.5rem);
    margin: 0;
    padding: var(--space-sm, 0.5rem) var(--space-md, 1rem);
    border-radius: var(--radius-field, 12px);
    background: var(--surface-container, #f0f4f8);
    color: var(--text-secondary, #4b5563);
    font-size: var(--font-size-body-sm, 14px);
    line-height: var(--line-height-body-sm, 20px);
  }

  .protect-note .material-symbols-outlined {
    flex: 0 0 auto;
    font-size: 20px;
    margin-top: 0.1rem;
    color: var(--accent, #4f6b8a);
  }
</style>