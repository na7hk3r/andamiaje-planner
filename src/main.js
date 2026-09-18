// Self-hosted fonts (design tokens §4): Outfit (display), Inter (body) and
// Material Symbols (icons) are bundled at build time — zero runtime network.
import '@fontsource-variable/outfit';
import '@fontsource-variable/inter';
import '@fontsource/material-symbols-outlined';
import { mount } from 'svelte';
import App from './App.svelte';

// DEV-ONLY screenshot seed: `npm run dev` + `?mock=1` loads realistic demo
// data through the versioned store (importJson), never by touching
// localStorage directly. Gated by import.meta.env.DEV so production builds
// cannot trigger it. Cleanup: Ajustes → Limpiar datos locales.
if (
  import.meta.env.DEV &&
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).get('mock') === '1'
) {
  import('./lib/store/app-state.svelte.js').then(async ({ actions }) => {
    const { buildMockState } = await import('./lib/dev-seed.js');
    actions.importJson(JSON.stringify(buildMockState()));
    const url = new URL(window.location.href);
    url.searchParams.delete('mock');
    window.history.replaceState(null, '', url);
  });
}

const app = mount(App, {
  target: document.getElementById('app'),
});

export default app;