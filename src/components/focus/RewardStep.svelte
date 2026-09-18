<script>
  // Reward step (spec: Focus Mode / Reward step). Shown when the countdown
  // ends and the store marks the task done: a brief, calm celebration and
  // sensory suggestions. The next-task affordance keeps other tasks hidden
  // behind it instead of showing a wall of pending todos.
  import { copy } from '../../lib/i18n-copy/es.js';

  let { taskTitle, hasNext = false, onnext = () => {}, onback = () => {} } = $props();
</script>

<section class="reward" role="status" aria-live="polite">
  <div class="reward-pop">
    <h3>{copy.focus.rewardTitle}</h3>
    <p class="task-title">{taskTitle}</p>
    <p class="done-line">{copy.focus.rewardTaskDone}</p>
    <p class="suggestions">{copy.focus.rewardSuggestions}</p>
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
    align-items: center;
    justify-content: center;
    min-height: 50vh;
  }

  .reward-pop {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.7rem;
    text-align: center;
    padding: 2rem 1.5rem;
    border-radius: 1rem;
    background: var(--card-bg, #ffffff);
    box-shadow: var(--shadow-soft, 0 1px 4px rgba(15, 23, 42, 0.08));
    border: 1px solid var(--border, #e5e7eb);
    animation: reward-pop 0.6s ease-out;
    max-width: 24rem;
  }

  h3 {
    margin: 0;
    font-size: 1.3rem;
    color: var(--accent, #4f6b8a);
  }

  .task-title {
    margin: 0;
    font-weight: 600;
  }

  .done-line,
  .suggestions {
    margin: 0;
    font-size: 0.9rem;
    color: var(--text-soft, #6b7280);
  }

  .actions {
    display: flex;
    gap: 0.6rem;
    margin-top: 0.6rem;
  }

  @keyframes reward-pop {
    0% {
      opacity: 0;
      transform: scale(0.94);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
</style>