/* The Puma Express -- the train, built once in three dimensions and drawn
 * from it: so the engine in the station, on the title and over the front
 * gun is the same engine as the one in the cab.
 *
 * A model is a list of parts: boxes, cylinders along any axis, spheres. Each
 * has a material, and may have a texture that picks the material where it is
 * hit, or makes a hole (a cab window, the gap between spokes). The tracer
 * casts a ray for every pixel, finds the nearest part, and shades it from a
 * material's five-step ramp by the light on it, dithered, as hand-made pixel
 * art is. It runs once per view and size; what turns (the wheels, the rods)
 * is drawn over it each frame.
 *
 * Coordinates are metres: z along the engine (front positive), x across it,
 * y up from the rail head. */
"use strict";
(() => {
  const K = PX.K, M = K.M, Mo = PX.Model = {};

  /* ---- intersections: each returns { t, n } or null ---- */
  function box(p, o, d) {
    let tmin = -Infinity, tmax = Infinity, n = null;
    for (let i = 0; i < 3; i++) {
      if (Math.abs(d[i]) < 1e-9) { if (o[i] < p.a[i] || o[i] > p.b[i]) return null; continue; }
      let t0 = (p.a[i] - o[i]) / d[i], t1 = (p.b[i] - o[i]) / d[i], s = -1;
      if (t0 > t1) { const q = t0; t0 = t1; t1 = q; s = 1; }
      if (t0 > tmin) { tmin = t0; n = [0, 0, 0]; n[i] = s; }
      if (t1 < tmax) tmax = t1;
      if (tmin > tmax) return null;
    }
    if (tmin <= 1e-4 || !n) return null;
    return { t: tmin, n };
  }
  const AX = { x: [0, 1, 2], y: [1, 0, 2], z: [2, 0, 1] };
  function cyl(p, o, d) {
    const [ai, i1, i2] = AX[p.ax], ox = o[i1] - p.c[0], oy = o[i2] - p.c[1], dx = d[i1], dy = d[i2];
    let best = null;
    const a = dx * dx + dy * dy;
    if (a > 1e-12) {
      const b = 2 * (ox * dx + oy * dy), c = ox * ox + oy * oy - p.r * p.r, disc = b * b - 4 * a * c;
      if (disc >= 0) {
        const sq = Math.sqrt(disc);
        for (const t of [(-b - sq) / (2 * a), (-b + sq) / (2 * a)]) {
          if (t <= 1e-4) continue;
          const l = o[ai] + t * d[ai];
          if (l < p.l[0] || l > p.l[1]) continue;
          const n = [0, 0, 0]; n[i1] = (ox + t * dx) / p.r; n[i2] = (oy + t * dy) / p.r;
          if (p.inner && t === (-b + sq) / (2 * a)) { n[i1] = -n[i1]; n[i2] = -n[i2]; }
          best = { t, n }; break;
        }
      }
    }
    if (p.cap !== false && Math.abs(d[ai]) > 1e-9) for (const [l, s] of [[p.l[0], -1], [p.l[1], 1]]) {
      const t = (l - o[ai]) / d[ai]; if (t <= 1e-4 || (best && t >= best.t)) continue;
      const u = o[i1] + t * d[i1] - p.c[0], v = o[i2] + t * d[i2] - p.c[1];
      if (u * u + v * v > p.r * p.r) continue;
      const n = [0, 0, 0]; n[ai] = s; best = { t, n, cap: s };
    }
    return best;
  }
  function sph(p, o, d) {
    const ox = o[0] - p.c[0], oy = o[1] - p.c[1], oz = o[2] - p.c[2];
    const a = d[0] * d[0] + d[1] * d[1] + d[2] * d[2], b = 2 * (ox * d[0] + oy * d[1] + oz * d[2]), c = ox * ox + oy * oy + oz * oz - p.r * p.r, disc = b * b - 4 * a * c;
    if (disc < 0) return null;
    const sq = Math.sqrt(disc);
    for (const t of [(-b - sq) / (2 * a), (-b + sq) / (2 * a)]) {
      if (t <= 1e-4) continue;
      const y = o[1] + t * d[1]; if (p.ymin !== undefined && y < p.ymin) continue;
      return { t, n: [(ox + t * d[0]) / p.r, (oy + t * d[1]) / p.r, (oz + t * d[2]) / p.r] };
    }
    return null;
  }
  const HIT = { box, cyl, sph };
  /* each part's bounds, for a quick miss */
  function bounds(p) {
    if (p.k === "box") return [p.a, p.b];
    if (p.k === "sph") return [[p.c[0] - p.r, p.c[1] - p.r, p.c[2] - p.r], [p.c[0] + p.r, p.c[1] + p.r, p.c[2] + p.r]];
    const [ai, i1, i2] = AX[p.ax], lo = [0, 0, 0], hi = [0, 0, 0];
    lo[ai] = p.l[0]; hi[ai] = p.l[1]; lo[i1] = p.c[0] - p.r; hi[i1] = p.c[0] + p.r; lo[i2] = p.c[1] - p.r; hi[i2] = p.c[1] + p.r;
    return [lo, hi];
  }
  function aabb(bb, o, d) {
    let tmin = -Infinity, tmax = Infinity;
    for (let i = 0; i < 3; i++) {
      if (Math.abs(d[i]) < 1e-9) { if (o[i] < bb[0][i] - 1e-6 || o[i] > bb[1][i] + 1e-6) return false; continue; }
      let t0 = (bb[0][i] - o[i]) / d[i], t1 = (bb[1][i] - o[i]) / d[i];
      if (t0 > t1) { const q = t0; t0 = t1; t1 = q; }
      if (t0 > tmin) tmin = t0; if (t1 < tmax) tmax = t1;
      if (tmin > tmax) return false;
    }
    return tmax > 0;
  }

  /* ---- the materials: a ramp each, light to dark ---- */
  const RAMP = {
    paint: M.paint, brass: M.brass, iron: M.iron, copper: M.copper, steel: M.steel, wood: M.wood, coal: M.coal, slate: M.slate, canvas: M.canvas,
    red: ["#ff8a6a", "#d8402a", "#a52c1a", "#6e1a0e", "#3e0e08"], black: ["#5a5e66", "#3c4048", "#26292f", "#17191d", "#0c0d10"],
    lining: ["#fff0b0", "#f2c860", "#c89a3a", "#8a6420", "#4c3410"], cream: M.cream, chalk: ["#ffffff", "#eeeae0", "#d8d2c4", "#b0aa9c", "#888274"],
    plane: ["#a8b4c4", "#7c8898", "#5a6474", "#3e4652", "#262c36"], under: ["#c8d0d8", "#a2acb6", "#7e8892", "#5a636c", "#3a4048"],
    glow: ["#fff6d0", "#ffe08a", "#ffb04a", "#e8661c", "#9c2d0c"], glass: ["#e8f0ff", "#9ab4d0", "#56708c", "#33465a", "#1e2a38"],
  };
  const RGB = Object.fromEntries(Object.entries(RAMP).map(([k, v]) => [k, v.map(K.rgb)]));
  Mo.RAMP = RAMP;

  /* ---- the tracer ----
     cam: { ray(px, py) -> [o, d] }, light: { dir (toward the light), amb, sun (colour multipliers), lamps: [{ p, col, r }] } */
  Mo.trace = (parts, W, H, cam, light, off = { x: 0, y: 0 }) => {
    const c = K.mk(W, H), g = c.getContext("2d"), img = g.createImageData(W, H), data = img.data;
    const bbs = parts.map(bounds), L0 = light.dir, ln = Math.hypot(...L0), Ld = L0.map(v => v / ln);
    const amb = light.amb || [0.3, 0.33, 0.45], sun = light.sun || [0.75, 0.78, 0.9], lamps = light.lamps || [];
    for (let py = 0; py < H; py++) for (let px = 0; px < W; px++) {
      const [o, d] = cam.ray(px + off.x + 0.5, py + off.y + 0.5);
      let best = null, bp = null, bm = null;
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        if (!aabb(bbs[i], o, d)) continue;
        const h = HIT[p.k](p, o, d);
        if (!h || (best && h.t >= best.t)) continue;
        const hp = [o[0] + d[0] * h.t, o[1] + d[1] * h.t, o[2] + d[2] * h.t];
        const m = p.tex ? p.tex(hp, h.n, h) : p.m;
        if (!m) continue;
        h.p = hp; best = h; bp = p; bm = m;
      }
      if (!best) continue;
      const o4 = (py * W + px) * 4;
      if (bm === "glowing" || bm === "lamp") {
        const q = bm === "lamp" ? [255, 246, 210] : [255, 170, 80]; data[o4] = q[0]; data[o4 + 1] = q[1]; data[o4 + 2] = q[2]; data[o4 + 3] = 255; continue;
      }
      const n = best.n, ndl = Math.max(0, n[0] * Ld[0] + n[1] * Ld[1] + n[2] * Ld[2]);
      const shiny = bm === "brass" || bm === "copper" || bm === "lining" || bm === "steel";
      /* a highlight where the light glances back toward the eye */
      const hx = Ld[0] - d[0], hy = Ld[1] - d[1], hz = Ld[2] - d[2], hl = Math.hypot(hx, hy, hz) || 1;
      const spec = Math.pow(Math.max(0, (n[0] * hx + n[1] * hy + n[2] * hz) / hl), shiny ? 18 : 40) * (shiny ? 1 : 0.35);
      let v = 0.16 + ndl * 0.84 + spec * 0.7 + K.bayer(px, py) * 0.14;
      const ramp = RGB[bm] || RGB.iron, q = ramp[Math.max(0, Math.min(4, Math.round(4.1 - v * 3.7)))];
      let r = q[0] * (amb[0] + ndl * sun[0]), gg = q[1] * (amb[1] + ndl * sun[1]), b = q[2] * (amb[2] + ndl * sun[2]);
      for (const lp of lamps) {
        const lx = lp.p[0] - best.p[0], ly = lp.p[1] - best.p[1], lz = lp.p[2] - best.p[2], dd = Math.hypot(lx, ly, lz), f = Math.max(0, 1 - dd / lp.r);
        if (f <= 0) continue;
        const nl = Math.max(0, (n[0] * lx + n[1] * ly + n[2] * lz) / dd) * f * f;
        r += q[0] * lp.col[0] * nl; gg += q[1] * lp.col[1] * nl; b += q[2] * lp.col[2] * nl;
      }
      data[o4] = Math.min(255, r + spec * 60); data[o4 + 1] = Math.min(255, gg + spec * 60); data[o4 + 2] = Math.min(255, b + spec * 70); data[o4 + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    return c;
  };

  /* ---- cameras ---- */
  /* side on, square to the engine from her right, looking a little down: s pixels a metre; (z0, y0) at the top left */
  Mo.side = (s, z0, y0, pitch = 0.1) => {
    const cp = Math.cos(pitch), sp = Math.sin(pitch), f = [-cp, -sp, 0], u = [-sp, cp, 0];
    return {
      s, z0, y0, f, u,
      ray: (px, py) => { const z = z0 + px / s, yy = y0 - py / s; return [[20 * cp + u[0] * yy, 20 * sp + u[1] * yy, z], f]; },
      /* where a point of the model falls on the picture */
      proj: p => ({ x: (p[2] - z0) * s, y: (y0 - (p[0] * u[0] + p[1] * u[1])) * s }),
    };
  };
  /* a perspective eye at e looking along +z (or -z), focal length f pixels, centre (cx, cy) */
  Mo.eye = (e, f, cx, cy, look = 1) => ({
    ray: (px, py) => { const dx = (px - cx) / f * look, dy = -(py - cy) / f; return [e, [dx, dy, look]]; },
  });

  /* ---- the engine: a 2-6-0, her tender, the art wagons, the gun wagon ---- */
  const B = (a, b, m, tex) => ({ k: "box", a, b, m, tex });
  const Cy = (ax, c, r, l, m, tex, cap) => ({ k: "cyl", ax, c, r, l, m, tex, cap });
  const Sp = (c, r, m, ymin) => ({ k: "sph", c, r, m, ymin });
  /* the boiler's brass bands */
  const banded = (z0s, w = 0.05) => p => z0s.some(z => Math.abs(p[2] - z) < w) ? "brass" : "paint";
  Mo.engine = (o = {}) => {
    const P = [], YC = 2.75, R0 = 0.8, RB = 1.45, RW = 1.38;
    /* frames and running boards, the valance lined in brass */
    P.push(B([-0.55, 0.55, 0.3], [0.55, 1.3, 10.55], "black"));
    P.push(B([-RW, RB - 0.06, 0], [RW, RB, 10.6], "iron"));
    P.push(B([-RW, RB - 0.34, 0], [RW, RB - 0.06, 10.6], "paint", p => Math.abs(p[1] - (RB - 0.2)) < 0.025 ? "lining" : "paint"));
    /* the firebox, square-shouldered, and the barrel with its bands, the smokebox black at the front */
    P.push(B([-0.95, RB, 1.45], [0.95, 3.45, 2.65], "paint", p => Math.abs(p[2] - 2.6) < 0.05 || Math.abs(p[1] - 3.42) < 0.03 ? "brass" : "paint"));
    P.push(Cy("z", [0, YC], R0, [2.6, 8.55], "paint", banded([3.3, 5.0, 6.8, 8.5])));
    P.push(Cy("z", [0, YC], 0.85, [8.55, 9.75], "black", (p, n, h) => h.cap > 0 ? (Math.hypot(p[0], p[1] - YC) < 0.1 ? "steel" : Math.hypot(p[0], p[1] - YC) > 0.78 ? "iron" : "black") : "black"));
    P.push(B([-0.55, RB, 8.55], [0.55, YC, 9.75], "black"));
    /* the chimney with its copper cap, the brass dome, the safety valves, the whistle */
    P.push(Cy("y", [0, 9.15], 0.27, [YC + 0.5, 4.2], "black"));
    P.push(Cy("y", [0, 9.15], 0.34, [4.1, 4.24], "copper"));
    P.push(Sp([0, YC + 0.66, 5.9], 0.5, "brass", YC + 0.7));
    P.push(Cy("y", [0, 5.9], 0.5, [YC + 0.62, YC + 0.76], "brass"));
    for (const x of [-0.13, 0.13]) P.push(Cy("y", [x, 2.15], 0.07, [3.4, 3.78], "brass"));
    P.push(Cy("y", [0.36, 1.9], 0.05, [3.4, 3.88], "brass"));
    /* handrails along the boiler, close in on their knobs: from the cab roof a gap between rail and barrel shows */
    for (const x of [-0.76, 0.76]) {
      P.push(Cy("z", [x, YC + 0.4], 0.03, [2.7, 9.0], "steel"));
      for (const z of [2.9, 4.4, 7.4, 8.8]) P.push(Sp([x * 0.96, YC + 0.38, z], 0.05, "steel"));
    }
    /* the cab: side sheets with their windows and the spectacle plate; the roof; the warm light inside */
    const cabWin = p => (p[2] > 0.25 && p[2] < 1.15 && p[1] > 2.55 && p[1] < 3.35) ? null : Math.abs(p[1] - 2.0) < 0.03 ? "lining" : "paint";
    P.push(B([RW - 0.05, RB, -0.05], [RW, 3.7, 1.6], "paint", cabWin));
    P.push(B([-RW, RB, -0.05], [-RW + 0.05, 3.7, 1.6], "paint", cabWin));
    P.push(B([-RW, RB, 1.55], [RW, 3.7, 1.6], "paint", p => (Math.abs(Math.abs(p[0]) - 0.95) < 0.32 && p[1] > 2.75 && p[1] < 3.35) ? "glass" : "paint"));
    P.push(B([-RW + 0.05, RB, -0.05], [RW - 0.05, 3.65, 1.55], "glowing"));
    P.push(B([-1.48, 3.7, -0.25], [1.48, 3.82, 1.72], "black"));
    /* outside cylinders, their covers, the slide bars */
    for (const x of [-1.12, 1.12]) { P.push(Cy("z", [x, 1.02], 0.34, [8.0, 9.35], "iron", (p, n, h) => h.cap ? "steel" : Math.abs(p[2] - 8.05) < 0.05 || Math.abs(p[2] - 9.3) < 0.05 ? "steel" : "iron")); P.push(B([x - 0.04, 0.92, 6.95], [x + 0.04, 1.0, 8.0], "steel")); }
    /* the buffer beam in red, the buffers, the lamp */
    P.push(B([-1.42, 0.95, 10.55], [1.42, RB, 10.75], "red"));
    for (const x of [-0.85, 0.85]) { P.push(Cy("z", [x, 1.18], 0.12, [10.75, 11.05], "black")); P.push(Cy("z", [x, 1.18], 0.21, [11.05, 11.12], "steel")); }
    P.push(B([-0.12, RB, 10.42], [0.12, 1.75, 10.6], "black", (p, n) => n[2] > 0.5 ? "lamp" : "black"));
    /* sandboxes on the running board, a toolbox */
    for (const x of [-1.0, 1.0]) P.push(B([x - 0.2, RB, 4.4], [x + 0.2, RB + 0.32, 4.9], "paint", p => Math.abs(p[1] - (RB + 0.3)) < 0.03 ? "brass" : "paint"));
    /* splashers over the driving wheels */
    for (const z of [3.0, 4.95, 6.9]) for (const x of [-1, 1]) P.push(Cy("x", [RB, z], 0.86, x > 0 ? [0.86, 1.32] : [-1.32, -0.86], "paint", (p, n, h) => p[1] < RB ? null : (h.cap && Math.hypot(p[1] - RB, p[2] - z) > 0.8 ? "brass" : "paint")));
    return P;
  };
  Mo.ENGINE_WHEELS = [{ z: 3.0, r: 0.78, d: true }, { z: 4.95, r: 0.78, d: true }, { z: 6.9, r: 0.78, d: true }, { z: 9.1, r: 0.45 }];
  /* the tender: a coal space heaped up, the tank, frames */
  Mo.tender = () => {
    const P = [];
    P.push(B([-0.5, 0.5, 0.2], [0.5, 1.3, 6.3], "black"));
    P.push(B([-1.35, 1.3, 0.1], [1.35, 3.1, 6.4], "paint", p => Math.abs(p[1] - 2.2) < 0.03 || Math.abs(p[1] - 3.06) < 0.03 ? "lining" : "paint"));
    P.push(B([-1.2, 3.0, 1.6], [1.2, 3.3, 6.2], "coal"));
    P.push(Cy("z", [0, 3.0], 1.2, [1.6, 6.2], "coal", p => p[1] < 3.0 ? null : (K.hash(Math.floor(p[0] * 8), Math.floor(p[2] * 8), 4) > 0.97 ? "black" : "coal"), false));
    P.push(B([-1.4, 1.0, 0], [1.4, 1.3, 0.12], "red"));
    return P;
  };
  Mo.TENDER_WHEELS = [{ z: 1.1, r: 0.55 }, { z: 3.25, r: 0.55 }, { z: 5.4, r: 0.55 }];
  /* a box van with art aboard: planked, its doors, a curved roof, the Resistance's paw chalked on */
  Mo.van = i => {
    const P = [];
    P.push(B([-0.45, 0.55, 0.4], [0.45, 1.15, 7.0], "black"));
    P.push(B([-1.38, 1.1, 0.1], [1.38, 1.3, 7.3], "iron"));
    P.push(B([-1.35, 1.3, 0.2], [1.35, 3.3, 7.2], "wood", (p, n) => {
      if (Math.abs(n[0]) > 0.5) {
        if (p[2] > 2.9 && p[2] < 4.5) return Math.abs(p[2] - 3.7) < 0.03 || Math.abs(p[1] - 2.3) < 0.04 ? "iron" : "wood";
        const pawZ = 1.6 + (i % 2) * 4.0, pd = Math.hypot(p[2] - pawZ, p[1] - 2.2);
        if (pd < 0.2 || [[-0.26, 0.2], [-0.09, 0.3], [0.09, 0.3], [0.26, 0.2]].some(([dz, dy]) => Math.hypot(p[2] - pawZ - dz, p[1] - 2.2 - dy) < 0.075)) return "chalk";
        return Math.floor(p[2] / 0.18) % 6 === 0 ? "iron" : "wood";
      }
      return "wood";
    }));
    P.push(Cy("z", [0, 2.2], 1.6, [0.15, 7.25], "slate", p => p[1] < 3.28 ? null : "slate", false));
    for (const z of [0.1, 7.3]) P.push(B([-1.4, 0.95, z - 0.12], [1.4, 1.3, z + 0.02], "red"));
    return P;
  };
  Mo.VAN_WHEELS = [{ z: 1.6, r: 0.48 }, { z: 5.7, r: 0.48 }];
  /* the gun wagon: a flat with sandbags and the anti-aircraft twin */
  Mo.flat = () => {
    const P = [];
    P.push(B([-0.45, 0.55, 0.3], [0.45, 1.15, 5.7], "black"));
    P.push(B([-1.38, 1.1, 0], [1.38, 1.36, 6.0], "wood", p => Math.floor(p[2] / 0.3) % 2 ? "wood" : "iron"));
    for (let i = 0; i < 9; i++) for (const x of [-1.05, 1.05]) P.push(Sp([x, 1.5, 0.5 + i * 0.62], 0.33, "canvas", 1.36));
    P.push(Cy("y", [0, 3.0], 0.45, [1.36, 1.9], "iron"));
    P.push(Cy("y", [0, 3.0], 0.12, [1.9, 2.5], "iron"));
    for (const x of [-0.12, 0.12]) P.push({ k: "cyl", ax: "z", c: [x, 2.5], r: 0.07, l: [3.0, 4.6], m: "black" });
    return P;
  };
  /* a Wolf Empire fighter: z forward, x the right wing, y up; 11 m across the wings */
  Mo.fighter = () => {
    const P = [];
    const skin = (p, n) => n[1] < -0.3 ? "under" : "plane";
    P.push(Cy("z", [0, 0], 0.3, [-4.6, -2.6], "plane", skin));
    P.push(Cy("z", [0, 0], 0.45, [-2.6, -0.6], "plane", skin, false));
    P.push(Cy("z", [0, 0], 0.58, [-0.6, 2.5], "plane", (p, n) => Math.abs(p[2] - 0.9) < 0.04 || Math.abs(p[2] - 1.9) < 0.04 ? "iron" : skin(p, n), false));
    P.push(Sp([0, 0, 2.5], 0.58, "black"));
    P.push(Sp([0, 0, 3.05], 0.2, "red"));
    /* the propeller turning: a disc, mostly air */
    P.push(Cy("z", [0, 0], 1.45, [2.95, 3.0], "steel", p => (K.hash(Math.floor(p[0] * 9), Math.floor(p[1] * 9), 2) > 0.8 ? "steel" : null)));
    /* the wings, tapering, red at the tips, the Empire's mark on them */
    P.push(B([-5.5, -0.32, -0.75], [5.5, -0.18, 1.15], "plane", (p, n) => {
      const ax = Math.abs(p[0]); if (p[2] > 1.15 - ax * 0.09 || p[2] < -0.75 + ax * 0.06) return null;
      if (ax > 4.9) return "red";
      const rd = Math.hypot(ax - 3.5, p[2] - 0.15); if (rd < 0.48) return rd < 0.22 ? "chalk" : "red";
      return n[1] < 0 ? "under" : "plane";
    }));
    P.push(B([-1.9, 0.02, -4.6], [1.9, 0.1, -3.8], "plane", p => p[2] > -3.8 - Math.abs(p[0]) * 0.25 ? null : "plane"));
    P.push(B([-0.06, 0, -4.7], [0.06, 1.45, -3.6], "plane", p => (p[2] > -3.6 - p[1] * 0.45 ? null : p[1] > 1.1 ? "red" : "plane")));
    P.push(Sp([0, 0.42, 0.1], 0.44, "glass", 0.4));
    for (const x of [-0.6, 0.6]) P.push(B([x - 0.04, -0.05, 1.7], [x + 0.04, 0.15, 2.3], "glowing"));
    return P;
  };
  Mo.FLAT_WHEELS = [{ z: 1.3, r: 0.48 }, { z: 4.7, r: 0.48 }];

  /* ---- a wheel, drawn flat each frame: tyre, spokes, boss, the crank and its weight ---- */
  Mo.wheel = (g, x, y, r, ang, lit = 1, driver = false) => {
    const R = Math.round(r), steel = M.steel, paint = M.paint;
    for (let j = -R; j <= R; j++) for (let i = -R; i <= R; i++) {
      const d = Math.hypot(i, j); if (d > R + 0.3) continue;
      const a = Math.atan2(j, i) - ang;
      let col;
      if (d > R - Math.max(1.5, R * 0.14)) col = steel[(i + j < 0) ? 1 : 3];                       /* the tyre */
      else if (d > R - Math.max(2.5, R * 0.24)) col = paint[2];                                    /* the rim */
      else if (d < Math.max(1.6, R * 0.2)) col = paint[1];                                          /* the boss */
      else {
        const n = R > 9 ? 14 : R > 5 ? 10 : 6, sp = ((a % (Math.PI * 2 / n)) + Math.PI * 2 / n) % (Math.PI * 2 / n);
        const spoke = sp < Math.PI * 2 / n * (0.18 + 0.4 / Math.max(1, d * 0.3));
        /* the balance weight, a crescent opposite the crank */
        const cw = driver && Math.cos(a + Math.PI) > 0.55 && d > R * 0.4;
        if (!spoke && !cw) continue;
        col = paint[cw ? 3 : 2];
      }
      g.fillStyle = col; g.fillRect(Math.round(x) + i, Math.round(y) + j, 1, 1);
    }
    /* the crank pin */
    if (driver) { const cx = x + Math.cos(ang) * r * 0.5, cy = y + Math.sin(ang) * r * 0.5; K.disc(g, cx, cy, Math.max(1, r * 0.12), Math.max(1, r * 0.12), steel[0]); }
  };
  /* the coupling rod and the connecting rod to the crosshead */
  Mo.rods = (g, pts, ang, r, cyl) => {
    const off = [Math.cos(ang) * r * 0.5, Math.sin(ang) * r * 0.5];
    const a = [pts[0].x + off[0], pts[0].y + off[1]], b = [pts[pts.length - 1].x + off[0], pts[pts.length - 1].y + off[1]];
    K.line(g, a[0], a[1], b[0], b[1], M.steel[3], Math.max(2, Math.round(r * 0.16)));
    K.line(g, a[0], a[1] - 1, b[0], b[1] - 1, M.steel[0], 1);
    if (cyl) {
      const m = pts[1], mp = [m.x + off[0], m.y + off[1]], ch = [cyl.x - r * 0.9 + Math.cos(ang) * r * 0.5, cyl.y];
      K.line(g, mp[0], mp[1], ch[0], ch[1], M.steel[2], Math.max(2, Math.round(r * 0.14)));
      K.rect(g, ch[0] - 3, ch[1] - 2, 6, 4, M.steel[1]);
    }
  };

  /* ---- the whole train side on: traced once for scale s, wheels drawn per frame ---- */
  const LAYOUT = () => [
    { kind: "flat", parts: Mo.flat, len: 6.0, wheels: Mo.FLAT_WHEELS },
    { kind: "van3", parts: () => Mo.van(3), len: 7.4, wheels: Mo.VAN_WHEELS },
    { kind: "van2", parts: () => Mo.van(2), len: 7.4, wheels: Mo.VAN_WHEELS },
    { kind: "van1", parts: () => Mo.van(1), len: 7.4, wheels: Mo.VAN_WHEELS },
    { kind: "van0", parts: () => Mo.van(0), len: 7.4, wheels: Mo.VAN_WHEELS },
    { kind: "tender", parts: Mo.tender, len: 6.5, wheels: Mo.TENDER_WHEELS },
    { kind: "engine", parts: Mo.engine, len: 11.15, wheels: Mo.ENGINE_WHEELS },
  ];
  /* one vehicle side on: its picture, and where its wheels go */
  Mo.sideSprite = (kind, s, light, only) => K.get(`side:${kind}:${s}:${light.key}`, () => {
    const v = LAYOUT().find(q => q.kind === kind), H = Math.ceil(4.6 * s), W = Math.ceil((v.len + 0.4) * s);
    const cam = Mo.side(s, -0.2, 4.4, 0.08);
    const c = Mo.trace(v.parts(), W, H, cam, light);
    K.outline(c, "#07080b");
    c.wheels = v.wheels.map(w => Object.assign({}, w, cam.proj([1.45, w.r, w.z])));
    c.cyl = kind === "engine" ? cam.proj([1.45, 1.02, 8.0]) : null;
    c.len = v.len;
    return c;
  });
  Mo.trainKinds = () => LAYOUT().map(v => v.kind);
  Mo.LIGHT_NIGHT = { key: "night", dir: [0.62, 0.7, 0.3], amb: [0.42, 0.46, 0.6], sun: [0.78, 0.8, 0.94], lamps: [] };
  /* draw a vehicle at x, y (its rail level), its wheels turned to ang */
  Mo.drawSide = (g, kind, s, x, y, ang, light = Mo.LIGHT_NIGHT) => {
    const sp = Mo.sideSprite(kind, s, light);
    const top = Math.round(y - 4.4 * s);
    g.drawImage(sp, Math.round(x), top);
    /* the driving wheels run up under their splashers: drawn below the valance only */
    const clipY = top + Math.round((4.4 - 1.12) * s);
    for (const w of sp.wheels) {
      if (w.d) { g.save(); g.beginPath(); g.rect(x - 4, clipY, sp.width + 8, 4 * s); g.clip(); }
      Mo.wheel(g, x + w.x, top + w.y, w.r * s, ang * (0.78 / w.r), 1, !!w.d);
      if (w.d) g.restore();
    }
    if (kind === "engine") Mo.rods(g, sp.wheels.filter(w => w.d).map(w => ({ x: x + w.x, y: top + w.y })), ang, 0.78 * s, { x: x + sp.cyl.x, y: top + sp.cyl.y });
    return sp;
  };
})();
