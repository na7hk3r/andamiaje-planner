<script>
  // One of the four daily anchors (Stitch "Vista Día": Anclas del Día).
  // Status is derived purely from existing persisted state — the checked
  // flag plus the recovery schedule — with calm, non-punitive wording:
  // completed / in march / "retomar en la próxima ancla (sin culpa)" /
  // scheduled. Time shows as display text; editing lives in Settings.
  import { actions } from '../../lib/store/app-state.svelte.js';
  import { copy } from '../../lib/i18n-copy/es.js';
  import { minutesOfDay } from '../../lib/logic/recovery.js';

  let { anchor } = $props();

  function onCheck(event) {
    actions.setAnchorChecked(anchor.id, event.currentTarget.checked);
  }

  // 'done' | 'active' | 'resume' | 'scheduled'
  const status = $derived.by(() => {
    if (anchor.checked) return 'done';
    const next = actions.nextResumeAnchor();
    if (next && next.id === anchor.id) return 'active';
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    return minutesOfDay(anchor.time) < nowMin ? 'resume' : 'scheduled';
  });

  const statusLabel = $derived(
    {
      done: copy.day.statusDone,
      active: copy.day.statusActive,
      resume: copy.day.statusResume,
      scheduled: copy.day.statusScheduled,
    }[status],
  );
</script>

<article class="anchor-card">
  <div class="top-row">
    <span class="time">{anchor.time}</span>
    <span class="envelope">
      <input
        type="checkbox"
        checked={anchor.checked}
        onchange={onCheck}
        aria-label={copy.day.anchorCheckedLabel.replace(
          '{label}',
          copy.day.anchors[anchor.id],
        )}
      />
    </span>
  </div>
  <div class="body">
    <h4>{copy.day.anchors[anchor.id]}</h4>
    {#if status === 'resume'}
      <p class="resume-note">{statusLabel}</p>
    {:else}
      <span class="chip {status}">{statusLabel}</span>
    {/if}
  </div>
</article>

<style>
  .anchor-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-md, 1rem);
    width: 100%;
    min-width: 0;
    padding: var(--space-md, 1rem);
    border-radius: var(--radius-card, 16px);
    background: var(--card-bg, #ffffff);
    border: 1px solid var(--border, #dbe3eb);
    box-shadow: var(--shadow-soft, 0 1px 4px rgba(15, 23, 42, 0.08));
    transition: var(--transition-gentle, all 180ms ease-out);
  }

  .top-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-sm, 0.5rem);
  }

  .time {
    font-size: var(--font-size-label-sm, 12px);
    line-height: var(--line-height-label-sm, 16px);
    letter-spacing: var(--letter-spacing-label-sm, 0.02em);
    color: var(--text-soft, #6b7280);
  }

  .envelope {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    width: 48px;
    height: 48px;
  }

  .envelope input {
    width: 22px;
    height: 22px;
    padding: 0;
    accent-color: var(--success, #2f7d4f);
    cursor: pointer;
  }

  .body {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm, 0.5rem);
  }

  h4 {
    margin: 0;
    font-family: var(--font-display, inherit);
    font-size: var(--font-size-body-lg, 18px);
    line-height: var(--line-height-body-lg, 28px);
    font-weight: var(--font-weight-medium, 500);
    color: var(--text, #1f2937);
  }

  .chip {
    align-self: flex-start;
    padding: 0.25rem 0.75rem;
    border-radius: var(--radius-button, 9999px);
    font-size: var(--font-size-label-sm, 12px);
    line-height: var(--line-height-label-sm, 16px);
    letter-spacing: var(--letter-spacing-label-sm, 0.02em);
    font-weight: var(--font-weight-medium, 500);
    background: var(--surface-container, #f0f4f8);
    border: 1px solid var(--border, #dbe3eb);
    color: var(--text-secondary, #4b5563);
  }

  .chip.active {
    background: var(--accent-soft, #eff4fa);
    border-color: transparent;
    color: var(--accent, #4f6b8a);
  }

  .chip.done {
    background: var(--card-bg, #ffffff);
    border-color: color-mix(in srgb, var(--success, #2f7d4f) 35%, #ffffff);
    color: var(--success, #2f7d4f);
  }

  /* Long recovery wording renders as a soft panel, not a stretched pill */
  .resume-note {
    margin: 0;
    padding: 0.4rem 0.6rem;
    border-radius: var(--radius-field, 12px);
    background: var(--surface-container, #f0f4f8);
    color: var(--text-secondary, #4b5563);
    font-size: var(--font-size-label-sm, 12px);
    line-height: var(--line-height-label-sm, 16px);
    letter-spacing: var(--letter-spacing-label-sm, 0.02em);
  }
</style>