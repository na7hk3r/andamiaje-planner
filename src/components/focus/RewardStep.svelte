<script>
  // Reward step (spec: Focus Mode / Calm static reward banner). Shown when
  // the countdown ends or a tramo is completed early: a grounded, static
  // celebration — no confetti, no entrance animation, no motion. Safe by
  // construction under prefers-reduced-motion. The next-task affordance
  // keeps other tasks hidden behind it instead of a wall of pending todos.
  import { copy } from '../../lib/i18n-copy/es.js';

  let { taskTitle, hasNext = false, onnext = () => {}, onback = () => {} } = $props();
</script>

<section class="reward" role="status" aria-live="polite">
  <div class="reward-icon" aria-hidden="true">
    <span class="material-symbols-outlined">spark</span>
  </div>
  <div class="reward-body">
    <h2 class="reward-title">{copy.focus.rewardStaticTitle}</h2>
    <p class="task-title">{taskTitle}</p>
    <p class="meta">{copy.focus.rewardTaskDone}</p>
    <p class="body">{copy.focus.rewardStaticBody}</p>
    <div class="actions">
      {#if hasNext}
        <button class="primary" type="button" onclick={onnext}>
          {copy.focus.nextTask}
        </button>
      {/if}
      <button class="ghost" type="button" onclick={onback}>
        {copy.focus.backToDay}
      </button>
    </div>
  </div>
</section>

<style>
  .reward {
    display: flex;
    align-items: flex-start;
    gap: var(--space-md);
    padding: var(--space-md) var(--space-lg);
    border-radius: var(--radius-card);
    background: var(--card-bg);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-soft);
  }

  .reward-icon {
    flex: 0 0 2.5rem;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    background: #e8f4ee;
    background: color-mix(in srgb, var(--success) 14%, var(--card-bg));
    color: var(--success);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .reward-icon .material-symbols-outlined {
    font-size: 24px;
    font-variation-settings: 'FILL' 1;
  }

  .reward-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .reward-title {
    margin: 0;
    font-size: var(--font-size-label-md);
    line-height: var(--line-height-label-md);
    font-weight: var(--font-weight-semibold);
    color: var(--text);
  }

  .task-title {
    margin: 0;
    font-weight: var(--font-weight-medium);
    color: var(--accent);
  }

  .meta,
  .body {
    margin: 0;
    font-size: 0.9rem;
    color: var(--text-secondary);
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
    margin-top: 0.6rem;
  }
</style>