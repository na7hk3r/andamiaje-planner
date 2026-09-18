<script>
  // Weekly priorities (spec: Week Ritual / Elegir — max 3 priorities).
  // The cap is enforced by the store action and by the add button state.
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
    <ul>
      {#each appState.week.priorities as priority (priority.id)}
        <li>
          <span>{priority.title}</span>
          <button
            class="ghost small"
            type="button"
            onclick={() => actions.removePriority(priority.id)}
          >
            {copy.common.remove}
          </button>
        </li>
      {/each}
    </ul>
  {/if}

  <div class="add-row">
    <input
      type="text"
      bind:value={newTitle}
      placeholder={copy.day.tasksPlaceholder}
      onkeydown={(e) => e.key === 'Enter' && add()}
    />
    <button class="primary" type="button" onclick={add} disabled={atLimit || !newTitle.trim()}>
      {copy.common.add}
    </button>
  </div>

  {#if atLimit}
    <p class="hint">{copy.week.prioritiesMax}</p>
  {/if}
</div>

<style>
  .priorities {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.6rem;
    padding: 0.55rem 0.7rem;
    border-radius: 0.6rem;
    background: var(--bg, #fafafa);
    font-size: 0.95rem;
  }

  .add-row {
    display: flex;
    gap: 0.5rem;
  }

  .add-row input {
    flex: 1;
    min-width: 0;
  }

  .hint {
    margin: 0;
    font-size: 0.8rem;
    color: var(--text-soft, #6b7280);
  }

  .small {
    padding: 0.3rem 0.6rem;
    font-size: 0.8rem;
  }
</style>