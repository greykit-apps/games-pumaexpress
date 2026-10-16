/* The Puma Express -- the country going by: the picture through the cab's
 * window and over the guns.
 *
 * The ground is painted a pixel at a time each frame, in perspective: fields
 * in their own crops, ploughland and stubble whose rows run to the vanishing
 * point, pasture, hedgerows on the field edges, the grass verge, the ballast,
 * the sleepers and two steel rails catching the lamp. It fades into the
 * night's haze toward the horizon. On it stand the telegraph poles and their
 * wires, oaks, the tall poplars of the puma country, farms with a lit window,
 * haystacks, and what the line holds: stations, bridges over their rivers,
 * points and their signals, a cut with the Resistance's red lamps at it.
 * Over it all a night sky, its moon, its stars and its cloud.
 *
 * The sky, the hills and every sprite are drawn once and kept. What is on
 * the line comes from the engine (PX.Line.ahead); the rest is dealt from the
 * distance run, so the same mile looks the same both ways. A mile of line
 * is VM metres of the picture, so two miles off is already the horizon. */
"use strict";
(() => {
  const K = PX.K, M = K.M, L = PX.Line, W = PX.World = {};
  W.VM = 240;
  const GAUGE = 0.72, FAR = 1100;
  const rgb = h => K.rgb(h);

  W.cam = (vp, o) => {
    const f = o.f || vp.h * 1.05, hor = vp.y + Math.round(vp.h * o.hor), cx = vp.x + Math.round(vp.w * (o.cx || 0.5));
    return Object.assign({}, o, { f, hor, cx, vp });
  };
  const P = (c, X, Y, Z) => ({ x: c.cx + (X - c.x) * c.f / Z, y: c.hor - (Y - c.h) * c.f / Z, s: c.f / Z });
  W.P = P;
  const lb = l => Math.round(l * 8) / 8;

  /* the light on the land: moonlight, cold and blue, warming toward day */
  const ambient = l => l <= 0 ? [0.34, 0.4, 0.56] : l < 0.55 ? [0.34 + l * 0.5, 0.4 + l * 0.3, 0.56 + l * 0.05] : [0.62 + (l - 0.55) * 0.85, 0.57 + (l - 0.55) * 0.95, 0.59 + (l - 0.55) * 0.92];
  W.ambient = ambient;
  /* the haze at the horizon: the sky's own lowest colour */
  const haze = l => rgb(K.sky(l)[4]);

  /* ---- the sky ---- */
  const MOON_DIR = look => look > 0 ? 0.8 : 0.2;
  function skyCanvas(w, h, l, look) {
    return K.get(`sky:${w}x${h}:${lb(l)}:${look}`, () => {
      const c = K.mk(w, h), g = c.getContext("2d"), img = g.createImageData(w, h), d = img.data;
      const cols = K.sky(l).map(rgb), mx = w * MOON_DIR(look), my = h * 0.3;
      for (let y = 0; y < h; y++) {
        const t = Math.pow(y / Math.max(1, h - 1), 1.25) * 4, i = Math.min(3, Math.floor(t)), f = t - i;
        for (let x = 0; x < w; x++) {
          const ff = PX.clamp(f + K.bayer(x, y) * 0.35, 0, 1), A = cols[i], B = cols[i + 1];
          let r = A[0] + (B[0] - A[0]) * ff, gg = A[1] + (B[1] - A[1]) * ff, b = A[2] + (B[2] - A[2]) * ff;
          /* the moon's glow on the sky */
          const dm = Math.hypot(x - mx, (y - my) * 1.2), glow = Math.max(0, 1 - dm / 130) * (1 - l) * 34;
          r += glow * 0.8; gg += glow * 0.85; b += glow;
          /* cloud: long thin banks, edged with moonlight on the side toward it */
          const cn = K.fbm2(x / 110 + 3, y / 14, 7 + look) - 0.5 - (y / h) * 0.05;
          if (cn > 0) {
            const dens = Math.min(1, cn * 4.5), edge = cn < 0.08 ? 1 : 0, lit = Math.max(0, 1 - Math.abs(x - mx) / (w * 0.7));
            const cr = PX.lerp(r, 34 + l * 120, dens * 0.8) + edge * lit * 38 * (1 - l * 0.5);
            const cg = PX.lerp(gg, 40 + l * 110, dens * 0.8) + edge * lit * 40 * (1 - l * 0.5);
            const cb = PX.lerp(b, 62 + l * 100, dens * 0.8) + edge * lit * 46 * (1 - l * 0.5);
            r = cr; gg = cg; b = cb;
          }
          const o = (y * w + x) * 4; d[o] = r; d[o + 1] = gg; d[o + 2] = b; d[o + 3] = 255;
        }
      }
      /* the stars: faint, bright, a few with their cross; never in cloud */
      if (l < 0.6) {
        const n = Math.round(w * h / 90);
        for (let i = 0; i < n; i++) {
          const x = Math.floor(K.hash(i, 1, 77) * w), y = Math.floor(Math.pow(K.hash(i, 2, 77), 1.4) * (h - 4));
          if (K.fbm2(x / 110 + 3, y / 14, 7 + look) - 0.5 > -0.03) continue;
          const b = K.hash(i, 3, 77) * (1 - l * 1.6); if (b < 0.12) continue;
          const v = 90 + b * 165, o = (y * w + x) * 4, tint = K.hash(i, 4, 77);
          d[o] = Math.max(d[o], v * (tint > 0.8 ? 1 : 0.85)); d[o + 1] = Math.max(d[o + 1], v * 0.92); d[o + 2] = Math.max(d[o + 2], v * (tint < 0.3 ? 0.8 : 1));
          if (b > 0.93 && x > 1 && y > 1 && x < w - 2 && y < h - 2) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const q = ((y + dy) * w + x + dx) * 4; d[q] = Math.max(d[q], v * 0.5); d[q + 1] = Math.max(d[q + 1], v * 0.5); d[q + 2] = Math.max(d[q + 2], v * 0.55); }
        }
      }
      g.putImageData(img, 0, 0);
      /* the moon, a waning gibbous, its seas and craters */
      if (l < 0.85) {
        const m = moon();
        g.globalAlpha = 1 - l;
        g.drawImage(m, Math.round(mx - m.width / 2), Math.round(my - m.height / 2));
        g.globalAlpha = 1;
      }
      return c;
    });
  }
  W.skyImage = (w, h, l, look = 1) => skyCanvas(w, h, l, look);
  const moon = () => K.get("moon2", () => {
    const R = 12, c = K.mk(R * 2 + 3, R * 2 + 3), g = c.getContext("2d"), img = g.createImageData(c.width, c.height), d = img.data;
    for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
      const dx = x - R - 1, dy = y - R - 1, r = Math.hypot(dx, dy);
      if (r > R + 0.4) continue;
      /* the shadowed limb: a gibbous moon, the dark eating in from the left */
      const term = Math.hypot(dx + R * 0.95, dy) < R * 0.98;
      let v = 236 - (r / R) * 26;
      const sea = K.fbm2(x / 5 + 2, y / 5, 31);
      if (sea > 0.55) v -= 34 * (sea - 0.55) / 0.45 + 10;
      for (const [cx2, cy2, cr] of [[5, -6, 2], [-3, 4, 2.4], [6, 5, 1.5], [-6, -2, 1.3]]) { const q = Math.hypot(dx - cx2, dy - cy2); if (q < cr) v -= 18; else if (q < cr + 0.8) v += 8; }
      if (term) v *= 0.18;
      const o = (y * c.width + x) * 4; d[o] = v; d[o + 1] = v * 0.97; d[o + 2] = v * 0.86; d[o + 3] = term ? 120 : 255;
    }
    g.putImageData(img, 0, 0);
    return c;
  });

  W.sky = (g, S, c, now) => {
    const vp = c.vp, l = K.light(S.t), h = c.hor - vp.y + 1;
    g.drawImage(skyCanvas(vp.w, h, l, c.look), vp.x, vp.y);
    /* a few stars breathe */
    if (l < 0.5) for (let i = 0; i < 14; i++) {
      if (K.hash(i, Math.floor(now / 300), 6) < 0.6) continue;
      const x = vp.x + Math.floor(K.hash(i, 1, 91) * vp.w), y = vp.y + Math.floor(K.hash(i, 2, 91) * h * 0.8);
      g.fillStyle = "rgba(255,248,225,.55)"; g.fillRect(x, y, 1, 1);
    }
  };

  /* ---- the hills on the horizon, three distances, for this stretch of line ---- */
  W.hills = (g, S, c) => {
    const vp = c.vp, l = K.light(S.t), seed = S.tr.e * 13 + (c.look > 0 ? 0 : 5);
    const can = K.get(`hills:${vp.w}:${seed}:${lb(l)}:${c.look}`, () => {
      const H = 44, o = K.mk(vp.w, H), og = o.getContext("2d"), A = ambient(l), hz = haze(l);
      const tone = (hex, fog) => { const q = rgb(hex); return K.hex(q.map((v, i) => PX.lerp(v * A[i], hz[i], fog))); };
      const far = tone("#56637e", 0.55), farLit = tone("#7d8aa6", 0.45), mid = tone("#2f3d48", 0.32), midLit = tone("#4b5f66", 0.28), near = tone("#1b2a26", 0.12), nearLit = tone("#33463d", 0.1);
      for (let x = 0; x < vp.w; x++) {
        const u = x / 70;
        const h1 = Math.round(10 + K.fbm(u * 0.5, seed) * 26), h2 = Math.round(5 + K.fbm(u * 1.2 + 40, seed + 3) * 12);
        /* the near line: hedges and copses, a crown here and there */
        const crown = K.hash(Math.floor(x / 7), 3, seed) > 0.55 ? Math.round(3 + 4 * Math.sin((x % 7) / 7 * Math.PI)) : 0;
        const h3 = Math.round(2 + K.fbm(u * 3 + 9, seed + 6) * 4) + crown;
        og.fillStyle = far; og.fillRect(x, H - h1, 1, h1); og.fillStyle = farLit; og.fillRect(x, H - h1, 1, 1);
        og.fillStyle = mid; og.fillRect(x, H - h2, 1, h2); og.fillStyle = midLit; og.fillRect(x, H - h2, 1, 1);
        og.fillStyle = near; og.fillRect(x, H - h3, 1, h3); if (crown) { og.fillStyle = nearLit; og.fillRect(x, H - h3, 1, 1); }
      }
      /* a village far off: a spire, a few lit windows */
      if (K.hash(seed, 1, 5) > 0.4) {
        const vx = Math.round(vp.w * (0.15 + K.hash(seed, 2, 5) * 0.7));
        og.fillStyle = mid; og.fillRect(vx, H - 18, 2, 12); og.fillRect(vx - 1, H - 10, 4, 4); og.fillRect(vx - 6, H - 9, 14, 4);
        if (l < 0.6) for (let i = 0; i < 4; i++) { og.fillStyle = K.hash(i, seed, 4) > 0.5 ? "#ffcf6a" : "#e89a4a"; og.fillRect(vx - 6 + Math.round(K.hash(i, seed, 9) * 14), H - 7 + Math.round(K.hash(i, seed, 8) * 2), 1, 1); }
      }
      return o;
    });
    g.drawImage(can, vp.x, c.hor - 43);
  };

  /* what is on the line, in picture metres, along the way the camera looks */
  function items(S, c) {
    const dir = c.look > 0 ? S.tr.face : -S.tr.face;
    return L.ahead(S, FAR / W.VM + 0.3, dir).map(a => Object.assign({ z: a.d * W.VM }, a));
  }
  W.items = items;

  /* ---- the ground, a pixel at a time ---- */
  /* field crops, by day: ploughland, stubble, pasture, lucerne, fallow */
  const CROP = [["#6b5236", "#58432b", "#7d6242"], ["#a08a52", "#8a7442", "#b49c62"], ["#4f6a36", "#435b2e", "#5b7a3e"], ["#3f5f2e", "#344f27", "#4e7036"], ["#6e6a4a", "#5c583c", "#7c7856"]].map(a => a.map(rgb));
  const HEDGE = rgb("#22331f"), VERGE = rgb("#3f5532"), VERGE2 = rgb("#4a613a"), BAL = rgb("#6b6359"), BAL2 = rgb("#575049"), BAL3 = rgb("#7e766a"), SLEEP = rgb("#3a2a1c"), SLEEP2 = rgb("#4a3626");
  const RAIL = rgb("#5c636c"), RAILTOP = rgb("#c9d1db"), RUST = rgb("#5a3e2c"), WATER = rgb("#1f3d5c"), WATER2 = rgb("#2a5276"), GRAVEL = rgb("#2e2a26");
  let gcan = null;
  W.ground = (g, S, c, now) => {
    const vp = c.vp, l = K.light(S.t), its = items(S, c);
    const pos = S.odoF * W.VM * c.look;
    const water = its.filter(a => a.k === "bridge").map(a => [a.z - 26, a.z + 26]);
    const stops = its.filter(a => a.k === "cut" || a.k === "end" || a.k === "wolf").map(a => a.z);
    const stopZ = stops.length ? Math.min(...stops) : Infinity;
    const stZ = its.filter(a => a.k === "node" && L.nodes[a.n].kind === "st").map(a => a.z);
    const top = c.hor + 1, bottom = vp.y + vp.h, H = bottom - top;
    if (H <= 0) return;
    if (!gcan || gcan.width !== vp.w || gcan.height !== H) gcan = K.mk(vp.w, H);
    const gg = gcan.getContext("2d"), img = gg.createImageData(vp.w, H), d = img.data;
    const A = ambient(l), hz = haze(l), lamp = c.lamp && l < 0.85 ? 1 - l : 0;
    const mx = vp.x + vp.w * MOON_DIR(c.look);
    for (let j = 0; j < H; j++) {
      const y = top + j, z = c.h * c.f / (y - c.hor + 0.5), wz = pos + z;
      const fog = Math.min(0.92, Math.pow(z / FAR, 1.15));
      const px = z / c.f;                                   /* metres a pixel, across, at this depth */
      const onWater = water.some(([a, b]) => z > a && z < b);
      const bank = water.some(([a, b]) => z > a - 5 && z < b + 5);
      const nearSt = stZ.some(s => Math.abs(s - z) < 75);
      const sleeper = (wz / 0.62) % 1 < 0.34;
      const cz = Math.floor(wz / 64), fz = (wz / 64) % 1;
      const furrowZ = Math.floor(wz / 0.9) % 2;
      const cut = z > stopZ;
      for (let i = 0; i < vp.w; i++) {
        const X = (vp.x + i - c.cx) * px + c.x, aX = Math.abs(X);
        let r, gr, b, lit = 1;
        if (onWater && aX > 3.4) {
          /* the river: dark, the moon's broken path on it */
          const w2 = K.hash(i >> 1, Math.floor(wz * 2 + now / 300), 3) > 0.82;
          const near = Math.abs(vp.x + i - mx) < 6 + z * 0.01;
          r = WATER[0]; gr = WATER[1]; b = WATER[2];
          if (w2) { r = WATER2[0]; gr = WATER2[1]; b = WATER2[2]; }
          if (near && w2 && l < 0.7) { r = 220; gr = 214; b = 190; lit = 0; }
        } else if (aX < 2.05 && !(onWater && aX > 1.6)) {
          if (cut) { r = GRAVEL[0]; gr = GRAVEL[1]; b = GRAVEL[2]; }
          else {
            /* ballast: grey gravel in a bed, a sleeper every so often, the rails on them */
            const q = K.hash(Math.floor(X * 9), Math.floor(wz * 9), 4);
            const B = q > 0.7 ? BAL3 : q < 0.3 ? BAL2 : BAL;
            r = B[0]; gr = B[1]; b = B[2];
            if (sleeper && aX < 1.32) { const S2 = q > 0.6 ? SLEEP2 : SLEEP; r = S2[0]; gr = S2[1]; b = S2[2]; }
            const rd = Math.abs(aX - GAUGE), rw = Math.max(0.05, px * 0.6);
            if (rd < rw) {
              const head = rd < Math.max(0.025, px * 0.5) && X * Math.sign(X) < GAUGE + 0.01;
              const R0 = head ? RAILTOP : RAIL;
              r = R0[0]; gr = R0[1]; b = R0[2];
              if (!head && rd > rw * 0.6) { r = RUST[0]; gr = RUST[1]; b = RUST[2]; }
              if (head) lit = 0.75;
            }
          }
        } else if (aX < (nearSt ? 7.5 : 4.2)) {
          /* the verge: rough grass, a drainage ditch, the platform's gravel at a station */
          const q = K.hash(Math.floor(X * 4), Math.floor(wz * 3), 6);
          const V = q > 0.6 ? VERGE2 : VERGE;
          r = V[0]; gr = V[1]; b = V[2];
          if (aX > 3.6 && aX < 3.9 && !nearSt) { r *= 0.55; gr *= 0.6; b *= 0.7; }
          if (bank) { r = 74; gr = 66; b = 52; }
        } else {
          /* the fields: a crop per field, rows running with the line, hedges along their edges */
          /* fields are irregular: their edges wander with the noise */
          const wob = (K.vnoise(X / 23, wz / 31, 3) - 0.5) * 14, Xw = X + wob, wzw = wz + (K.vnoise(X / 29, wz / 19, 4) - 0.5) * 18;
          const cxf = Math.floor(Xw / 58), fxf = ((Xw / 58) % 1 + 1) % 1, czw = Math.floor(wzw / 64), fzw = ((wzw / 64) % 1 + 1) % 1;
          const h = K.hash(cxf, czw, 13), type = Math.floor(h * 5), C0 = CROP[type];
          const hedge = (fzw < 0.03 && K.hash(cxf, czw, 14) > 0.3) || (fxf < 0.022 && K.hash(cxf, czw, 15) > 0.25);
          if (hedge) { r = HEDGE[0]; gr = HEDGE[1]; b = HEDGE[2]; lit = 0.9; }
          else {
            let k = 0;
            if (type === 0) k = Math.floor(X / 0.9) % 2 ? 1 : 0;                         /* furrows, along the line */
            else if (type === 1) k = Math.floor(X / 1.4) % 3 === 0 ? 1 : (furrowZ ? 2 : 0);   /* stubble in rows */
            else if (type === 2 || type === 3) k = K.hash(Math.floor(X * 2), Math.floor(wz * 2), 16) > 0.62 ? 2 : K.hash(Math.floor(X), Math.floor(wz), 17) > 0.8 ? 1 : 0;
            else k = K.hash(Math.floor(X * 3), Math.floor(wz * 3), 18) > 0.7 ? 1 : 0;
            const C1 = C0[k]; r = C1[0]; gr = C1[1]; b = C1[2];
            if (bank) { r *= 0.8; gr *= 0.85; b *= 0.8; }
          }
        }
        /* the light: the moon, the engine's lamp on the line ahead, then the haze */
        let lr = A[0], lg = A[1], lbb = A[2];
        if (lamp && z < 240) { const fall = (1 - z / 240), beam = Math.exp(-(X * X) / (3 + z * 0.06)) * fall * fall * 1.5 * lamp; lr += beam * 1.0; lg += beam * 0.88; lbb += beam * 0.62; }
        if (lit < 1) { lr = lr * lit + (1 - lit) * 1.2; lg = lg * lit + (1 - lit) * 1.2; lbb = lbb * lit + (1 - lit) * 1.25; }
        r *= lr; gr *= lg; b *= lbb;
        const dith = K.bayer(i, j) * 6;
        const o = (j * vp.w + i) * 4;
        d[o] = r + (hz[0] - r) * fog + dith; d[o + 1] = gr + (hz[1] - gr) * fog + dith; d[o + 2] = b + (hz[2] - b) * fog + dith; d[o + 3] = 255;
      }
    }
    gg.putImageData(img, 0, 0);
    g.drawImage(gcan, vp.x, top);
    things(g, S, c, its, pos, l, now);
  };

  /* ---- sprites: trees, farms, haystacks ---- */
  /* a tree, h pixels high: an oak's round crown, a poplar's column, a pine; lit on the moon's side */
  const TREE_H = [3, 4, 5, 6, 7, 8, 10, 12, 14, 17, 20, 24, 29, 35, 42, 50, 60, 72, 86, 104, 124];
  W.tree = (type, h0, v, l, look) => {
    const h = TREE_H.reduce((a, b) => Math.abs(b - h0) < Math.abs(a - h0) ? b : a);
    return K.get(`tree:${type}:${h}:${v}:${lb(l)}:${look}`, () => {
      const wide = type === "poplar" ? 0.32 : type === "pine" ? 0.5 : 0.82;
      const w = Math.max(2, Math.round(h * wide)), c = K.mk(w + 2, h + 1), g = c.getContext("2d"), img = g.createImageData(w + 2, h + 1), d = img.data;
      const A = ambient(l), lx = look > 0 ? 0.65 : -0.65, seed = v * 31 + h;
      const trunkH = type === "poplar" ? h * 0.12 : type === "pine" ? h * 0.14 : h * 0.24;
      const leaf = type === "pine" ? ["#1b2f22", "#24402c", "#30533a", "#4a7058"] : type === "poplar" ? ["#1e3322", "#2a4a2c", "#3a6236", "#5f8a52"] : ["#1d3020", "#2b4628", "#3c5e32", "#64844e"];
      const L4 = leaf.map(rgb), BARK = rgb("#2a1f17"), BARK2 = rgb("#3e2e22");
      const cxp = (w + 2) / 2;
      /* the crown: a cluster of blobs */
      const blobs = [];
      const nb = h < 8 ? 1 : type === "poplar" ? 4 : 6;
      for (let i = 0; i < nb; i++) {
        const t = nb === 1 ? 0.5 : i / (nb - 1);
        if (type === "poplar") blobs.push([cxp + (K.hash(i, seed, 1) - 0.5) * w * 0.25, (h - trunkH) * (0.15 + t * 0.62), w * 0.42, (h - trunkH) * 0.3]);
        else if (type === "pine") blobs.push([cxp, (h - trunkH) * (0.12 + t * 0.7), w * (0.18 + t * 0.32), (h - trunkH) * 0.2]);
        else blobs.push([cxp + (K.hash(i, seed, 1) - 0.5) * w * 0.55, (h - trunkH) * (0.3 + K.hash(i, seed, 2) * 0.35), w * (0.26 + K.hash(i, seed, 3) * 0.16), (h - trunkH) * (0.24 + K.hash(i, seed, 4) * 0.1)]);
      }
      for (let y = 0; y <= h; y++) for (let x = 0; x < w + 2; x++) {
        let best = null;
        for (const [bx, by, rx, ry] of blobs) { const dx = (x - bx) / rx, dy = (y - by) / ry, q = dx * dx + dy * dy; if (q <= 1 + (K.hash(x, y, seed) - 0.5) * 0.35 && (!best || q < best.q)) best = { q, dx, dy }; }
        let col = null;
        if (best) {
          const nl = (best.dx * lx - best.dy * 0.7) / 1.3 + (K.hash(x >> 1, y >> 1, seed + 9) - 0.5) * 0.7 + K.bayer(x, y) * 0.3;
          const k = PX.clamp(Math.round(1.2 + nl * 1.6), 0, 3);
          col = L4[k];
        } else if (y > h - trunkH - 2 && Math.abs(x - cxp) < Math.max(0.6, w * (type === "poplar" ? 0.06 : 0.07))) col = (x - cxp) * lx > 0 ? BARK2 : BARK;
        if (!col) continue;
        const o = (y * (w + 2) + x) * 4; d[o] = col[0] * A[0]; d[o + 1] = col[1] * A[1]; d[o + 2] = col[2] * A[2]; d[o + 3] = 255;
      }
      g.putImageData(img, 0, 0);
      return c;
    });
  };
  /* a farmhouse: whitewashed walls, a tiled roof, a chimney, a window lit for someone up late */
  W.farm = (s0, v, l, look) => {
    const s = Math.max(1, Math.round(s0 * 2) / 2);
    return K.get(`farm:${s}:${v}:${lb(l)}:${look}`, () => {
      const w = Math.round(14 * s), hw = Math.round(6 * s), hr = Math.round(5 * s), c = K.mk(w + Math.round(8 * s), hw + hr + 4), g = c.getContext("2d");
      const A = ambient(l), t = (hex, f = 1) => K.hex(rgb(hex).map((q, i) => q * A[i] * f));
      const base = c.height - 1;
      const barn = v % 2 ? Math.round(7 * s) : 0;
      /* the house */
      K.rect(g, 0, base - hw, w, hw, t(v % 3 ? "#cfc6b0" : "#b9ad94"));
      K.rect(g, look > 0 ? w - Math.max(1, Math.round(2 * s)) : 0, base - hw, Math.max(1, Math.round(2 * s)), hw, t("#9c937f"));
      K.poly(g, [[-1, base - hw], [w / 2, base - hw - hr], [w + 1, base - hw]], t("#8a4a32"));
      for (let y = base - hw - hr + 2; y < base - hw; y += Math.max(2, Math.round(s * 1.2))) { g.fillStyle = t("#6e3826"); g.fillRect(Math.round(w / 2 - (y - (base - hw - hr)) * w / 2 / hr), y, Math.round((y - (base - hw - hr)) * w / hr), 1); }
      K.rect(g, Math.round(w * 0.7), base - hw - hr, Math.max(1, Math.round(1.5 * s)), Math.round(hr * 0.8), t("#6e6658"));
      /* windows and a door */
      for (let i = 0; i < 3; i++) {
        const wx = Math.round(w * (0.15 + i * 0.28)), wy = base - hw + Math.round(hw * 0.25), ws = Math.max(1, Math.round(1.6 * s));
        const on = i === v % 3 && l < 0.7;
        K.rect(g, wx, wy, ws, ws, on ? "#ffcf6a" : t("#2a3040"));
        if (on && s > 1.4) { g.fillStyle = "rgba(255,200,110,.25)"; g.fillRect(wx - 1, wy - 1, ws + 2, ws + 2); }
      }
      K.rect(g, Math.round(w * 0.45), base - Math.round(hw * 0.55), Math.max(1, Math.round(1.8 * s)), Math.round(hw * 0.55), t("#4a3424"));
      /* a barn beside it, dark timber */
      if (barn) { K.rect(g, w + 1, base - Math.round(hw * 0.9), barn, Math.round(hw * 0.9), t("#4a3a2c")); K.poly(g, [[w, base - hw * 0.9], [w + 1 + barn / 2, base - hw * 0.9 - hr * 0.6], [w + 2 + barn, base - hw * 0.9]], t("#3b3f4a")); }
      return c;
    });
  };

  /* ---- what stands by the line, far to near ---- */
  function things(g, S, c, its, pos, l, now) {
    const list = [];
    const z0 = 3, z1 = FAR;
    for (let k = Math.ceil((pos + z0) / 55); k * 55 < pos + z1; k++) list.push({ z: k * 55 - pos, k: "pole", n: k });
    for (let k = Math.ceil((pos + z0) / 16); k * 16 < pos + z1; k++) {
      const h = K.hash(k, 5, 101), side = K.hash(k, 7) < 0.5 ? -1 : 1;
      if (h < 0.24) list.push({ z: k * 16 - pos + K.hash(k, 6) * 12, k: "tree", type: K.hash(k, 10) < 0.3 ? "poplar" : K.hash(k, 10) < 0.42 ? "pine" : "oak", x: side * (6 + K.hash(k, 8) * 46), n: k });
      else if (h < 0.29) list.push({ z: k * 16 - pos, k: "row", x: side * (12 + K.hash(k, 8) * 30), n: k });
      else if (h < 0.33) list.push({ z: k * 16 - pos, k: "farm", x: side * (30 + K.hash(k, 8) * 70), n: k });
      else if (h < 0.37) list.push({ z: k * 16 - pos, k: "hay", x: side * (9 + K.hash(k, 8) * 30), n: k });
      else if (h < 0.47) list.push({ z: k * 16 - pos, k: "post", x: side * 4.6, n: k });
    }
    for (const a of its) {
      if (a.k === "node") {
        const N = L.nodes[a.n];
        if (N.kind === "st") list.push({ z: a.z, k: "station", n: a.n, held: S.st[a.n] && S.st[a.n].held });
        if (L.isJunction(a.n)) list.push({ z: a.z, k: "points", n: a.n, p: S.pts[a.n], from: a.from });
      } else if (a.k === "bridge") list.push({ z: a.z, k: "bridge" });
      else if (a.k === "cut") list.push({ z: a.z, k: "cut", known: S.cut[a.e] && S.cut[a.e].known });
      else if (a.k === "end") list.push({ z: a.z, k: "buffer" });
      else if (a.k === "wolf") list.push({ z: a.z, k: "frontier" });
    }
    const stations = list.filter(o => o.k === "station"), bridges = list.filter(o => o.k === "bridge");
    list.sort((a, b) => b.z - a.z);
    const ctx = { prevPole: null };
    for (const o of list) {
      if (o.z < 2 && o.k !== "station" && o.k !== "bridge") continue;
      if ((o.k === "tree" || o.k === "farm" || o.k === "hay" || o.k === "row" || o.k === "post") && (stations.some(s => Math.abs(s.z - o.z) < 80) || bridges.some(s => Math.abs(s.z - o.z) < 34 && Math.abs(o.x || 0) < 60))) continue;
      DRAW[o.k](g, c, o, l, now, S, ctx);
    }
  }
  const tint = (hex, l, f = 1) => { const A = ambient(l); return K.hex(rgb(hex).map((q, i) => q * A[i] * f)); };
  const fogged = (hex, l, z) => { const A = ambient(l), hz = haze(l), fog = Math.min(0.92, Math.pow(z / FAR, 1.15)); return K.hex(rgb(hex).map((q, i) => PX.lerp(q * A[i], hz[i], fog))); };
  const onScreen = (c, x, w) => x > c.vp.x - w && x < c.vp.x + c.vp.w + w;
  const DRAW = {
    pole(g, c, o, l, now, S, ctx) {
      const b = P(c, -3.6, 0, o.z), t = P(c, -3.6, 7.2, o.z), w = Math.max(1, Math.round(0.22 * b.s));
      const col = fogged("#3b2c1f", l, o.z);
      g.fillStyle = col; g.fillRect(Math.round(b.x), Math.round(t.y), w, Math.max(1, Math.round(b.y - t.y)));
      const cw = Math.round(1.1 * b.s), arm = Math.round(t.y + 0.35 * b.s);
      g.fillRect(Math.round(b.x - cw), arm, cw * 2 + w, Math.max(1, Math.round(0.12 * b.s)));
      if (b.s > 6) { g.fillStyle = fogged("#c9c6bc", l, o.z); for (const f of [-0.9, -0.3, 0.3, 0.9]) g.fillRect(Math.round(b.x + f * cw), arm - 1, 1, 1); }
      /* the wires, sagging to the next pole */
      const nz = o.z + 55;
      if (o.z < 600) {
        const n = P(c, -3.6, 7.2, nz), narm = n.y + 0.35 * n.s, ncw = 1.1 * n.s;
        g.fillStyle = l < 0.4 ? "rgba(20,26,40,.9)" : "rgba(40,40,46,.8)";
        for (const f of [-0.9, 0.9]) {
          const x0 = b.x + f * cw, y0 = arm, x1 = n.x + f * ncw, y1 = narm, steps = Math.max(2, Math.ceil(Math.abs(x1 - x0) + Math.abs(y1 - y0)));
          for (let i = 0; i <= steps; i++) { const t2 = i / steps, sag = Math.sin(t2 * Math.PI) * 0.35 * b.s * 0.6; g.fillRect(Math.round(PX.lerp(x0, x1, t2)), Math.round(PX.lerp(y0, y1, t2) + sag), 1, 1); }
        }
      }
    },
    tree(g, c, o, l, now, S) {
      const b = P(c, o.x, 0, o.z), size = (o.type === "poplar" ? 19 : o.type === "pine" ? 11 : 9) * (0.75 + K.hash(o.n, 9) * 0.5);
      const h = size * b.s; if (h < 2.5) return;
      const spr = W.tree(o.type, h, o.n % 3, l, c.look);
      if (!onScreen(c, b.x, spr.width)) return;
      const fog = Math.min(0.85, Math.pow(o.z / FAR, 1.15));
      g.drawImage(spr, Math.round(b.x - spr.width / 2), Math.round(b.y - spr.height + 1));
      if (fog > 0.08) { g.globalAlpha = fog; g.drawImage(K.get(`treeFog:${o.type}:${spr.width}x${spr.height}:${o.n % 3}:${lb(l)}:${c.look}`, () => K.silhouette(spr, K.hex(haze(l)))), Math.round(b.x - spr.width / 2), Math.round(b.y - spr.height + 1)); g.globalAlpha = 1; }
    },
    row(g, c, o, l, now, S) {
      /* a line of poplars along a field edge, the puma country's own */
      for (let i = 0; i < 5; i++) DRAW.tree(g, c, { x: o.x, z: o.z + i * 7, type: "poplar", n: o.n * 7 + i }, l, now, S);
    },
    farm(g, c, o, l) {
      const b = P(c, o.x, 0, o.z), s = b.s * 0.6; if (s < 0.5) return;
      const spr = W.farm(s, o.n % 4, l, c.look);
      if (!onScreen(c, b.x, spr.width)) return;
      const fog = Math.min(0.85, Math.pow(o.z / FAR, 1.15));
      g.drawImage(spr, Math.round(b.x - spr.width / 2), Math.round(b.y - spr.height + 1));
      if (fog > 0.1) { g.globalAlpha = fog * 0.9; g.drawImage(K.get(`farmFog:${spr.width}x${spr.height}:${o.n % 4}:${lb(l)}`, () => K.silhouette(spr, K.hex(haze(l)))), Math.round(b.x - spr.width / 2), Math.round(b.y - spr.height + 1)); g.globalAlpha = 1; }
    },
    hay(g, c, o, l) {
      const b = P(c, o.x, 0, o.z), r = 1.3 * b.s; if (r < 0.8 || !onScreen(c, b.x, r * 3)) return;
      K.disc(g, b.x, b.y - r * 0.8, r * 1.2, r, fogged("#7a6a3e", l, o.z));
      K.disc(g, b.x - r * 0.3 * c.look, b.y - r * 1.1, r * 0.7, r * 0.45, fogged("#9a8650", l, o.z));
    },
    post(g, c, o, l) {
      const b = P(c, o.x, 0, o.z), t = P(c, o.x, 1.1, o.z); if (b.s < 1.5) return;
      g.fillStyle = fogged("#3a2c20", l, o.z); g.fillRect(Math.round(b.x), Math.round(t.y), Math.max(1, Math.round(0.12 * b.s)), Math.max(1, Math.round(b.y - t.y)));
      const n = P(c, o.x, 0.85, o.z + 16); g.fillStyle = fogged("#2c2219", l, o.z); K.line(g, b.x, t.y + 1, n.x, n.y);
    },
    station(g, c, o, l, now, S) {
      const side = 1, plat0 = Math.max(2.5, o.z - 75), plat1 = o.z + 75;
      /* the platform face and its slabs, the white edge */
      for (let z = plat1; z >= plat0; z -= 2) {
        const a = P(c, side * 2.2, 0.95, z), b = P(c, side * 7.4, 0.95, z), d = P(c, side * 2.2, 0, z);
        g.fillStyle = fogged(Math.floor(z / 4) % 2 ? "#8a857a" : "#7d786d", l, z); g.fillRect(Math.round(a.x), Math.round(a.y), Math.max(1, Math.round(b.x - a.x)), Math.max(1, Math.round(2 * a.s / 10)));
        g.fillStyle = fogged("#4a4640", l, z); g.fillRect(Math.round(a.x), Math.round(a.y), 1, Math.max(1, Math.round(d.y - a.y)));
        g.fillStyle = fogged("#d8d2c0", l, z); g.fillRect(Math.round(a.x), Math.round(a.y), Math.max(1, Math.round(0.25 * a.s)), 1);
      }
      for (let z = plat1 - 8; z >= plat0; z -= 24) {
        const b = P(c, side * 5.6, 0.95, z), t = P(c, side * 5.6, 4.8, z);
        g.fillStyle = fogged("#2a2c33", l, z); g.fillRect(Math.round(b.x), Math.round(t.y), Math.max(1, Math.round(0.12 * b.s)), Math.max(1, Math.round(b.y - t.y)));
        if (l < 0.8) { const r = Math.max(1, Math.round(0.3 * t.s)); g.fillStyle = "rgba(255,214,140,.18)"; K.disc(g, t.x, t.y, r * 4, r * 4); g.fillStyle = "rgba(255,214,140,.3)"; K.disc(g, t.x, t.y, r * 2, r * 2); K.disc(g, t.x, t.y, r, r, "#ffe9b0"); }
      }
      const bx0 = side * 9, z0 = o.z - 18, z1 = o.z + 18, Hh = 8.5;
      if (z0 < 3) return;
      const f0 = P(c, bx0, 0, z0), f1 = P(c, bx0, Hh, z0), r0 = P(c, bx0, 0, z1), r1 = P(c, bx0, Hh, z1);
      /* the long stone face toward the track, coursed */
      K.poly(g, [[f0.x, f0.y], [f1.x, f1.y], [r1.x, r1.y], [r0.x, r0.y]], fogged("#8c8272", l, o.z));
      for (let k = 1; k < 8; k++) { const a = P(c, bx0, Hh * k / 8, z0), b = P(c, bx0, Hh * k / 8, z1); g.fillStyle = fogged("#6e6658", l, o.z); K.line(g, a.x, a.y, b.x, b.y); }
      const rf = P(c, bx0 + side * 4.5, Hh + 4.5, z0), rr = P(c, bx0 + side * 4.5, Hh + 4.5, z1);
      K.poly(g, [[f1.x, f1.y], [rf.x, rf.y], [rr.x, rr.y], [r1.x, r1.y]], fogged("#3a4150", l, o.z));
      for (let k = 1; k < 6; k++) { const a = P(c, bx0 + side * 4.5 * k / 6, Hh + 4.5 * k / 6, z0), b = P(c, bx0 + side * 4.5 * k / 6, Hh + 4.5 * k / 6, z1); g.fillStyle = fogged("#2c323f", l, o.z); K.line(g, a.x, a.y, b.x, b.y); }
      /* windows: lit, warm; amber-red where the wolves are in */
      for (let i = 0; i < 7; i++) for (const yy of [1.6, 5]) {
        const zw = z0 + 3 + i * 4.6, a = P(c, bx0, yy, zw), b = P(c, bx0, yy + 2.4, zw + 2);
        g.fillStyle = l < 0.7 ? (o.held ? (i % 3 ? "#ff9a5a" : "#3a2a24") : (i % 4 ? "#ffcf6a" : "#2a3040")) : "#2a3040";
        g.fillRect(Math.round(Math.min(a.x, b.x)), Math.round(b.y), Math.max(1, Math.round(Math.abs(b.x - a.x))), Math.max(1, Math.round(a.y - b.y)));
      }
      if (o.held) for (const zz of [z0 + 9, z0 + 27]) {
        const a = P(c, bx0, Hh - 0.3, zz), b = P(c, bx0, Hh - 4.5, zz + 2.6);
        g.fillStyle = "#b52c1b"; g.fillRect(Math.round(Math.min(a.x, b.x)), Math.round(a.y), Math.max(1, Math.round(Math.abs(b.x - a.x))), Math.max(1, Math.round(b.y - a.y)));
      }
      /* the name board on its posts, once it can be read */
      const nb = P(c, side * 3.4, 3.2, o.z - 34);
      if (nb.s > 5 && o.z - 34 > 3) {
        const name = L.nodes[o.n].name, tw = K.text5w(name);
        const sc = PX.clamp(Math.round(nb.s / 9), 1, 2), w = tw * sc + 8, h = 7 * sc + 6;
        const bc = K.get(`board:${o.n}:${sc}`, () => { const q = K.mk(w, h), bg = q.getContext("2d"); bg.fillStyle = "#1d2a40"; bg.fillRect(0, 0, w, h); bg.fillStyle = "#e9e4d8"; bg.fillRect(1, 1, w - 2, h - 2); bg.fillStyle = "#1d2a40"; bg.fillRect(2, 2, w - 4, h - 4); const tc = K.mk(tw, 7); K.text5(tc.getContext("2d"), name, 0, 0, "#f2ecd8"); bg.imageSmoothingEnabled = false; bg.drawImage(tc, 4, 3, tw * sc, 7 * sc); return q; });
        const pb = P(c, side * 3.4, 0.95, o.z - 34);
        g.fillStyle = fogged("#2a2c33", l, o.z); g.fillRect(Math.round(nb.x + 2), Math.round(nb.y), 1, Math.round(pb.y - nb.y)); g.fillRect(Math.round(nb.x + bc.width - 3), Math.round(nb.y), 1, Math.round(pb.y - nb.y));
        g.globalAlpha = PX.clamp((nb.s - 5) / 4, 0, 1) * (l < 0.5 ? 0.88 : 1);
        g.drawImage(bc, Math.round(nb.x), Math.round(nb.y - h));
        g.globalAlpha = 1;
      }
    },
    points(g, c, o, l) {
      if (o.z < 3) return;
      const ways = L.ways(o.n, o.from), straight = ways[1], set = ways[o.p === undefined ? 1 : o.p];
      for (const sd of [-1, 1]) {
        const div = sd < 0 ? ways[0] : ways[2];
        if (div === straight) continue;
        const on = set === div;
        for (let z = o.z; z < o.z + 160; z += 0.8) {
          const k = (z - o.z) / 160, off = sd * k * k * 11;
          const a = P(c, off - GAUGE, 0, z), b = P(c, off + GAUGE, 0, z);
          if (a.y < c.hor + 1) break;
          g.fillStyle = on ? fogged("#d6dde6", l * 0.5 + 0.5, z) : fogged("#5b636e", l, z);
          g.fillRect(Math.round(a.x), Math.round(a.y), 1, 1); g.fillRect(Math.round(b.x), Math.round(b.y), 1, 1);
          if (Math.floor(z / 0.62) % 2 === 0 && a.s > 3) { g.fillStyle = fogged("#3a2a1c", l, z); g.fillRect(Math.round(a.x - a.s * 0.4), Math.round(a.y) + 1, Math.round(b.x - a.x + a.s * 0.8), 1); }
        }
      }
      /* the signal: a post, its arm, its lamp (white straight on, amber for the turnout) */
      const sz = o.z - 30;
      if (sz > 3) {
        const b = P(c, 2.9, 0, sz), t = P(c, 2.9, 7, sz), w = Math.max(1, Math.round(0.2 * b.s));
        g.fillStyle = fogged("#cfcac0", l, sz); g.fillRect(Math.round(b.x), Math.round(t.y), w, Math.max(1, Math.round(b.y - t.y)));
        const div = set !== straight, aw = Math.round(1.4 * b.s), ah = Math.max(1, Math.round(0.28 * b.s));
        g.save(); g.translate(Math.round(b.x), Math.round(t.y + 0.4 * b.s)); g.rotate(div ? -0.6 : 0);
        g.fillStyle = "#b52c1b"; g.fillRect(0, 0, aw, ah); if (aw > 4) { g.fillStyle = "#e9e4d8"; g.fillRect(Math.round(aw * 0.75), 0, Math.max(1, Math.round(aw * 0.1)), ah); }
        g.restore();
        const col = div ? "#ffb03a" : "#f4f1e0", r = Math.max(1, Math.round(0.28 * t.s)), lp = P(c, 2.9, 6.2, sz);
        g.fillStyle = div ? "rgba(255,176,58,.25)" : "rgba(244,241,224,.22)"; K.disc(g, lp.x - r * 2, lp.y, r * 4, r * 4);
        K.disc(g, lp.x - r * 2, lp.y, r, r, col);
      }
    },
    bridge(g, c, o, l) {
      /* a through truss either side, bank to bank: top chord, posts, the diagonals, the bracing overhead */
      const z0 = Math.max(2.5, o.z - 30), z1 = o.z + 30, H = 6.8;
      if (z1 < 3) return;
      for (const sd of [-1, 1]) {
        const x = sd * 2.7;
        for (let z = z1; z >= z0; z -= 6) {
          const zn = Math.max(z0, z - 6), b = P(c, x, 0, z), t = P(c, x, H, z), nb = P(c, x, 0, zn), nt = P(c, x, H, zn), w = Math.max(1, Math.round(0.22 * b.s));
          const col = fogged("#59606b", l, z), dk = fogged("#353a43", l, z), hi = fogged("#8a93a0", l, z);
          g.fillStyle = col; g.fillRect(Math.round(b.x), Math.round(t.y), w, Math.max(1, Math.round(b.y - t.y)));
          if (w > 2) { g.fillStyle = hi; g.fillRect(Math.round(b.x), Math.round(t.y), 1, Math.max(1, Math.round(b.y - t.y))); }
          g.fillStyle = dk; K.line(g, t.x, t.y, nb.x, nb.y, null, Math.max(1, Math.round(w * 0.6)));
          g.fillStyle = col; K.line(g, t.x, t.y, nt.x, nt.y, null, w); K.line(g, b.x, b.y, nb.x, nb.y, null, w);
          if (w > 3) for (let k = 0; k < 3; k++) K.px(g, b.x + w / 2, PX.lerp(t.y, b.y, 0.2 + k * 0.3), hi);
        }
      }
      for (let z = z1; z >= z0; z -= 12) { const a = P(c, -2.7, H, z), b = P(c, 2.7, H, z); g.fillStyle = fogged("#353a43", l, z); g.fillRect(Math.round(a.x), Math.round(a.y), Math.round(b.x - a.x), Math.max(1, Math.round(0.18 * a.s))); K.line(g, a.x, a.y, P(c, 2.7, H, z - 6).x, P(c, 2.7, H, z - 6).y); }
    },
    cut(g, c, o, l, now) {
      const a = P(c, -2.3, 0, o.z), b = P(c, 2.3, 0, o.z);
      if (a.y < c.hor + 1) return;
      K.disc(g, (a.x + b.x) / 2, a.y + 1, (b.x - a.x) * 0.7, Math.max(1, a.s * 0.6), tint("#1a1714", l));
      /* torn rails, bent up */
      g.fillStyle = tint("#8c96a3", l); for (const sd of [-1, 1]) K.line(g, (a.x + b.x) / 2 + sd * GAUGE * a.s, a.y, (a.x + b.x) / 2 + sd * GAUGE * a.s * 1.3, a.y - a.s * 0.8);
      if (o.known) for (const x of [-1.7, 1.7]) {
        const p = P(c, x, 0.5, o.z - 4), on = Math.floor(now / 300 + x) % 2 === 0, r = Math.max(1, Math.round(0.22 * p.s));
        if (on) { g.fillStyle = "rgba(255,60,30,.22)"; K.disc(g, p.x, p.y, r * 5, r * 5); g.fillStyle = "rgba(255,60,30,.35)"; K.disc(g, p.x, p.y, r * 2.5, r * 2.5); }
        K.disc(g, p.x, p.y, r, r, on ? "#ff6a4a" : "#7a1a10");
      }
    },
    buffer(g, c, o, l) {
      const a = P(c, -1.5, 0.4, o.z), b = P(c, 1.5, 1.5, o.z);
      if (a.y < c.hor + 1) return;
      g.fillStyle = tint("#8a3a24", l, 1.3); g.fillRect(Math.round(a.x), Math.round(b.y), Math.max(1, Math.round(b.x - a.x)), Math.max(1, Math.round(a.y - b.y)));
      g.fillStyle = tint("#e9e4d8", l); g.fillRect(Math.round(a.x), Math.round(b.y), Math.max(1, Math.round(b.x - a.x)), Math.max(1, Math.round((a.y - b.y) * 0.25)));
      const p = P(c, 0, 1.9, o.z), r = Math.max(1, p.s * 0.18); g.fillStyle = "rgba(255,60,30,.3)"; K.disc(g, p.x, p.y, r * 3, r * 3); K.disc(g, p.x, p.y, r, r, "#ff5a3a");
    },
    frontier(g, c, o, l, now) {
      const a = P(c, -3, 1.2, o.z), b = P(c, 3, 1.2, o.z);
      if (a.y < c.hor + 1) return;
      for (let i = 0; i < 8; i++) { const x0 = a.x + (b.x - a.x) * i / 8; g.fillStyle = i % 2 ? "#e9e4d8" : "#b52c1b"; g.fillRect(Math.round(x0), Math.round(a.y), Math.max(1, Math.round((b.x - a.x) / 8)), Math.max(1, Math.round(0.3 * a.s))); }
      const s = P(c, 6, 6, o.z), ang = Math.sin(now / 900) * 0.6;
      K.poly(g, [[s.x, s.y], [s.x + Math.sin(ang - 0.1) * 400, s.y - Math.cos(ang - 0.1) * 400], [s.x + Math.sin(ang + 0.1) * 400, s.y - Math.cos(ang + 0.1) * 400]], "rgba(255,250,220,.08)");
    },
  };
})();
