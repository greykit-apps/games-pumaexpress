/* The Puma Express -- the train itself, side on: a mixed-traffic engine in
 * dark green with brass and a red buffer beam, its tender, four box wagons
 * with the art inside (the Resistance has chalked a paw on each), and the
 * flat wagon with the anti-aircraft gun. Drawn at any whole scale.
 *
 * T.loco(s, frame) faces right; frame turns the wheels and the rods. */
"use strict";
(() => {
  const K = PX.K, M = K.M, T = PX.TrainArt = {};
  const INK = "#0b0d12";

  function wheel(g, x, y, r, frame, s) {
    K.disc(g, x, y, r + 0.5, r + 0.5, INK);
    K.disc(g, x, y, r, r, M.iron[2]);
    K.disc(g, x, y, r - Math.max(1, s), r - Math.max(1, s), M.iron[3]);
    /* the spokes, turning */
    const n = r > 6 ? 8 : 4;
    for (let i = 0; i < n; i++) { const a = frame * 0.5 + i * Math.PI * 2 / n; K.line(g, x, y, x + Math.cos(a) * (r - s), y + Math.sin(a) * (r - s), M.iron[1]); }
    K.disc(g, x, y, Math.max(1, s), Math.max(1, s), M.brass[2]);
    K.ring(g, x, y, Math.round(r), M.steel[1], 1);
  }
  /* the engine, 70 by 44 at scale 1; returns the canvas */
  T.loco = (s = 1, frame = 0) => K.get(`loco:${s}:${frame % 8}`, () => {
    const W = 74 * s, H = 46 * s, c = K.mk(W, H), g = c.getContext("2d");
    const u = v => Math.round(v * s), P = M.paint;
    const ground = H - 1;
    /* the boiler barrel, long and round */
    for (let y = u(12); y < u(30); y++) {
      const k = (y - u(12)) / u(18), col = P[PX.clamp(Math.round(k * 4 - 0.5 + (k < 0.2 ? -1 : 0)), 0, 4)];
      K.rect(g, u(20), y, u(42), 1, col);
    }
    /* brass bands, the smokebox in black at the front, the chimney, the dome, the safety valves */
    for (const x of [28, 40, 52]) K.rect(g, u(x), u(12), Math.max(1, u(1)), u(18), M.brass[2]);
    K.rect(g, u(60), u(10), u(10), u(21), M.iron[3]); K.rect(g, u(60), u(10), u(10), u(2), M.iron[1]);
    K.disc(g, u(70), u(20), u(1), u(10), M.iron[2]);
    K.rect(g, u(63), u(3), u(5), u(8), M.iron[3]); K.rect(g, u(62), u(2), u(7), u(2), M.iron[1]);
    K.disc(g, u(44), u(11), u(4), u(3), M.brass[2]); K.disc(g, u(43), u(10), u(2), u(1), M.brass[0]);
    K.rect(g, u(30), u(8), u(3), u(4), M.brass[3]);
    /* the lamp on the buffer beam, lit */
    K.rect(g, u(68), u(29), u(5), u(4), M.wolfRed[2]);
    K.disc(g, u(71), u(27), u(1.5), u(1.5), "#fff2c0");
    /* the cab: a roof, the spectacle window lit by the fire */
    K.rect(g, u(6), u(4), u(18), u(26), P[2]); K.rect(g, u(5), u(3), u(20), u(2), P[0]);
    K.rect(g, u(9), u(8), u(9), u(9), "#ffb04a"); K.rect(g, u(9), u(8), u(9), u(2), "#ffd98a");
    K.rect(g, u(6), u(28), u(18), u(2), M.brass[3]);
    /* the running board, the frames, the cylinder */
    K.rect(g, u(4), u(30), u(68), u(2), M.iron[1]);
    K.rect(g, u(6), u(32), u(62), u(4), M.iron[3]);
    K.rect(g, u(58), u(31), u(11), u(7), M.iron[2]); K.rect(g, u(58), u(31), u(11), u(1), M.steel[1]);
    /* the wheels: a pony truck at the front, three big drivers, coupled */
    const wr = 6.5 * s, wy = ground - wr;
    const xs = [16, 31, 46].map(u);
    const ang = frame / 8 * Math.PI * 2;
    for (const x of xs) wheel(g, x, wy, wr, frame, s);
    wheel(g, u(63), ground - 3.5 * s, 3.5 * s, frame, s);
    /* the coupling rod going round */
    const ox = Math.cos(ang) * 3 * s, oy = Math.sin(ang) * 3 * s;
    K.line(g, xs[0] + ox, wy + oy, xs[2] + ox, wy + oy, M.steel[0], Math.max(1, s));
    K.line(g, xs[1] + ox, wy + oy, u(60), u(35), M.steel[1], Math.max(1, s));
    return K.outline(c, INK);
  });
  T.tender = (s = 1) => K.get(`tender:${s}`, () => {
    const W = 40 * s, H = 40 * s, c = K.mk(W, H), g = c.getContext("2d"), u = v => Math.round(v * s), P = M.paint;
    K.rect(g, u(2), u(10), u(36), u(20), P[2]); K.rect(g, u(2), u(10), u(36), u(2), P[0]);
    K.rect(g, u(2), u(8), u(36), u(3), M.coal[2]);
    for (let x = 3; x < 37; x += 2) K.px(g, u(x), u(8) - (x % 4 ? 0 : s), M.coal[1]);
    K.rect(g, u(2), u(28), u(36), u(2), M.brass[3]);
    K.rect(g, u(0), u(30), u(40), u(3), M.iron[3]);
    for (const x of [8, 20, 32]) wheel(g, u(x), H - 1 - 4.5 * s, 4.5 * s, 0, s);
    return K.outline(c, INK);
  });
  /* a box wagon with art aboard; a paw chalked on its side */
  T.wagon = (s = 1, i = 0) => K.get(`wagon:${s}:${i}`, () => {
    const W = 46 * s, H = 40 * s, c = K.mk(W, H), g = c.getContext("2d"), u = v => Math.round(v * s), Wd = M.wood;
    K.rect(g, u(1), u(6), u(44), u(25), Wd[3]);
    for (let x = 2; x < 45; x += 4) K.rect(g, u(x), u(6), Math.max(1, u(1)), u(25), Wd[4]);
    K.rect(g, u(1), u(4), u(44), u(3), M.slate[2]); K.rect(g, u(0), u(3), u(46), u(1), M.slate[0]);
    K.rect(g, u(17), u(9), u(12), u(20), Wd[2]); K.rect(g, u(17), u(9), u(12), u(1), Wd[1]);
    /* the paw, in chalk */
    const px = u(9), py = u(17), ch = "#e8e2d2";
    K.disc(g, px, py + u(2), u(2.5), u(2), ch);
    for (const [dx, dy] of [[-3, -2], [-1, -4], [1, -4], [3, -2]]) K.disc(g, px + u(dx), py + u(dy), Math.max(1, u(0.9)), Math.max(1, u(0.9)), ch);
    /* a wolf eagle stencil half scrubbed out on the far end */
    K.rect(g, u(34), u(13), u(6), u(5), "#7d1c11"); K.line(g, u(33), u(12), u(41), u(19), ch, Math.max(1, s));
    K.rect(g, u(0), u(31), u(46), u(2), M.iron[3]);
    for (const x of [8, 14, 32, 38]) wheel(g, u(x), H - 1 - 3.6 * s, 3.6 * s, i, s);
    return K.outline(c, INK);
  });
  /* the flat wagon with the gun crew's mounting */
  T.gunCar = (s = 1) => K.get(`gunCar:${s}`, () => {
    const W = 36 * s, H = 40 * s, c = K.mk(W, H), g = c.getContext("2d"), u = v => Math.round(v * s);
    K.rect(g, u(0), u(27), u(36), u(4), M.wood[2]); K.rect(g, u(0), u(27), u(36), u(1), M.wood[0]);
    K.rect(g, u(4), u(20), u(28), u(8), M.canvas[2]); for (let x = 4; x < 32; x += 3) K.rect(g, u(x), u(20), Math.max(1, u(1)), u(8), M.canvas[3]);
    K.rect(g, u(15), u(13), u(6), u(8), M.iron[2]);
    K.line(g, u(18), u(14), u(30), u(4), M.iron[1], Math.max(1, u(1.5)));
    K.line(g, u(18), u(16), u(30), u(6), M.iron[1], Math.max(1, u(1.5)));
    K.rect(g, u(0), u(31), u(36), u(2), M.iron[3]);
    for (const x of [7, 29]) wheel(g, u(x), H - 1 - 3.6 * s, 3.6 * s, 0, s);
    return K.outline(c, INK);
  });
  /* the whole train, end to end, for the title: returns the canvas and where the chimney is */
  T.whole = (s, frame) => {
    const parts = [T.gunCar(s), T.wagon(s, 3), T.wagon(s, 2), T.wagon(s, 1), T.wagon(s, 0), T.tender(s), T.loco(s, frame)];
    const H = Math.max(...parts.map(p => p.height)), W = parts.reduce((a, p) => a + p.width - 2 * s, 0) + 2 * s;
    const c = K.mk(W, H), g = c.getContext("2d");
    let x = 0;
    for (const p of parts) { g.drawImage(p, x, H - p.height); x += p.width - 2 * s; }
    return { c, chimney: { x: W - 74 * s + 65 * s, y: H - 46 * s + 2 * s }, cab: { x: W - 74 * s + 12 * s, y: H - 46 * s + 12 * s } };
  };
})();
