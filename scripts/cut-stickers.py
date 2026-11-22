"""Cut a transparent sticker sheet into separate stickers.

Usage: python3 scripts/cut-stickers.py SHEET.png OUT_DIR PREVIEW.png [--names=a,b,c] [--sheet=path.webp] [--no-outline]
  --names       one name per sticker, top row left to right, then the next row (default: the 7 line stickers)
  --sheet       where to save a half-size copy of the cleaned sheet
  --no-outline  also remove a white sticker border (not needed for the current Krea sheets)
Needs Pillow, numpy and scipy.
"""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage

src, outdir, preview = sys.argv[1], sys.argv[2], sys.argv[3]
im = Image.open(src).convert('RGBA')
a = np.asarray(im).copy()
a[a[:, :, 3] < 40, 3] = 0                      # faint haze shows up as specks on dark backgrounds
# remove the white sticker outline: from the transparent outside, clear light pixels that lie
# within the outline band, stopping at the dark line drawing (inner white parts stay)
if '--no-outline' in sys.argv:
    rgb_min = a[:, :, :3].min(axis=2).astype(int)
    rgb_spread = a[:, :, :3].max(axis=2).astype(int) - rgb_min
    whiteish = (rgb_min > 150) & (rgb_spread < 60)
    total = 0
    for _ in range(4):                          # each pass reaches 40px further into white fills
        outside = a[:, :, 3] == 0
        dist = ndimage.distance_transform_edt(~outside)
        light = whiteish & (dist <= 40) & ~outside
        seeds = light & (dist <= 2)
        lab_l, _ = ndimage.label(light, structure=np.ones((3, 3)))
        band = np.isin(lab_l, np.unique(lab_l[seeds])) & light
        band &= lab_l > 0
        if not band.any():
            break
        a[band, 3] = 0
        total += int(band.sum())
    band_sum = total
    # white pockets trapped between hair strands at the edge: small and close to the outside
    outside = a[:, :, 3] == 0
    dist = ndimage.distance_transform_edt(~outside)
    pockets = whiteish & ~outside
    lab_p, np_ = ndimage.label(pockets, structure=np.ones((3, 3)))
    if np_:
        ids = np.arange(1, np_ + 1)
        area = ndimage.sum(pockets, lab_p, ids)
        far = ndimage.maximum(dist, lab_p, ids)
        thick = ndimage.maximum(ndimage.distance_transform_edt(pockets), lab_p, ids)
        r, g, b_ = (a[:, :, k].astype(int) for k in range(3))
        hairish = ((r >= g) & (g >= b_) & (r - b_ > 25) & (np.maximum(r, g) < 215)) | outside
        cand = ids[(area < 6000) & (far <= 90) & (thick <= 7)]
        drop = []
        for lid in cand:
            sl = ndimage.find_objects((lab_p == lid).astype(int))[0]
            sl = (slice(max(sl[0].start - 4, 0), sl[0].stop + 4), slice(max(sl[1].start - 4, 0), sl[1].stop + 4))
            comp = lab_p[sl] == lid
            ring = ndimage.binary_dilation(comp, iterations=3) & ~comp
            if ring.any() and hairish[sl][ring].mean() >= 0.8:
                drop.append(lid)
        rm = np.isin(lab_p, drop)
        rm = ndimage.binary_dilation(rm, iterations=1) & whiteish & ~outside | rm
        a[rm, 3] = 0
        print('edge pockets cleared', len(drop), int(rm.sum()))
    # soften the new edge by one pixel
    new_out = a[:, :, 3] == 0
    edge = ndimage.binary_dilation(new_out, structure=np.ones((3, 3))) & ~new_out
    a[edge, 3] = (a[edge, 3].astype(int) * 0.55).astype(np.uint8)
    print('outline pixels cleared', band_sum)
solid = a[:, :, 3] > 100
lab, n = ndimage.label(solid, structure=np.ones((3, 3)))
sizes = ndimage.sum(solid, lab, np.arange(1, n + 1))
objs = ndimage.find_objects(lab)
# drop anything tiny and not solid
keep_ids = [i + 1 for i in range(n) if sizes[i] >= 1500]
keep = ndimage.binary_dilation(np.isin(lab, keep_ids), iterations=3) & (a[:, :, 3] > 0)
a[~keep, 3] = 0
clean = Image.fromarray(a)

