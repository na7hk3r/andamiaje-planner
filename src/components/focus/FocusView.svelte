<script>
  // Focus mode (spec: Focus Mode). Exactly one task is visible at a time —
  // the rest sit behind the "next task" affordance on the reward step (no
  // todo wall). Stages: picker -> primer paso helper + task hero + countdown
  // -> reward -> next/back. Esc anywhere in the focus view returns to the
  // day with the calm exit (no completion, nothing counted); the capture
  // modal keeps its own Esc handling while open. Timer math runs through
  // the delta-based timer API; this component only drives the view state.
  import { onMount } from 'svelte';
  import { appState, focus, actions } from '../../lib/store/app-state.svelte.js';
  import { copy } from '../../lib/i18n-copy/es.js';
  import { uiState } from '../../lib/store/capture.svelte.js';
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

  // Block chip label: the task's block when assigned, "Sin asignar" for
  // captures and week priorities.
  const blockLabel = $derived(
    focus.currentTask?.blockId ? copy.day.blocks[focus.currentTask.blockId] : copy.day.unassigned,
  );

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

  // Calm exit (spec: "Salir con calma al día" / Esc): back to the day view
  // without marking anything done — nothing is lost and nothing counts.
  function exitCalmly() {
    actions.timerReset();
    actions.setView('day');
  }

  onMount(() => {
    function onKeydown(event) {
      if (uiState.captureOpen || event.key !== 'Escape') return;
      event.preventDefault();
      exitCalmly();
    }
    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  });
</script>

<div class="focus-view">
  {#if rewarded}
    <RewardStep
      taskTitle={focus.reward.title}
      hasNext={pending.length > 0}
      onnext={goNext}
      onback={exitCalmly}
    />
  {:else if inSession}
    <PrimerPasoHelper bind:primerPaso bind:tooBig />
    <article class="task-hero">
      <div class="hero-top">
        <span class="block-chip">
          <span class="block-dot" aria-hidden="true"></span>
          {copy.focus.blockChip.replace('{label}', blockLabel)}
        </span>
        <span class="one-thing">
          <span class="material-symbols-outlined" aria-hidden="true">visibility</span>
          {copy.focus.oneThingAtATime}
        </span>
      </div>
      <h1 class="task-title">{focus.currentTask.title}</h1>
    </article>
    <Countdown onexit={exitCalmly} />
  {:else if pending.length > 0}
    <PrimerPasoHelper bind:primerPaso bind:tooBig />
    <h1 class="pick-heading">{copy.focus.title}</h1>
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
    <PrimerPasoHelper bind:primerPaso bind:tooBig />
    <h1 class="pick-heading">{copy.focus.title}</h1>
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

  .task-hero {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    padding: var(--space-lg);
    border-radius: var(--radius-card);
    background: var(--card-bg);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-soft);
  }

  .hero-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-sm);
    flex-wrap: wrap;
  }

  .block-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.25rem 0.75rem;
    border-radius: var(--radius-button);
    background: var(--surface-container);
    color: var(--accent);
    font-size: var(--font-size-label-sm);
    line-height: var(--line-height-label-sm);
    letter-spacing: var(--letter-spacing-label-sm);
    font-weight: var(--font-weight-medium);
  }

  .block-dot {
    width: 0.375rem;
    height: 0.375rem;
    border-radius: 50%;
    background: var(--accent);
  }

  .one-thing {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-size: var(--font-size-label-sm);
    line-height: var(--line-height-label-sm);
    color: var(--text-soft);
  }

  .one-thing .material-symbols-outlined {
    font-size: var(--font-size-label-md);
  }

  .task-title {
    margin: 0;
    font-family: var(--font-display);
    font-size: var(--font-size-headline-sm);
    line-height: var(--line-height-headline-sm);
    letter-spacing: -0.01em;
    font-weight: var(--font-weight-semibold);
    color: var(--text);
  }

  @media (min-width: 48rem) {
    .task-title {
      font-size: var(--font-size-headline-md);
      line-height: var(--line-height-headline-md);
    }
  }

  .pick-heading {
    margin: 0;
    font-family: var(--font-display);
    font-size: var(--font-size-headline-lg-mobile);
    line-height: var(--line-height-headline-lg-mobile);
    letter-spacing: var(--letter-spacing-headline-lg-mobile);
    font-weight: var(--font-weight-semibold);
  }

  @media (min-width: 48rem) {
    .pick-heading {
      font-size: var(--font-size-headline-lg);
      line-height: var(--line-height-headline-lg);
      letter-spacing: var(--letter-spacing-headline-lg);
    }
  }

  .hint {
    margin: 0;
    font-size: 0.85rem;
    color: var(--text-soft);
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
    background: var(--card-bg);
    border: 1px solid var(--border);
    color: var(--text);
    box-shadow: var(--shadow-soft);
  }

  .empty {
    margin: 0;
    font-size: 0.9rem;
    color: var(--text-soft);
  }
</style>