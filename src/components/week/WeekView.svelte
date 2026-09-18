<script>
  // Week view (Stitch "Ritual Semanal"). Calm page header, a retomar/pausar
  // banner when the ritual is mid-way (steps 2–3), the guided ritual, and
  // the suggested weekly distribution grid mapped from the persisted
  // schedule. The banner's pause is a session-only dismissal: it never
  // touches stored ritual state, so nothing auto-resets (D6). The grid is
  // display-only — a suggested map, not a streak tracker; days without an
  // assignment show the calm "buffer libre" state.
  import { appState } from '../../lib/store/app-state.svelte.js';
  import { copy } from '../../lib/i18n-copy/es.js';
  import RitualSteps from './RitualSteps.svelte';

  const resumed = $derived(
    appState.week.ritualStep > 1 && appState.week.ritualStep < 4,
  );
  // Session-only dismissal. Pausing never writes to the store, so reloading
  // the week view shows the banner again exactly where the ritual stopped.
  let paused = $state(false);

  // Display-only week dates (D6): derived from the local clock at render,
  // never written to state. Monday of the current week, then the 4 weekdays.
  const weekDays = $derived.by(() => {
    const now = new Date();
    const back = (now.getDay() + 6) % 7; // days since Monday
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - back);
    return Array.from({ length: 5 }, (_, i) => {
      const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
      return d.getDate();
    });
  });

  const rangeLabel = $derived(
    copy.week.weekRange
      .replace('{start}', `${copy.week.days[0]} ${weekDays[0]}`)
      .replace('{end}', `${copy.week.days[4]} ${weekDays[4]}`),
  );

  // Day columns for the distribution grid: schedule entries are grouped by
  // the day label chosen in the ritual step 3. Entries whose priority was
  // removed since scheduling are dropped from the view (the stored schedule
  // shape itself is left untouched).
  const byDay = $derived.by(() => {
    const map = new Map();
    for (const item of appState.week.schedule) {
      const list = map.get(item.day) ?? [];
      list.push(item);
      map.set(item.day, list);
    }
    return map;
  });

  function priorityFor(item) {
    const idx = appState.week.priorities.findIndex((p) => p.id === item.priorityId);
    return idx >= 0 ? { priority: appState.week.priorities[idx], n: idx + 1 } : null;
  }

  function blockLabel(item) {
    return appState.day.blocks.find((b) => b.id === item.blockId)?.label ?? '';
  }
</script>

