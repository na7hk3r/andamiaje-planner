<script>
  // Week view (spec: Week Ritual). Hosts the guided ritual, surfaces the
  // resume banner when the ritual was interrupted mid-way, and nudges a
  // fixed weekly slot. All ritual progress is persisted, so returning to
  // this view continues exactly where it stopped.
  import { state } from '../../lib/store/app-state.svelte.js';
  import { copy } from '../../lib/i18n-copy/es.js';
  import RitualSteps from './RitualSteps.svelte';

  const resumed = $derived(state.week.ritualStep > 1);
</script>

<div class="week-view">
  <h2>{copy.week.title}</h2>

  {#if resumed}
    <p class="resume-banner">{copy.week.resumeRitual}</p>
  {/if}

  <RitualSteps />

  <p class="hint">{copy.week.nudgeWeekly}</p>
</div>

<style>
  .week-view {
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

  .resume-banner {
    margin: 0;
    padding: 0.85rem 1rem;
    border-radius: 0.75rem;
    background: var(--accent-soft, #eef2f7);
    color: var(--text, #1f2937);
    font-size: 0.9rem;
  }

  .hint {
    margin: 0;
    font-size: 0.85rem;
    color: var(--text-soft, #6b7280);
  }
</style>