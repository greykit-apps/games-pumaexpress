/* The Puma Express -- the map (key 4 or Tab): the railway across the puma
 * country as a driver's working map, dark paper and pale ink. The coast in
 * the west, the two rivers, the line in double strokes; the stations, ours
 * in tawny and the wolves' a grey wolf's head; the bridges, with a boat
 * where gunboats watch; the cuts the Resistance has told of, crossed out; the
 * junctions, with the way the next one is set; the train, a ringed arrow.
 *
 * Told by shape as well as colour: a station of ours is a round, a held one
 * a wolf's head, Port Clair a star, a cut a cross, a guarded bridge a boat. With
 * the route aid, the way the points lead is drawn as a lit line, to the coast
 * or to wherever it ends. */
"use strict";
(() => {
  const K = PX.K, M = K.M, C = PX.C, L = PX.Line, MA = PX.MapArt = {};
  const INK = "#0b0d12", PAPER = "#121c2c", PAPER2 = "#16233a", LINE = "#d9d2bf", OURS = "#e2ad6a", THEIRS = "#e8573a", WATER = "#3d6f96", LIT = "#ffc35a";

  /* the rectangle the map takes: left of the side panel, its own shape kept. The panel is the page's,
   * 230 CSS pixels wide and 14 in from the edge; s is how many CSS pixels a canvas pixel is (main.js) */
  MA.frame = (W, H, s = K.SCALE || 1) => {
    const right = W - Math.ceil(252 / s), avail = right - 16, k = Math.min(avail / L.W, (H - 24) / L.H);
    const w = L.W * k, h = L.H * k;
    return { x: Math.round(8 + (avail - w) / 2), y: Math.round((H - h) / 2), w, h, k };
  };
  const X = (f, x) => f.x + x * f.k, Y = (f, y) => f.y + y * f.k;

  /* ---- where the names go ----
   * The map is small and the face is not: a name set to the right of every
   * station runs into the next one along the middle of the line, and past the
   * map at Velmont. So each name has a few dozen places it may sit about its mark,
   * best first, and the map takes the first set of them in which no name
   * touches another, a mark, a bridge or the map's edge. Worked out once a
   * size, and kept. If a map is too small to hold them all (a tall, narrow
   * window), the least of them, the rivers' and the countries' first, are
   * left off rather than drawn over one another. */
  const hit = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
  const H5 = n => 7 + (n - 1) * 9;
  /* the glyphs and their shadow, with a pixel clear all round; and the room one name keeps from another, so that two
   * side by side are not read as one name (a word space and more) nor two stacked as one name of two lines */
  const boxAt = (x, y, w, h) => ({ x: x - 1, y: y - 1, w: w + 3, h: h + 3 });
  const roomAt = (x, y, w, h) => ({ x: x - 3, y: y - 2, w: w + 7, h: h + 5 });
  /* the places about a mark rx by ry: right, above, below, left; then above and below slid aside, a few pixels at a time;
   * then right and left raised or lowered; then above and below again, standing a little further off */
  const around = (x, y, rx, ry, w, h) => {
    const up = y - ry - h - 3, dn = y + ry + 3, mid = y - (h >> 1), r = x + rx + 3, l = x - rx - 3 - w, c = x - w / 2, out = [[r, mid], [c, up], [c, dn], [l, mid]];
    const slide = (u, v) => { for (let d = 3; d <= w / 2 - 2; d += 3) out.push([c + d, u], [c - d, u], [c + d, v], [c - d, v]); };
    slide(up, dn);
    out.push([r, y - h - 1], [r, y + 1], [l, y - h - 1], [l, y + 1], [c, up - 3], [c, dn + 3]);
    slide(up - 3, dn + 3);
    return out.map(([a, b]) => [Math.round(a), Math.round(b)]);
  };
  /* a set of names in which none touches another: the most hemmed-in first, each at its best place still free */
  function solve(labels, cap) {
    const n = labels.length, pick = new Array(n).fill(-1), fails = new Array(n).fill(0);
    let steps = 0;
    const free = (i, c) => { const b = labels[i].c[c].room; for (let j = 0; j < n; j++) if (pick[j] >= 0 && hit(b, labels[j].c[pick[j]].room)) return false; return true; };
    const go = left => {
      if (!left) return true;
      if (++steps > cap) return false;
      let best = -1, opts = null;
      for (let i = 0; i < n; i++) {
        if (pick[i] >= 0) continue;
        const o = []; for (let c = 0; c < labels[i].c.length; c++) if (free(i, c)) o.push(c);
        if (!o.length) { fails[i]++; return false; }
        if (!opts || o.length < opts.length) { best = i; opts = o; }
      }
      for (const c of opts) { pick[best] = c; if (go(left - 1)) return true; if (steps > cap) break; }
      pick[best] = -1;
      return false;
    };
    return { ok: go(n), pick, fails };
  }
  /* boats: the bridges the wolves' gunboats watch tonight, as a list of edges (a boat's mark under its bridge is kept clear) */
  MA.layout = (W, H, s = K.SCALE || 1, boats = []) => K.get(`maplabels:${W}x${H}@${s}:${boats.join(",")}`, () => {
    const f = MA.frame(W, H, s), inner = { x: f.x + 1, y: f.y + 1, w: f.w - 2, h: f.h - 2 };
    const inside = b => b.x >= inner.x && b.y >= inner.y && b.x + b.w <= inner.x + inner.w && b.y + b.h <= inner.y + inner.h;
    /* what a name may not cover: the stations, the junctions, the quarry's buffer, the bridges and the boat that may lie under one */
    const marks = [], mark = (x, y, rx, ry) => marks.push({ x: Math.round(x) - rx, y: Math.round(y) - ry, w: rx * 2 + 1, h: ry * 2 + 1 });
    for (const N of L.nodes) {
      const x = X(f, N.x), y = Y(f, N.y);
      if (N.kind === "st") mark(x, y, N.final ? 7 : 5, N.final ? 7 : 5);
      else if (N.kind === "end") mark(x, y, 4, 1);
      else if (L.isJunction(N.i)) mark(x, y, 4, 4);
    }
    const bridges = L.BRIDGES.map(e => { const E0 = L.edges[e], A = L.nodes[E0.a], B = L.nodes[E0.b], t = E0.bridge.at / E0.len; return [X(f, A.x + (B.x - A.x) * t), Y(f, A.y + (B.y - A.y) * t)]; });
    bridges.forEach(([x, y], i) => { mark(x, y, 4, 2); if (boats.includes(L.BRIDGES[i])) marks.push({ x: Math.round(x) - 6, y: Math.round(y) + 5, w: 13, h: 8 }); });
    /* the track, which a name may cross but had rather not */
    const track = [];
    for (const e of L.edges) { const A = L.nodes[e.a], B = L.nodes[e.b], x0 = X(f, A.x), y0 = Y(f, A.y), x1 = X(f, B.x), y1 = Y(f, B.y), len = Math.hypot(x1 - x0, y1 - y0); for (let t = 0; t < len; t += 2) track.push([x0 + (x1 - x0) * t / len, y0 + (y1 - y0) * t / len]); }
    const crossing = b => { let k = 0; for (const [x, y] of track) if (x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h) k++; return k; };
    const clear = b => inside(b) && !marks.some(m => hit(b, m));
    /* a label: its key, its tier (the higher, the later it is left off), and its wordings, each with
     * its places in order of liking; a name of two words may break over two lines where one will not go */
    const labels = [];
    const label = (key, tier, ways, extra = () => 0) => {
      const c = [];
      ways.forEach(([lines, places], k) => {
        const w = Math.max(...lines.map(s => K.text5w(s))), h = H5(lines.length);
        places(w, h).forEach(([x, y], i) => { const b = boxAt(x, y, w, h); if (clear(b)) c.push({ x, y, b, room: roomAt(x, y, w, h), lines, w, h, cost: k * 40 + i + crossing(b) * 0.4 + extra(x, y, w, h) }); });
      });
      c.sort((a, b) => a.cost - b.cost);
      labels.push({ key, tier, c });
    };
    const broken = s => { const m = s.match(/^(.+?[ -])(.+)$/); return m ? [m[1].trim(), m[2]] : null; };
    for (const N of L.nodes) {
      const x = X(f, N.x), y = Y(f, N.y);
      if (N.kind === "st") {
        const r = N.final ? 7 : 5, nm = N.name.toUpperCase(), two = broken(nm), at = (w, h) => around(x, y, r, r, w, h);
        label(N.i, N.final || N.start ? 4 : 3, two ? [[[nm], at], [two, at]] : [[[nm], at]]);
      } else if (N.kind === "end") label("quarry", 2, [[["QUARRY"], (w, h) => around(x, y, 4, 1, w, h)]]);
      else if (N.kind === "wolf") label("wolf", 2, [
        [["TO THE WOLF FRONTIER"], w => [[x - w / 2, y - 12], [x - w + 10, y - 12], [x - w - 4, y - 3], [x - w / 2, y - 22], [x - w + 10, y - 22], [x + 4, y - 12]].map(([a, b]) => [Math.round(a), Math.round(b)])],
        [["TO THE WOLF", "FRONTIER"], (w, h) => around(x, y, 2, 2, w, h)],
      ]);
    }
    /* the rivers' names, somewhere along them, as near the old place as is free */
    for (const r of L.RIVERS) {
      const nm = r.name.replace("the ", "").toUpperCase(), [ax, ay] = [X(f, r.pts[2][0]), Y(f, r.pts[2][1])], at = [];
      for (let i = 0; i < r.pts.length - 1; i++) { const [x0, y0] = r.pts[i], [x1, y1] = r.pts[i + 1], len = Math.hypot(x1 - x0, y1 - y0) * f.k; for (let t = 0; t < len; t += 6) at.push([X(f, x0 + (x1 - x0) * t / len), Y(f, y0 + (y1 - y0) * t / len)]); }
      at.sort((a, b) => Math.hypot(a[0] - ax, a[1] - ay) - Math.hypot(b[0] - ax, b[1] - ay));
      label("river:" + r.name, 0, [[[nm], w => at.flatMap(([x, y]) => [[Math.round(x + 4), Math.round(y - 3)], [Math.round(x - 4 - w), Math.round(y - 3)]])]], (x, y) => Math.hypot(x - ax, y - ay) * 0.05);
    }
    /* the two countries, in the corners */
    label("coast", 1, [[["THE FREE COAST"], () => [[f.x + 6, f.y + f.h - 12], [f.x + 6, f.y + 6]].map(([a, b]) => [Math.round(a), Math.round(b)])]]);
    label("empire", 1, [[["WOLF EMPIRE"], w => [[f.x + f.w - w - 9, f.y + f.h - 12], [f.x + f.w - w - 9, f.y + 6]].map(([a, b]) => [Math.round(a), Math.round(b)])]]);
    /* solve; and if it cannot be done, leave off the least label that kept failing, and again */
    let live = labels.slice(), res;
    const dropped = [];
    for (;;) {
      live = live.filter(l => l.c.length || (dropped.push(l.key), false));
      res = solve(live, 4000);
      if (res.ok) break;
      /* the rivers', the countries', the quarry's and the frontier's go before any station's; of the stations, the one that failed most */
      const order = live.map((l, i) => ({ l, i, fl: res.fails[i] })).sort((a, b) => Math.min(a.l.tier, 3) - Math.min(b.l.tier, 3) || a.l.tier - b.l.tier || b.fl - a.fl);
      const out = order[0].l.tier < 3 ? order[0] : order.find(o => o.fl > 0) || order[0];
      dropped.push(out.l.key); live.splice(out.i, 1);
    }
    const at = {};
    live.forEach((l, i) => { const c = l.c[res.pick[i]]; at[l.key] = { x: c.x, y: c.y, w: c.w, h: c.h, lines: c.lines, b: c.b, room: c.room }; });
    return { f, at, marks, dropped, taken: live.map(l => at[l.key].room), inner };
  });
  /* a label the night adds (a station's or a bridge's time to beat): the first of its places nothing else is in */
  function placeExtra(lay, taken, w, h, places) {
    const inside = b => b.x >= lay.inner.x && b.y >= lay.inner.y && b.x + b.w <= lay.inner.x + lay.inner.w && b.y + b.h <= lay.inner.y + lay.inner.h;
    let best = null, bs = Infinity;
    for (const [x, y] of places) {
      const b = boxAt(x, y, w, h), room = roomAt(x, y, w, h);
      const s = (inside(b) ? 0 : 100) + lay.marks.filter(m => hit(b, m)).length * 10 + taken.filter(t => hit(room, t)).length * 10;
      if (s < bs) { bs = s; best = { x, y, room }; if (!s) break; }
    }
    taken.push(best.room);
    return best;
  }

  /* the paper and what never changes on it: the sea, the rivers, the hills */
  const base = (W, H) => K.get(`mapbase:${W}x${H}@${K.SCALE || 1}`, () => {
    const c = K.mk(W, H), g = c.getContext("2d"), f = MA.frame(W, H);
    K.rect(g, 0, 0, W, H, "#0a101a");
    K.rect(g, f.x - 2, f.y - 2, f.w + 4, f.h + 4, "#2a3550");
    K.rect(g, f.x, f.y, f.w, f.h, PAPER);
    /* the land: relief shaded from the north-west, higher in the middle country, woods stippled in */
    { const img = g.getImageData(f.x, f.y, Math.ceil(f.w), Math.ceil(f.h)), d = img.data, w = Math.ceil(f.w), h = Math.ceil(f.h);
      const elev = (mx, my) => { const mid = Math.exp(-Math.pow((mx - 560) / 230, 2)); return K.fbm2(mx / 130, my / 130, 4) * (0.45 + mid * 0.9) + K.fbm2(mx / 40, my / 40, 6) * 0.12; };
      const paper = K.rgb(PAPER), hi = K.rgb("#2a3a58"), lo = K.rgb("#0c1424"), wood = K.rgb("#173226"), wood2 = K.rgb("#1f4030");
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
        const mx = i / f.k, my = j / f.k, e = elev(mx, my), sh = (elev(mx - 4, my - 4) - elev(mx + 4, my + 4)) * 9;
        let q = paper.map((v, k) => v + (sh > 0 ? (hi[k] - v) * Math.min(1, sh) : (lo[k] - v) * Math.min(1, -sh)));
        q = q.map((v, k) => v + e * 10 - 4);
        const fo = K.fbm2(mx / 46, my / 46, 77);
        if (fo > 0.6) { const dot = K.hash(i >> 1, j >> 1, 5) > 0.55; q = dot ? wood2 : q.map((v, k) => (v + wood[k]) / 2); }
        if (K.hash(i, j, 3) > 0.9) q = q.map(v => v + 6);
        /* contour lines, faint, every so high */
        if (Math.abs(((e * 9) % 1) - 0.5) < 0.04 && e > 0.45) q = q.map(v => v + 10);
        const o = (j * w + i) * 4; d[o] = q[0]; d[o + 1] = q[1]; d[o + 2] = q[2];
      }
      g.putImageData(img, f.x, f.y); }
    /* the sea west of the coast, hatched */
    g.save(); g.beginPath(); g.rect(f.x, f.y, f.w, f.h); g.clip();
    for (let y = f.y; y < f.y + f.h; y++) {
      const yy = (y - f.y) / f.k; let cx = 0;
      for (let i = 0; i < L.COAST.length - 1; i++) { const [x0, y0] = L.COAST[i], [x1, y1] = L.COAST[i + 1]; if (yy >= y0 && yy <= y1) { cx = x0 + (x1 - x0) * (yy - y0) / (y1 - y0); break; } }
      const xe = X(f, cx);
      g.fillStyle = "#0e2238"; g.fillRect(f.x, y, Math.max(0, Math.round(xe - f.x)), 1);
      if (y % 4 === 0) { g.fillStyle = "#1a3550"; for (let x = f.x + (y % 8); x < xe - 2; x += 8) g.fillRect(x, y, 3, 1); }
      g.fillStyle = "#5a7fa0"; g.fillRect(Math.round(xe), y, 1, 1);
    }
    /* the rivers */
    for (const r of L.RIVERS) {
      for (let i = 0; i < r.pts.length - 1; i++) { const [x0, y0] = r.pts[i], [x1, y1] = r.pts[i + 1]; K.line(g, X(f, x0), Y(f, y0), X(f, x1), Y(f, y1), WATER, 2); }
    }
    g.restore();
    /* the track, as a railway map draws it: a dark bed, a pale line, cross ticks for the sleepers */
    for (const e of L.edges) { const A = L.nodes[e.a], B = L.nodes[e.b]; K.line(g, X(f, A.x), Y(f, A.y), X(f, B.x), Y(f, B.y), INK, 5); }
    for (const e of L.edges) {
      const A = L.nodes[e.a], B = L.nodes[e.b], wolf = B.kind === "wolf" || A.kind === "wolf";
      const x0 = X(f, A.x), y0 = Y(f, A.y), x1 = X(f, B.x), y1 = Y(f, B.y), len = Math.hypot(x1 - x0, y1 - y0), nx = -(y1 - y0) / len, ny = (x1 - x0) / len;
      K.line(g, x0, y0, x1, y1, wolf ? "#7a3428" : "#cfc8b2", 1);
      for (let t = 4; t < len - 2; t += 5) { const x = x0 + (x1 - x0) * t / len, y = y0 + (y1 - y0) * t / len; K.line(g, x - nx * 2, y - ny * 2, x + nx * 2, y + ny * 2, wolf ? "#5a2a20" : "#8a8270"); }
    }
    return c;
  });

  /* a held station: a grey wolf's head, 11 by 11 as the round is, so the names keep clear of it; its eyes in the wolves' red */
  const WOLF_HEAD = [
    ".o.......o.",
    "odo.....odo",
    "odmo...omdo",
    "ommmooommmo",
    "omdmmdmmdmo",
    "omeemdmeemo",
    "oLLmmmmmLLo",
    ".oLLmmmLLo.",
    "..oLmmmLo..",
    "...onnno...",
    "....ooo....",
  ];
  function station(g, x, y, kind, col) {
    x = Math.round(x); y = Math.round(y);
    if (kind === "final") {
      for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 3 : 7; K.line(g, x, y, x + Math.cos(a) * r, y + Math.sin(a) * r, col, 2); }
      K.disc(g, x, y, 2, 2, col); return;
    }
    if (kind === "held") { g.drawImage(K.get(`mapwolf:${col}`, () => K.map(WOLF_HEAD, { o: INK, m: M.wolf[1], d: M.wolf[3], L: M.wolf[0], e: col, n: INK })), x - 5, y - 5); return; }
    K.disc(g, x, y, 5, 5, INK); K.disc(g, x, y, 4, 4, col); K.disc(g, x, y, 2, 2, INK);
  }
  function boatMark(g, x, y, col) { x = Math.round(x); y = Math.round(y); K.poly(g, [[x - 6, y - 1], [x + 6, y - 1], [x + 4, y + 3], [x - 4, y + 3]], INK); K.poly(g, [[x - 5, y], [x + 5, y], [x + 3, y + 2], [x - 3, y + 2]], col); K.rect(g, x - 1, y - 4, 3, 3, col); }
  function cross(g, x, y, col) { x = Math.round(x); y = Math.round(y); for (let i = -4; i <= 4; i++) { K.rect(g, x + i - 1, y + i - 1, 3, 3, INK); K.rect(g, x + i - 1, y - i - 1, 3, 3, INK); } for (let i = -3; i <= 3; i++) { K.rect(g, x + i, y + i, 2, 2, col); K.rect(g, x + i, y - i, 2, 2, col); } }
  MA.mark = { station, boat: boatMark, cross };

  /* the lit way: a dark casing, the lamp-coloured line, and sparks running along it the way she will go */
  function litWay(g, pts, now) {
    for (let i = 0; i < pts.length - 1; i++) K.line(g, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], INK, 5);
    for (let i = 0; i < pts.length - 1; i++) K.line(g, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], LIT, 3);
    if (PX.calm && PX.calm()) return;
    let at = (now / 1000 * 22) % 16;
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], len = Math.hypot(x1 - x0, y1 - y0);
      for (; at < len; at += 16) K.rect(g, Math.round(x0 + (x1 - x0) * at / len) - 1, Math.round(y0 + (y1 - y0) * at / len) - 1, 2, 2, "#fff4d6");
      at -= len;
    }
  }
  /* how the lit way ends: home is a ring round Port Clair; the buffers and the frontier a red bar across; a loop a red ring at the junction that turns her back; a cut is its own cross */
  function wayEnd(g, P, pts, now) {
    const [x, y] = pts[pts.length - 1];
    if (P.k === "home") { const r = 11 + (PX.calm && PX.calm() ? 0 : Math.floor(now / 500) % 2); K.ring(g, x, y, r + 1, INK, 4); K.ring(g, x, y, r, LIT, 2); return; }
    if (P.k === "loop") { K.ring(g, x, y, 8, INK, 4); K.ring(g, x, y, 7, THEIRS, 2); return; }
    if (P.k === "far" || P.k === "cut" || pts.length < 2) return;
    const [px, py] = pts[pts.length - 2], d = Math.hypot(x - px, y - py) || 1, nx = -(y - py) / d * 6, ny = (x - px) / d * 6;
    K.line(g, x - nx, y - ny, x + nx, y + ny, INK, 5); K.line(g, x - nx, y - ny, x + nx, y + ny, THEIRS, 3);
  }

  MA.draw = (g, S, ui, now) => {
    const W = g.canvas.width, H = g.canvas.height, f = MA.frame(W, H);
    MA.last = f;
    g.drawImage(base(W, H), 0, 0);
    /* the way the points lead, lit (the route aid), ended where she would stop: Port Clair, the buffers, the frontier,
       a known cut, or the junction that would send her round again (L.path) */
    const P = L.path(S), pts = P.pts.map(([x, y]) => [X(f, x), Y(f, y)]);
    if (ui.aids.route) litWay(g, pts, now);
    /* the junctions: a diamond; the next one ahead shows the way it is set */
    MA.junctions = [];
    const next = P.via.find(a => L.isJunction(a.n) && a.d > 0.05);
    for (const N of L.nodes) {
      if (!L.isJunction(N.i)) continue;
      const x = X(f, N.x), y = Y(f, N.y);
      MA.junctions.push({ n: N.i, x, y });
      if (N.kind === "jn") { K.poly(g, [[x, y - 4], [x + 4, y], [x, y + 4], [x - 4, y]], INK); K.poly(g, [[x, y - 3], [x + 3, y], [x, y + 3], [x - 3, y]], "#9b9284"); }
      const showWay = next && next.n === N.i || (ui.aids.planner && P.via.some(a => a.n === N.i));
      if (showWay) {
        const a = next && next.n === N.i ? next : P.via.find(q => q.n === N.i), from = a ? a.from : -1;
        if (from >= 0) {
          const ex = L.choose(N.i, from, S.pts[N.i]), O = L.nodes[L.other(ex, N.i)], d = Math.hypot(O.x - N.x, O.y - N.y);
          K.line(g, x, y, x + (O.x - N.x) / d * 14, y + (O.y - N.y) / d * 14, "#ffc35a", 3);
          K.disc(g, x, y, 3, 3, "#ffc35a");
        }
      }
    }
    /* the bridges, and the boats at the ones watched */
    for (const e of L.BRIDGES) {
      const E0 = L.edges[e], A = L.nodes[E0.a], B = L.nodes[E0.b], t = E0.bridge.at / E0.len, x = X(f, A.x + (B.x - A.x) * t), y = Y(f, A.y + (B.y - A.y) * t);
      K.rect(g, x - 4, y - 2, 9, 5, INK); K.rect(g, x - 3, y - 1, 7, 3, "#c9c2b4");
      if (S.br[e].guarded) boatMark(g, x, y + 9, THEIRS);
    }
    /* the cuts that are known */
    for (const [e, c] of Object.entries(S.cut)) {
      if (!c.known) continue;
      const E0 = L.edges[e], A = L.nodes[E0.a], B = L.nodes[E0.b], t = c.at / E0.len;
      cross(g, X(f, A.x + (B.x - A.x) * t), Y(f, A.y + (B.y - A.y) * t), THEIRS);
    }
    if (ui.aids.route) wayEnd(g, P, pts, now);
    /* the stations and their names, each where the layout put it; the rivers' and the countries' too */
    const lay = MA.layout(W, H, K.SCALE || 1, L.BRIDGES.filter(e => S.br[e].guarded)), taken = lay.taken.slice(), TASK = "#7fd28a";
    for (const r of L.RIVERS) { const a = lay.at["river:" + r.name]; if (a) K.text5(g, a.lines[0], a.x, a.y, "#4f7fa6"); }
    if (lay.at.coast) K.text5(g, "THE FREE COAST", lay.at.coast.x, lay.at.coast.y, "#5a7fa0");
    if (lay.at.empire) K.text5(g, "WOLF EMPIRE", lay.at.empire.x, lay.at.empire.y, "#8a3a2c");
    for (const N of L.nodes) {
      const x = X(f, N.x), y = Y(f, N.y);
      if (N.kind === "st") {
        const held = S.st[N.i].held;
        station(g, x, y, N.final ? "final" : held ? "held" : "ours", N.final ? "#f2ecd8" : held ? THEIRS : OURS);
      } else if (N.kind === "end") K.rect(g, x - 4, y - 1, 9, 3, THEIRS);
    }
    for (const N of L.nodes) {
      const a = lay.at[N.kind === "st" ? N.i : N.kind === "wolf" ? "wolf" : N.kind === "end" ? "quarry" : null];
      if (!a) continue;
      const col = N.kind === "wolf" ? "#c0503a" : N.kind === "end" ? "#9b9284" : S.st[N.i].held ? "#ff9a80" : N.final ? "#f2ecd8" : "#d9d2bf";
      a.lines.forEach((s, i) => K.text5(g, s, a.x + Math.round((a.w - K.text5w(s)) / 2), a.y + i * 9, col, INK));
    }
    /* the times to beat: under the name if there is room, else wherever about it there is */
    for (const k of S.tasks) {
      if (k.done || (k.k !== "station" && k.k !== "bridge")) continue;
      const s = "TO " + PX.hhmm(k.until), w = K.text5w(s);
      let places;
      if (k.k === "station") {
        const N = L.nodes[k.n], a = lay.at[N.i], x = X(f, N.x), y = Y(f, N.y);
        places = (a ? [[a.x, a.y + 9], [a.x, a.y - 9], [a.x + a.w - w, a.y + 9], [a.x + a.w - w, a.y - 9]] : []).concat(around(x, y, 5, 5, w, 7));
      } else {
        const E0 = L.edges[k.e], A = L.nodes[E0.a], B = L.nodes[E0.b], t = E0.bridge.at / E0.len;
        places = around(X(f, A.x + (B.x - A.x) * t), Y(f, A.y + (B.y - A.y) * t) + 5, 6, 7, w, 7);
      }
      const p = placeExtra(lay, taken, w, 7, places);
      K.text5(g, s, p.x, p.y, TASK, INK);
    }
    /* the train: a white arrow the way she faces, in a tawny ring that breathes */
    const [tx, ty] = L.xy(S), E0 = L.edges[S.tr.e], A = L.nodes[E0.a], B = L.nodes[E0.b];
    const dx = (B.x - A.x) * S.tr.face, dy = (B.y - A.y) * S.tr.face, d = Math.hypot(dx, dy) || 1;
    const x = X(f, tx), y = Y(f, ty), r = 8 + (PX.calm && PX.calm() ? 0 : (Math.floor(now / 400) % 2));
    K.ring(g, x, y, r + 1, INK, 3); K.ring(g, x, y, r, OURS, 2);
    K.line(g, x - dx / d * 4, y - dy / d * 4, x + dx / d * 5, y + dy / d * 5, "#ffffff", 2);
    K.disc(g, x + dx / d * 5, y + dy / d * 5, 1.5, 1.5, "#ffffff");
  };
  /* the junction under a point, for the planner */
  MA.junctionAt = (x, y) => { let best = null, bd = 12; for (const j of MA.junctions || []) { const d = Math.hypot(j.x - x, j.y - y); if (d < bd) { bd = d; best = j.n; } } return best; };
})();