bodies = [[objs[i][1].start, objs[i][0].start, objs[i][1].stop, objs[i][0].stop, i + 1] for i in range(n) if sizes[i] >= 150000]
widths = sorted(b[2] - b[0] for b in bodies)
med = widths[len(widths) // 2]
split = []
for b in bodies:
    if b[2] - b[0] > 1.5 * med:                # two stickers touching: cut at the thinnest column
        x0, x1 = b[0] + int((b[2] - b[0]) * 0.3), b[0] + int((b[2] - b[0]) * 0.7)
        col = solid[b[1]:b[3], x0:x1].sum(axis=0)
        cut = x0 + int(np.argmin(col))
        print('split', b, 'at', cut, 'col mass', int(col.min()))
        split += [[b[0], b[1], cut, b[3]], [cut, b[1], b[2], b[3]]]
        new_id = lab.max() + 1                   # give the right half its own label
        part = (lab == b[4]); part[:, :cut] = False
        lab[part] = new_id
    else:
        split.append(b[:4])
boxes = split
want = next((len(x.split('=', 1)[1].split(',')) for x in sys.argv if x.startswith('--names=')), 7)
def gap(p, q):
    dx = max(p[0] - q[2], q[0] - p[2], 0); dy = max(p[1] - q[3], q[1] - p[3], 0); return (dx * dx + dy * dy) ** .5
while len(boxes) > want:                         # parts of one sticker that do not touch (e.g. a robot beside her)
    i, j = min(((i, j) for i in range(len(boxes)) for j in range(i + 1, len(boxes))), key=lambda ij: gap(boxes[ij[0]], boxes[ij[1]]))
    p, q = boxes[i], boxes[j]
    print('merge', p, q, 'gap', round(gap(p, q)))
    boxes[i] = [min(p[0], q[0]), min(p[1], q[1]), max(p[2], q[2]), max(p[3], q[3])]
    del boxes[j]
for i in range(n):
    if sizes[i] < 1500 or sizes[i] >= 150000:
        continue
    sl = objs[i]
    cx, cy = (sl[1].start + sl[1].stop) / 2, (sl[0].start + sl[0].stop) / 2
    def dist(b):
        dx = max(b[0] - cx, 0, cx - b[2]); dy = max(b[1] - cy, 0, cy - b[3]); return dx * dx + dy * dy
    j = min(range(len(boxes)), key=lambda k: dist(boxes[k]))
    b = boxes[j]
    boxes[j] = [min(b[0], sl[1].start), min(b[1], sl[0].start), max(b[2], sl[1].stop), max(b[3], sl[0].stop)]
boxes.sort(key=lambda b: (0 if (b[1] + b[3]) / 2 < im.height / 2 else 1, b[0]))
names = ['learn', 'power', 'agents', 'build', 'design', 'work', 'exam']
for arg in sys.argv:
    if arg.startswith('--names='):
        names = arg.split('=', 1)[1].split(',')
assert len(boxes) == len(names), (len(boxes), len(names))
arr = np.asarray(clean)
for k, (name, b) in enumerate(zip(names, boxes)):
    pad = 8
    box = (max(b[0] - pad, 0), max(b[1] - pad, 0), min(b[2] + pad, im.width), min(b[3] + pad, im.height))
    c = arr[box[1]:box[3], box[0]:box[2]].copy()
    # erase pixels that belong to a neighbouring sticker's blob inside this crop
    sub = lab[box[1]:box[3], box[0]:box[2]]
    own = set()
    for lid in np.unique(sub):
        if lid == 0:
            continue
        ys, xs = np.where(lab == lid)
        cx, cy = xs.mean(), ys.mean()
        if b[0] <= cx <= b[2] and b[1] <= cy <= b[3]:
            own.add(lid)
    other = (sub > 0) & ~np.isin(sub, list(own))
    other = ndimage.binary_dilation(other, iterations=3)
    # a merged blob is "own" for both halves; trim at the cut line by keeping only this box's columns
    c[other, 3] = 0
    ci = Image.fromarray(c)
    bb = ci.getbbox()
    if bb:
        ci = ci.crop(bb)
    s = 720 / max(ci.size)
    if s < 1:
        ci = ci.resize((round(ci.width * s), round(ci.height * s)), Image.LANCZOS)
    ci.save(f'{outdir}/{name}.webp', quality=88, method=6)
    print(name, box, ci.size)
sheet_name = next((x.split('=', 1)[1] for x in sys.argv if x.startswith('--sheet=')), f'{outdir}/../sheet-lines.webp')
clean.resize((clean.width // 2, clean.height // 2), Image.LANCZOS).save(sheet_name, quality=90, method=6)
prev = Image.new('RGBA', clean.size, (21, 21, 21, 255)); prev.alpha_composite(clean)
prev.convert('RGB').resize((clean.width // 3, clean.height // 3)).save(preview)
