<script>
  // App shell (real implementation, replaces the slice-2 placeholder).
  // Spec: Disclaimer gate (first run blocks every screen until explicit
  // acknowledgment, persisted), quick capture on every screen, view switch
  // through store.view with a hash fragment for the back button (D7), and
  // the persistent footer disclaimer. Nav labels and all copy come from
  // the i18n module — no literal UI strings here.
  import { onMount } from 'svelte';
  import { appState, actions, VIEWS } from './lib/store/app-state.svelte.js';
  import { copy } from './lib/i18n-copy/es.js';
  import { openCapture } from './lib/store/capture.svelte.js';
  import Footer from './components/layout/Footer.svelte';
  import TopNav from './components/layout/TopNav.svelte';
  import QuickCapture from './components/layout/QuickCapture.svelte';
  import DayView from './components/day/DayView.svelte';
  import FocusView from './components/focus/FocusView.svelte';
  import WeekView from './components/week/WeekView.svelte';
  import SettingsView from './components/settings/SettingsView.svelte';

  // Material Symbols glyph per view for the mobile bottom nav. Keys mirror
  // the VIEWS ids so the loop stays data-driven.
  const NAV_ICONS = {
    day: 'calendar_today',
    focus: 'timer',
    week: 'view_week',
    settings: 'settings',
  };

  function parseHash() {
    const value =
      typeof location !== 'undefined' ? location.hash.replace(/^#\/?/, '') : '';
    return VIEWS.includes(value) ? value : null;
  }

  function applyHash() {
    const view = parseHash();
    if (view && view !== appState.view) actions.setView(view);
  }

  onMount(() => {
    const view = parseHash();
    if (view && view !== appState.view) actions.setView(view);
    window.addEventListener('hashchange', applyHash);

    // Global quick capture shortcut: Ctrl+K (or Cmd+K on macOS). The modal
    // only lives behind the disclaimer gate, so the shortcut stays silent
    // until the first-run acknowledgment.
    function onKeydown(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        if (!appState.disclaimerAccepted) return;
        event.preventDefault();
        openCapture();
      }
    }
    window.addEventListener('keydown', onKeydown);

    return () => {
      window.removeEventListener('hashchange', applyHash);
      window.removeEventListener('keydown', onKeydown);
    };
  });

  function navigate(view) {
    actions.setView(view);
    const target = `#/${view}`;
    if (location.hash !== target) location.hash = target;
  }
</script>

