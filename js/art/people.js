/* The Puma Express -- the people: Duc, the old puma who drove this line
 * before the wolves came, in his hickory-striped cap and a red neckerchief;
 * the wolves of the garrison, grey, in peaked caps with the Empire's red band;
 * and your own paws on the controls.
 *
 * All drawn in code from discs and strokes, at the size they are used, and
 * cached: P.duc(frame) running, P.ducFace() for the words at the foot of the
 * screen, P.wolf(state) at a window, P.paw() in the cab. */
"use strict";
(() => {
  const K = PX.K, M = K.M, P = PX.People = {};
  const INK = "#1a120c";

  /* ---- Duc's face, 40 square ---- */
  P.ducFace = (size = 40) => K.get("ducFace:" + size, () => {
    const c = K.mk(40, 40), g = c.getContext("2d");
    const T = M.puma;
    /* ears, round, dark-backed */
    for (const x of [8, 32]) { K.disc(g, x, 13, 5, 5, INK); K.disc(g, x, 13, 4, 4, "#4a3322"); K.disc(g, x + (x < 20 ? 1 : -1), 14, 2, 2, "#d9a487"); }
    /* the head: lit on its upper left */
    K.disc(g, 20, 22, 14, 13, INK);
    K.disc(g, 20, 22, 13, 12, T[2]);
    for (let y = 10; y < 35; y++) for (let x = 6; x < 34; x++) {
      const dx = (x - 20) / 13, dy = (y - 22) / 12; if (dx * dx + dy * dy > 1) continue;
      const l = -dx * 0.5 - dy * 0.6 + K.bayer(x, y) * 0.5;
      if (l > 0.35) K.px(g, x, y, T[1]); else if (l < -0.45) K.px(g, x, y, T[3]);
    }
    /* the muzzle, cream, and the dark marks either side of it */
    K.disc(g, 16, 28, 5, 4, T[0]); K.disc(g, 24, 28, 5, 4, T[0]); K.disc(g, 20, 31, 4, 3, T[0]);
    K.px(g, 11, 27, INK); K.px(g, 12, 28, INK); K.px(g, 29, 28, INK); K.px(g, 28, 27, INK);
    K.disc(g, 12, 28, 1, 1, "#5a3a22"); K.disc(g, 28, 28, 1, 1, "#5a3a22");
    /* whisker dots */
    for (const [x, y] of [[14, 29], [16, 30], [24, 30], [26, 29]]) K.px(g, x, y, T[3]);
    /* the nose and mouth */
    K.rect(g, 18, 25, 5, 1, "#9b5a4a"); K.rect(g, 19, 26, 3, 1, "#7d4236"); K.px(g, 20, 27, "#7d4236");
    K.rect(g, 20, 28, 1, 2, INK); K.rect(g, 18, 30, 2, 1, INK); K.rect(g, 21, 30, 2, 1, INK);
    /* eyes: amber, the pupil a slit, the dark line from the inner corner down */
    for (const [x, d] of [[13, 1], [24, 0]]) {
      K.rect(g, x, 20, 4, 3, INK); K.rect(g, x, 20, 3, 2, "#e8c24a"); K.px(g, x + 1, 20, INK); K.px(g, x + 1, 21, INK);
      K.px(g, x + 2, 20, "#fff4c0");
      const ix = d ? x + 3 : x - 1;
      K.px(g, ix, 22, "#4a3322"); K.px(g, ix, 23, "#4a3322"); K.px(g, ix + (d ? 0 : 0), 24, "#4a3322");
    }
    /* pale brows */
    K.rect(g, 13, 18, 3, 1, T[0]); K.rect(g, 25, 18, 3, 1, T[0]);
    /* the cap: hickory stripes, a short peak */
    K.disc(g, 20, 11, 13, 6, INK);
    for (let y = 5; y <= 16; y++) for (let x = 7; x <= 33; x++) {
      const dx = (x - 20) / 12.5, dy = (y - 11) / 5.5; if (dx * dx + dy * dy > 1 || y > 15) continue;
      K.px(g, x, y, x % 3 === 0 ? "#c9d2e0" : y < 8 ? "#4f6489" : "#3b4b6a");
    }
    K.rect(g, 6, 15, 28, 2, INK); K.rect(g, 7, 15, 26, 1, "#2a3550"); K.rect(g, 9, 17, 22, 1, "rgba(0,0,0,.35)");
    /* the neckerchief and the overalls */
    K.poly(g, [[9, 35], [31, 35], [27, 40], [13, 40]], "#3d5378");
    K.poly(g, [[12, 33], [28, 33], [20, 40]], INK);
    K.poly(g, [[13, 33], [27, 33], [20, 39]], "#c8452c");
    K.rect(g, 15, 33, 10, 1, "#e8664a");
    return c;
  });

  /* ---- Duc running, side on, facing right: 20 by 28, eight frames; and at the lever ---- */
  P.duc = (frame, pose = "run") => K.get(`duc:${pose}:${frame}`, () => {
    const c = K.mk(22, 30), g = c.getContext("2d"), T = M.puma;
    const ph = frame / 8 * Math.PI * 2, run = pose === "run", hx = 12, hy = 6;
    const lean = run ? 1 : 0;
    /* the tail, long, curling at the end */
    for (let i = 0; i < 9; i++) { const tx = 6 - i * 0.9, ty = 17 + Math.sin(i * 0.5 + ph) * 1.2 + i * 0.25; K.px(g, tx, ty, i > 6 ? "#3a2616" : T[2]); K.px(g, tx, ty + 1, i > 6 ? INK : T[3]); }
    /* legs: overalls to the knee, then fur and paw */
    const leg = (a, col) => {
      const kx = 10 + Math.sin(a) * 4, ky = 21 + Math.max(0, -Math.cos(a)) * 1.5;
      const fx = 10 + Math.sin(a) * 6.5 - (run ? Math.max(0, Math.cos(a)) * 1 : 0), fy = 27 - Math.max(0, Math.cos(a + 0.6)) * (run ? 3 : 0);
      K.line(g, 10, 17, kx, ky, col, 2); K.line(g, kx, ky, fx, fy, T[3], 2); K.rect(g, fx - 1, fy, 3, 2, T[3]);
    };
    if (run) { leg(ph + Math.PI, "#2c3d5c"); } else { leg(-0.3, "#2c3d5c"); }
    /* the body */
    K.rect(g, 7 + lean, 9, 7, 10, INK);
    K.rect(g, 8 + lean, 10, 5, 8, "#3d5378"); K.rect(g, 8 + lean, 10, 2, 8, "#4f6a96");
    K.rect(g, 8 + lean, 9, 5, 2, "#c8452c");
    if (run) leg(ph, "#3d5378"); else leg(0.4, "#3d5378");
    /* the arm: swinging, or up at the lever */
    if (pose === "lever") { K.line(g, 11, 11, 16, 6 + Math.round(Math.sin(frame) * 1), T[2], 2); K.rect(g, 16, 5, 2, 2, T[1]); }
    else if (pose === "hurt") { K.line(g, 10, 11, 7, 15, T[2], 2); }
    else { const ax = 11 + Math.sin(ph + Math.PI) * 4, ay = 15 - Math.abs(Math.cos(ph)) * 1; K.line(g, 11, 11, ax, ay, "#3d5378", 2); K.rect(g, ax, ay, 2, 2, T[2]); }
    /* the head, the ear, the cap */
    K.disc(g, hx + lean, hy, 4, 4, INK); K.disc(g, hx + lean, hy, 3, 3, T[2]);
    K.rect(g, hx + lean + 1, hy, 4, 3, T[0]); K.rect(g, hx + lean + 4, hy, 1, 1, "#7d4236");
    K.px(g, hx + lean + 1, hy - 1, "#e8c24a");
    K.disc(g, hx + lean - 2, hy - 3, 1, 1, "#4a3322");
    K.rect(g, hx + lean - 3, hy - 5, 7, 3, "#3b4b6a"); K.rect(g, hx + lean - 3, hy - 3, 9, 1, "#2a3550");
    K.px(g, hx + lean - 1, hy - 5, "#c9d2e0"); K.px(g, hx + lean + 2, hy - 5, "#c9d2e0");
    return K.outline(c, INK);
  });

  /* ---- a wolf at a window, 24 by 30: rising, aiming, firing, hit ---- */
  P.wolf = (st, var_ = 0) => K.get(`wolf:${st}:${var_}`, () => {
    const c = K.mk(24, 30), g = c.getContext("2d"), W = var_ ? M.wolfDk : M.wolf, dead = st === "dead";
    const oy = st === "up" ? 8 : dead ? 4 : 0;
    /* shoulders, the grey tunic, the red collar tabs */
    K.rect(g, 2, 20 + oy, 20, 10, INK); K.rect(g, 3, 21 + oy, 18, 9, "#4b5248"); K.rect(g, 3, 21 + oy, 18, 2, "#5d6559");
    K.rect(g, 8, 21 + oy, 2, 2, "#b52c1b"); K.rect(g, 14, 21 + oy, 2, 2, "#b52c1b");
    /* the head: long-muzzled, pointed ears */
    K.poly(g, [[4, 6 + oy], [7, 0 + oy], [9, 6 + oy]], INK); K.poly(g, [[15, 6 + oy], [17, 0 + oy], [20, 6 + oy]], INK);
    K.poly(g, [[5, 6 + oy], [7, 2 + oy], [8, 6 + oy]], W[2]); K.poly(g, [[16, 6 + oy], [17, 2 + oy], [19, 6 + oy]], W[2]);
    K.disc(g, 12, 12 + oy, 8, 7, INK); K.disc(g, 12, 12 + oy, 7, 6, W[1]);
    K.disc(g, 9, 10 + oy, 3, 2, W[0]);
    K.disc(g, 12, 17 + oy, 4, 3, INK); K.disc(g, 12, 17 + oy, 3, 2, W[0]);
    K.rect(g, 11, 15 + oy, 3, 2, "#1d1a19");
    /* the eyes: amber, narrowed when it aims */
    const eye = st === "aim" || st === "fire" ? "#ffb43a" : "#e0a34a";
    if (dead) { K.line(g, 7, 10 + oy, 9, 12 + oy, INK); K.line(g, 9, 10 + oy, 7, 12 + oy, INK); K.line(g, 15, 10 + oy, 17, 12 + oy, INK); K.line(g, 17, 10 + oy, 15, 12 + oy, INK); }
    else { K.rect(g, 7, 11 + oy, 3, st === "aim" ? 1 : 2, eye); K.rect(g, 14, 11 + oy, 3, st === "aim" ? 1 : 2, eye); K.px(g, 8, 11 + oy, INK); K.px(g, 15, 11 + oy, INK); }
    /* the peaked cap with its red band */
    K.rect(g, 5, 3 + oy, 14, 4, INK); K.rect(g, 6, 3 + oy, 12, 3, "#3e463c"); K.rect(g, 6, 5 + oy, 12, 1, "#b52c1b");
    K.rect(g, 4, 6 + oy, 16, 1, "#1c201b"); K.px(g, 12, 3 + oy, "#d8b45a");
    /* the rifle: across the chest, or up and levelled at you */
    if (st === "aim" || st === "fire") { K.rect(g, 13, 19 + oy, 3, 9, "#2a1e14"); K.rect(g, 13, 18 + oy, 3, 3, "#151515"); K.disc(g, 14, 19, 2, 2, "#0c0c0c"); }
    else if (!dead) K.line(g, 3, 28 + oy, 21, 22 + oy, "#3a2a1a", 2);
    if (dead) { K.rect(g, 0, 0, 24, 30, "rgba(0,0,0,0)"); }
    return c;
  });

  /* ---- a paw on the controls: the pointer in the cab, 16 by 14 ---- */
  P.paw = () => K.get("paw", () => {
    const c = K.mk(16, 16), g = c.getContext("2d"), T = M.puma;
    K.disc(g, 8, 10, 6, 5, T[2]);
    for (let y = 5; y < 16; y++) for (let x = 2; x < 15; x++) if (K.bayer(x, y) > 0.2 && (x - 8) * (x - 8) / 36 + (y - 10) * (y - 10) / 25 < 1 && y > 10) K.px(g, x, y, T[3]);
    for (const [x, y] of [[3, 5], [6, 3], [10, 3], [13, 5]]) { K.disc(g, x, y, 2, 2, T[2]); K.px(g, x - 1, y - 1, T[1]); }
    K.disc(g, 8, 11, 3, 2, "#c9877a");
    for (const [x, y] of [[3, 5], [6, 3], [10, 3], [13, 5]]) K.px(g, x, y + 1, "#c9877a");
    return K.outline(c, INK);
  });
})();
