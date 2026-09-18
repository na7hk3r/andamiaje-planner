<script>
  // Top navigation bar (design: TopNavBar shared anchor). Desktop shows the
  // brand, the capture pill trigger, the view pills and the trailing icons;
  // below md the pills hide and the bottom mobile nav takes over (App.svelte).
  // `onnavigate` is wired by App.svelte so all hash routing stays in one place.
  import { appState, VIEWS } from '../../lib/store/app-state.svelte.js';
  import { copy } from '../../lib/i18n-copy/es.js';
  import { openCapture } from '../../lib/store/capture.svelte.js';

  let { onnavigate = () => {} } = $props();

  function goHome(event) {
    event.preventDefault();
    onnavigate('day');
  }
</script>

<header class="topnav">
  <div class="topnav-inner">
    <div class="topnav-left">
      <a class="brand" href="#/day" onclick={goHome}>
        <span class="material-symbols-outlined brand-icon" aria-hidden="true">spa</span>
        <span>{copy.app.title}</span>
      </a>
      <button
        class="capture-pill"
        type="button"
        aria-label={copy.topnav.captureLabel}
        onclick={openCapture}
      >
        <span class="material-symbols-outlined" aria-hidden="true">edit_note</span>
        <span class="capture-pill-text">{copy.topnav.capturePlaceholder}</span>
        <span class="capture-pill-kbd" aria-hidden="true">{copy.topnav.shortcut}</span>
      </button>
    </div>

    <nav class="topnav-nav" aria-label={copy.topnav.navLabel}>
      {#each VIEWS as view (view)}
        <button
          type="button"
          class="topnav-pill"
          class:active={appState.view === view}
          aria-current={appState.view === view ? 'page' : undefined}
          onclick={() => onnavigate(view)}
        >
          {copy.nav[view]}
        </button>
      {/each}
    </nav>

    <div class="topnav-actions">
      <button
        class="icon-button"
        type="button"
        aria-label={copy.topnav.privacyButton}
        title={copy.topnav.privacyButton}
        onclick={() => onnavigate('settings')}
      >
        <span class="material-symbols-outlined" aria-hidden="true">lock_open</span>
      </button>
      <span class="icon-button" aria-hidden="true">
        <span class="material-symbols-outlined">tune</span>
      </span>
    </div>
  </div>
</header>

<style>
  .topnav {
    position: sticky;
    top: 0;
    z-index: 30;
    background: var(--bg, #fafafa);
    border-bottom: 1px solid var(--border, #dbe3eb);
  }

  .topnav-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-md, 1rem);
    height: 4rem;
    padding-inline: var(--gutter-mobile, 1rem);
    max-width: 72rem;
    margin-inline: auto;
  }

  @media (min-width: 48rem) {
    .topnav-inner {
      padding-inline: var(--gutter, 1.5rem);
    }
  }

  .topnav-left {
    display: flex;
    align-items: center;
    gap: var(--space-sm, 0.5rem);
    min-width: 0;
  }

  .brand {
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs, 0.25rem);
    font-family: var(--font-display, 'Outfit Variable');
    font-size: var(--font-size-headline-md, 22px);
    line-height: var(--line-height-headline-md, 28px);
    font-weight: var(--font-weight-semibold, 600);
    color: var(--accent, #4f6b8a);
    text-decoration: none;
    min-height: 44px;
    padding-inline: var(--space-xs, 0.25rem);
  }

  .brand-icon {
    font-size: 22px;
  }

  /* Capture pill: icon-only below sm, full pill from sm up */
  .capture-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-xs, 0.25rem);
    width: 44px;
    height: 44px;
    flex-shrink: 0;
    padding: 0;
    border-radius: var(--radius-button, 9999px);
    background: var(--card-bg, #ffffff);
    border: 1px solid var(--border, #dbe3eb);
    color: var(--text-soft, #6b7280);
    font-family: var(--font-body, 'Inter Variable');
    font-size: var(--font-size-label-md, 14px);
    font-weight: var(--font-weight-label-md, 500);
    line-height: var(--line-height-label-md, 20px);
    transition: var(--transition-gentle, all 180ms ease-out);
  }

  .capture-pill:hover {
    border-color: var(--accent, #4f6b8a);
    color: var(--accent, #4f6b8a);
  }

  .capture-pill .material-symbols-outlined {
    font-size: 22px;
  }

  .capture-pill-text,
  .capture-pill-kbd {
    display: none;
  }

  @media (min-width: 40rem) {
    .capture-pill {
      width: 16rem;
      padding-inline: var(--space-md, 1rem);
      justify-content: flex-start;
    }

    .capture-pill-text {
      display: block;
      flex: 1;
      text-align: left;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .capture-pill-kbd {
      display: inline-block;
      padding: 0.125rem 0.375rem;
      border-radius: 0.25rem;
      background: var(--accent-soft, #eff4fa);
      color: var(--accent, #4f6b8a);
      font-size: var(--font-size-label-sm, 12px);
      line-height: var(--line-height-label-sm, 16px);
      font-weight: var(--font-weight-label-sm, 500);
    }
  }

  .topnav-nav {
    display: none;
    align-items: center;
    gap: var(--space-xs, 0.25rem);
  }

  @media (min-width: 48rem) {
    .topnav-nav {
      display: flex;
    }
  }

  .topnav-pill {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: var(--radius-button, 9999px);
    background: transparent;
    color: var(--text-secondary, #4b5563);
    font-family: var(--font-body, 'Inter Variable');
    font-size: var(--font-size-label-md, 14px);
    font-weight: var(--font-weight-label-md, 500);
    line-height: var(--line-height-label-md, 20px);
    transition: var(--transition-gentle, all 180ms ease-out);
  }

  .topnav-pill:hover {
    background: var(--accent-soft, #eff4fa);
    color: var(--text, #1f2937);
  }

  .topnav-pill.active {
    background: var(--accent-soft, #eff4fa);
    color: var(--accent, #4f6b8a);
  }

  .topnav-actions {
    display: flex;
    align-items: center;
    gap: var(--space-xs, 0.25rem);
  }

  .icon-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border: none;
    border-radius: var(--radius-button, 9999px);
    background: transparent;
    color: var(--text-secondary, #4b5563);
    transition: var(--transition-gentle, all 180ms ease-out);
  }

  .icon-button:hover {
    background: var(--accent-soft, #eff4fa);
    color: var(--accent, #4f6b8a);
  }

  .icon-button .material-symbols-outlined {
    font-size: 22px;
  }
</style>