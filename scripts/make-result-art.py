"""Cut the subject out of the client's result photos and emit the eight tier
images (plus the 100% special) at the canvas width the renderer expects.

Local authoring tool only. Not part of the deployed page and not required to
build it — the eight PNGs it produces are committed.

Run:  python scripts/make-result-art.py
"""
import glob, io, os, sys
from PIL import Image
from rembg import remove, new_session

CANVAS_W = 1080
CANVAS_H = 1920
TARGET_H = int(CANVAS_H * 0.52)   # how tall the person stands in the frame

# Tone order agreed with the client. Keys are substrings of the Bengali filenames.
MAP = {
    'batch27-tier1': 'তুই তো শেষ মামা',
    'batch27-tier2': 'এভাবে চলবে না',
    'batch27-tier3': 'আরও ভাল করতে হবে',
    'batch27-tier4': 'পারফেক্ট',
    'batch28-tier1': 'তুই তো শেষ মামা',
    'batch28-tier2': 'এভাবে চলবে না',
    'batch28-tier3': 'সাবাস',
    'batch28-tier4': 'GOAT',
    'perfect':       'মিথ্যা কথা বলিস কেন',
}

def find(fragment, files):
    hits = [f for f in files if fragment in f]
    if not hits:
        raise SystemExit(f'No source image matches {fragment!r}')
    return hits[0]

def cutout(path, session, cache):
    if path in cache:
        return cache[path]
    src = Image.open(path).convert('RGBA')
    out = remove(src, session=session, post_process_mask=True)
    bbox = out.getbbox()               # tight crop around non-transparent pixels
    if bbox:
        out = out.crop(bbox)
    cache[path] = out
    return out

def main():
    files = [p for p in glob.glob('source-art/*.jpeg')
             if os.path.basename(p) not in ('Hulkenstein.jpeg', 'Infinity School.jpeg')]
    if not files:
        raise SystemExit('No source photos found in the project root')

    os.makedirs('images/results', exist_ok=True)
    session = new_session('u2net')
    cache = {}

    for slot, fragment in MAP.items():
        src_path = find(fragment, files)
        person = cutout(src_path, session, cache)

        # Scale so the person stands TARGET_H tall, never wider than the canvas.
        scale = TARGET_H / person.height
        if person.width * scale > CANVAS_W:
            scale = CANVAS_W / person.width
        w, h = max(1, round(person.width * scale)), max(1, round(person.height * scale))
        person_s = person.resize((w, h), Image.LANCZOS)

        # Transparent plate exactly canvas-width; the renderer scales to width
        # and anchors to the bottom, so the plate height is the standing height.
        plate = Image.new('RGBA', (CANVAS_W, h), (0, 0, 0, 0))
        plate.paste(person_s, ((CANVAS_W - w) // 2, 0), person_s)

        # Quantise to a 255-colour palette. Students load these over mobile
        # data in Bangladesh; this cuts ~870KB to ~180KB per image at full
        # resolution with no visible banding on skin tones.
        dest = f'images/results/{slot}.png'
        plate.quantize(colors=255, method=Image.FASTOCTREE).save(dest, 'PNG', optimize=True)
        alpha = plate.split()[3]
        covered = sum(alpha.point(lambda v: 1 if v > 8 else 0).getdata())
        pct = 100 * covered / (plate.width * plate.height)
        print(f'{slot:16s} <- {os.path.basename(src_path):40s} {plate.width}x{plate.height} subject={pct:.1f}%')

if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    main()
