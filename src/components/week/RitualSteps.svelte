<script>
  // Week ritual (spec: Week Ritual / Guided 4-step ritual). The four steps
  // render in sequence; ritualStep, answers, priorities and schedule live
  // in the persisted week state, so an interrupted ritual resumes exactly
  // where it stopped (no progress is local-only).
  import { appState, actions } from '../../lib/store/app-state.svelte.js';
  import { copy } from '../../lib/i18n-copy/es.js';
  import PrioritiesPicker from './PrioritiesPicker.svelte';

  const step = $derived(appState.week.ritualStep);
  const stepDef = $derived(copy.week.steps[step - 1]);
  const scheduledIds = $derived(new Set(appState.week.schedule.map((s) => s.priorityId)));

  // The two review questions stay local until "Siguiente" persists them.
  let q1 = $state(appState.week.reviewAnswers[0] ?? '');
  let q2 = $state(appState.week.reviewAnswers[1] ?? '');

  // Per-priority scheduling draft (day label + block id), defaulted to the
  // first day and block. Values are read reactively; the row() helper only
  // writes from change handlers.
  let draft = $state({});

  function row(id) {
    if (!draft[id]) {
      draft[id] = { day: copy.week.days[0], blockId: appState.day.blocks[0]?.id ?? '' };
    }
    return draft[id];
  }

  function saveReview() {
    actions.setReviewAnswers([q1, q2]);
    actions.advanceRitualStep();
  }

  function back() {
    actions.setRitualStep(Math.max(1, step - 1));
  }
</script>

<section class="ritual">
  <h3>{copy.week.ritualTitle}</h3>

  {#if step === 1}
    <ol class="questions">
      <li>
        <label>
          <span>{stepDef.questions[0]}</span>
          <textarea rows="2" bind:value={q1}></textarea>
        </label>
      </li>
      <li>
        <label>
          <span>{stepDef.questions[1]}</span>
          <textarea rows="2" bind:value={q2}></textarea>
        </label>
      </li>
    </ol>
    <button class="primary" type="button" onclick={saveReview}>
      {copy.common.next}
    </button>
  {:else if step === 2}
    <p class="hint">{stepDef.hint}</p>
    <PrioritiesPicker />
  {:else if step === 3}
    <p class="hint">{stepDef.hint}</p>
    {#if appState.week.priorities.length === 0}
      <p class="empty">{copy.week.noPriorities}</p>
    {:else}
      <ul class="schedule-list">
        {#each appState.week.priorities as priority (priority.id)}
          <li class="schedule-row">
            <span class="p-title">{priority.title}</span>
            {#if scheduledIds.has(priority.id)}
              <span class="badge">{copy.week.scheduled}</span>
            {/if}
            <select
              aria-label={copy.week.scheduleDay}
              value={draft[priority.id]?.day ?? copy.week.days[0]}
              onchange={(e) => (row(priority.id).day = e.currentTarget.value)}
            >
              {#each copy.week.days as day (day)}
                <option value={day}>{day}</option>
              {/each}
            </select>
            <select
              aria-label={copy.week.scheduleBlock}
              value={draft[priority.id]?.blockId ?? appState.day.blocks[0]?.id ?? ''}
              onchange={(e) => (row(priority.id).blockId = e.currentTarget.value)}
            >
              {#each appState.day.blocks as block (block.id)}
                <option value={block.id}>{block.label}</option>
              {/each}
            </select>
            <button
              class="primary small"
              type="button"
              disabled={scheduledIds.has(priority.id)}
              onclick={() =>
                actions.schedulePriority(
                  priority.id,
                  row(priority.id).day,
                  row(priority.id).blockId,
                )}
            >
              {copy.common.add}
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  {:else}
    <p class="hint">{stepDef.hint}</p>
    <p class="complete">{copy.week.ritualComplete}</p>
    <button class="ghost" type="button" onclick={() => actions.setRitualStep(1)}>
      {copy.week.startNewReview}
    </button>
  {/if}

  {#if step > 1 && step < 4}
    <div class="step-nav">
      <button class="ghost" type="button" onclick={back}>
        {copy.common.back}
      </button>
      <button class="primary" type="button" onclick={actions.advanceRitualStep}>
        {copy.common.next}
      </button>
    </div>
  {/if}
</section>

<style>
  .ritual {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem 1.1rem;
    border-radius: 0.9rem;
    background: var(--card-bg, #ffffff);
    box-shadow: var(--shadow-soft, 0 1px 4px rgba(15, 23, 42, 0.08));
    border: 1px solid var(--border, #e5e7eb);
  }

  h3 {
    margin: 0;
    font-size: 1.05rem;
  }

  .hint,
  .empty {
    margin: 0;
    font-size: 0.85rem;
    color: var(--text-soft, #6b7280);
  }

  .questions {
    margin: 0;
    padding-left: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    font-size: 0.9rem;
  }

  textarea {
    resize: vertical;
  }

  .schedule-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
  }

  .schedule-row {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.5rem;
    align-items: center;
    padding: 0.7rem;
    border-radius: 0.6rem;
    background: var(--bg, #fafafa);
  }

  .schedule-row select {
    grid-column: span 1;
  }

  .p-title {
    font-size: 0.95rem;
    font-weight: 600;
  }

  .badge {
    justify-self: end;
    font-size: 0.75rem;
    padding: 0.15rem 0.5rem;
    border-radius: 999px;
    background: var(--accent-soft, #eef2f7);
    color: var(--accent, #4f6b8a);
  }

  .complete {
    margin: 0;
    font-weight: 600;
    color: var(--accent, #4f6b8a);
  }

  .step-nav {
    display: flex;
    justify-content: space-between;
    gap: 0.6rem;
    margin-top: 0.4rem;
  }
</style>