{#if !appState.disclaimerAccepted}
  <main class="gate">
    <article class="gate-card">
      <div class="gate-header">
        <span class="gate-isotipo" aria-hidden="true">
          <span class="material-symbols-outlined">spa</span>
        </span>
        <h1>{copy.app.title}</h1>
        <p class="tagline">{copy.app.subtitle}</p>
      </div>
      <p class="intro">{copy.welcome.intro}</p>
      <section class="notice-card">
        <span class="notice-icon" aria-hidden="true">
          <span class="material-symbols-outlined">health_and_safety</span>
        </span>
        <div class="notice-body">
          <h2>{copy.welcome.healthTitle}</h2>
          <p>{copy.welcome.healthBody}</p>
        </div>
      </section>
      <section class="privacy-card">
        <span class="privacy-icon" aria-hidden="true">
          <span class="material-symbols-outlined">lock</span>
        </span>
        <p>{copy.welcome.privacyBody}</p>
      </section>
      <div class="gate-cta">
        <button class="primary cta" type="button" onclick={actions.acknowledgeDisclaimer}>
          {copy.welcome.cta}
          <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
        </button>
        <p class="microcopy">{copy.welcome.microcopy}</p>
      </div>
    </article>
  </main>
{:else}
  <main class="shell" id="top">
    <TopNav onnavigate={navigate} />
    <div class="view">
      {#if appState.view === 'day'}
        <DayView />
      {:else if appState.view === 'focus'}
        <FocusView />
      {:else if appState.view === 'week'}
        <WeekView />
      {:else}
        <SettingsView />
      {/if}
    </div>
    <nav class="nav" aria-label={copy.nav.sectionLabel}>
      {#each VIEWS as view (view)}
        <button
          class="nav-item"
          class:active={appState.view === view}
          type="button"
          aria-current={appState.view === view ? 'page' : undefined}
          onclick={() => navigate(view)}
        >
          <span class="material-symbols-outlined nav-icon" aria-hidden="true">
            {NAV_ICONS[view]}
          </span>
          <span class="nav-label">{copy.nav[view]}</span>
        </button>
      {/each}
    </nav>
    <Footer />
  </main>
  <QuickCapture />
{/if}

<style>
  :global(:root) {
    /* Surfaces (design tokens §4) */
    --bg: #fafafa;
    --card-bg: #ffffff;
    --surface-container: #f0f4f8;
    --border: #dbe3eb;

    /* Typography — self-hosted variable fonts (bundled, zero CDN) */
    --font-display: 'Outfit Variable', system-ui, -apple-system, 'Segoe UI', sans-serif;
    --font-body: 'Inter Variable', system-ui, -apple-system, 'Segoe UI', sans-serif;
    --font-icons: 'Material Symbols Outlined';
    --text: #1f2937;
    --text-soft: #6b7280;
    --text-secondary: #4b5563;

    /* Accents and signals */
    --accent: #4f6b8a;
    --accent-soft: #eff4fa;
    --danger: #92400e; /* caution-warm: AA-verified (never destructive red) */
    --success: #2f7d4f;

    /* Radii, motion, focus */
    --radius-card: 16px;
    --radius-button: 9999px; /* pill buttons */
    --radius-field: 12px;
    --focus-ring: 2px solid #4f6b8a; /* slate-blue ring (WCAG 2.1 AA) */
    --transition-gentle: all 180ms ease-out;

    /* Shadows */
    --shadow-soft: 0 1px 4px rgba(15, 23, 42, 0.08);
    --shadow-paper:
      0 4px 24px -2px rgba(18, 28, 42, 0.08),
      0 2px 8px -1px rgba(18, 28, 42, 0.04);

    /* Spacing scale (design tokens §4) */
    --space-xs: 0.25rem;
    --space-sm: 0.5rem;
    --space-md: 1rem;
    --space-lg: 1.5rem;
    --space-xl: 2.5rem;
    --gutter-mobile: 1rem;
    --gutter: 1.5rem;

    /* Type scale (design §type scale) */
    --font-size-display-timer: 56px;
    --line-height-display-timer: 64px;
    --letter-spacing-display-timer: -0.02em;
    --font-size-display-timer-mobile: 40px;
    --line-height-display-timer-mobile: 48px;
    --font-size-headline-lg: 32px;
    --line-height-headline-lg: 40px;
    --letter-spacing-headline-lg: -0.015em;
    --font-size-headline-lg-mobile: 26px;
    --line-height-headline-lg-mobile: 34px;
    --letter-spacing-headline-lg-mobile: -0.01em;
    --font-size-headline-md: 22px;
    --line-height-headline-md: 28px;
    --font-size-headline-sm: 18px;
    --line-height-headline-sm: 24px;
    --font-size-body-lg: 18px;
    --line-height-body-lg: 28px;
    --font-size-body-md: 16px;
    --line-height-body-md: 26px;
    --font-size-body-sm: 14px;
    --line-height-body-sm: 20px;
    --font-size-label-lg: 16px;
    --line-height-label-lg: 24px;
    --font-size-label-md: 14px;
    --line-height-label-md: 20px;
    --font-size-label-sm: 12px;
    --line-height-label-sm: 16px;
    --letter-spacing-label-sm: 0.02em;
    --font-weight-medium: 500;
    --font-weight-semibold: 600;

    font-family: var(--font-body);
    color: var(--text);
    background: var(--bg);
  }

  :global(*) {
    box-sizing: border-box;
  }

  :global(input),
  :global(select),
  :global(textarea) {
    padding: 0.55rem 0.7rem;
    border-radius: var(--radius-field);
    border: 1px solid var(--border);
    background: var(--card-bg);
    color: var(--text);
    font-family: var(--font-body);
    font-size: var(--font-size-body-md);
    line-height: var(--line-height-body-md);
  }

  :global(button) {
    padding: 0.55rem 0.85rem;
    border-radius: var(--radius-field);
    border: 1px solid var(--border);
    background: var(--card-bg);
    color: var(--text);
    font-family: var(--font-body);
    font-size: var(--font-size-body-md);
    line-height: 1.25;
    cursor: pointer;
    min-height: 44px; /* minimum touch target (44×44) */
  }

  :global(button:disabled) {
    opacity: 0.5;
    cursor: default;
  }

  :global(.primary) {
    background: var(--accent);
    border-color: var(--accent);
    color: #ffffff;
  }

  :global(.ghost) {
    background: transparent;
  }

  /* Visible 2px slate-blue focus ring (WCAG 2.1 AA, spec §6.2) */
  :global(:focus-visible) {
    outline: var(--focus-ring);
    outline-offset: 2px;
  }

  /* Material Symbols utility class — icons inherit the surrounding font size */
  :global(.material-symbols-outlined) {
    font-family: var(--font-icons);
    font-weight: normal;
    font-style: normal;
    font-size: inherit;
    line-height: 1;
    letter-spacing: normal;
    text-transform: none;
    display: inline-block;
    white-space: nowrap;
    word-wrap: normal;
    direction: ltr;
    vertical-align: middle;
    font-feature-settings: 'liga';
    -webkit-font-feature-settings: 'liga';
    -webkit-font-smoothing: antialiased;
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }

  /* Calm motion: celebrations are static text; neutralize the rest */
  @media (prefers-reduced-motion: reduce) {
    :global(*),
    :global(*::before),
    :global(*::after) {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }

  .gate {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: var(--space-lg) var(--gutter-mobile);
  }

  .gate-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
    width: 100%;
    max-width: 42.5rem;
    padding: var(--space-lg);
    border-radius: var(--radius-card);
    background: var(--card-bg);
    box-shadow: var(--shadow-paper);
    text-align: center;
  }

  @media (min-width: 48rem) {
    .gate-card {
      padding: var(--space-xl);
    }
  }

  .gate-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-sm);
  }

  .gate-isotipo {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    margin-bottom: var(--space-xs);
    border-radius: 50%;
    background: var(--accent-soft);
    color: var(--accent);
  }

  .gate-isotipo .material-symbols-outlined {
    font-size: 28px;
  }

  .gate-card h1 {
    margin: 0;
    font-family: var(--font-display);
    font-size: var(--font-size-headline-lg-mobile);
    line-height: var(--line-height-headline-lg-mobile);
    letter-spacing: var(--letter-spacing-headline-lg-mobile);
    font-weight: var(--font-weight-semibold);
    color: var(--text);
  }

  @media (min-width: 48rem) {
    .gate-card h1 {
      font-size: var(--font-size-headline-lg);
      line-height: var(--line-height-headline-lg);
      letter-spacing: var(--letter-spacing-headline-lg);
    }
  }

  .tagline {
    margin: 0;
    font-family: var(--font-display);
    font-size: var(--font-size-headline-sm);
    line-height: var(--line-height-headline-sm);
    font-weight: var(--font-weight-medium);
    color: var(--accent);
  }

  .intro {
    margin: 0;
    font-size: var(--font-size-body-lg);
    line-height: var(--line-height-body-lg);
    color: var(--text-soft);
  }

  .notice-card {
    display: flex;
    gap: var(--space-md);
    padding: var(--space-lg);
    border-radius: var(--radius-card);
    background: var(--accent-soft);
    text-align: left;
  }

  .notice-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 2.75rem;
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 50%;
    background: var(--card-bg);
    color: var(--accent);
  }

  .notice-body h2 {
    margin: 0 0 var(--space-xs);
    font-size: var(--font-size-body-md);
    line-height: var(--line-height-body-md);
    font-weight: var(--font-weight-semibold);
    color: var(--text);
  }

  .notice-body p {
    margin: 0;
    font-size: var(--font-size-body-sm);
    line-height: var(--line-height-body-sm);
    color: var(--text-secondary);
  }

  .privacy-card {
    display: flex;
    align-items: flex-start;
    gap: var(--space-md);
    padding: var(--space-lg);
    border-radius: var(--radius-card);
    background: var(--surface-container);
    text-align: left;
  }

  .privacy-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 2.75rem;
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 50%;
    background: var(--card-bg);
    color: var(--success);
  }

  .privacy-card p {
    margin: 0;
    font-size: var(--font-size-body-sm);
    line-height: var(--line-height-body-sm);
    color: var(--text-secondary);
  }

  .gate-cta {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-sm);
  }

  .cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-height: 48px;
    padding: 0.75rem 1.75rem;
    border-radius: var(--radius-button);
    font-weight: var(--font-weight-medium);
    font-size: var(--font-size-body-md);
  }

  .microcopy {
    margin: 0;
    font-size: var(--font-size-label-sm);
    line-height: var(--line-height-label-sm);
    letter-spacing: var(--letter-spacing-label-sm);
    color: var(--text-soft);
  }

  .shell {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .view {
    flex: 1;
    padding-bottom: 1.5rem;
  }

  /* Bottom navigation: mobile only (top pills live in TopNav from md up) */
  .nav {
    display: flex;
    justify-content: space-around;
    align-items: stretch;
    gap: var(--space-xs, 0.25rem);
    padding: var(--space-xs, 0.25rem) var(--gutter-mobile, 1rem)
      calc(var(--space-xs, 0.25rem) + env(safe-area-inset-bottom, 0px));
    border-top: 1px solid var(--border, #dbe3eb);
    background: var(--card-bg, #ffffff);
    position: sticky;
    bottom: 0;
    z-index: 20;
  }

  @media (min-width: 48rem) {
    .nav {
      display: none;
    }
  }

  .nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.125rem;
    min-height: 48px;
    padding: 0.25rem 0.5rem;
    border: none;
    border-radius: var(--radius-field, 12px);
    background: transparent;
    color: var(--text-soft, #6b7280);
    font-size: var(--font-size-label-sm, 12px);
    line-height: var(--line-height-label-sm, 16px);
    letter-spacing: var(--letter-spacing-label-sm, 0.02em);
    font-weight: var(--font-weight-medium, 500);
    transition: var(--transition-gentle, all 180ms ease-out);
  }

  .nav-item.active {
    color: var(--accent, #4f6b8a);
    background: var(--accent-soft, #eff4fa);
  }

  .nav-icon {
    font-size: 24px;
  }
</style>