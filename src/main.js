// Self-hosted fonts (design tokens §4): Outfit (display), Inter (body) and
// Material Symbols (icons) are bundled at build time — zero runtime network.
import '@fontsource-variable/outfit';
import '@fontsource-variable/inter';
import '@fontsource/material-symbols-outlined';
import { mount } from 'svelte';
import App from './App.svelte';

const app = mount(App, {
  target: document.getElementById('app'),
});

export default app;