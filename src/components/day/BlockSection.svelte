<script>
  // One day block (mañana / mediodía / tarde). Contains its tasks and a
  // reorder control: the block object moves wholesale through swapBlocks,
  // so its tasks always stay attached (spec: Swappable blocks / swap keeps
  // tasks). New tasks are added through the store action.
  import { appState, actions } from '../../lib/store/app-state.svelte.js';
  import { copy } from '../../lib/i18n-copy/es.js';
  import TaskCard from './TaskCard.svelte';

  let { block, index } = $props();
  let newTitle = $state('');

  const blocks = $derived(appState.day.blocks);

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
    <div class="titles">
      <h4>{block.label}</h4>
      <input
        class="time"
        type="time"
        value={block.time}
        onchange={(e) =>
          actions.updateSettings({
            blockTimes: { ...appState.settings.blockTimes, [block.id]: e.currentTarget.value },
          })}
        aria-label={copy.day.anchorTimeLabel}
      />
    </div>
    <div class="reorder" aria-label={copy.day.swapBlocks}>
      <button
        class="icon"
        type="button"
        onclick={moveUp}
        disabled={index === 0}
        aria-label={copy.common.moveUp}
      >
        ↑
      </button>
      <button
        class="icon"
        type="button"
        onclick={moveDown}
        disabled={index === blocks.length - 1}
        aria-label={copy.common.moveDown}
      >
        ↓
      </button>
    </div>
  </header>

  {#if block.tasks.length > 0}
    <ul class="tasks">
      {#each block.tasks as task (task.id)}
        <li><TaskCard {task} /></li>
      {/each}
    </ul>
  {:else}
    <p class="empty">{copy.day.emptyBlock}</p>
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
    gap: 0.7rem;
    padding: 1rem 1.1rem;
    border-radius: 0.9rem;
    background: var(--card-bg, #ffffff);
    box-shadow: var(--shadow-soft, 0 1px 4px rgba(15, 23, 42, 0.08));
    border: 1px solid var(--border, #e5e7eb);
  }

  .block-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.6rem;
  }

  .titles {
    display: flex;
    align-items: center;
    gap: 0.7rem;
  }

  h4 {
    margin: 0;
    font-size: 1rem;
  }

  .time {
    background: var(--bg, #fafafa);
  }

  .reorder {
    display: flex;
    gap: 0.3rem;
  }

  .icon {
    min-width: 2rem;
    padding: 0.3rem 0.4rem;
  }

  .tasks {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .empty {
    margin: 0;
    font-size: 0.85rem;
    color: var(--text-soft, #6b7280);
  }

  .add-row {
    display: flex;
    gap: 0.5rem;
  }

  .add-row input {
    flex: 1;
    min-width: 0;
  }
</style>