import { CONFIG } from '../data/config.js';
import { toRating } from './scoring.js';

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    // Same-origin in production, but this keeps toBlob working if assets ever
    // move to a CDN that sends the right headers. A tainted canvas cannot export.
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

// Bengali needs complex text shaping. Canvas fillText shapes correctly through
// the platform engine, but only once the webfont is actually loaded — otherwise
// conjuncts render as tofu boxes. Waiting here is not optional.
async function ensureFonts() {
  if (!document.fonts) return;
  await Promise.all([
    document.fonts.load('800 96px "Baloo Da 2"'),
    document.fonts.load('600 48px "Hind Siliguri"'),
  ]);
  await document.fonts.ready;
}

function fitText(ctx, text, maxWidth, startPx, font) {
  let size = startPx;
  ctx.font = font(size);
  while (ctx.measureText(text).width > maxWidth && size > 20) {
    size -= 2;
    ctx.font = font(size);
  }
  return size;
}

function hexToRgba(hex, alpha) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

// Same line-art study icons as bgVectors() in ui.js (open book, check-circle,
// sparkle) -- Path2D accepts an SVG path string directly, so the exact `d`
// data is reused rather than re-derived. Kept to the upper third of the
// canvas, clear of the centred name/rating/caption text column and the
// top-left logo chip, since the tier photo below has a transparent
// background (rembg cutout) and would otherwise let these show through
// mid-figure in an inconsistent way per photo.
const BOOK_PATH = new Path2D(
  'M0,-14 C-14,-20 -28,-18 -28,-18 L-28,14 C-28,14 -14,12 0,18 '
  + 'C14,12 28,14 28,14 L28,-18 C28,-18 14,-20 0,-14 Z M0,-14 L0,18',
);
const CHECK_PATH = new Path2D('M-7,1 L-2,7 L8,-8');
const SPARKLE_PATH = new Path2D(
  'M0,-18 L4,-4 L18,0 L4,4 L0,18 L-4,4 L-18,0 L-4,-4 Z',
);

