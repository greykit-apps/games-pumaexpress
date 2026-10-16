/* The Puma Express -- the guns: the twin anti-aircraft mounting. Key 1 is
 * the one on the engine's cab roof, looking ahead down the boiler (traced
 * from the model) to the chimney and its smoke; key 2 is the one on the gun
 * wagon at the tail, looking back down the line over its sandbags.
 *
 * The Wolf Empire's fighters are models too, traced from the very angle the
 * gun sees each one at (binned, and kept), turned and mirrored onto the
 * screen, banked into their turns: gunmetal over pale undersides, red at the
 * wingtips and spinner, the Empire's mark under the wings, exhausts glowing.
 *
 * Aim is in radians off the gun's line (PX.Engine.sight); Guns.toSight turns
 * a point on the canvas into it, for the mouse. */
"use strict";
(() => {
  const K = PX.K, M = K.M, C = PX.C, E = PX.Engine, World = PX.World, FX = PX.FX, Mo = PX.Model, G = PX.Guns = {};
  const INK = "#0b0d12";

  /* ---- a fighter's sprite, seen from direction v (the plane's own frame), span pixels across ---- */
  const SIZES = [4, 5, 6, 8, 10, 12, 14, 17, 20, 24, 28, 33, 39, 46, 54, 64, 76, 90];
  const norm = v => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const AZ = 24, EL = 9;
  /* the frame a sprite is drawn in: up is the plane's own up as nearly as it can be */
  function spriteBasis(v) {
    let ref = [0, 1, 0];
    if (Math.abs(v[1]) > 0.96) ref = [0, 0, 1];
    const U = norm([ref[0] - v[0] * dot(ref, v), ref[1] - v[1] * dot(ref, v), ref[2] - v[2] * dot(ref, v)]);
    const R = cross(U, v);
    return { U, R };
  }
  G.planeSprite = (ai, ei, span) => {
    const S = SIZES.reduce((a, b) => Math.abs(b - span) < Math.abs(a - span) ? b : a);
    return K.get(`fighter:${ai}:${ei}:${S}`, () => {
      const az = (ai + 0.5) / AZ * Math.PI * 2 - Math.PI, el = ((ei + 0.5) / EL - 0.5) * Math.PI * 0.95;
      const v = [Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az)];
      const { U, R } = spriteBasis(v), f = [-v[0], -v[1], -v[2]];
      /* a wing seen edge on is thinner than a pixel, and one ray a pixel steps over it, leaving a dot: so the wings are
       * traced at least a ray thick, and a small one three rays to the pixel, any pixel a ray of it strikes kept,
       * coloured as the rays that struck */
      const sz = Math.ceil(S * 1.15) + 4, ss = S < 20 ? 3 : 1, Z = sz * ss, s = S / 11.2 * ss;
      const cam = { ray: (px, py) => { const a = (px - Z / 2) / s, b = (Z / 2 - py) / s; return [[R[0] * a + U[0] * b + v[0] * 30, R[1] * a + U[1] * b + v[1] * 30, R[2] * a + U[2] * b + v[2] * 30], f]; } };
      const L = norm([U[0] * 0.8 + R[0] * 0.35 + v[0] * 0.45, U[1] * 0.8 + R[1] * 0.35 + v[1] * 0.45, U[2] * 0.8 + R[2] * 0.35 + v[2] * 0.45]);
      let c = Mo.trace(Mo.fighter(1.05 / s), Z, Z, cam, { dir: L, amb: [0.62, 0.66, 0.8], sun: [0.95, 0.95, 1.05] });
      if (ss > 1) {
        const big = c.getContext("2d").getImageData(0, 0, Z, Z).data, out = K.mk(sz, sz), g2 = out.getContext("2d"), img = g2.createImageData(sz, sz), d = img.data;
        for (let y = 0; y < sz; y++) for (let x = 0; x < sz; x++) {
          let n = 0, r = 0, gg = 0, b = 0;
          for (let j = 0; j < ss; j++) for (let i = 0; i < ss; i++) { const o = ((y * ss + j) * Z + x * ss + i) * 4; if (big[o + 3] > 0) { n++; r += big[o]; gg += big[o + 1]; b += big[o + 2]; } }
          if (n) { const o = (y * sz + x) * 4; d[o] = r / n; d[o + 1] = gg / n; d[o + 2] = b / n; d[o + 3] = 255; }
        }
        g2.putImageData(img, 0, 0); c = out;
      }
      /* the moon catches its upper edges: a pale rim, so it shows against the night */
      { const g2 = c.getContext("2d"), img = g2.getImageData(0, 0, sz, sz), d = img.data, a2 = (x, y) => x >= 0 && y >= 0 && x < sz && y < sz && d[(y * sz + x) * 4 + 3] > 0, rim = [];
        for (let y = 0; y < sz; y++) for (let x = 0; x < sz; x++) if (a2(x, y) && (!a2(x, y - 1) || (!a2(x + 1, y) && K.hash(x, y, 3) > 0.4))) rim.push([x, y]);
        g2.fillStyle = "#d4dcea"; for (const [x, y] of rim) g2.fillRect(x, y, 1, 1); }
      /* and a dark edge all round, so a small one, all wing edge and rim, reads as a shape and not as a star or two */
      K.outline(c, S >= 24 ? "#1a2030" : INK);
      c.basis = { U, R };
      return c;
    });
  };
  /* where a plane is, the way it is going, and how it is banked: its own frame in the world */
  function frame(p) {
    const q = Object.assign({}, p);
    const pos = [p.x, p.y, p.z];
    if (p.st === "down") return { pos, f: norm([p.drift || 0.1, -0.6, p.z1 - p.z0 > 0 ? 0.8 : -0.8]), bank: 2.4 };
    q.u = Math.min(1, p.u + 0.01);
    const u0 = PX.clamp(q.u, 0, 1), uz = q.z0 / (q.z0 - q.z1);
    const z2 = PX.lerp(q.z0, q.z1, u0), x2 = PX.lerp(q.x0, q.x1, u0), kk = u0 < uz ? (uz - u0) / uz : (u0 - uz) / (1 - uz), y2 = q.lo + (u0 < uz ? 290 : 340) * kk * kk;
    const f = norm([x2 - p.x, y2 - p.y, z2 - p.z]);
    return { pos, f, bank: PX.clamp((p.x1 - p.x0) / 700, -0.7, 0.7) * Math.sign(p.z1 - p.z0) };
  }
  function drawPlane(g, p, q, view, cam, now) {
    const fr = frame(p), up = [0, 1, 0];
    let r = norm(cross(up, fr.f)); if (!isFinite(r[0])) r = [1, 0, 0];
    let ub = cross(fr.f, r);
    const bank = fr.bank + (p.st === "down" ? now / 200 : 0), cb = Math.cos(bank), sb = Math.sin(bank);
    const r2 = [r[0] * cb + ub[0] * sb, r[1] * cb + ub[1] * sb, r[2] * cb + ub[2] * sb], u2 = [ub[0] * cb - r[0] * sb, ub[1] * cb - r[1] * sb, ub[2] * cb - r[2] * sb];
    /* the camera, in the plane's own frame */
    const cw = [0 - fr.pos[0], C.AIR.camY - fr.pos[1], 0 - fr.pos[2]], v = norm([dot(cw, r2), dot(cw, u2), dot(cw, fr.f)]);
    const ai = Math.min(AZ - 1, Math.floor((Math.atan2(v[0], v[2]) + Math.PI) / (Math.PI * 2) * AZ)), ei = PX.clamp(Math.floor((Math.asin(PX.clamp(v[1], -1, 1)) / (Math.PI * 0.95) + 0.5) * EL), 0, EL - 1);
    /* drawn true to size, a fighter is three or four pixels across until it is nearly on you, and a line of wing edge-on:
     * too little to aim at, though the gun's spread would take it. So it is drawn larger than life while it closes, easing
     * up to a floor of about thirteen pixels at the edge of its strafing run (all at 360 high), and true once it is nearer */
    const near = PX.clamp((1600 - q.dist) / 850, 0, 1), span = Math.max(cam.f * 11.2 / q.dist, cam.f * (0.014 + 0.032 * near)), spr = G.planeSprite(ai, ei, span);
    /* the sprite's right and up, out in the world, onto the screen */
    const B = spr.basis, toW = a => [a[0] * r2[0] + a[1] * u2[0] + a[2] * fr.f[0], a[0] * r2[1] + a[1] * u2[1] + a[2] * fr.f[1], a[0] * r2[2] + a[1] * u2[2] + a[2] * fr.f[2]];
    const sR = view === "rear" ? [-1, 0, 0] : [1, 0, 0], sU = [0, 1, 0];
    const Rw = toW(B.R), Uw = toW(B.U);
    let a = dot(Rw, sR), b = -dot(Rw, sU), c = -dot(Uw, sR), d = dot(Uw, sU);
    const ang = Math.atan2(b, a), mirror = a * d - b * c < 0;
    g.save(); g.imageSmoothingEnabled = false;
    g.translate(Math.round(q.x), Math.round(q.y)); g.rotate(ang); if (mirror) g.scale(1, -1);
    g.drawImage(spr, -Math.round(spr.width / 2), -Math.round(spr.height / 2));
    g.restore();
    return span;
  }

  /* ---- the view ---- */
  G.cam = (W, H, view) => World.cam({ x: 0, y: 0, w: W, h: H }, { look: view === "rear" ? -1 : 1, h: C.AIR.camY, x: 0, hor: 0.6, f: H * 0.95, lamp: view !== "rear" });
  G.toScreen = (cam, yaw, pitch) => ({ x: cam.cx + Math.tan(yaw) * cam.f, y: cam.hor - Math.tan(pitch) * cam.f });
  G.toSight = (x, y) => { const c = G.last; if (!c) return null; return { yaw: Math.atan((x - c.cx) / c.f), pitch: Math.atan((c.hor - y) / c.f) }; };
  function proj(cam, view, p) {
    const s = E.sight(p, view); if (!s) return null;
    const q = G.toScreen(cam, s.yaw, s.pitch);
    q.dist = s.dist; q.s = s; return q;
  }
  G.proj = proj;

  /* the engine under the front gun, traced from the cab roof: the boiler to the chimney */
  const engineAhead = (W, H, cam) => K.get(`gunEngine:${W}x${H}`, () => {
    const parts = Mo.engine().filter(p => { const z1 = p.k === "box" ? p.b[2] : p.k === "cyl" ? (p.ax === "z" ? p.l[1] : p.c[1] + p.r) : p.c[2] + p.r; return z1 > 1.75; });
    const x0 = Math.max(0, Math.round(cam.cx - W * 0.32)), x1 = Math.min(W, Math.round(cam.cx + W * 0.32)), y0 = Math.round(cam.hor - 20), eye = [0, C.AIR.camY, 0.9];
    const camR = { ray: (px, py) => [eye, [(px - cam.cx) / cam.f, -(py - cam.hor) / cam.f, 1]] };
    const img = Mo.trace(parts, x1 - x0, H - y0, camR, { dir: [0.4, 0.8, 0.45], amb: [0.42, 0.46, 0.6], sun: [0.7, 0.72, 0.86] }, { x: x0, y: y0 });
    const out = K.mk(W, H); out.getContext("2d").drawImage(img, x0, y0);
    const P = World.P, ch = P(Object.assign({}, cam, { x: 0, h: C.AIR.camY }), 0, 4.26, 9.15 - 0.9);
    out.chimney = { x: ch.x, y: ch.y };
    return out;
  });
  /* the gun wagon's parapet at the tail: sandbags across, the deck's edge */
  const tailBehind = (W, H) => K.get(`gunTail:${W}x${H}`, () => {
    const c = K.mk(W, H), g = c.getContext("2d"), top = Math.round(H * 0.86);
    for (let y = top + 10; y < H; y++) for (let x = 0; x < W; x++) { g.fillStyle = M.wood[(Math.floor(x / 22) + (y > H - 6 ? 1 : 0)) % 2 ? 3 : 4]; g.fillRect(x, y, 1, 1); }
    const bag = (cx, cy, rx, ry) => { for (let y = Math.floor(cy - ry); y <= cy + ry; y++) for (let x = Math.floor(cx - rx); x <= cx + rx; x++) { const dx = (x - cx) / rx, dy = (y - cy) / ry; if (dx * dx + dy * dy > 1) continue; const lv = -dx * 0.4 - dy * 0.7 + K.bayer(x, y) * 0.3 + (K.hash(x >> 1, y >> 1, 4) - 0.5) * 0.3; g.fillStyle = M.canvas[PX.clamp(Math.round(2.3 - lv * 1.6), 0, 4)]; g.fillRect(x, y, 1, 1); } };
    for (let row = 0; row < 2; row++) for (let i = -1; i < W / 34 + 1; i++) bag(i * 34 + (row ? 17 : 0), top + 14 - row * 10, 19, 7);
    K.outline(c, INK);
    return c;
  });
  /* the twin guns at the foot of the screen, laid on the sight: jackets, receivers, the shield, your paws on the grips */
  function mounting(g, cam, sx, sy, now, firing, l) {
    const W = cam.vp.w, H = cam.vp.h, px = cam.cx, py = H + 10;
    const dx = sx - px, dy = sy - py, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d, nx = -uy, ny = ux, len = Math.min(120, H * 0.36);
    const dim = Math.max(0.85, 0.85 + l * 0.15), st = M.steel.map(c => K.mix(c, "#000", 1 - dim)), ir = M.iron.map(c => K.mix(c, "#000", 1 - dim));
    /* the pedestal and ring */
    K.disc(g, px, H + 6, 54, 22, ir[3]); K.disc(g, px, H + 4, 48, 18, ir[2]); K.disc(g, px - 6, H + 1, 30, 10, ir[1]);
    for (const s of [-1, 1]) {
      const ox = nx * 10 * s, oy = ny * 10 * s, kick = firing ? Math.random() * 4 : 0;
      const b0 = [px + ox + ux * 18, py + oy + uy * 18], b1 = [px + ox + ux * (len - kick), py + oy + uy * (len - kick)], j1 = [px + ox + ux * (len * 0.72 - kick), py + oy + uy * (len * 0.72 - kick)];
      /* the barrel jacket, ribbed */
      K.line(g, b0[0], b0[1], j1[0], j1[1], INK, 9);
      K.line(g, b0[0], b0[1], j1[0], j1[1], st[3], 7);
      K.line(g, b0[0] - nx * 2, b0[1] - ny * 2, j1[0] - nx * 2, j1[1] - ny * 2, st[1], 2);
      for (let t = 0.1; t < 1; t += 0.07) { const x = PX.lerp(b0[0], j1[0], t), y = PX.lerp(b0[1], j1[1], t); K.line(g, x - nx * 3, y - ny * 3, x + nx * 3, y + ny * 3, st[4]); }
      /* the barrel beyond it, the flash hider */
      K.line(g, j1[0], j1[1], b1[0], b1[1], INK, 5); K.line(g, j1[0], j1[1], b1[0], b1[1], st[2], 3);
      K.line(g, b1[0] - ux * 6, b1[1] - uy * 6, b1[0], b1[1], st[1], 6);
      if (firing) FX.flash(b1[0] + ux * 4, b1[1] + uy * 4, 7, { life: 0.05 });
      /* the receiver */
      const r0 = [px + ox, py + oy];
      K.line(g, r0[0], r0[1], b0[0], b0[1], INK, 15); K.line(g, r0[0], r0[1], b0[0], b0[1], ir[1], 13); K.line(g, r0[0] - nx * 4, r0[1] - ny * 4, b0[0] - nx * 4, b0[1] - ny * 4, ir[0], 2);
    }
    /* the ring sight on its post between the guns */
    const rs = [px + ux * len * 0.55, py + uy * len * 0.55];
    K.line(g, px + ux * 30, py + uy * 30, rs[0], rs[1], st[3], 2); K.ring(g, rs[0], rs[1] - 4, 6, st[1], 1);
    /* the shield: an armoured plate, riveted */
    const sw = 70, sh = 34, sy0 = H - sh;
    K.poly(g, [[px - sw, H], [px - sw + 10, sy0], [px + sw - 10, sy0], [px + sw, H]], INK);
    K.poly(g, [[px - sw + 2, H], [px - sw + 11, sy0 + 2], [px + sw - 11, sy0 + 2], [px + sw - 2, H]], ir[2]);
    K.rect(g, px - sw + 11, sy0 + 2, (sw - 11) * 2, 2, ir[0]);
    for (let x = px - sw + 16; x < px + sw - 14; x += 12) K.rivet(g, x, sy0 + 7, ir[0], INK);
    K.rect(g, px - 18, sy0 - 2, 36, 6, INK); K.rect(g, px - 16, sy0 - 1, 32, 4, ir[3]);
    /* your paws on the spade grips */
    const paw = PX.People.paw();
    g.drawImage(paw, Math.round(px - 30 + ux * 4), Math.round(H - 18 + uy * 3));
    g.drawImage(K.get("pawF", () => K.flip(PX.People.paw())), Math.round(px + 14 + ux * 4), Math.round(H - 18 + uy * 3));
    G.muzzle = { x: px + ux * len, y: py + uy * len };
  }
  function sightMark(g, x, y, col) {
    x = Math.round(x); y = Math.round(y);
    K.ring(g, x, y, 10, "rgba(10,10,14,.7)", 1); K.ring(g, x, y, 9, col, 1); K.ring(g, x, y, 3, col, 1);
    g.fillStyle = col;
    for (const [dx, dy] of [[-16, 0], [12, 0], [0, -16], [0, 12]]) g.fillRect(x + dx, y + dy, dx ? 5 : 1, dy ? 5 : 1);
  }

  G.draw = (g, S, ui, now, dt) => {
    const W = g.canvas.width, H = g.canvas.height, view = S.view, cam = G.cam(W, H, view);
    G.last = cam;
    const l = K.light(S.t), wc = World.turned(S, cam, now);  /* the country swings through points; the guns and the fighters keep to cam */
    World.sky(g, S, wc, now);
    World.hills(g, S, wc);
    World.ground(g, S, wc, now);
    FX.draw(g, "back");
    const raid = S.raid, ps = raid ? raid.planes.filter(p => p.st !== "gone" && p.delay <= 0).map(p => ({ p, q: proj(cam, view, p) })).filter(o => o.q).sort((a, b) => b.q.dist - a.q.dist) : [];
    G.onTarget = null;
    if (view === "front") { const eng = engineAhead(W, H, cam); g.drawImage(eng, 0, 0); G.chimney = eng.chimney; }
    for (const { p, q } of ps) {
      const span = drawPlane(g, p, q, view, cam, now);
      if ((p.hp < 3 || p.st === "down") && Math.random() < 0.5) FX.smoke(q.x, q.y, { r: Math.max(1, span * 0.08), grow: span * 0.3 + 2, vx: 0, vy: -4, life: 1.2, col: p.st === "down" ? [60, 54, 50] : [110, 110, 116], a: 0.55, layer: "back" });
      if (p.st === "down" && Math.random() < 0.6) FX.spark(q.x, q.y, { col: "#ffad3c", life: 0.3, vx: 0, vy: 5 });
      const s = q.s, r = Math.max(0.016, C.AIR.planeR / s.dist * 1.15) + C.AIR.spread;
      const on = p.st === "run" && Math.hypot(s.yaw - S.gun.yaw, s.pitch - S.gun.pitch) < r;
      if (on) G.onTarget = p.id;
      if (ui.aids.gunnery && p.st === "run" && q.dist < 1100) {
        const b = Math.max(7, span * 0.62), col = on ? "#ffc35a" : "rgba(233,228,216,.55)";
        g.fillStyle = col;
        for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { g.fillRect(Math.round(q.x + sx * b - (sx > 0 ? 4 : 0)), Math.round(q.y + sy * b), 5, 1); g.fillRect(Math.round(q.x + sx * b), Math.round(q.y + sy * b - (sy > 0 ? 4 : 0)), 1, 5); }
      }
    }
    if (view === "rear") g.drawImage(tailBehind(W, H), 0, 0);
    const sp = G.toScreen(cam, S.gun.yaw, S.gun.pitch);
    const firing = S.gun.shotT > C.AIR.rof * 0.6;
    mounting(g, cam, sp.x, sp.y, now, firing, l);
    FX.draw(g, "front");
    sightMark(g, sp.x, sp.y, G.onTarget ? "#ffc35a" : "#e9e4d8");
    if (raid && ui.aids.gunnery) {
      const other = raid.planes.filter(p => p.st === "run" && p.delay <= 0 && !E.sight(p, view)).length;
      if (other) { const col = Math.floor(now / 300) % 2 ? "#ffc35a" : "#e9e4d8"; K.text5(g, view === "front" ? "2 BEHIND" : "1 AHEAD", W - 70, H - 60, col, INK); }
    }
  };
  G.fire = S => { const m = G.muzzle, c = G.last; if (!m || !c) return; const sp = G.toScreen(c, S.gun.yaw, S.gun.pitch); FX.tracer(m.x, m.y, sp.x + (Math.random() - 0.5) * 6, sp.y + (Math.random() - 0.5) * 6, { life: 0.14 }); };
  /* for Help: a fighter head on */
  G.plane = (kind, span) => G.planeSprite(kind === "head" ? Math.floor(AZ / 2) : 0, Math.floor(EL / 2) + 1, span);
})();
