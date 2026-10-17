/* The Puma Express -- the title's picture: the train running west across the
 * occupied country by night, side on.
 *
 * Far to near, each layer sliding at its own pace: the sky and its moon; a
 * far range with a town on its crest, a church spire and a chateau's round
 * towers; the nearer hills and their few lights; a river with the moon in it;
 * the fields, their hedgerows and farms, low mist lying in them; the lineside,
 * a semaphore signal and a water tower; the line itself, now on its
 * embankment, now over a stone viaduct with the valley seen through its
 * arches; the train, traced from the model, her smoke rolling back over her,
 * lit by the moon above and the fire below, sparks streaming from the
 * chimney, the safety valves feathering, her lamp catching the rails ahead;
 * and the foreground rushing by. Everything is whole opaque pixels: what is
 * thin (mist, smoke, a lamp's glow) is thinned by the 4x4 dither. */
"use strict";
(() => {
  const K = PX.K, FX = PX.FX, T = PX.TitleArt = {};
  const rnd = (a, b) => a + Math.random() * (b - a);
  const RIDGE = "#26324e", RIDGE_LIT = "#4a5a7e";

  /* a canvas that repeats every TW pixels, drawn scrolled by off, between x0 and x1 */
  function strip(g, can, off, x0, x1, y) {
    const TW = can.width, o = ((Math.round(off) % TW) + TW) % TW;
    for (let x = x0 - ((x0 + o) % TW); x < x1; x += TW) {
      const a = Math.max(x, x0), b = Math.min(x + TW, x1);
      if (b > a) g.drawImage(can, a - x, 0, b - a, can.height, a, y, b - a, can.height);
    }
  }

  /* ---- the town on the far crest: roofs, a church and its spire, a chateau with two round towers ---- */
  const town = (sc, v) => K.get(`ttown:${sc}:${v}`, () => {
    const u = x => Math.round(x * sc), w = u(112), h = u(48), c = K.mk(w, h), g = c.getContext("2d");
    /* the moon is up and to the right: a lit edge down the right of every wall and roof */
    const box = (x, bw, bh) => { K.rect(g, u(x), h - u(bh), u(bw), u(bh), RIDGE); K.rect(g, u(x + bw) - 1, h - u(bh), 1, u(bh), RIDGE_LIT); };
    const roof = (x, bw, rh, y0) => { const yb = h - u(y0); K.poly(g, [[u(x) - 1, yb], [u(x + bw / 2), yb - u(rh)], [u(x + bw) + 1, yb]], RIDGE); K.line(g, u(x + bw / 2), yb - u(rh), u(x + bw), yb, RIDGE_LIT); };
    const house = (x, bw, bh, rh) => { box(x, bw, bh); roof(x, bw, rh, bh); };
    house(2, 11, 7, 5); house(12, 9, 10, 4); house(22, 13, 6, 5);
    /* the church: the nave, the tower, the spire */
    house(36, 22, 12, 7); box(57, 7, 23); roof(56, 9, 17, 23);
    house(66, 10, 8, 4);
    /* the chateau: the house between two round towers under their cones */
    house(80, 20, 14, 7); box(77, 6, 20); roof(76, 8, 10, 20); box(99, 6, 18); roof(98, 8, 9, 18);
    /* a few windows still lit, behind the blackout */
    for (const [x, y] of [[6, 3], [16, 5], [44, 4], [70, 3], [85, 6], [92, 6]]) {
      if (K.hash(x, v, 77) < 0.35) continue;
      K.rect(g, u(x), h - u(y), Math.max(1, u(1)), Math.max(1, u(1.4)), K.hash(x, v, 78) > 0.5 ? "#ffcf6a" : "#e89a4a");
    }
    return v & 1 ? K.flip(c) : c;
  });

  /* ---- the lineside: a home signal, its arm off and its lamp green; a water tower ---- */
  const signal = sc => K.get(`tsig:${sc}`, () => {
    const u = x => Math.round(x * sc), w = u(20), h = u(82), c = K.mk(w, h), g = c.getContext("2d");
    const px = u(7), pw = Math.max(2, u(2));
    K.rect(g, px - u(2), h - u(3), pw + u(4), u(3), "#1a1c22");                       /* the foot */
    K.rect(g, px, u(5), pw, h - u(5), "#1c1f27"); K.rect(g, px + pw - 1, u(5), 1, h - u(5), "#3c4252");   /* the post, lit on the moon's side */
    for (let y = u(14); y < h - u(4); y += Math.max(2, u(4))) K.rect(g, px - u(2), y, u(2), 1, "#2a2e38");   /* the ladder's rungs */
    K.rect(g, px - 1, u(3), pw + 2, u(2), "#2a2e38");                                  /* the finial */
    /* the arm, raised: "off", the line is clear */
    const ax = px + pw, ay = u(9);
    for (let i = 0; i < u(11); i++) { const y = ay - Math.round(i * 0.55); K.rect(g, ax + i, y, 1, Math.max(2, u(2.4)), i > u(7) && i < u(9) ? "#a9a59a" : "#7a2418"); K.px(g, ax + i, y, i > u(7) && i < u(9) ? "#d6d2c6" : "#a8402a"); }
    /* the spectacle and its lamp */
    K.rect(g, px - u(4), u(8), u(4), u(4), "#14161c");
    K.rect(g, px - u(3), u(9), Math.max(1, u(2)), Math.max(1, u(2)), "#a8ffb0");
    return c;
  });
  const tower = sc => K.get(`ttower:${sc}`, () => {
    const u = x => Math.round(x * sc), w = u(36), h = u(58), c = K.mk(w, h), g = c.getContext("2d");
    /* the legs and their bracing */
    for (const x of [6, 28]) { K.rect(g, u(x), u(26), Math.max(2, u(2)), h - u(26), "#1c1f27"); K.rect(g, u(x) + Math.max(2, u(2)) - 1, u(26), 1, h - u(26), "#343a48"); }
    for (let k = 0; k < 2; k++) { const y0 = u(28 + k * 15), y1 = u(42 + k * 15); K.line(g, u(7), y0, u(29), Math.min(h - 1, y1), "#20232c"); K.line(g, u(29), y0, u(7), Math.min(h - 1, y1), "#20232c"); }
    /* the tank, iron, banded, lit along its rim and down its right side */
    K.rect(g, u(3), u(9), u(30), u(17), "#2c3240");
    for (const y of [12, 17, 22]) K.rect(g, u(3), u(y), u(30), 1, "#3a4252");
    K.rect(g, u(3), u(9), u(30), 1, "#5a6478"); K.rect(g, u(33) - 1, u(9), 1, u(17), "#56607a");
    K.poly(g, [[u(2), u(9)], [u(18), u(5)], [u(34), u(9)]], "#262b37"); K.line(g, u(18), u(5), u(34), u(9), "#4a5366");
    /* the swinging arm and its leather hose, hung over the line */
    K.rect(g, 0, u(19), u(4), Math.max(1, u(1.5)), "#1a1c22");
    K.rect(g, 0, u(19), Math.max(1, u(1.5)), u(16), "#15161b");
    return c;
  });

  /* ---- the viaduct: an arch and its pier, repeated; the solid abutments at its ends ---- */
  const STONE = ["#3a4150", "#353b49", "#40485a", "#383e4c"], MORTAR = "#1b1e27";
  function ashlar(g, x0, w, h, top, sc, seed, open = null) {
    const ch = Math.max(3, Math.round(5 * sc)), bw = Math.max(5, Math.round(10 * sc));
    for (let y = top; y < h; y++) {
      const row = Math.floor((y - top) / ch), off = row & 1 ? bw >> 1 : 0;
      for (let x = 0; x < w; x++) {
        if (open && open(x, y)) continue;
        const bx = Math.floor((x0 + x + off) / bw);
        const joint = (y - top) % ch === 0 || (x0 + x + off) % bw === 0;
        g.fillStyle = joint ? MORTAR : K.hash(x0 + x, y, seed) > 0.92 ? "#2c313d" : STONE[Math.floor(K.hash(bx, row, seed) * 4)];
        g.fillRect(x, y, 1, 1);
      }
    }
  }
  const cornice = (g, w, sc) => {
    const ch = Math.max(3, Math.round(4 * sc));
    K.rect(g, 0, 0, w, ch, "#4a5262"); K.rect(g, 0, 0, w, 1, "#6a7488"); K.rect(g, 0, ch - 1, w, 1, "#232733");
    return ch;
  };
  const arch = (sc, Hs) => K.get(`tarch:${sc}:${Hs}`, () => {
    const A = Math.round(56 * sc), pier = Math.round(14 * sc), r = (A - pier) / 2, cx = pier + r, spring = Math.round(32 * sc);
    const c = K.mk(A, Hs), g = c.getContext("2d");
    const open = (x, y) => x >= pier && (y >= spring || Math.hypot(x + 0.5 - cx, y + 0.5 - spring) < r);
    const top = cornice(g, A, sc);
    ashlar(g, 0, A, Hs, top, sc, 5, open);
    /* the arch ring: voussoirs fanned round the opening, lit on the moon's side, the soffit in shadow */
    const ring = Math.max(3, Math.round(4.5 * sc));
    for (let y = top; y < spring; y++) for (let x = pier - ring; x < A; x++) {
      const dx = x + 0.5 - cx, dy = y + 0.5 - spring, d = Math.hypot(dx, dy);
      if (d < r || d >= r + ring) continue;
      const a = Math.atan2(-dy, dx), joint = ((a / (Math.PI / 11)) % 1 + 1) % 1 < 0.12;
      g.fillStyle = joint ? MORTAR : d < r + 1 ? "#262a35" : a < Math.PI / 2 ? "#525c6e" : "#454d5e";
      g.fillRect(x, y, 1, 1);
    }
    return c;
  });
  const abutment = (sc, Hs) => K.get(`tabut:${sc}:${Hs}`, () => {
    const w = Math.round(30 * sc), c = K.mk(w, Hs), g = c.getContext("2d");
    ashlar(g, 0, w, Hs, cornice(g, w, sc), sc, 9);
    K.rect(g, w - 1, 0, 1, Hs, "#4f5868");
    return c;
  });
  /* the valley seen through the arches, far below: woods, and a stream with the moon in it */
  const valley = (sc, Hv) => K.get(`tvalley:${sc}:${Hv}`, () => {
    const TW = Math.round(512 * sc), c = K.mk(TW, Hv), g = c.getContext("2d");
    K.vgrad(g, 0, 0, TW, Hv, ["#101813", "#0c130f", "#0a1014"]);
    for (let i = 0; i < 40; i++) {
      const x = K.hash(i, 1, 51) * TW, y = Hv * (0.42 + K.hash(i, 2, 51) * 0.3), r = (3 + K.hash(i, 3, 51) * 5) * sc;
      for (const dx of [-TW, 0, TW]) { K.disc(g, x + dx, y, r, r * 0.7, "#08100c"); K.px(g, x + dx + r * 0.5, y - r * 0.5, "#16241b"); }
    }
    const sy = Hv - Math.round(9 * sc);
    for (let x = 0; x < TW; x++) {
      const y = sy + Math.round(Math.sin(x / TW * Math.PI * 8) * 1.5 * sc);
      K.rect(g, x, y, 1, Math.max(2, Math.round(2 * sc)), "#15253a");
      if (K.hash(x, 3, 52) > 0.93) K.px(g, x, y, "#6d84a6");
    }
    return c;
  });

  /* ---- the picture ---- */
  let tOff = 0, tAng = 0, tPuff = 0, tSpark = 0, tValve = 0, back = null;
  T.draw = (cv, now, dt) => {
    const g = cv.getContext("2d"), W = cv.width, H = cv.height, Mo = PX.Model, World = PX.World;
    g.imageSmoothingEnabled = false;
    const sc = Math.round(H / 360 * 100) / 100, ry = Math.round(H * 0.83), hor = Math.round(H * 0.6);
    const speed = 70 * sc, u = x => Math.round(x * sc);
    tOff += dt * speed; tAng += dt * speed / (0.78 * 15 * sc);
    const mx = W * 0.8;   /* the moon, as the sky sets it */

    g.drawImage(World.skyImage(W, hor + 1, 0, 1), 0, 0);
    /* the far range, blue in the moonlight, its ridges lit, a town on its crest; the nearer hills and their lights.
       They creep, so they are drawn again only when one of them has moved a whole pixel */
    const key = `${W}x${H}:${Math.round(tOff * 0.04)}:${Math.round(tOff * 0.12)}`;
    if (!back || back.key !== key) {
      if (!back || back.c.width !== W || back.c.height !== H) back = { c: K.mk(W, H) };
      back.key = key;
      const bg = back.c.getContext("2d");
      bg.clearRect(0, 0, W, H);
      const ridge = (k, base, amp, freq, seed, col, lit) => {
        for (let x = 0; x < W; x++) { const h = Math.round(base + K.fbm((x + tOff * k) / freq, seed) * amp); bg.fillStyle = col; bg.fillRect(x, hor - h, 1, h + (H - hor)); bg.fillStyle = lit; bg.fillRect(x, hor - h, 1, 1); }
      };
      ridge(0.04, 26 * sc, 46 * sc, 120 * sc, 1, RIDGE, RIDGE_LIT);
      for (let i = -1; i < 2; i++) {
        const cx = Math.round(W * 0.55 + i * 1800 * sc - tOff * 0.04), tn = town(sc, (i + 4) & 3);
        if (cx + tn.width < 0 || cx - tn.width > W) continue;
        const crest = Math.round(26 * sc + K.fbm((cx + tOff * 0.04) / (120 * sc), 1) * 46 * sc);
        bg.drawImage(tn, cx - (tn.width >> 1), hor - crest - tn.height + u(7));
      }
      ridge(0.12, 6 * sc, 26 * sc, 70 * sc, 2, "#1a2438", "#32425e");
      /* villages on the nearer hills: a few lights */
      for (let i = Math.floor(tOff * 0.12 / 90); i < (tOff * 0.12 + W) / 90 + 1; i++) {
        if (K.hash(i, 1, 33) < 0.6) continue;
        const x = Math.round(i * 90 - tOff * 0.12), y = hor - Math.round(6 * sc + K.hash(i, 2, 33) * 8 * sc);
        for (let k = 0; k < 4; k++) K.px(bg, x + k * 3, y + (k % 2), K.hash(i, k, 34) > 0.5 ? "#ffcf6a" : "#e89a4a");
      }
    }
    g.drawImage(back.c, 0, 0);

    /* the fields to the line, falling away dark */
    g.drawImage(K.get(`tfields:${W}x${ry - hor}`, () => { const c = K.mk(W, ry - hor); K.vgrad(c.getContext("2d"), 0, 0, W, ry - hor, ["#1a2620", "#141d18", "#0f1712"], hor); return c; }), 0, hor);
    /* the river, winding along the valley floor, the moon broken on it */
    const glint = Math.floor(now / 140);
    for (let x = 0; x < W; x++) {
      const q = (x + tOff * 0.22) / (90 * sc), y = hor + Math.round(12 * sc + K.fbm(q, 41) * 5 * sc), th = Math.max(2, Math.round(2 * sc + K.fbm(q * 1.7, 42) * 3 * sc));
      K.rect(g, x, y - 1, 1, 1, "#0c140f"); K.rect(g, x, y, 1, th, "#1e3048"); K.px(g, x, y, "#3a5272");
      const near = Math.abs(x - mx);
      if (near < 18 * sc) for (let j = 0; j < th; j++) if (K.hash(x, j + glint, 9) > 0.4 + near / (18 * sc) * 0.55) K.px(g, x, y + j, near < 6 * sc ? "#c8d4e8" : "#7d90b0");
    }
    /* the copses and the poplars, a middle distance */
    for (let i = Math.floor(tOff * 0.35 / 26) - 2; i < (tOff * 0.35 + W) / 26 + 2; i++) {
      if (K.hash(i, 3, 7) < 0.45) continue;
      const type = K.hash(i, 4, 7) < 0.4 ? "poplar" : "oak", h = (type === "poplar" ? 44 : 30) * sc * (0.7 + K.hash(i, 5, 7) * 0.5);
      const t = World.tree(type, h, i % 3, 0, 1), x = Math.round(i * 26 - tOff * 0.35 + K.hash(i, 6, 7) * 14);
      g.drawImage(t, x - (t.width >> 1), Math.round(hor + 10 * sc - t.height + K.hash(i, 8, 7) * 6 * sc));
    }
    /* hedgerows across the fields, nearer ones faster; a farm here and there; mist lying low between */
    const hedge = (k, y0, seed) => {
      for (let x = 0; x < W; x++) {
        const w = x + tOff * k, y = Math.round(y0 + (K.fbm(w / (80 * sc), seed) - 0.5) * 8 * sc);
        const bush = Math.round((1 + K.hash(Math.floor(w / (5 * sc)), seed, 3) * 2.5) * sc);
        K.rect(g, x, y - bush, 1, bush + 1, "#0a110d");
        if (K.hash(Math.floor(w), seed, 4) > 0.8) K.px(g, x, y - bush, "#1f3127");
      }
    };
    const mist = (k, y0, seed, a) => {
      const d = K.dither(g, "136,152,182", a); if (!d) return;
      g.fillStyle = d;
      const sp = 120 * sc, drift = now / 1000 * 3 * sc + tOff * k;
      for (let i = Math.floor(drift / sp) - 1; i < (drift + W) / sp + 1; i++) {
        if (K.hash(i, seed, 5) < 0.3) continue;
        K.disc(g, i * sp - drift + K.hash(i, seed, 6) * 40 * sc, y0 + (K.hash(i, seed, 7) - 0.5) * 6 * sc, (45 + K.hash(i, seed, 8) * 50) * sc, (2 + K.hash(i, seed, 9) * 2.5) * sc);
      }
    };
    hedge(0.45, hor + 22 * sc, 1);
    for (let i = Math.floor(tOff * 0.5 / (230 * sc)) - 1; i < (tOff * 0.5 + W) / (230 * sc) + 1; i++) {
      if (K.hash(i, 1, 61) < 0.45) continue;
      const f = World.farm(1.4 * sc, i % 5, 0, 1), x = Math.round(i * 230 * sc - tOff * 0.5 + K.hash(i, 2, 61) * 60 * sc);
      g.drawImage(f, x, Math.round(hor + (30 + K.hash(i, 3, 61) * 6) * sc) - f.height);
    }
    mist(0.5, hor + 30 * sc, 1, 0.28);
    hedge(0.62, hor + 40 * sc, 2);
    mist(0.66, hor + 50 * sc, 2, 0.24);
    hedge(0.8, hor + 62 * sc, 3);
    mist(0.85, hor + 72 * sc, 3, 0.19);

    /* the line: where the viaduct carries it over the valley, and where it runs on its embankment */
    const VP = 2600 * sc, VA = 280 * sc, VL = 1100 * sc, spans = [];
    for (let i = Math.floor((tOff - VA - VL) / VP); i <= Math.floor((tOff + W - VA) / VP); i++) {
      const xs = Math.round(i * VP + VA - tOff); if (xs + VL > 0 && xs < W) spans.push([xs, Math.round(xs + VL)]);
    }
    const onViaduct = x => spans.some(([a, b]) => x >= a - 30 * sc && x < b + 30 * sc);
    /* the lineside, behind the line: a signal, a water tower, never on the viaduct */
    for (let i = Math.floor((tOff - 40 * sc) / (1500 * sc)); i < (tOff + W) / (1500 * sc) + 1; i++) {
      const x = Math.round(i * 1500 * sc + 900 * sc - tOff); if (onViaduct(x)) continue;
      const sg = signal(sc); g.drawImage(sg, x, ry - u(3) - sg.height);
      const d = K.dither(g, "140,255,160", 0.3); if (d) { g.fillStyle = d; K.disc(g, x + u(5), ry - u(3) - sg.height + u(10), u(5), u(5)); }
    }
    for (let i = Math.floor((tOff - 60 * sc) / (3700 * sc)); i < (tOff + W) / (3700 * sc) + 1; i++) {
      const x = Math.round(i * 3700 * sc + 2300 * sc - tOff); if (onViaduct(x)) continue;
      const tw = tower(sc); g.drawImage(tw, x, ry - u(4) - tw.height);
    }
    /* the embankment: grass, then the ballast shoulder */
    for (let y = ry - Math.round(10 * sc); y < H; y++) { const k = (y - ry) / (H - ry); g.fillStyle = y < ry ? "#2a3428" : K.mix("#3a3630", "#14120f", PX.clamp(k * 1.4, 0, 1)); g.fillRect(0, y, W, 1); }
    for (let x = 0; x < W; x++) { const q = K.hash(Math.floor(x + tOff), 1, 3); if (q > 0.5) K.px(g, x, ry + 2 + Math.floor(q * 6 * sc), q > 0.85 ? "#6a6458" : "#4a453d"); }
    /* the viaduct over it: the valley seen through, the arches, an abutment at either end */
    const Hs = H - ry, top = ry - Math.round(10 * sc), vc = valley(sc, H - top), ar = arch(sc, Hs), ab = abutment(sc, Hs);
    for (const [xs, xe] of spans) {
      strip(g, vc, tOff * 0.3, Math.max(0, xs), Math.min(W, xe), top);
      const n = Math.floor((xe - xs - ab.width * 2) / ar.width), x0 = xs + ab.width + Math.round((xe - xs - ab.width * 2 - n * ar.width) / 2), x1 = x0 + n * ar.width;
      for (let k = 0; k < n; k++) g.drawImage(ar, x0 + k * ar.width, ry);
      /* the abutments, run out to meet the arches (the last opening's far side is the right one's face) */
      g.drawImage(ab, xs, ry); g.drawImage(ab, x0 - ab.width, ry);
      g.drawImage(ab, x1, ry); g.drawImage(ab, xe - ab.width, ry);
    }
    /* the sleepers' ends and the rail */
    for (let x = -((tOff) % (11 * sc)); x < W; x += 11 * sc) K.rect(g, Math.round(x), ry + 1, Math.round(6 * sc), Math.round(3 * sc), "#3a2a1c");
    K.rect(g, 0, ry - 1, W, Math.max(2, Math.round(2 * sc)), "#4a525c"); K.rect(g, 0, ry - 1, W, 1, "#a8b2be");

    /* the train: the engine leading, at the right, the rest going off to the left */
    const s = Math.round(15 * sc), kinds = ["engine", "tender", "van0", "van1", "van2", "van3", "flat"];
    let x = Math.round(W * 0.93) - Math.round(11.4 * s);
    const placed = [];
    for (let i = 0; i < kinds.length; i++) {
      const kind = kinds[i], sp = Mo.sideSprite(kind, s, Mo.LIGHT_NIGHT);
      placed.push([kind, x]);
      if (x + sp.width < 0) break;
      const next = kinds[i + 1];
      if (next) x -= Math.round((Mo.sideSprite(next, s, Mo.LIGHT_NIGHT).len + 0.25) * s);
    }
    /* the firebox's glow on the ballast under the cab, breathing as the fire draws */
    const ex = placed[0][1], cabX = ex + Math.round(1.0 * s), breath = 0.85 + 0.15 * K.noise(now / 90, 3);
    const grd = g.createRadialGradient(cabX, ry, 2, cabX, ry, 50 * sc);
    grd.addColorStop(0, `rgba(255,140,50,${(0.35 * breath).toFixed(3)})`); grd.addColorStop(1, "rgba(255,140,50,0)"); g.fillStyle = grd; g.fillRect(cabX - 60 * sc, ry - 40 * sc, 120 * sc, 60 * sc);
    for (const [kind, px] of placed.slice().reverse()) Mo.drawSide(g, kind, s, px, ry, tAng);
    /* the lamp's beam ahead, its glow, and the rails catching it */
    const lamp = { x: ex + Math.round(10.75 * s), y: ry - Math.round(1.7 * s) };
    K.poly(g, [[lamp.x, lamp.y - 1], [W + 40, lamp.y - 30 * sc], [W + 40, lamp.y + 24 * sc]], "rgba(255,240,190,.07)");
    g.fillStyle = "rgba(255,240,190,.3)"; K.disc(g, lamp.x + 2, lamp.y, 5 * sc, 5 * sc);
    for (let xx = lamp.x + u(6); xx < W; xx++) { const t = (xx - lamp.x) / (90 * sc); if (t < 1) K.px(g, xx, ry - 1, K.mix("#fff4d0", "#a8b2be", t)); }

    /* smoke rolling back from the chimney: moonlit on top, lit by the fire from below while it is young */
    FX.use("title");
    const ch = { x: ex + Math.round(9.35 * s), y: ry - Math.round(4.3 * s) };
    tPuff += dt * 18;
    while (tPuff > 1) {
      tPuff -= 1;
      FX.smoke(ch.x + rnd(-1, 1) * sc, ch.y, { r: 3 * sc, grow: rnd(9, 14) * sc, vx: -speed * rnd(0.86, 0.98), vy: -rnd(34, 48) * sc, drag: 1.3, life: rnd(3.6, 4.6), col: [108, 114, 136], a: 0.9, shade: [66, 72, 92], under: [255, 146, 64], layer: "back" });
    }
    /* sparks thrown up and streaming back */
    tSpark += dt * 4;
    while (tSpark > 1) { tSpark -= 1; FX.spark(ch.x + rnd(-1, 1), ch.y - 1, { vx: -speed * rnd(0.4, 0.95), vy: -rnd(30, 70) * sc, g: 55 * sc, col: Math.random() < 0.5 ? "#ffad3c" : "#ffe08a", life: rnd(0.7, 1.5) }); }
    /* the safety valves lifting now and then, a white feather off the firebox */
    tValve += dt; if (tValve > 7) tValve = 0;
    if (tValve < 1.4 && Math.random() < 0.6) FX.smoke(ex + Math.round(2.35 * s), ry - Math.round(3.85 * s), { r: 1.2 * sc, grow: 9 * sc, vx: -speed * 0.85, vy: -rnd(36, 50) * sc, drag: 1.5, life: 0.9, col: [214, 220, 232], a: 0.6, layer: "back" });
    /* steam from the cylinder cocks */
    if (Math.random() < 0.2) FX.smoke(ex + Math.round(8.2 * s), ry - Math.round(0.9 * s), { r: 1.5 * sc, grow: 8 * sc, vx: -speed * 0.6, vy: -4, life: 0.8, col: [220, 226, 236], a: 0.35, layer: "front" });
    FX.step(dt);
    FX.draw(g, "back");
    FX.draw(g, "front");

    /* the foreground rushing by: poles with their wires, fence posts, grass */
    for (let i = Math.floor(tOff * 1.6 / (150 * sc)) - 1; i < (tOff * 1.6 + W) / (150 * sc) + 1; i++) {
      const px = Math.round(i * 150 * sc - tOff * 1.6), top2 = Math.round(ry - 120 * sc);
      K.rect(g, px, top2, Math.round(4 * sc), H - top2, "#0d0a08"); K.rect(g, px - Math.round(10 * sc), top2 + Math.round(6 * sc), Math.round(24 * sc), Math.round(3 * sc), "#0d0a08");
      for (const f of [-8, 10]) K.px(g, px + f * sc, top2 + 4 * sc, "#c9c6bc");
      g.fillStyle = "rgba(10,12,18,.9)";
      for (let k = 0; k < 150 * sc; k += 2) { const t2 = k / (150 * sc), sag = Math.sin(t2 * Math.PI) * 10 * sc; g.fillRect(px + k, Math.round(top2 + 5 * sc + sag), 1, 1); }
    }
    for (let i = Math.floor(tOff * 2.2 / (34 * sc)) - 1; i < (tOff * 2.2 + W) / (34 * sc) + 1; i++) { const px = Math.round(i * 34 * sc - tOff * 2.2); K.rect(g, px, H - Math.round(30 * sc), Math.round(3 * sc), Math.round(30 * sc), "#080706"); }
    for (let x2 = 0; x2 < W; x2++) { const h = Math.round((4 + K.hash(Math.floor((x2 + tOff * 2.4) / 3), 2, 9) * 10) * sc); K.rect(g, x2, H - h, 1, h, "#060805"); }
    FX.use(PX.Render.scene || "cab");
  };
})();
