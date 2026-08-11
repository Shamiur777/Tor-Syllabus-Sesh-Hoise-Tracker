import { CONFIG } from '../data/config.js';

export function boot() {
  document.getElementById('app').textContent = '';
  return CONFIG;
}

boot();
