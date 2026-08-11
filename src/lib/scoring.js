import { CONFIG } from '../data/config.js';

export function resolveTier(percent, batch) {
  const bands = CONFIG.tiers[batch];
  if (!bands) throw new RangeError(`Unknown batch: ${batch}`);
  const clamped = Math.min(100, Math.max(0, Math.round(percent)));
  const index = bands.findIndex((b) => clamped >= b.min && clamped <= b.max);
  const resolved = index === -1 ? bands.length - 1 : index;
  return { index: resolved, ...bands[resolved] };
}
