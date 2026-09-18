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
  import Footer from './components/layout/Footer.svelte';
  import QuickCapture from './components/layout/QuickCapture.svelte';
  import DayView from './components/day/DayView.svelte';
  import FocusView from './components/focus/FocusView.svelte';
  import WeekView from './components/week/WeekView.svelte';
  import SettingsView from './components/settings/SettingsView.svelte';

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
    return () => window.removeEventListener('hashchange', applyHash);
  });

  function navigate(view) {
    actions.setView(view);
    const target = `#/${view}`;
    if (location.hash !== target) location.hash = target;
  }
</script>

{#if !appState.disclaimerAccepted}
  <main class="gate">
    <h1>{copy.app.title}</h1>
    <p class="tagline">{copy.app.tagline}</p>
    <section class="disclaimer-card">
      <h2>{copy.disclaimer.title}</h2>
      <p>{copy.disclaimer.body}</p>
      <button class="primary" type="button" onclick={actions.acknowledgeDisclaimer}>
        {copy.disclaimer.acknowledge}
      </button>
    </section>
  </main>
{:else}
  <main class="shell">
    <QuickCapture />
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
          onclick={() => navigate(view)}
        >
          {copy.nav[view]}
        </button>
      {/each}
    </nav>
    <Footer />
  </main>
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
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 3rem 1.25rem;
    max-width: 30rem;
    margin-inline: auto;
    text-align: center;
  }

  h1 {
    margin: 0;
    font-size: 1.7rem;
    color: var(--accent);
  }

  .tagline {
    margin: 0;
    color: var(--text-soft);
  }

  .disclaimer-card {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
    padding: 1.4rem 1.3rem;
    border-radius: 1rem;
    background: var(--card-bg);
    box-shadow: var(--shadow-soft);
    border: 1px solid var(--border);
    text-align: left;
  }

  .disclaimer-card h2 {
    margin: 0;
    font-size: 1.2rem;
  }

  .disclaimer-card p {
    margin: 0;
    line-height: 1.55;
    font-size: 0.95rem;
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

  .nav {
    display: flex;
    justify-content: space-around;
    gap: 0.4rem;
    padding: 0.6rem 0.75rem;
    border-top: 1px solid var(--border);
    background: var(--card-bg);
    position: sticky;
    bottom: 0;
  }

  .nav-item {
    flex: 1;
    border: none;
    background: transparent;
    color: var(--text-soft);
    font-size: 0.9rem;
    padding: 0.55rem 0.4rem;
  }

  .nav-item.active {
    color: var(--accent);
    font-weight: 600;
  }
</style>