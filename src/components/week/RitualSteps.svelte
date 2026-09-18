<script>
  // Week ritual (Stitch "Ritual Semanal"). The guided 4-step flow keeps its
  // step-based semantics: step 1 reviews the week, step 2 picks priorities,
  // step 3 assigns each priority to a day and block, step 4 closes with a
  // calm completion banner. Above the content, a 4-step stepper shows each
  // step's visual state (done / current / scheduled) with discreet pill
  // bars — positive progress markers, never counts or losses. ritualStep,
  // answers, priorities and schedule live in the persisted week state, so
  // an interrupted ritual resumes exactly where it stopped.
  import { appState, actions } from '../../lib/store/app-state.svelte.js';
  import { copy } from '../../lib/i18n-copy/es.js';
  import PrioritiesPicker from './PrioritiesPicker.svelte';

  const step = $derived(appState.week.ritualStep);
  const stepDef = $derived(copy.week.steps[step - 1]);
  const scheduledIds = $derived(new Set(appState.week.schedule.map((s) => s.priorityId)));

  // Per-step icon while the step is the one in progress (done steps render
  // the shared check_circle glyph instead).
  const STEP_ICONS = ['edit_note', 'lightbulb', 'checklist', 'self_improvement'];

  // The two review questions stay local until "Siguiente" persists them.
  let q1 = $state(appState.week.reviewAnswers[0] ?? '');
  let q2 = $state(appState.week.reviewAnswers[1] ?? '');

  const hasReview = $derived(Boolean(q1.trim() || q2.trim()));

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

