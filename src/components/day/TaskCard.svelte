<script>
  // A task row used across the day view (blocks and unassigned captures;
  // Stitch "Vista Día"). The done toggle flips through the store's generic
  // setTaskDone action, which resolves the task source without the
  // component knowing where it lives. Every pending task also offers
  // "Iniciar enfoque", which sets the focus candidate and switches to the
  // focus view; completed tasks show a calm check mark instead. The
  // delete button calls the store's removeTask, which resolves the task
  // the same way and also clears a dangling focus session.
  import { actions } from '../../lib/store/app-state.svelte.js';
  import { copy } from '../../lib/i18n-copy/es.js';

  let { task } = $props();

  const deleteLabel = $derived(copy.day.deleteTaskAria.replace('{task}', task.title));

  function onCheck(event) {
    actions.setTaskDone(task.id, event.currentTarget.checked);
  }

  function startFocus() {
    actions.startFocusFromTask(task.id);
  }

  function onDelete() {
    actions.removeTask(task.id);
  }
</script>

<li class="task-card" class:is-done={task.done}>
  <label class="main">
    <span class="envelope">
      <input type="checkbox" checked={task.done} onchange={onCheck} aria-label={copy.day.taskDoneLabel} />
    </span>
    <span class="title">{task.title}</span>
  </label>
  {#if task.done}
    <span class="done-mark" aria-hidden="true">
      <span class="material-symbols-outlined">check_circle</span>
    </span>
  {:else}
    <button class="focus" type="button" onclick={startFocus}>
      <span class="material-symbols-outlined" aria-hidden="true">timer</span>
      {copy.day.startFocus}
    </button>
  {/if}
  <button class="delete" type="button" onclick={onDelete} aria-label={deleteLabel}>
    <span class="material-symbols-outlined" aria-hidden="true">delete</span>
  </button>
</li>

<style>
  .task-card {
    display: flex;
    align-items: center;
    gap: var(--space-sm, 0.5rem);
    min-width: 0;
    padding: 0.35rem 0.5rem 0.35rem 0.25rem;
    border-radius: var(--radius-field, 12px);
    background: var(--bg, #fafafa);
    border: 1px solid var(--border, #dbe3eb);
    transition: var(--transition-gentle, all 180ms ease-out);
  }

  .main {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
    min-width: 0;
    cursor: pointer;
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

  .title {
    font-size: var(--font-size-body-md, 16px);
    line-height: var(--line-height-body-md, 26px);
    color: var(--text, #1f2937);
    overflow-wrap: anywhere;
  }

  .is-done .title {
    text-decoration: line-through;
    color: var(--text-soft, #6b7280);
  }

  .focus {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    flex: 0 0 auto;
    min-height: 44px;
    padding: 0.5rem 0.75rem;
    border-radius: var(--radius-field, 12px);
    background: var(--card-bg, #ffffff);
    border: 1px solid var(--border, #dbe3eb);
    color: var(--accent, #4f6b8a);
    font-size: var(--font-size-label-md, 14px);
    line-height: var(--line-height-label-md, 20px);
    font-weight: var(--font-weight-medium, 500);
    transition: var(--transition-gentle, all 180ms ease-out);
  }

  .focus:hover {
    background: var(--accent-soft, #eff4fa);
  }

  .focus .material-symbols-outlined {
    font-size: 18px;
  }

  .done-mark {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    width: 44px;
    height: 44px;
    color: var(--success, #2f7d4f);
  }

  .done-mark .material-symbols-outlined {
    font-size: 22px;
  }

  .delete {
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
    color: var(--text-soft, #6b7280);
    border-radius: var(--radius-field, 12px);
    transition: var(--transition-gentle, all 180ms ease-out);
  }

  .delete:hover,
  .delete:focus-visible {
    background: rgba(146, 64, 14, 0.08);
    color: var(--danger, #92400e);
  }

  .delete .material-symbols-outlined {
    font-size: 20px;
  }
</style>