// Decorative wash behind the photo/text: a soft two-tone radial gradient (the
// canvas equivalent of --grad-hero), a dot-grid that fades out by the time
// the photo begins, a couple of blurred accent orbs, and three faint icons --
// all at the same low opacities validated on the web page's own background
// this session, so the exported image reads as the same product rather than
// a plainer, flatter cousin of it.
function drawDecorativeBackground(ctx, width, height, brand) {
  const fadeY = Math.min(height, 820);

  // Radius sized so alpha is already ~0 by y=~700 -- well before fadeY --
  // and painted over the FULL canvas height rather than a hard-edged rect
  // cut off at fadeY. An earlier version clipped the fillRect at fadeY with
  // a radius wide enough to still carry ~5% tint there, which showed up as
  // a visible seam where the wash stopped and the flat canvasBg began.
  // Filling the whole canvas with a gradient that fades to true 0 well
  // before that point removes the seam without needing a cutoff at all.
  const wash1 = ctx.createRadialGradient(width * 0.12, 0, 0, width * 0.12, 0, 780);
  wash1.addColorStop(0, hexToRgba(brand.accent, 0.16));
  wash1.addColorStop(0.7, hexToRgba(brand.accent, 0.04));
  wash1.addColorStop(1, hexToRgba(brand.accent, 0));
  ctx.fillStyle = wash1;
  ctx.fillRect(0, 0, width, height);

  const wash2 = ctx.createRadialGradient(width * 0.96, height * 0.05, 0, width * 0.96, height * 0.05, 820);
  wash2.addColorStop(0, hexToRgba(brand.accent2 || brand.accent, 0.14));
  wash2.addColorStop(0.7, hexToRgba(brand.accent2 || brand.accent, 0.035));
  wash2.addColorStop(1, hexToRgba(brand.accent2 || brand.accent, 0));
  ctx.fillStyle = wash2;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = hexToRgba(brand.canvasInk, 0.06);
  for (let y = 20; y < fadeY; y += 34) {
    const rowAlpha = 1 - y / fadeY;
    if (rowAlpha <= 0) continue;
    ctx.globalAlpha = rowAlpha;
    for (let x = 20; x < width; x += 34) {
      ctx.beginPath();
      ctx.arc(x, y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;

  const orbs = [
    { x: width * 0.85, y: height * 0.16, r: 190, color: brand.accent, alpha: 0.16 },
    { x: width * 0.1, y: height * 0.42, r: 150, color: brand.accent2 || brand.accent, alpha: 0.12 },
  ];
  ctx.save();
  ctx.filter = 'blur(70px)'; // no-op on the rare engine that ignores it -- solid orb instead, not a crash
  for (const orb of orbs) {
    ctx.fillStyle = hexToRgba(orb.color, orb.alpha);
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  const glyph = (path, x, y, scale, color, alpha) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = 1.8 / scale;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke(path);
    ctx.restore();
  };
  glyph(BOOK_PATH, width * 0.86, 250, 2.2, brand.canvasInk, 0.16);
  glyph(CHECK_PATH, width * 0.09, 470, 3.2, brand.canvasInk, 0.2);
  ctx.save();
  ctx.translate(width * 0.9, 560);
  ctx.scale(1.8, 1.8);
  ctx.fillStyle = brand.accent2 || brand.accent;
  ctx.globalAlpha = 0.22;
  ctx.fill(SPARKLE_PATH);
  ctx.restore();
}

export async function renderResultImage({ name, institute, percent, tier, level }) {
  await ensureFonts();

  const { width, height } = CONFIG.canvas;
  const brand = CONFIG.brands[level];
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // The exported image follows the same theme as the page: light for SSC,
  // dark for HSC, so a downloaded result looks like the tool that made it.
  ctx.fillStyle = brand.canvasBg;
  ctx.fillRect(0, 0, width, height);
  drawDecorativeBackground(ctx, width, height, brand);

  // A perfect score gets the client's joke image instead of the tier artwork.
  const artSrc = percent >= 100 && CONFIG.perfectImage
    ? CONFIG.perfectImage
    : CONFIG.resultImages[tier.id];

  const [bg, logo] = await Promise.all([
    loadImage(artSrc),
    loadImage(brand.logo),
  ]);

  // Tier artwork is anchored to the bottom, scaled to the full width.
  if (bg) {
    const scale = width / bg.width;
    const drawH = bg.height * scale;
    ctx.drawImage(bg, 0, height - drawH, width, drawH);
  }

  // Every tier (and the perfect-score joke) has a catchphrase confirmed with
  // the client -- CONFIG.tiers[].label / CONFIG.perfectLabel -- drawn as a
  // caption bar over the bottom of the artwork so it reads regardless of what
  // is underneath, rather than depending on each photo's own contrast. Uses
  // the same accent/accentInk pairing as the on-page primary button, so the
  // bar is guaranteed legible without a new colour to maintain.
  const caption = percent >= 100 && CONFIG.perfectLabel ? CONFIG.perfectLabel : tier.label;
  if (caption) {
    const barH = 150;
    ctx.fillStyle = brand.accent;
    ctx.fillRect(0, height - barH, width, barH);
    ctx.fillStyle = brand.accentInk;
    ctx.textAlign = 'center';
    const capSize = fitText(ctx, caption, width - 100, 60, (s) => `800 ${s}px "Baloo Da 2", sans-serif`);
    ctx.font = `800 ${capSize}px "Baloo Da 2", sans-serif`;
    ctx.fillText(caption, width / 2, height - barH / 2 + capSize * 0.34);
  }

  // The logo sits on a rounded chip in its own background colour. On both themes
  // the chip matches the canvas backdrop and is invisible; it only shows itself
  // if a future logo ships with a different background.
  if (logo) {
    const logoH = 120;
    const logoW = logo.width * (logoH / logo.height);
    const pad = 18;
    ctx.fillStyle = brand.logoBg;
    // roundRect landed in Safari 16.4; fall back to a plain rect on older iOS.
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(60 - pad, 60 - pad, logoW + pad * 2, logoH + pad * 2, 20);
      ctx.fill();
    } else {
      ctx.fillRect(60 - pad, 60 - pad, logoW + pad * 2, logoH + pad * 2);
    }
    ctx.drawImage(logo, 60, 60, logoW, logoH);
  }

  ctx.textAlign = 'center';
  ctx.fillStyle = brand.canvasInk;

  const nameSize = fitText(ctx, name, width - 200, 76, (s) => `800 ${s}px "Baloo Da 2", sans-serif`);
  ctx.font = `800 ${nameSize}px "Baloo Da 2", sans-serif`;
  ctx.fillText(name, width / 2, 330);

  const instSize = fitText(ctx, institute, width - 220, 44, (s) => `600 ${s}px "Hind Siliguri", sans-serif`);
  ctx.font = `600 ${instSize}px "Hind Siliguri", sans-serif`;
  ctx.fillStyle = brand.canvasInkSoft;
  ctx.fillText(institute, width / 2, 400);

  // Rating out of 10, not the raw percentage (client decision 2026-08-20) --
  // must match ui.js's on-screen number exactly, via the same toRating().
  ctx.fillStyle = brand.accent;
  ctx.font = '800 220px "Baloo Da 2", sans-serif';
  ctx.fillText(`${toRating(percent)}/10`, width / 2, 620);

  ctx.fillStyle = brand.canvasInkSoft;
  ctx.font = '600 42px "Hind Siliguri", sans-serif';
  ctx.fillText('সিলেবাস শেষ', width / 2, 685);

  return canvas;
}

function toBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

export async function downloadCanvas(canvas, filename) {
  const blob = await toBlob(canvas);
  if (!blob) return false;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  // iOS Safari ignores the download attribute entirely, so the caller always
  // shows the long-press instruction as well rather than trusting this.
  return true;
}

export async function shareCanvas(canvas, filename) {
  const blob = await toBlob(canvas);
  if (!blob) return false;
  const file = new File([blob], filename, { type: 'image/png' });
  if (!navigator.canShare || !navigator.canShare({ files: [file] })) return false;
  try {
    await navigator.share({ files: [file] });
    return true;
  } catch {
    return false;
  }
}