<section class="ritual" aria-label={copy.week.ritualTitle}>
  <!-- 4-step stepper with explicit visual state per step -->
  <ol class="stepper" aria-label={copy.week.stepperLabel}>
    {#each copy.week.steps as stepDef, i (i)}
      {@const n = i + 1}
      {@const isDone = n < step}
      {@const isCurrent = n === step}
      <li class="step" class:done={isDone} class:current={isCurrent}>
        <div class="step-head">
          <span class="step-index">{copy.week.stepNumber.replace('{n}', n)}</span>
          {#if isDone}
            <span class="material-symbols-outlined" aria-hidden="true">check_circle</span>
          {:else if isCurrent}
            <span class="material-symbols-outlined" aria-hidden="true">{STEP_ICONS[i]}</span>
          {:else}
            <span class="material-symbols-outlined" aria-hidden="true">radio_button_unchecked</span>
          {/if}
        </div>
        <span class="step-name">{stepDef.name}</span>
        {#if isCurrent}
          <span class="step-status">{copy.week.stepInProgress}</span>
        {/if}
        <span class="step-bar" aria-hidden="true"></span>
      </li>
    {/each}
  </ol>

  {#if step === 1}
    <div class="step-panel">
      <div class="panel-head">
        <span class="panel-number" aria-hidden="true">1</span>
        <div class="panel-titles">
          <h4>{copy.week.reviewTitle}</h4>
          <p>{copy.week.reviewSubtitle}</p>
        </div>
      </div>
      <ol class="questions">
        <li>
          <label>
            <span class="question">{stepDef.questions[0]}</span>
            <textarea rows="3" bind:value={q1}></textarea>
          </label>
        </li>
        <li>
          <label>
            <span class="question">{stepDef.questions[1]}</span>
            <textarea rows="3" bind:value={q2}></textarea>
          </label>
        </li>
      </ol>
      {#if hasReview}
        <p class="saved-note">
          <span class="material-symbols-outlined" aria-hidden="true">cloud_done</span>
          {copy.week.savedLocally}
        </p>
      {/if}
      <div class="actions">
        <button class="primary" type="button" onclick={saveReview}>
          {copy.common.next}
        </button>
      </div>
    </div>
  {:else if step === 2}
    <div class="step-panel">
      <div class="panel-head">
        <span class="panel-number" aria-hidden="true">2</span>
        <div class="panel-titles">
          <h4>{copy.week.prioritiesTitle}</h4>
          <p>{copy.week.prioritiesSubtitle}</p>
        </div>
      </div>
      <p class="hint">{stepDef.hint}</p>
      <PrioritiesPicker />
    </div>
  {:else if step === 3}
    <div class="step-panel">
      <div class="panel-head">
        <span class="panel-number" aria-hidden="true">3</span>
        <div class="panel-titles">
          <h4>{stepDef.name}</h4>
          <p>{stepDef.hint}</p>
        </div>
      </div>
      {#if appState.week.priorities.length === 0}
        <p class="empty">{copy.week.noPriorities}</p>
      {:else}
        <ul class="schedule-list">
          {#each appState.week.priorities as priority (priority.id)}
            <li class="schedule-row">
              <div class="schedule-id">
                <span class="p-title">{priority.title}</span>
                {#if scheduledIds.has(priority.id)}
                  <span class="badge">{copy.week.scheduled}</span>
                {/if}
              </div>
              <div class="schedule-picks">
                <label class="pick">
                  <span class="pick-label">{copy.week.scheduleDay}</span>
                  <select
                    aria-label={copy.week.scheduleDay}
                    value={draft[priority.id]?.day ?? copy.week.days[0]}
                    onchange={(e) => (row(priority.id).day = e.currentTarget.value)}
                  >
                    {#each copy.week.days as day (day)}
                      <option value={day}>{day}</option>
                    {/each}
                  </select>
                </label>
                <label class="pick">
                  <span class="pick-label">{copy.week.scheduleBlock}</span>
                  <select
                    aria-label={copy.week.scheduleBlock}
                    value={draft[priority.id]?.blockId ?? appState.day.blocks[0]?.id ?? ''}
                    onchange={(e) => (row(priority.id).blockId = e.currentTarget.value)}
                  >
                    {#each appState.day.blocks as block (block.id)}
                      <option value={block.id}>{block.label}</option>
                    {/each}
                  </select>
                </label>
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
              </div>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  {:else}
    <div class="step-panel">
      <div class="panel-head">
        <span class="panel-number" aria-hidden="true">4</span>
        <div class="panel-titles">
          <h4>{stepDef.name}</h4>
          <p>{stepDef.hint}</p>
        </div>
      </div>
      <div class="complete-banner">
        <div class="complete-icon" aria-hidden="true">
          <span class="material-symbols-outlined">yard</span>
        </div>
        <div class="complete-text">
          <p class="complete-title">{copy.week.completeBanner}</p>
          <p class="complete-body">{copy.week.completeBody}</p>
        </div>
        <span class="complete-chip">{copy.week.noJudgment}</span>
      </div>
      <div class="actions">
        <button class="ghost" type="button" onclick={() => actions.setRitualStep(1)}>
          {copy.week.startNewReview}
        </button>
      </div>
    </div>
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
    gap: var(--space-lg, 1.5rem);
    padding: var(--space-lg, 1.5rem);
    border-radius: var(--radius-card, 16px);
    background: var(--card-bg, #ffffff);
    box-shadow: var(--shadow-soft, 0 1px 4px rgba(15, 23, 42, 0.08));
    border: 1px solid var(--border, #dbe3eb);
  }

  /* --- 4-step stepper --- */
  .stepper {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-sm, 0.5rem);
  }

  @media (min-width: 36rem) {
    .stepper {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (min-width: 64rem) {
    .stepper {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  .step {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs, 0.25rem);
    padding: 0.75rem;
    border-radius: var(--radius-field, 12px);
    background: var(--bg, #fafafa);
    border: 1px solid var(--border, #dbe3eb);
    transition: var(--transition-gentle, all 180ms ease-out);
  }

  .step.done {
    background: var(--accent-soft, #eff4fa);
    border-color: color-mix(in srgb, var(--success, #2f7d4f) 35%, #ffffff);
  }

  .step.current {
    background: var(--surface-container, #f0f4f8);
    border-color: color-mix(in srgb, var(--accent, #4f6b8a) 40%, #ffffff);
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent, #4f6b8a) 20%, transparent);
  }

  .step-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-xs, 0.25rem);
  }

  .step-index {
    font-size: var(--font-size-label-sm, 12px);
    line-height: var(--line-height-label-sm, 16px);
    letter-spacing: var(--letter-spacing-label-sm, 0.02em);
    font-weight: var(--font-weight-medium, 500);
    color: var(--text-secondary, #4b5563);
  }

  .step.current .step-index {
    color: var(--accent, #4f6b8a);
    font-weight: var(--font-weight-semibold, 600);
  }

  .step-head .material-symbols-outlined {
    font-size: 18px;
  }

  .step.done .step-head .material-symbols-outlined {
    color: var(--success, #2f7d4f);
  }

  .step.current .step-head .material-symbols-outlined {
    color: var(--accent, #4f6b8a);
  }

  .step:not(.done):not(.current) .step-head .material-symbols-outlined {
    color: var(--text-soft, #6b7280);
  }

  .step-name {
    font-size: var(--font-size-label-md, 14px);
    line-height: var(--line-height-label-md, 20px);
    font-weight: var(--font-weight-medium, 500);
    color: var(--text, #1f2937);
  }

  .step.current .step-name {
    color: var(--accent, #4f6b8a);
    font-weight: var(--font-weight-semibold, 600);
  }

  .step-status {
    font-size: var(--font-size-label-sm, 12px);
    line-height: var(--line-height-label-sm, 16px);
    color: var(--accent, #4f6b8a);
  }

  /* Discreet pill progress bar — positive, never a counter */
  .step-bar {
    display: block;
    width: 100%;
    height: 6px;
    margin-top: var(--space-xs, 0.25rem);
    border-radius: var(--radius-button, 9999px);
    background: var(--border, #dbe3eb);
  }

  .step.done .step-bar {
    background: var(--success, #2f7d4f);
  }

  .step.current .step-bar {
    background: var(--accent, #4f6b8a);
  }

  /* --- step content panels --- */
  .step-panel {
    display: flex;
    flex-direction: column;
    gap: var(--space-md, 1rem);
  }

  .panel-head {
    display: flex;
    align-items: center;
    gap: var(--space-sm, 0.5rem);
    padding-bottom: var(--space-xs, 0.25rem);
    border-bottom: 1px solid var(--surface-container, #f0f4f8);
  }

  .panel-number {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background: var(--surface-container, #f0f4f8);
    color: var(--accent, #4f6b8a);
    font-size: var(--font-size-label-sm, 12px);
    line-height: var(--line-height-label-sm, 16px);
    font-weight: var(--font-weight-semibold, 600);
  }

  .panel-titles {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  h4 {
    margin: 0;
    font-family: var(--font-display, inherit);
    font-size: var(--font-size-headline-sm, 18px);
    line-height: var(--line-height-headline-sm, 24px);
    font-weight: var(--font-weight-medium, 500);
    color: var(--text, #1f2937);
  }

  .panel-titles p,
  .hint,
  .empty {
    margin: 0;
    font-size: var(--font-size-body-sm, 14px);
    line-height: var(--line-height-body-sm, 20px);
    color: var(--text-secondary, #4b5563);
  }

  .questions {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-md, 1rem);
  }

  .questions label {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs, 0.25rem);
  }

  .question {
    font-size: var(--font-size-label-md, 14px);
    line-height: var(--line-height-label-md, 20px);
    font-weight: var(--font-weight-medium, 500);
    color: var(--text, #1f2937);
  }

  .questions textarea {
    resize: vertical;
    background: var(--bg, #fafafa);
  }

  .saved-note {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.25rem;
    margin: 0;
    font-size: var(--font-size-label-sm, 12px);
    line-height: var(--line-height-label-sm, 16px);
    color: var(--text-secondary, #4b5563);
  }

  .saved-note .material-symbols-outlined {
    font-size: 15px;
    color: var(--success, #2f7d4f);
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-sm, 0.5rem);
  }

  .actions .primary {
    padding-inline: 1.25rem;
  }

  /* --- step 3: schedule assignment rows --- */
  .schedule-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-sm, 0.5rem);
  }

  .schedule-row {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm, 0.5rem);
    padding: var(--space-md, 1rem);
    border-radius: var(--radius-field, 12px);
    background: var(--bg, #fafafa);
    border: 1px solid var(--border, #dbe3eb);
  }

  .schedule-id {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-sm, 0.5rem);
  }

  .p-title {
    font-size: var(--font-size-body-md, 16px);
    line-height: var(--line-height-body-md, 26px);
    font-weight: var(--font-weight-semibold, 600);
    color: var(--text, #1f2937);
  }

  .badge {
    flex: 0 0 auto;
    font-size: var(--font-size-label-sm, 12px);
    line-height: var(--line-height-label-sm, 16px);
    padding: 0.25rem 0.6rem;
    border-radius: var(--radius-button, 9999px);
    background: var(--accent-soft, #eff4fa);
    color: var(--accent, #4f6b8a);
    font-weight: var(--font-weight-medium, 500);
  }

  .schedule-picks {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: var(--space-sm, 0.5rem);
  }

  .pick {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    min-width: 7.5rem;
    flex: 1 1 7.5rem;
  }

  .pick-label {
    font-size: var(--font-size-label-sm, 12px);
    line-height: var(--line-height-label-sm, 16px);
    color: var(--text-secondary, #4b5563);
  }

  .schedule-picks .primary.small {
    flex: 0 0 auto;
    padding-inline: 1rem;
  }

  /* --- step 4: calm completion banner --- */
  .complete-banner {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-md, 1rem);
    padding: var(--space-md, 1rem);
    border-radius: var(--radius-card, 16px);
    background: var(--accent-soft, #eff4fa);
    border: 1px solid var(--border, #dbe3eb);
  }

  .complete-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    background: color-mix(in srgb, var(--success, #2f7d4f) 30%, #ffffff);
    color: var(--success, #2f7d4f);
  }

  .complete-icon .material-symbols-outlined {
    font-size: 22px;
  }

  .complete-text {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    flex: 1 1 14rem;
    min-width: 0;
  }

  .complete-title {
    margin: 0;
    font-size: var(--font-size-label-md, 14px);
    line-height: var(--line-height-label-md, 20px);
    font-weight: var(--font-weight-semibold, 600);
    color: var(--text, #1f2937);
  }

  .complete-body {
    margin: 0;
    font-size: var(--font-size-body-sm, 14px);
    line-height: var(--line-height-body-sm, 20px);
    color: var(--text-secondary, #4b5563);
  }

  .complete-chip {
    flex: 0 0 auto;
    padding: 0.25rem 0.75rem;
    border-radius: var(--radius-button, 9999px);
    background: var(--card-bg, #ffffff);
    border: 1px solid var(--border, #dbe3eb);
    color: var(--text-secondary, #4b5563);
    font-size: var(--font-size-label-sm, 12px);
    line-height: var(--line-height-label-sm, 16px);
    letter-spacing: var(--letter-spacing-label-sm, 0.02em);
    font-weight: var(--font-weight-medium, 500);
    white-space: nowrap;
  }

  .step-nav {
    display: flex;
    justify-content: space-between;
    gap: var(--space-sm, 0.5rem);
  }
</style>