<div class="week-view">
  <header class="page-header">
    <h2>{copy.week.pageTitle}</h2>
    <p class="page-subtitle">{copy.week.pageSubtitle}</p>
  </header>

  {#if resumed && !paused}
    <div class="resume-banner">
      <span class="material-symbols-outlined" aria-hidden="true">spa</span>
      <p>{copy.week.resumeBanner}</p>
      <button class="pause-btn" type="button" onclick={() => (paused = true)}>
        {copy.week.pauseForToday}
      </button>
    </div>
  {/if}

  <RitualSteps />

  <section class="distribution" aria-labelledby="distribution-title">
    <header class="section-head">
      <span class="material-symbols-outlined" aria-hidden="true">view_week</span>
      <div class="section-titles">
        <h3 id="distribution-title">{copy.week.distributionTitle}</h3>
        <p>{copy.week.distributionSubtitle}</p>
      </div>
      <span class="range-chip">{rangeLabel}</span>
    </header>
    <div class="day-grid">
      {#each copy.week.days.slice(0, 5) as day, di (day)}
        {@const entries = byDay.get(day) ?? []}
        {@const visible = entries.map(priorityFor).filter(Boolean)}
        <article class="day-col">
          <div class="day-head">
            <span class="day-name">{day}</span>
            <span class="day-num">{weekDays[di]}</span>
          </div>
          <div class="day-body">
            {#each visible as found (found.priority.id)}
              <div class="assign assign-{(found.n % 3) + 1}">
                <span class="assign-tag">
                  <span class="dot" aria-hidden="true"></span>
                  {copy.week.priorityTag.replace('{n}', found.n)}
                </span>
                <span class="assign-title">{found.priority.title}</span>
                {#if blockLabel(entries.find((e) => e.priorityId === found.priority.id))}
                  <span class="assign-block">
                    {blockLabel(entries.find((e) => e.priorityId === found.priority.id))}
                  </span>
                {/if}
              </div>
            {/each}

            {#if visible.length === 0}
              <div class="buffer">
                <span class="material-symbols-outlined" aria-hidden="true">cloud_download</span>
                <span class="buffer-title">{copy.week.bufferFree}</span>
                <span class="buffer-body">{copy.week.bufferFreeBody}</span>
              </div>
            {:else}
              <div class="soft-buffer">{copy.week.softBuffer}</div>
            {/if}
          </div>
        </article>
      {/each}
    </div>
  </section>
</div>

<style>
  .week-view {
    display: flex;
    flex-direction: column;
    gap: var(--space-xl, 2.5rem);
    width: 100%;
    max-width: 65rem;
    margin-inline: auto;
    padding: var(--space-lg, 1.5rem) var(--gutter-mobile, 1rem)
      var(--space-xl, 2.5rem);
  }

  @media (min-width: 48rem) {
    .week-view {
      padding-inline: var(--gutter, 1.5rem);
    }
  }

  .page-header {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  h2 {
    margin: 0;
    font-family: var(--font-display, inherit);
    font-size: var(--font-size-headline-lg-mobile, 26px);
    line-height: var(--line-height-headline-lg-mobile, 34px);
    letter-spacing: var(--letter-spacing-headline-lg-mobile, -0.01em);
    font-weight: var(--font-weight-semibold, 600);
    color: var(--text, #1f2937);
  }

  @media (min-width: 48rem) {
    h2 {
      font-size: var(--font-size-headline-lg, 32px);
      line-height: var(--line-height-headline-lg, 40px);
      letter-spacing: var(--letter-spacing-headline-lg, -0.015em);
    }
  }

  .page-subtitle {
    margin: 0;
    max-width: 42rem;
    font-size: var(--font-size-body-md, 16px);
    line-height: var(--line-height-body-md, 26px);
    color: var(--text-secondary, #4b5563);
  }

  /* Retomar / pausar banner: resume wording + a session-only pause */
  .resume-banner {
    display: flex;
    align-items: center;
    gap: var(--space-md, 1rem);
    padding: var(--space-md, 1rem);
    border-radius: var(--radius-field, 12px);
    border: 1px solid var(--border, #dbe3eb);
    background: var(--accent-soft, #eff4fa);
  }

  .resume-banner .material-symbols-outlined {
    flex: 0 0 auto;
    font-size: 22px;
    color: var(--accent, #4f6b8a);
  }

  .resume-banner p {
    flex: 1 1 auto;
    min-width: 0;
    margin: 0;
    font-size: var(--font-size-body-sm, 14px);
    line-height: var(--line-height-body-sm, 20px);
    color: var(--text-secondary, #4b5563);
  }

  .pause-btn {
    flex: 0 0 auto;
    min-height: 44px;
    padding: 0.5rem 1rem;
    border-radius: var(--radius-button, 9999px);
    border: none;
    background: transparent;
    color: var(--accent, #4f6b8a);
    font-size: var(--font-size-label-md, 14px);
    line-height: var(--line-height-label-md, 20px);
    font-weight: var(--font-weight-medium, 500);
  }

  .pause-btn:hover {
    background: var(--surface-container, #f0f4f8);
  }

  /* --- suggested weekly distribution --- */
  .distribution {
    display: flex;
    flex-direction: column;
    gap: var(--space-md, 1rem);
  }

  .section-head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-sm, 0.5rem);
  }

  .section-head .material-symbols-outlined {
    font-size: 22px;
    color: var(--accent, #4f6b8a);
  }

  .section-titles {
    display: flex;
    flex-direction: column;
    gap: 0;
    flex: 1 1 auto;
    min-width: 0;
  }

  h3 {
    margin: 0;
    font-family: var(--font-display, inherit);
    font-size: var(--font-size-headline-sm, 18px);
    line-height: var(--line-height-headline-sm, 24px);
    font-weight: var(--font-weight-medium, 500);
    color: var(--text, #1f2937);
  }

  .section-titles p {
    margin: 0;
    font-size: var(--font-size-label-sm, 12px);
    line-height: var(--line-height-label-sm, 16px);
    letter-spacing: var(--letter-spacing-label-sm, 0.02em);
    color: var(--text-secondary, #4b5563);
  }

  .range-chip {
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

  .day-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-md, 1rem);
    align-items: stretch;
  }

  @media (min-width: 40rem) {
    .day-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (min-width: 64rem) {
    .day-grid {
      grid-template-columns: repeat(5, 1fr);
    }
  }

  .day-col {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm, 0.5rem);
    padding: var(--space-md, 1rem);
    border-radius: var(--radius-card, 16px);
    background: var(--card-bg, #ffffff);
    border: 1px solid var(--border, #dbe3eb);
  }

  .day-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--space-sm, 0.5rem);
    padding-bottom: var(--space-xs, 0.25rem);
    border-bottom: 1px solid var(--surface-container, #f0f4f8);
  }

  .day-name {
    font-size: var(--font-size-label-md, 14px);
    line-height: var(--line-height-label-md, 20px);
    font-weight: var(--font-weight-semibold, 600);
    color: var(--text, #1f2937);
  }

  .day-num {
    font-size: var(--font-size-label-sm, 12px);
    line-height: var(--line-height-label-sm, 16px);
    color: var(--text-soft, #6b7280);
  }

  .day-body {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm, 0.5rem);
    flex: 1 1 auto;
  }

  .assign {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    padding: 0.6rem 0.75rem;
    border-radius: var(--radius-field, 12px);
    background: var(--accent-soft, #eff4fa);
    border: 1px solid color-mix(in srgb, var(--accent, #4f6b8a) 25%, #ffffff);
  }

  .assign-2 {
    border-color: color-mix(in srgb, var(--success, #2f7d4f) 25%, #ffffff);
  }

  .assign-3 {
    border-color: color-mix(in srgb, var(--danger, #92400e) 25%, #ffffff);
  }

  .assign-tag {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: var(--font-size-label-sm, 12px);
    line-height: var(--line-height-label-sm, 16px);
    font-weight: var(--font-weight-medium, 500);
    color: var(--accent, #4f6b8a);
  }

  .assign-2 .assign-tag {
    color: var(--success, #2f7d4f);
  }

  .assign-3 .assign-tag {
    color: var(--danger, #92400e);
  }

  .assign-tag .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }

  .assign-title {
    font-size: var(--font-size-body-sm, 14px);
    line-height: var(--line-height-body-sm, 20px);
    color: var(--text, #1f2937);
  }

  .assign-block {
    font-size: var(--font-size-label-sm, 12px);
    line-height: var(--line-height-label-sm, 16px);
    color: var(--text-secondary, #4b5563);
  }

  /* Calm "buffer libre" state — suggested space, never a gap that "counts" */
  .buffer {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.125rem;
    flex: 1 1 auto;
    padding: var(--space-md, 1rem) var(--space-sm, 0.5rem);
    border: 1px dashed var(--border, #dbe3eb);
    border-radius: var(--radius-field, 12px);
    background: var(--bg, #fafafa);
    text-align: center;
  }

  .buffer .material-symbols-outlined {
    font-size: 20px;
    color: var(--success, #2f7d4f);
    margin-bottom: 0.125rem;
  }

  .buffer-title {
    font-size: var(--font-size-label-md, 14px);
    line-height: var(--line-height-label-md, 20px);
    font-weight: var(--font-weight-medium, 500);
    color: var(--text, #1f2937);
  }

  .buffer-body {
    font-size: var(--font-size-label-sm, 12px);
    line-height: var(--line-height-label-sm, 16px);
    color: var(--text-secondary, #4b5563);
  }

  .soft-buffer {
    padding: 0.5rem 0.6rem;
    border-radius: var(--radius-field, 12px);
    background: var(--card-bg, #ffffff);
    border: 1px solid var(--border, #dbe3eb);
    color: var(--text-secondary, #4b5563);
    font-size: var(--font-size-label-sm, 12px);
    line-height: var(--line-height-label-sm, 16px);
    text-align: center;
  }
</style>