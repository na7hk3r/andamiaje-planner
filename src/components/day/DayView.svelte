<script>
  // Day view (spec: Day View + Recovery Protocol). Composes the four
  // independent anchors (apagado embeds its checklist), the three swappable
  // blocks, and the unassigned captures. A banner points at the next
  // actionable anchor — recovery copy, never a restart offer.
  import { state, actions } from '../../lib/store/app-state.svelte.js';
  import { copy } from '../../lib/i18n-copy/es.js';
  import AnchorCard from './AnchorCard.svelte';
  import BlockSection from './BlockSection.svelte';
  import TaskCard from './TaskCard.svelte';

  let resume = $derived.by(() => {
    const anchor = actions.nextResumeAnchor();
    return anchor ? { id: anchor.id, label: copy.day.anchors[anchor.id] } : null;
  });
</script>

<div class="day-view">
  <h2>{copy.day.title}</h2>
  <p class="hint">{copy.day.anchorsHint}</p>

  {#if resume}
    <p class="resume-banner">
      <strong>{copy.recovery.resumeNextAnchor}:</strong> {resume.label}
    </p>
  {/if}

  <section aria-label={copy.day.anchorsTitle}>
    <h3>{copy.day.anchorsTitle}</h3>
    <div class="anchor-list">
      {#each state.day.anchors as anchor (anchor.id)}
        <AnchorCard {anchor} />
      {/each}
    </div>
  </section>

  <section aria-label={copy.day.blocksTitle}>
    <h3>{copy.day.blocksTitle}</h3>
    <p class="hint">
      {copy.day.swapBlocks} · {copy.day.swapKeepsTasks}
    </p>
    <div class="block-list">
      {#each state.day.blocks as block, i (block.id)}
        <BlockSection {block} index={i} />
      {/each}
    </div>
  </section>

  {#if state.day.captured.length > 0}
    <section aria-label={copy.day.unassigned}>
      <h3>{copy.day.unassigned}</h3>
      <p class="hint">{copy.recovery.progressCounts}</p>
      <ul class="captured-list">
        {#each state.day.captured as task (task.id)}
          <li><TaskCard {task} /></li>
        {/each}
      </ul>
    </section>
  {/if}
</div>

<style>
  .day-view {
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
    padding: 1rem 1.25rem;
    max-width: 42rem;
    margin-inline: auto;
  }

  h2 {
    margin: 0;
    font-size: 1.4rem;
  }

  h3 {
    margin: 0 0 0.75rem;
    font-size: 1.05rem;
  }

  section {
    display: flex;
    flex-direction: column;
  }

  .hint {
    margin: 0 0 0.9rem;
    font-size: 0.85rem;
    color: var(--text-soft, #6b7280);
  }

  .resume-banner {
    margin: 0;
    padding: 0.85rem 1rem;
    border-radius: 0.75rem;
    background: var(--accent-soft, #eef2f7);
    color: var(--text, #1f2937);
    font-size: 0.9rem;
  }

  .anchor-list,
  .block-list {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }

  .captured-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }
</style>