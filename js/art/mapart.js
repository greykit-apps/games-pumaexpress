/* The Puma Express -- the map (key 4 or Tab): the railway across the puma
 * country as a driver's working map, dark paper and pale ink. The coast in
 * the west, the two rivers, the line in double strokes; the stations, ours
 * in tawny and the wolves' in red with their mark; the bridges, with a boat
 * where gunboats watch; the cuts the Resistance has told of, crossed out; the
 * junctions, with the way the next one is set; the train, a ringed arrow.
 *
 * Told by shape as well as colour: a station of ours is a round, a held one
 * a square, Port Clair a star, a cut a cross, a guarded bridge a boat, a place
 * the Resistance holds for us bracketed in green. With the route aid, the way
 * the points lead is drawn as a lit line, and it stops where she would: at
 * Port Clair, at the buffers, at the frontier, at a cut that is known, or at
 * the junction that would send her round onto track already lit.
 *
 * Every name is put where it hides least: off the track, clear of the other
 * names and the marks, on the paper, on a dark plate of its own. */
"use strict";
(() => {
  const K = PX.K, L = PX.Line, MA = PX.MapArt = {};
  const INK = "#0b0d12", PAPER = "#121c2c", OURS = "#e2ad6a", THEIRS = "#e8573a", WATER = "#3d6f96", LIT = "#ffc35a", GREEN = "#7fd28a";
  const PANEL = 260;   /* CSS pixels the side panel takes at the right, with its margins (css: #hud .h-mapside) */

  /* the rectangle the map takes: left of the side panel, its own shape kept. rw: canvas pixels the panel takes */
  MA.frame = (W, H, rw = 230) => {
    const right = Math.max(W * 0.55, W - rw), avail = right - 16, k = Math.min(avail / L.W, (H - 40) / L.H);
    const w = L.W * k, h = L.H * k;
    return { x: Math.round(8 + (avail - w) / 2), y: Math.round(20 + (H - 40 - h) / 2), w, h, k };
  };
  const X = (f, x) => f.x + x * f.k, Y = (f, y) => f.y + y * f.k;
  const onEdge = (f, e, d) => { const [x, y] = L.at(e, d); return [X(f, x), Y(f, y)]; };

  /* the paper and what never changes on it: the sea, the rivers, the hills, the track */
  const base = f => K.get(`mapbase:${f.x},${f.y},${f.k}`, () => {
    const c = K.mk(Math.ceil(f.x + f.w + 4), Math.ceil(f.y + f.h + 4)), g = c.getContext("2d");
    K.rect(g, f.x - 2, f.y - 2, f.w + 4, f.h + 4, "#2a3550");
    K.rect(g, f.x, f.y, f.w, f.h, PAPER);
    /* the land: relief shaded from the north-west, higher in the middle country, woods stippled in; kept low, so the line reads over it */
    { const img = g.getImageData(f.x, f.y, Math.ceil(f.w), Math.ceil(f.h)), d = img.data, w = Math.ceil(f.w), h = Math.ceil(f.h);
      const elev = (mx, my) => { const mid = Math.exp(-Math.pow((mx - 560) / 230, 2)); return K.fbm2(mx / 130, my / 130, 4) * (0.45 + mid * 0.9) + K.fbm2(mx / 40, my / 40, 6) * 0.12; };
      const paper = K.rgb(PAPER), hi = K.rgb("#24324c"), lo = K.rgb("#0d1526"), wood = K.rgb("#14271f"), wood2 = K.rgb("#1a3226");
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
        const mx = i / f.k, my = j / f.k, e = elev(mx, my), sh = (elev(mx - 4, my - 4) - elev(mx + 4, my + 4)) * 6;
        let q = paper.map((v, k) => v + (sh > 0 ? (hi[k] - v) * Math.min(1, sh) : (lo[k] - v) * Math.min(1, -sh)));
        q = q.map(v => v + e * 7 - 3);
        const fo = K.fbm2(mx / 46, my / 46, 77);
        if (fo > 0.62) { const dot = K.hash(i >> 1, j >> 1, 5) > 0.6; q = dot ? wood2 : q.map((v, k) => (v * 2 + wood[k]) / 3); }
        if (K.hash(i, j, 3) > 0.93) q = q.map(v => v + 4);
        /* contour lines, faint, every so high */
        if (Math.abs(((e * 9) % 1) - 0.5) < 0.04 && e > 0.45) q = q.map(v => v + 6);
        const o = (j * w + i) * 4; d[o] = q[0]; d[o + 1] = q[1]; d[o + 2] = q[2]; d[o + 3] = 255;
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
    for (const r of L.RIVERS) for (let i = 0; i < r.pts.length - 1; i++) { const [x0, y0] = r.pts[i], [x1, y1] = r.pts[i + 1]; K.line(g, X(f, x0), Y(f, y0), X(f, x1), Y(f, y1), WATER, 2); }
    for (const t of fixedText(f)) K.text5(g, t.s, t.x, t.y, t.col);
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
  /* the words printed on the paper itself: the rivers (each between the lines that cross it, clear of the bridges), the free coast, the empire */
  const fixedText = f => [
    ...L.RIVERS.map(r => { const [nx, ny] = r.pts[3]; return { s: r.name.replace("the ", "").toUpperCase(), x: Math.round(X(f, nx) + 6), y: Math.round(Y(f, ny) - 3), col: "#4f7fa6" }; }),
    { s: "THE FREE COAST", x: f.x + 6, y: Math.round(f.y + f.h - 12), col: "#5a7fa0" },
    { s: "WOLF EMPIRE", x: Math.round(f.x + f.w - 6 - K.text5w("WOLF EMPIRE")), y: f.y + 6, col: "#8a3a2c" },
  ];

  /* ---- the names: where each goes ---- */
  /* the places a name may sit round its mark, best first: east, west, north, south, then the corners */
  const SPOTS = [
    (x, y, w) => [x + 8, y - 3, 0], (x, y, w) => [x - 8 - w, y - 3, 1], (x, y, w) => [x - w / 2, y - 16, 1], (x, y, w) => [x - w / 2, y + 9, 1],
    (x, y, w) => [x + 5, y - 13, 2], (x, y, w) => [x + 5, y + 7, 2], (x, y, w) => [x - 5 - w, y - 13, 3], (x, y, w) => [x - 5 - w, y + 7, 3],
  ];
  const over = (a, b) => a[0] < b[0] + b[2] && b[0] < a[0] + a[2] && a[1] < b[1] + b[3] && b[1] < a[1] + a[3];
  /* does the segment s cross the box r (Liang-Barsky) */
  const hits = (r, s) => {
    const dx = s[2] - s[0], dy = s[3] - s[1];
    let t0 = 0, t1 = 1;
    for (const [p, q] of [[-dx, s[0] - r[0]], [dx, r[0] + r[2] - s[0]], [-dy, s[1] - r[1]], [dy, r[1] + r[3] - s[1]]]) {
      if (p === 0) { if (q < 0) return false; continue; }
      const t = q / p;
      if (p < 0) { if (t > t1) return false; if (t > t0) t0 = t; } else { if (t < t0) return false; if (t < t1) t1 = t; }
    }
    return true;
  };
  const names = f => K.get(`mapnames:${f.x},${f.y},${f.k}`, () => {
    const seg = (a, b) => [X(f, a.x), Y(f, a.y), X(f, b.x), Y(f, b.y)];
    const track = L.edges.map(e => seg(L.nodes[e.a], L.nodes[e.b]));
    const rivers = L.RIVERS.flatMap(r => r.pts.slice(1).map((p, i) => [X(f, r.pts[i][0]), Y(f, r.pts[i][1]), X(f, p[0]), Y(f, p[1])]));
    /* the marks a name must not cover: [box, how much it matters] */
    const marks = [];
    for (const N of L.nodes) { const x = X(f, N.x), y = Y(f, N.y), r = N.final ? 8 : 6; marks.push([[x - r, y - r, r * 2 + 1, r * 2 + 1], 60]); }
    for (const e of L.BRIDGES) {
      const [x, y] = onEdge(f, e, L.edges[e].bridge.at);
      marks.push([[x - 5, y - 3, 11, 7], 60], [[x - 7, y + 4, 15, 9], 20]);
    }
    for (const t of fixedText(f)) marks.push([[t.x - 1, t.y - 1, K.text5w(t.s) + 2, 9], 40]);
    const want = [];
    for (const N of L.nodes) {
      const s = N.kind === "st" ? N.name : N.kind === "end" ? "QUARRY" : N.kind === "wolf" ? "WOLF FRONTIER" : null;
      if (s) want.push({ n: N.i, s: s.toUpperCase(), w: K.text5w(s), x: X(f, N.x), y: Y(f, N.y) });
    }
    const box = (lx, ly, w) => [lx - 2, ly - 2, w + 4, 11];
    const cost = (it, lx, ly, pref, others) => {
      const b = box(lx, ly, it.w);
      let c = pref;
      if (b[0] < f.x + 1 || b[1] < f.y + 1 || b[0] + b[2] > f.x + f.w - 1 || b[1] + b[3] > f.y + f.h - 1) c += 1000;
      for (const s of track) if (hits(b, s)) c += 80;
      for (const s of rivers) if (hits(b, s)) c += 4;
      for (const [m, wt] of marks) if (over(b, m)) c += wt;
      for (const o of others) if (o !== it && o.b && over(b, o.b)) c += 200;
      return c;
    };
    /* the first pass places each where it is best among those placed; the next ones move any that would sit better now the rest are down */
    for (let pass = 0; pass < 4; pass++) for (const it of want) {
      let best = null;
      for (const spot of SPOTS) {
        const [lx, ly, pref] = spot(it.x, it.y, it.w), c = cost(it, lx, ly, pref, want);
        if (!best || c < best.c) best = { c, lx: Math.round(lx), ly: Math.round(ly) };
      }
      it.lx = best.lx; it.ly = best.ly; it.b = box(best.lx, best.ly, it.w);
    }
    return want;
  });

  function station(g, x, y, kind, col) {
    x = Math.round(x); y = Math.round(y);
    if (kind === "final") {
      for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 3 : 7; K.line(g, x, y, x + Math.cos(a) * r, y + Math.sin(a) * r, col, 2); }
      K.disc(g, x, y, 2, 2, col); return;
    }
    if (kind === "held") { K.rect(g, x - 5, y - 5, 11, 11, INK); K.rect(g, x - 4, y - 4, 9, 9, col); K.px(g, x - 2, y - 3, INK); K.px(g, x + 2, y - 3, INK); K.rect(g, x - 1, y, 3, 2, INK); return; }
    K.disc(g, x, y, 5, 5, INK); K.disc(g, x, y, 4, 4, col); K.disc(g, x, y, 2, 2, INK);
  }
  function boatMark(g, x, y, col) { x = Math.round(x); y = Math.round(y); K.poly(g, [[x - 6, y - 1], [x + 6, y - 1], [x + 4, y + 3], [x - 4, y + 3]], INK); K.poly(g, [[x - 5, y], [x + 5, y], [x + 3, y + 2], [x - 3, y + 2]], col); K.rect(g, x - 1, y - 4, 3, 3, col); }
  function cross(g, x, y, col) { x = Math.round(x); y = Math.round(y); for (let i = -4; i <= 4; i++) { K.rect(g, x + i - 1, y + i - 1, 3, 3, INK); K.rect(g, x + i - 1, y - i - 1, 3, 3, INK); } for (let i = -3; i <= 3; i++) { K.rect(g, x + i, y + i, 2, 2, col); K.rect(g, x + i, y - i, 2, 2, col); } }
  /* green corners round a place the Resistance holds for us till a time */
  function held(g, x, y, r, col) {
    x = Math.round(x); y = Math.round(y);
    for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const cx = x + sx * r, cy = y + sy * r;
      K.rect(g, Math.min(cx, cx - sx * 3) - 1, cy - 1, 5, 3, INK); K.rect(g, cx - 1, Math.min(cy, cy - sy * 3) - 1, 3, 5, INK);
      K.rect(g, Math.min(cx, cx - sx * 3), cy, 4, 1, col); K.rect(g, cx, Math.min(cy, cy - sy * 3), 1, 4, col);
    }
  }
  MA.mark = { station, boat: boatMark, cross, held };

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
    const W = g.canvas.width, H = g.canvas.height, scale = (g.canvas.clientWidth || W) / W, f = MA.frame(W, H, Math.ceil(PANEL / scale));
    MA.last = f;
    K.rect(g, 0, 0, W, H, "#0a101a");
    g.drawImage(base(f), 0, 0);
    const P = L.path(S), pts = P.pts.map(([x, y]) => [X(f, x), Y(f, y)]);
    if (ui.aids.route) litWay(g, pts, now);
    /* the junctions: a diamond; the next one ahead shows the way it is set, and with the planner every one on the way */
    MA.junctions = [];
    const next = P.via.find(a => L.isJunction(a.n) && a.d > 0.05);
    for (const N of L.nodes) {
      if (!L.isJunction(N.i)) continue;
      const x = X(f, N.x), y = Y(f, N.y);
      MA.junctions.push({ n: N.i, x, y });
      K.poly(g, [[x, y - 4], [x + 4, y], [x, y + 4], [x - 4, y]], INK); K.poly(g, [[x, y - 3], [x + 3, y], [x, y + 3], [x - 3, y]], "#b3aa9a");
      const a = next && next.n === N.i ? next : ui.aids.planner ? P.via.find(q => q.n === N.i) : null;
      if (a) {
        const ex = L.choose(N.i, a.from, S.pts[N.i]), O = L.nodes[L.other(ex, N.i)], d = Math.hypot(O.x - N.x, O.y - N.y);
        K.line(g, x, y, x + (O.x - N.x) / d * 14, y + (O.y - N.y) / d * 14, INK, 5);
        K.line(g, x, y, x + (O.x - N.x) / d * 14, y + (O.y - N.y) / d * 14, LIT, 3);
        K.disc(g, x, y, 3, 3, LIT);
      }
    }
    /* the bridges, and the boats at the ones watched */
    for (const e of L.BRIDGES) {
      const [x, y] = onEdge(f, e, L.edges[e].bridge.at);
      K.rect(g, x - 4, y - 2, 9, 5, INK); K.rect(g, x - 3, y - 1, 7, 3, "#c9c2b4");
      if (S.br[e].guarded) boatMark(g, x, y + 9, THEIRS);
    }
    /* the cuts that are known */
    for (const [e, c] of Object.entries(S.cut)) if (c.known) { const [x, y] = onEdge(f, +e, c.at); cross(g, x, y, THEIRS); }
    /* the stations, the quarry's buffers, and what the Resistance holds for us */
    for (const N of L.nodes) {
      const x = X(f, N.x), y = Y(f, N.y);
      if (N.kind === "st") station(g, x, y, N.final ? "final" : S.st[N.i].held ? "held" : "ours", N.final ? "#f2ecd8" : S.st[N.i].held ? THEIRS : OURS);
      else if (N.kind === "end") K.rect(g, x - 4, y - 1, 9, 3, THEIRS);
    }
    for (const k of S.tasks) {
      if (k.done) continue;
      if (k.k === "station") held(g, X(f, L.nodes[k.n].x), Y(f, L.nodes[k.n].y), 8, GREEN);
      else { const [x, y] = onEdge(f, k.e, L.edges[k.e].bridge.at); held(g, x, y, 7, GREEN); }
    }
    if (ui.aids.route) wayEnd(g, P, pts, now);
    /* the names, each on its plate */
    for (const it of names(f)) {
      const N = L.nodes[it.n], hd = N.kind === "st" && S.st[N.i].held;
      const col = N.kind === "wolf" ? "#ff8a6e" : N.kind === "end" ? "#b3aa9a" : hd ? "#ff9a80" : N.final ? "#f2ecd8" : "#e4ddca";
      g.fillStyle = "rgba(8,11,17,.8)"; g.fillRect(it.b[0], it.b[1], it.b[2], it.b[3]);
      K.text5(g, it.s, it.lx, it.ly, col);
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
