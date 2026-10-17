/* The Puma Express -- what flies about for a moment: smoke from the chimney,
 * sparks, tracer, spray, fire and smoke from a hit, the flash of a shot.
 * Screen-space particles, one list per scene, so leaving the cab for the gun
 * and coming back finds the cab's smoke where it was. Drawn in two layers:
 * "back" behind the scene's foreground, "front" over everything. Not part of
 * the game: Math.random is fine here. */
"use strict";
(() => {
  const K = PX.K, FX = PX.FX = { lists: {}, scene: "cab" };
  const list = () => FX.lists[FX.scene] || (FX.lists[FX.scene] = []);
  FX.use = scene => { FX.scene = scene; };
  FX.clear = scene => { if (scene) FX.lists[scene] = []; else FX.lists = {}; };
  FX.add = p => { const L = list(); if (L.length > 500) L.shift(); p.t = 0; p.layer = p.layer || "front"; L.push(p); return p; };
  const rnd = (a, b) => a + Math.random() * (b - a);

  /* ---- the kinds ---- */
  /* drag slows its rise (per second); shade, the colour of its side away from the moon; under, of a fire below it,
     lighting its underside while it is young */
  FX.smoke = (x, y, o = {}) => FX.add({ k: "smoke", x, y, vx: o.vx || rnd(-4, 4), vy: o.vy || rnd(-18, -10), r: o.r || rnd(2, 4), grow: o.grow || 9, life: o.life || rnd(1.6, 2.6), col: o.col || [190, 196, 210], a: o.a || 0.5, layer: o.layer || "back", drag: o.drag || 0, under: o.under || null, shade: o.shade || null });
  FX.spark = (x, y, o = {}) => FX.add({ k: "spark", x, y, vx: o.vx !== undefined ? o.vx : rnd(-40, 40), vy: o.vy !== undefined ? o.vy : rnd(-60, -10), g: o.g || 90, life: o.life || rnd(0.3, 0.8), col: o.col || "#ffcf6a" });
  FX.burst = (x, y, n, o = {}) => { for (let i = 0; i < n; i++) FX.spark(x, y, Object.assign({ vx: rnd(-1, 1) * (o.sp || 60), vy: rnd(-1, 0.4) * (o.sp || 60) }, o)); };
  FX.flash = (x, y, r, o = {}) => FX.add({ k: "flash", x, y, r, life: o.life || 0.09, col: o.col || "255,230,160" });
  FX.tracer = (x0, y0, x1, y1, o = {}) => FX.add({ k: "tracer", x0, y0, x1, y1, life: o.life || 0.12, col: o.col || "#ffe28a" });
  FX.splash = (x, y, s) => { FX.add({ k: "column", x, y, s, life: 1.4 }); for (let i = 0; i < 10 * s; i++) FX.spark(x + rnd(-3, 3) * s, y, { vx: rnd(-14, 14) * s, vy: rnd(-70, -25) * s, g: 110 * s, col: "#d6e8f2", life: rnd(0.6, 1.1) }); };
  FX.boom = (x, y, s = 1) => {
    FX.flash(x, y, 14 * s, { life: 0.16 });
    FX.burst(x, y, Math.round(14 * s), { sp: 70 * s, col: "#ffb04a" });
    for (let i = 0; i < 6 * s; i++) FX.smoke(x + rnd(-4, 4) * s, y + rnd(-3, 3) * s, { r: rnd(2, 5) * s, grow: 10 * s, vy: rnd(-16, -4), vx: rnd(-10, 10), life: rnd(1.2, 2.2), col: [70, 64, 60], a: 0.7, layer: "front" });
  };
  FX.dust = (x, y, s = 1) => { for (let i = 0; i < 4; i++) FX.smoke(x + rnd(-2, 2) * s, y, { r: 1 * s, grow: 5 * s, vy: rnd(-10, -3), vx: rnd(-6, 6), life: rnd(0.5, 0.9), col: [120, 110, 96], a: 0.5, layer: "front" }); };

  FX.step = dt => {
    const L = list();
    for (const p of L) {
      p.t += dt;
      if (p.k === "smoke") { p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.99; p.r += p.grow * dt; if (p.drag) p.vy *= Math.exp(-p.drag * dt); }
      else if (p.k === "spark") { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += p.g * dt; }
    }
    FX.lists[FX.scene] = L.filter(p => p.t < p.life);
  };
  /* the scroll: everything drifts with the scene (smoke left behind as the train runs) */
  FX.shift = (dx, dy) => { for (const p of list()) if (p.k === "smoke" && p.drift) { p.x += dx; p.y += dy; } };

  FX.draw = (g, layer) => {
    for (const p of list()) {
      if (p.layer !== layer) continue;
      const f = p.t / p.life;
      if (p.k === "smoke") {
        const a = p.a * (1 - f) * (f < 0.1 ? f / 0.1 : 1), d = K.dither(g, p.col.join(","), a);
        if (!d) continue;
        g.fillStyle = d; K.disc(g, p.x, p.y, p.r, p.r * 0.85);
        /* the side away from the moon, a step darker, where the puff is thick enough to have one */
        if (p.shade && p.r > 4) { const sh = K.dither(g, p.shade.join(","), a * 0.85); if (sh) { g.fillStyle = sh; K.disc(g, p.x + p.r * 0.25, p.y + p.r * 0.32, p.r * 0.6, p.r * 0.42); } }
        if (p.under && f < 0.35) { const u = K.dither(g, p.under.join(","), a * (1 - f / 0.35)); if (u) { g.fillStyle = u; K.disc(g, p.x + p.r * 0.1, p.y + p.r * 0.4, p.r * 0.65, p.r * 0.4); } }
        /* its moonlit top: a lighter shade of the same, a step denser */
        if (p.r > 3) { const hi = K.dither(g, p.col.map(v => Math.min(255, Math.round(v + (255 - v) * 0.35))).join(","), a * 0.7); if (hi) { g.fillStyle = hi; K.disc(g, p.x - p.r * 0.3, p.y - p.r * 0.3, p.r * 0.45, p.r * 0.4); } }
      } else if (p.k === "spark") {
        g.fillStyle = p.col; g.globalAlpha = 1 - f; g.fillRect(Math.round(p.x), Math.round(p.y), 1, 1); g.globalAlpha = 1;
      } else if (p.k === "flash") {
        g.fillStyle = `rgba(${p.col},${(0.85 * (1 - f)).toFixed(3)})`; K.disc(g, p.x, p.y, p.r * (0.6 + f), p.r * (0.6 + f));
        g.fillStyle = `rgba(255,255,240,${(1 - f).toFixed(3)})`; K.disc(g, p.x, p.y, p.r * 0.35, p.r * 0.35);
      } else if (p.k === "tracer") {
        const a = f, b = Math.min(1, f + 0.35);
        g.globalAlpha = 1 - f * 0.5;
        K.line(g, p.x0 + (p.x1 - p.x0) * a, p.y0 + (p.y1 - p.y0) * a, p.x0 + (p.x1 - p.x0) * b, p.y0 + (p.y1 - p.y0) * b, p.col);
        g.globalAlpha = 1;
      } else if (p.k === "column") {
        const h = p.s * 22 * Math.sin(Math.min(1, f * 1.6) * Math.PI * 0.5) * (1 - Math.max(0, f - 0.5) * 2);
        const w = K.dither(g, "214,232,242", 0.85 * (1 - f)), hi = K.dither(g, "255,255,255", 0.6 * (1 - f));
        if (w) { g.fillStyle = w; K.rect(g, p.x - p.s * 2, p.y - h, p.s * 4, h); K.disc(g, p.x, p.y - h, p.s * 3, p.s * 2); }
        if (hi) { g.fillStyle = hi; K.rect(g, p.x - p.s, p.y - h, p.s, h); }
      }
    }
  };
})();
