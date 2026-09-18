<script>
  // Day view (Stitch "Vista Día"). Calm greeting header ("Soporte del Día"
  // plus the local date), an encouragement banner and the recovery banner,
  // then the anchors grid, the energy-block bento, the standalone
  // "Ritual de Apagado" and the unassigned captures. All copy comes from
  // the i18n module; state flows only through the store.
  import { appState, actions } from '../../lib/store/app-state.svelte.js';
  import { copy } from '../../lib/i18n-copy/es.js';
  import AnchorCard from './AnchorCard.svelte';
  import BlockSection from './BlockSection.svelte';
  import TaskCard from './TaskCard.svelte';
  import ApagadoChecklist from './ApagadoChecklist.svelte';

  // Local date as gentle display copy, e.g. "Jueves, 24 de Octubre".
  function formatToday() {
    const date = new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(new Date());
    return date.charAt(0).toUpperCase() + date.slice(1);
  }

  const dateLine = $derived(`${formatToday()} · ${copy.day.paceOpen}`);

  const resume = $derived.by(() => {
    const anchor = actions.nextResumeAnchor();
    return anchor ? { id: anchor.id, label: copy.day.anchors[anchor.id] } : null;
  });

  // The ritual rows live inside the apagado anchor (persisted shape); the
  // day view renders them as the standalone "Ritual de Apagado" section.
  const apagadoItems = $derived(
    appState.day.anchors.find((a) => a.id === 'apagado')?.apagadoChecklist ?? [],
  );
</script>

<div class="day-view">
  <header class="page-header">
    <h2>{copy.day.pageTitle}</h2>
    <p class="date-line">{dateLine}</p>
  </header>

  <p class="calm-banner">
    <span class="material-symbols-outlined" aria-hidden="true">info</span>
    <span>{copy.day.calmBanner}</span>
  </p>

  {#if resume}
    <p class="calm-banner resume-banner">
      <span class="material-symbols-outlined" aria-hidden="true">schedule</span>
      <span>
        <strong>{copy.recovery.resumeNextAnchor}:</strong> {resume.label}
      </span>
    </p>
  {/if}

  <section class="section" aria-labelledby="anclas-title">
    <header class="section-head">
      <span class="material-symbols-outlined" aria-hidden="true">anchor</span>
      <div class="section-titles">
        <h3 id="anclas-title">{copy.day.anchorsPageTitle}</h3>
        <p>{copy.day.anchorsSubtitle}</p>
      </div>
    </header>
    <div class="anchor-grid">
      {#each appState.day.anchors as anchor (anchor.id)}
        <AnchorCard {anchor} />
      {/each}
    </div>
  </section>

  <section class="section" aria-labelledby="bloques-title">
    <header class="section-head">
      <span class="material-symbols-outlined" aria-hidden="true">view_timeline</span>
      <div class="section-titles">
        <h3 id="bloques-title">{copy.day.blocksPageTitle}</h3>
        <p>{copy.day.blocksSubtitle}</p>
      </div>
    </header>
    <div class="block-grid">
      {#each appState.day.blocks as block, i (block.id)}
        <BlockSection {block} index={i} />
      {/each}
    </div>
  </section>

  {#if apagadoItems.length > 0}
    <section class="ritual" aria-labelledby="ritual-title">
      <header class="section-head">
        <span class="material-symbols-outlined" aria-hidden="true">wb_twilight</span>
        <div class="section-titles">
          <h3 id="ritual-title">{copy.day.apagadoTitle}</h3>
          <p>{copy.day.apagadoSubtitle}</p>
        </div>
      </header>
      <ApagadoChecklist items={apagadoItems} />
    </section>
  {/if}

  {#if appState.day.captured.length > 0}
    <section class="section" aria-labelledby="captures-title">
      <header class="section-head">
        <span class="material-symbols-outlined" aria-hidden="true">inbox</span>
        <div class="section-titles">
          <h3 id="captures-title">{copy.day.unassigned}</h3>
          <p>{copy.recovery.progressCounts}</p>
        </div>
      </header>
      <ul class="captured-list">
        {#each appState.day.captured as task (task.id)}
          <TaskCard {task} />
        {/each}
      </ul>
    </section>
  {/if}
</div>

<style>
  .day-view {
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
    .day-view {
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

  .date-line {
    margin: 0;
    font-size: var(--font-size-label-md, 14px);
    line-height: var(--line-height-label-md, 20px);
    color: var(--text-soft, #6b7280);
  }

  .calm-banner {
    display: flex;
    align-items: flex-start;
    gap: var(--space-sm, 0.5rem);
    margin: 0;
    padding: 0.75rem var(--space-md, 1rem);
    border-radius: var(--radius-field, 12px);
    border: 1px solid var(--border, #dbe3eb);
    background: var(--accent-soft, #eff4fa);
    color: var(--text-secondary, #4b5563);
    font-size: var(--font-size-body-md, 16px);
    line-height: var(--line-height-body-md, 26px);
  }

  .calm-banner .material-symbols-outlined {
    flex: 0 0 auto;
    color: var(--accent, #4f6b8a);
    margin-top: 0.2rem;
  }

  .resume-banner strong {
    color: var(--text, #1f2937);
  }

  .section,
  .ritual {
    display: flex;
    flex-direction: column;
    gap: var(--space-md, 1rem);
    width: 100%;
    min-width: 0;
  }

  .ritual {
    padding: var(--space-lg, 1.5rem);
    border-radius: var(--radius-card, 16px);
    background: var(--card-bg, #ffffff);
    border: 1px solid var(--border, #dbe3eb);
    box-shadow: var(--shadow-soft, 0 1px 4px rgba(15, 23, 42, 0.08));
  }

  .section-head {
    display: flex;
    align-items: center;
    gap: var(--space-sm, 0.5rem);
    min-width: 0;
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

  .anchor-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-md, 1rem);
    width: 100%;
    min-width: 0;
  }

  @media (min-width: 40rem) {
    .anchor-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (min-width: 64rem) {
    .anchor-grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }

  .block-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-md, 1rem);
    align-items: stretch;
    width: 100%;
    min-width: 0;
  }

  /* Three columns only on wide screens: task rows need ~220px+
     of breathing room, otherwise fixed-width actions squeeze the
     title down to one letter per line. */
  @media (min-width: 64rem) {
    .block-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  .captured-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-sm, 0.5rem);
  }
</style>