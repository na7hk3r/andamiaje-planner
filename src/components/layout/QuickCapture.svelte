<script>
  // Quick capture modal (design: QuickCaptureModal, spec §3.6 "Capture
  // everywhere"). Ctrl+K / Cmd+K opens it (listener wired in App.svelte);
  // Esc or a backdrop click closes it; focus is trapped while open and
  // restored on close. Captures land in a day block when one is chosen,
  // otherwise they stay as unassigned captures in the day view.
  import { tick } from 'svelte';
  import { appState, actions } from '../../lib/store/app-state.svelte.js';
  import { copy } from '../../lib/i18n-copy/es.js';
  import { uiState, closeCapture } from '../../lib/store/capture.svelte.js';

  let title = $state('');
  let blockId = $state('');
  let inputEl = $state(null);
  let dialogEl = $state(null);
  let priorFocus = null;

  function submit() {
    if (!title.trim()) return;
    actions.capture(title, blockId || null);
    title = '';
    blockId = '';
    closeCapture();
  }

  function onBackdropClick(event) {
    if (event.target === event.currentTarget) closeCapture();
  }

  function onDialogKeydown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeCapture();
    } else if (event.key === 'Tab') {
      trapFocus(event);
    }
  }

  function focusableElements() {
    if (!dialogEl) return [];
    const nodes = dialogEl.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    return [...nodes].filter((el) => !el.disabled && el.getAttribute('aria-hidden') !== 'true');
  }

  function trapFocus(event) {
    const items = focusableElements();
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  // Remember who had focus before the modal opened, move it into the capture
  // input, and restore it after closing (WCAG 2.1 AA, spec §6.2).
  $effect(() => {
    if (uiState.captureOpen) {
      priorFocus = document.activeElement;
      document.body.style.overflow = 'hidden';
      tick().then(() => inputEl?.focus());
    } else if (priorFocus instanceof HTMLElement) {
      document.body.style.overflow = '';
      priorFocus.focus();
      priorFocus = null;
    }
  });
</script>

{#if uiState.captureOpen}
  <div class="backdrop" onclick={onBackdropClick}>
    <div
      class="modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="capture-modal-title"
      bind:this={dialogEl}
      onkeydown={onDialogKeydown}
    >
      <div class="modal-header">
        <div class="modal-heading">
          <div class="modal-title-row">
            <span class="material-symbols-outlined modal-icon" aria-hidden="true">
              psychology_alt
            </span>
            <h2 id="capture-modal-title" class="modal-title">
              {copy.quickCapture.modalTitle}
            </h2>
          </div>
          <p class="modal-hint">{copy.quickCapture.modalHint}</p>
        </div>
        <button class="close" type="button" aria-label={copy.quickCapture.closeLabel} onclick={closeCapture}>
          <span class="material-symbols-outlined" aria-hidden="true">close</span>
        </button>
      </div>

      <form class="capture-form" onsubmit={(e) => { e.preventDefault(); submit(); }}>
        <input
          class="capture-input"
          type="text"
          bind:this={inputEl}
          bind:value={title}
          placeholder={copy.quickCapture.modalPlaceholder}
          aria-label={copy.quickCapture.label}
        />
        <label class="assign">
          <span>{copy.quickCapture.assignToBlock}</span>
          <select bind:value={blockId}>
            <option value="">{copy.quickCapture.unassigned}</option>
            {#each appState.day.blocks as block (block.id)}
              <option value={block.id}>{block.label}</option>
            {/each}
          </select>
        </label>
        <div class="modal-actions">
          <p class="kbd-hint">{copy.quickCapture.kbdHint}</p>
          <button class="primary save" type="submit" disabled={!title.trim()}>
            <span class="material-symbols-outlined" aria-hidden="true">subdirectory_arrow_left</span>
            {copy.quickCapture.saveLabel}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 60;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-md, 1rem);
    background: rgba(18, 28, 42, 0.45);
  }

  .modal {
    width: 100%;
    max-width: 42.5rem;
    max-height: calc(100vh - 2rem);
    overflow-y: auto;
    background: var(--card-bg, #ffffff);
    border: 1px solid var(--border, #dbe3eb);
    border-radius: var(--radius-card, 16px);
    box-shadow: var(--shadow-paper);
    padding: var(--space-lg, 1.5rem);
  }

  @media (min-width: 48rem) {
    .modal {
      padding: var(--space-xl, 2.5rem);
    }
  }

  .modal-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-md, 1rem);
    margin-bottom: var(--space-md, 1rem);
  }

  .modal-heading {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .modal-title-row {
    display: flex;
    align-items: center;
    gap: var(--space-xs, 0.25rem);
  }

  .modal-icon {
    color: var(--accent, #4f6b8a);
    font-size: 22px;
  }

  .modal-title {
    margin: 0;
    font-family: var(--font-display, 'Outfit Variable');
    font-size: var(--font-size-headline-sm, 18px);
    line-height: var(--line-height-headline-sm, 24px);
    font-weight: var(--font-weight-headline-sm, 500);
    color: var(--text, #1f2937);
  }

  .modal-hint {
    margin: 0;
    font-size: var(--font-size-body-sm, 14px);
    line-height: var(--line-height-body-sm, 20px);
    color: var(--text-soft, #6b7280);
    max-width: 34rem;
  }

  .close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    flex-shrink: 0;
    border: none;
    border-radius: var(--radius-button, 9999px);
    background: transparent;
    color: var(--text-soft, #6b7280);
    transition: var(--transition-gentle, all 180ms ease-out);
  }

  .close:hover {
    background: var(--accent-soft, #eff4fa);
    color: var(--text, #1f2937);
  }

  .capture-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-md, 1rem);
  }

  .capture-input {
    padding: var(--space-md, 1rem);
    border-radius: var(--radius-field, 12px);
    font-size: var(--font-size-body-md, 16px);
    line-height: var(--line-height-body-md, 26px);
  }

  .assign {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs, 0.25rem);
    font-size: var(--font-size-label-sm, 12px);
    line-height: var(--line-height-label-sm, 16px);
    letter-spacing: var(--letter-spacing-label-sm, 0.02em);
    font-weight: var(--font-weight-label-sm, 500);
    color: var(--text-soft, #6b7280);
  }

  .assign select {
    font-size: var(--font-size-body-md, 16px);
    line-height: var(--line-height-body-md, 26px);
    min-height: 44px;
  }

  .modal-actions {
    display: flex;
    flex-direction: column;
    gap: var(--space-md, 1rem);
    padding-top: var(--space-md, 1rem);
    border-top: 1px solid var(--border, #dbe3eb);
  }

  @media (min-width: 40rem) {
    .modal-actions {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
  }

  .kbd-hint {
    margin: 0;
    font-size: var(--font-size-label-sm, 12px);
    line-height: var(--line-height-label-sm, 16px);
    color: var(--text-soft, #6b7280);
  }

  .save {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-xs, 0.25rem);
    min-height: 44px;
    padding-inline: 1.25rem;
    border-radius: var(--radius-button, 9999px);
    font-size: var(--font-size-label-md, 14px);
    line-height: var(--line-height-label-md, 20px);
    font-weight: var(--font-weight-label-md, 500);
  }
</style>