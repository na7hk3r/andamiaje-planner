<script>
  // One energy-block bucket (Stitch "Vista Día": Bloques de Tiempo). Renders
  // its time range, a calm task count (or "Descanso"), reorder controls
  // that swap whole blocks so tasks stay attached, the task list and a
  // gentle empty state. The block start time stays editable; end-of-range
  // labels are display copy from the i18n module, never persisted state.
  import { appState, actions } from '../../lib/store/app-state.svelte.js';
  import { copy } from '../../lib/i18n-copy/es.js';
  import TaskCard from './TaskCard.svelte';

  let { block, index } = $props();
  let newTitle = $state('');

  const blocks = $derived(appState.day.blocks);

  const rangeEnd = $derived(copy.day.blockEnds[block.id] ?? '');
  const countLabel = $derived(
    block.tasks.length === 0
      ? copy.day.blockRest
      : `${block.tasks.length} ${block.tasks.length === 1 ? copy.day.taskOne : copy.day.taskMany}`,
  );
  const emptyIcon = $derived(
    { manana: 'wb_sunny', mediodia: 'light_mode', tarde: 'bedtime' }[block.id] ?? 'bedtime',
  );

  function addTask() {
    if (!newTitle.trim()) return;
    actions.addTask(block.id, newTitle);
    newTitle = '';
  }

  function moveUp() {
    const prev = blocks[index - 1];
    if (prev) actions.swapBlocks(prev.id, block.id);
  }

  function moveDown() {
    const next = blocks[index + 1];
    if (next) actions.swapBlocks(block.id, next.id);
  }
</script>

<article class="block-section">
  <header class="block-header">
    <div class="headings">
      <span class="range">
        <input
          class="time"
          type="time"
          value={block.time}
          onchange={(e) =>
            actions.updateSettings({
              blockTimes: {
                ...appState.settings.blockTimes,
                [block.id]: e.currentTarget.value,
              },
            })}
          aria-label={copy.day.anchorTimeLabel}
        />
        {#if rangeEnd}
          <span aria-hidden="true">—</span>
          <span>{rangeEnd}</span>
        {/if}
      </span>
      <h4>{block.label}</h4>
    </div>
    <div class="header-side">
      <span class="count">{countLabel}</span>
      <div class="reorder" aria-label={copy.day.swapBlocks}>
        <button
          class="icon"
          type="button"
          onclick={moveUp}
          disabled={index === 0}
          aria-label={copy.common.moveUp}
        >
          <span class="material-symbols-outlined" aria-hidden="true">arrow_upward</span>
        </button>
        <button
          class="icon"
          type="button"
          onclick={moveDown}
          disabled={index === blocks.length - 1}
          aria-label={copy.common.moveDown}
        >
          <span class="material-symbols-outlined" aria-hidden="true">arrow_downward</span>
        </button>
      </div>
    </div>
  </header>

  {#if block.tasks.length > 0}
    <ul class="tasks">
      {#each block.tasks as task (task.id)}
        <TaskCard {task} />
      {/each}
    </ul>
  {:else}
    <div class="empty">
      <span class="material-symbols-outlined" aria-hidden="true">{emptyIcon}</span>
      <p>{copy.day.emptyBlockGentle}</p>
    </div>
  {/if}

  <div class="add-row">
    <input
      type="text"
      bind:value={newTitle}
      placeholder={copy.day.tasksPlaceholder}
      onkeydown={(e) => e.key === 'Enter' && addTask()}
      aria-label={copy.day.tasksPlaceholder}
    />
    <button class="primary" type="button" onclick={addTask} disabled={!newTitle.trim()}>
      {copy.common.add}
    </button>
  </div>
</article>

<style>
  .block-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-md, 1rem);
    padding: var(--space-lg, 1.5rem) var(--space-md, 1rem);
    border-radius: var(--radius-card, 16px);
    background: var(--card-bg, #ffffff);
    border: 1px solid var(--border, #dbe3eb);
    box-shadow: var(--shadow-soft, 0 1px 4px rgba(15, 23, 42, 0.08));
  }

  .block-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-sm, 0.5rem);
    border-bottom: 1px solid var(--surface-container, #f0f4f8);
    padding-bottom: var(--space-sm, 0.5rem);
  }

  .headings {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    min-width: 0;
  }

  .range {
    display: flex;
    align-items: baseline;
    gap: 0.25rem;
    font-size: var(--font-size-label-sm, 12px);
    line-height: var(--line-height-label-sm, 16px);
    letter-spacing: var(--letter-spacing-label-sm, 0.02em);
    font-weight: var(--font-weight-medium, 500);
    color: var(--accent, #4f6b8a);
  }

  .time {
    width: 5.2rem;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--accent, #4f6b8a);
    font-family: inherit;
    font-size: inherit;
    font-weight: inherit;
    letter-spacing: inherit;
    line-height: inherit;
    min-height: 24px;
  }

  h4 {
    margin: 0;
    font-family: var(--font-display, inherit);
    font-size: var(--font-size-headline-sm, 18px);
    line-height: var(--line-height-headline-sm, 24px);
    font-weight: var(--font-weight-medium, 500);
    color: var(--text, #1f2937);
  }

  .header-side {
    display: flex;
    align-items: center;
    gap: var(--space-sm, 0.5rem);
    flex: 0 0 auto;
  }

  .count {
    padding: 0.2rem 0.6rem;
    border-radius: var(--radius-chip, 8px);
    background: var(--surface-container, #f0f4f8);
    color: var(--text-secondary, #4b5563);
    font-size: var(--font-size-label-sm, 12px);
    line-height: var(--line-height-label-sm, 16px);
    letter-spacing: var(--letter-spacing-label-sm, 0.02em);
    white-space: nowrap;
  }

  .reorder {
    display: flex;
    gap: 0.125rem;
  }

  .icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    min-height: 44px;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--text-soft, #6b7280);
    border-radius: var(--radius-field, 12px);
  }

  .icon:hover:not(:disabled) {
    background: var(--accent-soft, #eff4fa);
    color: var(--accent, #4f6b8a);
  }

  .icon:disabled {
    opacity: 0.35;
  }

  .icon .material-symbols-outlined {
    font-size: 22px;
  }

  .tasks {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-sm, 0.5rem);
  }

  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm, 0.5rem);
    padding: var(--space-lg, 1.5rem) var(--space-md, 1rem);
    border: 1px dashed var(--border, #dbe3eb);
    border-radius: var(--radius-field, 12px);
    background: var(--bg, #fafafa);
    text-align: center;
  }

  .empty .material-symbols-outlined {
    font-size: 32px;
    color: var(--accent, #4f6b8a);
    opacity: 0.8;
  }

  .empty p {
    margin: 0;
    max-width: 18rem;
    color: var(--text-secondary, #4b5563);
    font-size: var(--font-size-body-md, 16px);
    line-height: var(--line-height-body-md, 26px);
  }

  .add-row {
    display: flex;
    gap: var(--space-sm, 0.5rem);
  }

  .add-row input {
    flex: 1;
    min-width: 0;
  }
</style>