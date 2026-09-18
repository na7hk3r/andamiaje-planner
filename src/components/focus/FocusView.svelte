<script>
  // Focus mode (spec: Focus Mode). Exactly one task is visible at a time —
  // the rest sit behind the "next task" affordance on the reward step (no
  // todo wall). Stages: picker -> one task + primer paso + countdown ->
  // reward -> next/back. Timer math runs through the delta-based timer API;
  // this component only drives ticks and renders store state.
  import { appState, focus, actions } from '../../lib/store/app-state.svelte.js';
  import { copy } from '../../lib/i18n-copy/es.js';
  import PrimerPasoHelper from './PrimerPasoHelper.svelte';
  import Countdown from './Countdown.svelte';
  import RewardStep from './RewardStep.svelte';

  let primerPaso = $state('');
  let tooBig = $state(false);

  const pending = $derived.by(() => {
    const list = [];
    for (const block of appState.day.blocks) {
      for (const task of block.tasks) {
        if (!task.done) list.push({ taskId: task.id, title: task.title });
      }
    }
    for (const task of appState.day.captured) {
      if (!task.done) list.push({ taskId: task.id, title: task.title });
    }
    for (const task of appState.week.priorities) {
      if (!task.done) list.push({ taskId: task.id, title: task.title });
    }
    return list;
  });

  const inSession = $derived(focus.currentTask !== null);
  const rewarded = $derived(focus.reward !== null);

  function pick(task) {
    primerPaso = '';
    tooBig = false;
    actions.startFocus(task.taskId);
  }

  function goNext() {
    const next = pending.find((t) => t.taskId !== focus.currentTask?.taskId);
    actions.timerReset();
    if (next) actions.startFocus(next.taskId);
  }

  function goBackToDay() {
    actions.timerReset();
    actions.setView('day');
  }
</script>

<div class="focus-view">
  <h2>{copy.focus.title}</h2>

  {#if rewarded}
    <RewardStep
      taskTitle={focus.reward.title}
      hasNext={pending.length > 0}
      onnext={goNext}
      onback={goBackToDay}
    />
  {:else if inSession}
    <p class="hint">{copy.focus.oneTaskHint}</p>
    <article class="session-task card">
      <h3>{focus.currentTask.title}</h3>
    </article>
    <PrimerPasoHelper bind:primerPaso bind:tooBig />
    <Countdown />
  {:else if pending.length > 0}
    <p class="hint">{copy.focus.chooseTaskHint}</p>
    <ul class="picker">
      {#each pending as task (task.taskId)}
        <li>
          <button class="pick" type="button" onclick={() => pick(task)}>
            {task.title}
          </button>
        </li>
      {/each}
    </ul>
  {:else}
    <p class="empty">{copy.focus.noTasks}</p>
  {/if}
</div>

<style>
  .focus-view {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    padding: 1rem 1.25rem;
    max-width: 42rem;
    margin-inline: auto;
  }

  h2 {
    margin: 0;
    font-size: 1.4rem;
  }

  h3 {
    margin: 0;
    font-size: 1.15rem;
  }

  .hint {
    margin: 0;
    font-size: 0.85rem;
    color: var(--text-soft, #6b7280);
  }

  .card {
    padding: 1rem 1.1rem;
    border-radius: 0.9rem;
    background: var(--card-bg, #ffffff);
    box-shadow: var(--shadow-soft, 0 1px 4px rgba(15, 23, 42, 0.08));
    border: 1px solid var(--border, #e5e7eb);
  }

  .picker {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .pick {
    display: block;
    width: 100%;
    text-align: left;
    padding: 0.8rem 1rem;
    border-radius: 0.7rem;
    background: var(--card-bg, #ffffff);
    border: 1px solid var(--border, #e5e7eb);
    color: var(--text, #1f2937);
    box-shadow: var(--shadow-soft, 0 1px 4px rgba(15, 23, 42, 0.08));
  }

  .empty {
    margin: 0;
    font-size: 0.9rem;
    color: var(--text-soft, #6b7280);
  }
</style>