import { CONFIG } from '../data/config.js';

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

  const [bg, logo] = await Promise.all([
    loadImage(CONFIG.resultImages[tier.id]),
    loadImage(brand.logo),
  ]);

  // Tier artwork is anchored to the bottom, scaled to the full width.
  if (bg) {
    const scale = width / bg.width;
    const drawH = bg.height * scale;
    ctx.drawImage(bg, 0, height - drawH, width, drawH);
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

  ctx.fillStyle = brand.accent;
  ctx.font = '800 220px "Baloo Da 2", sans-serif';
  ctx.fillText(`${percent}%`, width / 2, 620);

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
