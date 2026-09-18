<script>
  // A task row used across the day view (blocks and unassigned captures).
  // Done state flips through the store's generic setTaskDone action, which
  // resolves the task source without the component knowing where it lives.
  import { actions } from '../../lib/store/app-state.svelte.js';
  import { copy } from '../../lib/i18n-copy/es.js';

  let { task } = $props();

  function onCheck(event) {
    actions.setTaskDone(task.id, event.currentTarget.checked);
  }
</script>

<label class="task-card">
  <input type="checkbox" checked={task.done} onchange={onCheck} aria-label={copy.day.taskDoneLabel} />
  <span class="title" class:done={task.done}>{task.title}</span>
</label>

<style>
  .task-card {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.55rem 0.7rem;
    border-radius: 0.6rem;
    background: var(--bg, #fafafa);
    cursor: pointer;
  }

  .title {
    font-size: 0.95rem;
    color: var(--text, #1f2937);
  }

  .done {
    text-decoration: line-through;
    color: var(--text-soft, #6b7280);
  }
</style>