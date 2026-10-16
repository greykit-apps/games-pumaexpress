/* The Puma Express -- a bridge the wolves' gunboats hold: from the bank by
 * the bridgehead, looking across the river at night.
 *
 * The bridge runs away across the water on the left: a through truss on
 * stone piers, traced from a model. The far bank: its poplars and oaks, a
 * farm or two with a window lit, all of it given back by the water, broken
 * by the ripples, with the moon's path across it. The gunboats lie out on
 * the river, models too: grey hulls with a red boot-top, a lit wheelhouse,
 * the funnel, the bow gun, the Empire's flag, a searchlight sweeping. The
 * cannon on the flat wagon is in front of you, your paws on its wheels.
 *
 * Bearing is left and right, range is how far out over the water; a shell
 * takes its time and throws up a column where it lands, and that is how you
 * learn which way to correct (1987: high or low, left or right). The range
 * scale is on the right, the bearing mark over the far bank. */
"use strict";
(() => {
  const K = PX.K, M = K.M, C = PX.C, FX = PX.FX, Mo = PX.Model, World = PX.World, B = PX.BridgeArt = {};
  const INK = "#0b0d12";

  B.geo = (W, H) => {
    const hor = Math.round(H * 0.3), top = hor + 4, bot = Math.round(H * 0.8), cx = Math.round(W / 2), half = W * 0.44;
    const yR = r => { const t = (1 / r - 1 / 1600) / (1 / 220 - 1 / 1600); return top + 4 + t * (bot - top - 8); };
    const rY = y => { const t = (y - top - 4) / (bot - top - 8); return 1 / (t * (1 / 220 - 1 / 1600) + 1 / 1600); };
    return { W, H, hor, top, bot, cx, xB: b => cx + b / C.BRIDGE.bearMax * half, bX: x => (x - cx) / half * C.BRIDGE.bearMax, yR, rY };
  };
  B.toAim = (x, y) => { const G = B.last; if (!G) return null; return { bear: PX.clamp(G.bX(x), -C.BRIDGE.bearMax, C.BRIDGE.bearMax), range: PX.clamp(G.rY(PX.clamp(y, G.top + 4, G.bot - 4)), C.BRIDGE.rangeMin, C.BRIDGE.rangeMax) }; };

  /* ---- the models ---- */
  const Bx = (a, b, m, tex) => ({ k: "box", a, b, m, tex });
  const Cy = (ax, c, r, l, m, tex, cap) => ({ k: "cyl", ax, c, r, l, m, tex, cap });
  /* a gunboat: z along her, bow forward; y up from the water */
  const gunboat = () => {
    const P = [];
    P.push(Bx([-2.4, 0, -12], [2.4, 1.9, 11], "plane", (p, n) => {
      const w = p[2] > 5 ? 2.4 * (1 - (p[2] - 5) / 6.5) : p[2] < -10 ? 2.4 * (1 - (-10 - p[2]) / 3) : 2.4;
      if (Math.abs(p[0]) > w + 0.02) return null;
      if (n[1] > 0.5) return Math.floor(p[2] / 0.6) % 2 ? "wood" : "iron";
      if (p[1] < 0.35) return "red";
      return Math.abs(p[1] - 1.5) < 0.05 ? "steel" : "plane";
    }));
    P.push(Bx([-1.6, 1.9, -5], [1.6, 3.4, 2.5], "plane", (p, n) => Math.abs(n[0]) > 0.5 && p[1] > 2.5 && p[1] < 3.0 && ((p[2] + 5) % 1.4) < 0.7 ? "lamp" : "plane"));
    P.push(Bx([-1.2, 3.4, -0.5], [1.2, 4.9, 2.5], "plane", (p, n) => (Math.abs(n[0]) > 0.5 || n[2] > 0.5) && p[1] > 4.0 && p[1] < 4.6 ? "lamp" : n[1] > 0.5 ? "iron" : "plane"));
    P.push(Cy("y", [0, -2.8], 0.62, [3.4, 6.3], "black", p => p[1] > 5.3 && p[1] < 5.7 ? "red" : "black"));
    P.push(Cy("y", [0, 7.2], 0.95, [1.9, 2.6], "iron"));
    P.push(Bx([-0.8, 2.0, 7.5], [0.8, 3.1, 7.8], "plane"));
    P.push(Cy("z", [0, 2.45], 0.13, [7.2, 11.2], "black"));
    P.push(Cy("y", [0, 1.0], 0.08, [4.9, 9.5], "black"));
    P.push(Bx([-0.03, 8.0, -0.6], [0.03, 9.1, 1.0], "red", p => Math.hypot(p[2] - 0.2, p[1] - 8.55) < 0.32 ? "chalk" : "red"));
    P.push(Cy("z", [0, 5.25], 0.32, [1.6, 2.4], "black", (p, n, h) => h.cap > 0 ? "lamp" : "black"));
    return P;
  };
  /* a gunboat side on, bow to the right, len pixels long */
  const boatSprite = (len) => {
    const L = Math.max(10, Math.round(len / 2) * 2);
    return K.get(`boat3:${L}`, () => {
      const s = L / 24, W = L + 6, H = Math.ceil(L * 0.48) + 4, el = 0.12, ce = Math.cos(el), se = Math.sin(el);
      const f = [-ce, -se, 0], u = [-se, ce, 0];
      const cam = { ray: (px, py) => { const z = (px - 3) / s - 12.5, yy = (H - 3 - py) / s - 0.2; return [[30 * ce + u[0] * yy, 30 * se + u[1] * yy, z], f]; } };
      const c = Mo.trace(gunboat(), W, H, cam, { dir: [0.5, 0.75, 0.4], amb: [0.5, 0.54, 0.68], sun: [0.8, 0.82, 0.95] });
      if (L >= 16) K.outline(c, "#141a26");
      c.water = H - 3 - Math.round(0.2 * s * ce);
      c.lamp = { x: 3 + (2.0 + 12.5) * s, y: H - 3 - (5.25 + 0.2) * s };
      c.gun = { x: 3 + (11.2 + 12.5) * s, y: H - 3 - (2.45 + 0.2) * s };
      return c;
    });
  };
  /* the bridge: a through truss on stone piers, running away across the river on the left */
  const bridgeParts = () => {
    const P = [], x0 = -16, w = 3.0, top = 9;
    for (let z = 6; z < 150; z += 45) P.push(Bx([x0 - w - 1.4, 0.05, z - 2.5], [x0 + w + 1.4, 1.0, z + 2.5], "stone", p => (Math.floor(p[1] / 0.7) + Math.floor(p[2] / 1.4)) % 2 ? "stone" : "slate"));
    for (const sx of [-1, 1]) {
      const x = x0 + sx * w;
      P.push(Bx([x - 0.25, 0.8, 0], [x + 0.25, 1.6, 150], "iron"));
      P.push(Bx([x - 0.25, top - 0.6, 3], [x + 0.25, top, 150], "iron"));
      for (let z = 3; z < 140; z += 7.5) {
        P.push(Bx([x - 0.18, 1.6, z - 0.2], [x + 0.18, top - 0.6, z + 0.2], "iron"));
        /* the diagonal, stepped */
        for (let k = 0; k < 6; k++) { const t0 = k / 6, y0 = 1.6 + t0 * (top - 2.2); P.push(Bx([x - 0.12, y0, z + t0 * 7.5 - 0.3], [x + 0.12, y0 + (top - 2.2) / 6 + 0.05, z + t0 * 7.5 + 0.35], "iron")); }
      }
    }
    for (let z = 3; z < 140; z += 15) P.push(Bx([x0 - w, top - 0.5, z - 0.15], [x0 + w, top - 0.2, z + 0.15], "iron"));
    return P;
  };
  RAMP_STONE();
  function RAMP_STONE() { Mo.RAMP.stone = M.stone; }

  /* ---- the still picture: sky, the far bank, the bridge; its reflection kept for the water ---- */
  const scene = (W, H, l) => K.get(`bridgeScene:${W}x${H}:${Math.round(l * 8)}`, () => {
    const G = B.geo(W, H), c = K.mk(W, H), g = c.getContext("2d");
    g.drawImage(World.skyImage(W, G.top + 1, l, 1), 0, 0);
    /* the far bank: a hedge line, poplars and oaks, a farm with a window lit */
    const bank = K.mk(W, 60), bg = bank.getContext("2d"), by = 46;
    for (let x = 0; x < W; x++) { const h = 4 + Math.round(K.fbm(x / 30, 21) * 7); bg.fillStyle = K.dim("#2a3a30", l * 0.6, 0.1); bg.fillRect(x, by - h, 1, h + 14); }
    for (let i = 0; i < W / 9; i++) {
      const x = Math.round(i * 9 + K.hash(i, 1, 41) * 8), kind = K.hash(i, 2, 41) < 0.35 ? "poplar" : "oak", h = (kind === "poplar" ? 24 : 15) * (0.6 + K.hash(i, 3, 41) * 0.6);
      if (K.hash(i, 4, 41) < 0.3) continue;
      const t = World.tree(kind, h, i % 3, l, 1); bg.drawImage(t, x - (t.width >> 1), by - t.height + 2);
    }
    for (const fx of [0.3, 0.7]) { const f = World.farm(1.4, Math.round(fx * 10), l, 1); bg.drawImage(f, Math.round(W * fx), by - f.height + 3); }
    g.drawImage(bank, 0, G.top - by + 2);
    /* its reflection, for the water to break up */
    const refl = K.mk(W, 60), rg = refl.getContext("2d"); rg.translate(0, 60); rg.scale(1, -1); rg.drawImage(bank, 0, 60 - by - 2 - 14);
    /* the bridge over the water on the left: stone piers, the deck, the truss's chords, posts and diagonals,
       each member as thick as its distance allows, moonlit along its top */
    const br = K.mk(W, H), bgc = br.getContext("2d"), f = H * 1.25, ex = W * 0.5, eyeY = 3.2, X0 = -16, BW = 3.0, TOP = 8.6;
    const P = (x, y, z) => ({ x: ex + x * f / (z + 8), y: G.hor - (y - eyeY) * f / (z + 8), s: f / (z + 8) });
    const hz = K.rgb(K.sky(l)[4]);
    const tone = (hex, z) => { const q = K.rgb(K.dim(hex, l * 0.6, 0.1)), fog = Math.min(0.85, z / 170); return K.hex(q.map((v, i) => v + (hz[i] - v) * fog)); };
    const member = (a, b2, w, z) => { const wd = Math.max(1, Math.round(w * a.s)); K.line(bgc, a.x, a.y, b2.x, b2.y, tone("#2c3038", z), wd); if (wd > 2) K.line(bgc, a.x, a.y - (wd >> 1), b2.x, b2.y - (wd >> 1), tone("#7a8494", z), 1); };
    for (let z = 140; z >= 0; z -= 7.5) {
      /* a pier every few spans: dressed stone above the water */
      if (Math.round(z) % 45 === 0) {
        const p0 = P(X0 - BW - 1.2, 0, z), p1 = P(X0 + BW + 1.2, 1.0, z);
        for (let y = Math.round(p1.y); y < p0.y; y++) for (let x = Math.round(p0.x); x < p1.x; x++) { const q = K.hash(Math.floor((x - p0.x) / Math.max(2, p0.s * 0.7)), Math.floor((y - p1.y) / Math.max(2, p0.s * 0.35)), 5); bgc.fillStyle = tone(q > 0.6 ? "#8a8274" : "#6e6658", z); bgc.fillRect(x, y, 1, 1); }
      }
      /* the deck between the bottom chords */
      const d0 = P(X0 - BW, 1.05, z), d1 = P(X0 + BW, 1.05, z), d2 = P(X0 + BW, 1.05, z + 7.5), d3 = P(X0 - BW, 1.05, z + 7.5);
      K.poly(bgc, [[d0.x, d0.y], [d1.x, d1.y], [d2.x, d2.y], [d3.x, d3.y]], tone("#1c1e22", z));
      for (const sx of [1, -1]) {
        const x = X0 + sx * BW, bA = P(x, 1.2, z), bB = P(x, 1.2, z + 7.5), tA = P(x, TOP, z), tB = P(x, TOP, z + 7.5);
        member(bA, bB, 0.45, z);
        if (z > 0) member(tA, tB, 0.45, z);
        member(bA, tA, 0.3, z);
        member(tA, bB, 0.22, z);
      }
      if (Math.round(z) % 15 === 0) member(P(X0 - BW, TOP, z), P(X0 + BW, TOP, z), 0.18, z);
    }
    g.drawImage(br, 0, 0);
    c.refl = refl;
    c.bridge = br; c.bridgeY = 0;
    return c;
  });

  B.draw = (g, S, ui, now) => {
    const W = g.canvas.width, H = g.canvas.height, G = B.geo(W, H), F = S.fight, l = K.light(S.t), cn = S.cannon;
    B.last = G;
    const sc = scene(W, H, l);
    g.drawImage(sc, 0, 0, W, G.top, 0, 0, W, G.top);
    /* the water, a row at a time: dark, ripples drifting, the bank given back broken, the moon's path */
    const refl = sc.refl, t = now / 1000, mx = W * 0.8;
    for (let y = G.top; y < G.bot; y++) {
      const k = (y - G.top) / (G.bot - G.top), base = K.mix("#1e3a56", "#0e1c2c", k);
      g.fillStyle = K.dim(base, l * 0.6, 0.12); g.fillRect(0, y, W, 1);
      /* the bank's reflection, near the far shore, swayed by the ripples */
      const ry = y - G.top;
      if (ry < 26) { const sway = Math.round(Math.sin(y * 0.9 + t * 2.2) * (1 + ry * 0.12)); g.globalAlpha = 0.45 * (1 - ry / 26); g.drawImage(refl, 0, ry + 14, W, 1, sway, y, W, 1); g.globalAlpha = 1; }
      /* the moon's path, broken into bright dashes, wider toward us */
      if (l < 0.75) for (let i = 0; i < 2 + k * 4; i++) { const h = K.hash(y, i + Math.floor(t * 3), 9); if (h < 0.55) continue; const x = mx + (K.hash(y, i, 10) - 0.5) * (8 + k * 60), w = 2 + Math.round(h * 4 * (1 + k * 2)); g.fillStyle = `rgba(244,236,210,${(0.25 + h * 0.3).toFixed(2)})`; g.fillRect(Math.round(x), y, w, 1); }
      /* ripples catching the sky */
      for (let i = 0; i < 3 + k * 6; i++) { const h = K.hash(y * 7 + i, Math.floor(t * 1.5 + i), 11); if (h < 0.6) continue; g.fillStyle = "rgba(150,180,215,.12)"; g.fillRect(Math.round(K.hash(y, i, 12) * W + t * 6 * (1 + k)) % W, y, 3 + Math.round(k * 10), 1); }
    }
    /* the bridge over the water */
    g.drawImage(sc.bridge, 0, sc.bridgeY);
    /* the boats, far to near: their wakes, their searchlights sweeping the bank */
    const boats = F.boats.filter(b => b.st !== "gone").slice().sort((a, b) => b.range - a.range);
    for (const b of boats) {
      const x = G.xB(b.bear), y = G.yR(b.range), len = PX.clamp(24000 / b.range, 16, 96);
      const spr = boatSprite(len), left = b.vb < 0;
      const img = left ? K.get(`boat3F:${spr.width}`, () => K.flip(spr)) : spr;
      const sink = b.st === "sinking" ? Math.min(1, b.t / 2) : 0;
      if (b.st === "ok") {
        /* the wake and the bow wave */
        g.fillStyle = "rgba(220,232,240,.4)"; const wx = left ? x + len * 0.45 : x - len * 0.45 - len * 0.5;
        for (let i = 0; i < len * 0.5; i += 2) g.fillRect(Math.round(wx + i), Math.round(y + 1 + (i % 4 === 0 ? 1 : 0)), 1, 1);
        g.fillRect(Math.round(left ? x - len * 0.5 : x + len * 0.45), Math.round(y), 3, 1);
      }
      g.save(); g.beginPath(); g.rect(0, 0, W, Math.round(y) + 1); g.clip();
      g.translate(Math.round(x), Math.round(y + sink * spr.height * 0.9)); g.rotate((left ? -1 : 1) * sink * 0.35);
      g.drawImage(img, -Math.round(img.width / 2), -spr.water);
      g.restore();
      /* its reflection, dim, under it */
      if (b.st === "ok") { g.save(); g.globalAlpha = 0.18; g.translate(Math.round(x), Math.round(y) + 1); g.scale(1, -0.5); g.drawImage(img, -Math.round(img.width / 2), -spr.water); g.restore(); }
      if (b.st === "ok" && l < 0.75) {
        const lx = Math.round(x - img.width / 2 + (left ? img.width - spr.lamp.x : spr.lamp.x)), ly = Math.round(y - spr.water + spr.lamp.y);
        const a = Math.sin(now / 1300 + b.id * 2.1) * 0.6 + 0.2;
        K.poly(g, [[lx, ly], [lx + Math.sin(a - 0.07) * H, ly + Math.cos(a - 0.07) * H], [lx + Math.sin(a + 0.07) * H, ly + Math.cos(a + 0.07) * H]], "rgba(255,250,215,.07)");
        g.fillStyle = "rgba(255,250,215,.5)"; K.disc(g, lx, ly, 2, 2);
      }
      if (b.st === "sinking" && Math.random() < 0.5) FX.smoke(x, y - len * 0.2, { r: 2, grow: 10, vy: -12, life: 1.8, col: [60, 56, 54], a: 0.6, layer: "back" });
      if (b.st === "sinking" && Math.random() < 0.4) FX.spark(x + (Math.random() - 0.5) * len * 0.4, y - len * 0.15, { col: "#ffad3c", vy: -25, vx: 0, life: 0.5 });
      if (b.hp < (S.diff === 0 ? 1 : 2) && b.st === "ok" && Math.random() < 0.3) FX.smoke(x, y - len * 0.25, { r: 1.5, grow: 6, vy: -10, life: 1.2, col: [70, 66, 64], a: 0.5, layer: "back" });
    }
    FX.draw(g, "back");
    /* the near bank and the flat wagon under the gun */
    for (let y = G.bot; y < H; y++) { const k = (y - G.bot) / (H - G.bot); g.fillStyle = K.mix("#2e2c26", "#12110e", k); g.fillRect(0, y, W, 1); }
    for (let x = 0; x < W; x += 2) if (K.hash(x, 3, 5) > 0.5) K.px(g, x, G.bot + 1 + K.hash(x, 4) * (H - G.bot - 2), "#4a463c");
    for (let x = 0; x < W; x++) { const h = Math.round(3 + K.hash(Math.floor(x / 2), 5, 6) * 6); g.fillStyle = "#1e2a1c"; g.fillRect(x, G.bot - h + 3, 1, h); }
    cannon(g, G, F, cn, l);
    /* shells in the air */
    for (const sh of F.shells) {
      const f = sh.t / sh.T, x = PX.lerp(B.muzzle.x, G.xB(sh.bear), f), y = PX.lerp(B.muzzle.y, G.yR(sh.range), f) - Math.sin(f * Math.PI) * H * 0.3;
      K.rect(g, x - 1, y - 1, 3, 3, "#fff0b0"); g.fillStyle = "rgba(255,200,120,.35)"; g.fillRect(Math.round(x - 4), Math.round(y), 4, 1);
    }
    FX.draw(g, "front");
    /* the range scale on the right, the bearing mark over the far bank */
    const rx = W - 30;
    g.fillStyle = "rgba(12,14,20,.6)"; g.fillRect(rx - 8, G.top - 18, 36, G.bot - G.top + 26);
    K.text3(g, "M", rx + 6, G.top - 14, "#9b9284"); K.text3(g, "X100", rx - 4, G.top - 8, "#9b9284");
    for (const r of [250, 400, 600, 800, 1000, 1200, 1500]) { const y = Math.round(G.yR(r)); K.rect(g, rx, y, 5, 1, "#9b9284"); K.text3(g, String(r / 100 | 0), rx + 8, y - 2, "#b8ae9c"); }
    const ry2 = Math.round(G.yR(cn.range));
    K.poly(g, [[rx - 7, ry2 - 4], [rx - 1, ry2], [rx - 7, ry2 + 4]], "#ffc35a"); K.rect(g, rx - 1, ry2, 7, 1, "#ffc35a");
    const tx = Math.round(G.xB(cn.bear));
    for (let b = -30; b <= 30; b += 10) K.rect(g, Math.round(G.xB(b)), G.hor - 30, 1, 4, "rgba(233,228,216,.5)");
    K.poly(g, [[tx - 4, G.hor - 26], [tx + 4, G.hor - 26], [tx, G.hor - 21]], "#ffc35a");
    if (ui.aids.gunnery) { const gy = G.yR(cn.range); K.ring(g, tx, gy, 5, "rgba(255,195,90,.85)", 1); K.rect(g, tx - 10, gy, 4, 1, "rgba(255,195,90,.85)"); K.rect(g, tx + 7, gy, 4, 1, "rgba(255,195,90,.85)"); }
  };

  /* the gun on the flat wagon: its shield, the barrel and recoil cylinder laid by bearing and range, the handwheels, your paws */
  function cannon(g, G, F, cn, l) {
    const W = G.W, H = G.H, deckY = H - 30;
    for (let y = deckY; y < H; y++) for (let x = Math.round(G.cx - 150); x < G.cx + 150; x++) { g.fillStyle = M.wood[y === deckY ? 0 : Math.floor((x - G.cx) / 18) % 2 ? 2 : 3]; g.fillRect(x, y, 1, 1); }
    K.rect(g, G.cx - 150, deckY + 8, 300, 2, M.iron[2]);
    const tx = G.xB(cn.bear), el = (cn.range - C.BRIDGE.rangeMin) / (C.BRIDGE.rangeMax - C.BRIDGE.rangeMin);
    /* the barrel, seen from behind: wide at the breech, narrowing toward the water it is laid on */
    const bx = G.cx, by = deckY - 26, recoil = F.reload > C.BRIDGE.reload - 0.25 ? 6 : 0;
    const tipX = PX.lerp(bx, tx, 0.42), tipY = PX.lerp(by - 40, G.yR(cn.range) - 30, 0.35) - el * 18 + recoil;
    const dx = tipX - bx, dy = tipY - by, dl = Math.hypot(dx, dy) || 1, nx = -dy / dl, ny = dx / dl;
    const quad = (w0, w1, t0, t1, col) => K.poly(g, [[bx + dx * t0 + nx * w0, by + dy * t0 + ny * w0], [bx + dx * t1 + nx * w1, by + dy * t1 + ny * w1], [bx + dx * t1 - nx * w1, by + dy * t1 - ny * w1], [bx + dx * t0 - nx * w0, by + dy * t0 - ny * w0]], col);
    quad(16, 7, 0, 1, INK);
    quad(15, 6, 0, 1, M.olive[3]);
    quad(9, 3.5, 0, 1, M.olive[2]);
    quad(4, 1.5, 0.05, 1, M.olive[1]);
    quad(8, 7.5, 0.88, 1, M.olive[4]);
    /* the breech ring and the recoil cylinder under the barrel */
    K.disc(g, bx, by + 4, 18, 12, INK); K.disc(g, bx, by + 4, 16, 10, M.iron[2]); K.disc(g, bx - 4, by + 1, 8, 5, M.iron[1]); K.disc(g, bx, by + 4, 5, 4, M.iron[3]);
    B.muzzle = { x: tipX, y: tipY };
    /* the shield: a sloped plate, riveted, a sighting slot */
    const sx = bx, sy = by + 14;
    K.poly(g, [[sx - 56, deckY], [sx - 46, sy - 30], [sx + 46, sy - 30], [sx + 56, deckY]], INK);
    for (let y = Math.round(sy - 29); y < deckY; y++) { const k = (y - (sy - 29)) / (deckY - sy + 29), half = 46 + k * 9; for (let x = Math.round(sx - half); x < sx + half; x++) { const lv = -(x - sx) / half * 0.4 - k * 0.5 + K.bayer(x, y) * 0.35; g.fillStyle = M.olive[PX.clamp(Math.round(2 - lv * 1.4), 0, 4)]; g.fillRect(x, y, 1, 1); } }
    K.rect(g, sx - 46, Math.round(sy - 30), 92, 2, M.olive[0]);
    for (let x = sx - 40; x <= sx + 40; x += 10) K.rivet(g, x, Math.round(sy - 25), M.olive[0], INK);
    K.rect(g, sx - 12, Math.round(sy - 18), 24, 3, INK);
    /* the handwheels, training and laying, and your paws on them */
    for (const [hx, hy, a] of [[sx - 34, deckY - 14, el * 6], [sx + 34, deckY - 14, cn.bear / 6]]) {
      K.ring(g, hx, hy, 9, INK, 3); K.ring(g, hx, hy, 8, M.brass[2], 2);
      for (let i = 0; i < 4; i++) { const q = a + i * Math.PI / 2; K.line(g, hx, hy, hx + Math.cos(q) * 7, hy + Math.sin(q) * 7, M.brass[3]); }
      K.disc(g, hx, hy, 2, 2, M.brass[1]);
    }
    const paw = PX.People.paw();
    g.drawImage(paw, sx - 42, deckY - 18); g.drawImage(K.get("pawF", () => K.flip(PX.People.paw())), sx + 26, deckY - 18);
  }

  /* a column where a shell came down, and the gun's flash */
  B.splash = (bear, range, big) => { const G = B.last; if (!G) return; const s = PX.clamp(600 / range, 0.7, 2.8) * (big ? 1.3 : 1); FX.splash(G.xB(bear), G.yR(range), s); };
  B.fire = () => { if (B.muzzle) { FX.flash(B.muzzle.x, B.muzzle.y, 12, { life: 0.12 }); for (let i = 0; i < 8; i++) FX.smoke(B.muzzle.x, B.muzzle.y, { r: 3, grow: 14, vy: -12, vx: (Math.random() - 0.5) * 20, life: 1.6, col: [150, 150, 156], a: 0.5 }); } };
  B.boatFire = id => { const G = B.last, b = PX.game && PX.game.S && PX.game.S.fight && PX.game.S.fight.boats[id]; if (!G || !b) return; const len = PX.clamp(24000 / b.range, 16, 96); FX.flash(G.xB(b.bear) + (b.vb < 0 ? -1 : 1) * len * 0.42, G.yR(b.range) - len * 0.12, 4 + len * 0.08, { life: 0.1 }); };
  B.nearMiss = x => { const G = B.last; if (!G) return; FX.splash(G.cx + x * G.W * 0.35, G.bot - 6, 1.8); };
})();
