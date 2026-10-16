/* The Puma Express -- the map (key 4 or Tab): the railway across the puma
 * country as a driver's working map, dark paper and pale ink. The coast in
 * the west, the two rivers, the line in double strokes; the stations, ours
 * in tawny and the wolves' in red with their mark; the bridges, with a boat
 * where gunboats watch; the cuts the Resistance has told of, crossed out; the
 * junctions, with the way the next one is set; the train, a ringed arrow.
 *
 * Told by shape as well as colour: a station of ours is a round, a held one
 * a square, Port Clair a star, a cut a cross, a guarded bridge a boat. With
 * the route aid, the way the points lead is drawn as a lit line, to the coast
 * or to wherever it ends. */
"use strict";
(() => {
  const K = PX.K, M = K.M, C = PX.C, L = PX.Line, MA = PX.MapArt = {};
  const INK = "#0b0d12", PAPER = "#121c2c", PAPER2 = "#16233a", LINE = "#d9d2bf", OURS = "#e2ad6a", THEIRS = "#e8573a", WATER = "#3d6f96";

  /* the rectangle the map takes: left of the side panel, its own shape kept */
  MA.frame = (W, H) => {
    const right = Math.max(W * 0.62, W - 230), avail = right - 16, k = Math.min(avail / L.W, (H - 24) / L.H);
    const w = L.W * k, h = L.H * k;
    return { x: Math.round(8 + (avail - w) / 2), y: Math.round((H - h) / 2), w, h, k };
  };
  const X = (f, x) => f.x + x * f.k, Y = (f, y) => f.y + y * f.k;

  /* the paper and what never changes on it: the sea, the rivers, the hills */
  const base = (W, H) => K.get(`mapbase:${W}x${H}`, () => {
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
      const [nx, ny] = r.pts[2]; K.text5(g, r.name.replace("the ", "").toUpperCase(), X(f, nx) + 6, Y(f, ny) - 3, "#4f7fa6");
    }
    K.text5(g, "THE FREE COAST", f.x + 6, f.y + f.h - 12, "#5a7fa0");
    K.text5(g, "WOLF EMPIRE", f.x + f.w - 74, f.y + f.h - 12, "#8a3a2c");
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
  MA.mark = { station, boat: boatMark, cross };

  MA.draw = (g, S, ui, now) => {
    const W = g.canvas.width, H = g.canvas.height, f = MA.frame(W, H);
    MA.last = f;
    g.drawImage(base(W, H), 0, 0);
    /* the way the points lead, lit (the route aid), and where it ends */
    const ahead = L.ahead(S, 400, S.tr.v === 0 ? S.tr.face : 0);
    if (ui.aids.route) {
      let [px, py] = L.xy(S);
      const col = "rgba(255,195,90,.85)";
      for (const a of ahead) {
        if (a.k !== "node") continue;
        const N = L.nodes[a.n];
        K.line(g, X(f, px), Y(f, py), X(f, N.x), Y(f, N.y), col, 2);
        px = N.x; py = N.y;
      }
    }
    /* the junctions: a diamond; the next one ahead shows the way it is set */
    MA.junctions = [];
    const next = L.nextJunction(S);
    for (const N of L.nodes) {
      if (!L.isJunction(N.i)) continue;
      const x = X(f, N.x), y = Y(f, N.y);
      MA.junctions.push({ n: N.i, x, y });
      if (N.kind === "jn") { K.poly(g, [[x, y - 4], [x + 4, y], [x, y + 4], [x - 4, y]], INK); K.poly(g, [[x, y - 3], [x + 3, y], [x, y + 3], [x - 3, y]], "#9b9284"); }
      const showWay = next && next.n === N.i || (ui.aids.planner && ahead.some(a => a.k === "node" && a.n === N.i));
      if (showWay) {
        const a = ahead.find(q => q.k === "node" && q.n === N.i), from = a ? a.from : -1;
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
    /* the stations and their names */
    for (const N of L.nodes) {
      const x = X(f, N.x), y = Y(f, N.y);
      if (N.kind === "st") {
        const held = S.st[N.i].held, task = S.tasks.find(k => !k.done && k.k === "station" && k.n === N.i);
        station(g, x, y, N.final ? "final" : held ? "held" : "ours", N.final ? "#f2ecd8" : held ? THEIRS : OURS);
        const nm = N.name, tw = K.text5w(nm), lx = Math.round(N.y < 150 ? x - tw / 2 : x + 8), ly = Math.round(N.y < 150 ? y - 15 : y - 3);
        K.text5(g, nm, lx, ly, held ? "#ff9a80" : N.final ? "#f2ecd8" : "#d9d2bf", INK);
        if (task) K.text5(g, "TO " + PX.hhmm(task.until), lx, ly + 9, "#7fd28a", INK);
      } else if (N.kind === "wolf") {
        K.text5(g, "TO THE WOLF FRONTIER", Math.round(x - 60), Math.round(y - 12), "#c0503a", INK);
      } else if (N.kind === "end") {
        K.rect(g, x - 4, y - 1, 9, 3, THEIRS); K.text5(g, "QUARRY", Math.round(x + 8), Math.round(y - 3), "#9b9284", INK);
      }
    }
    for (const k of S.tasks) if (!k.done && k.k === "bridge") { const E0 = L.edges[k.e], A = L.nodes[E0.a], B = L.nodes[E0.b], t = E0.bridge.at / E0.len; K.text5(g, "TO " + PX.hhmm(k.until), Math.round(X(f, A.x + (B.x - A.x) * t) - 18), Math.round(Y(f, A.y + (B.y - A.y) * t) + 14), "#7fd28a", INK); }
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
