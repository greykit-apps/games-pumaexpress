/* The Puma Express -- the end of the night, and the pictures the night was for.
 *
 * PX.Paintings: the forty-eight paintings on the train, each a small picture
 * of its own (fields, the sea, a still life, a portrait, a town at night, a
 * river) with its title, made from its number so the same painting is the
 * same every night. The first ones aboard are the last ones lost.
 *
 * PX.Ending: the scene that takes the screen when the night is over, side on
 * as the title is, the train standing. Won, she stands at Port Clair: the
 * platform lamps, the sea and its lighthouse behind, a van open and the
 * pumas lifting the pictures down under the bunting. Lost, she stands
 * wherever it ended: in daylight with the fighters over her; in a cloud of
 * her own steam; off the rails at a cut or the points; against the buffers;
 * at the wolves' barrier on the frontier. */
"use strict";
(() => {
  const K = PX.K, M = K.M, L = PX.Line, FX = PX.FX;
  const Pt = PX.Paintings = {}, End = PX.Ending = {};

  /* ---- the paintings ---- */
  /* every six in a row are six kinds of picture, the order turning a step each six */
  const GENRES = ["fields", "portrait", "sea", "still", "night", "river"];
  const genre = i => GENRES[(i + Math.floor(i / 6)) % GENRES.length];
  const pick = (a, i, k) => a[Math.floor(K.hash(i, k, 92) * a.length)];
  const inland = () => L.nodes.filter(n => n.kind === "st" && n.x > 200).map(n => n.name);
  const coast = () => L.nodes.filter(n => n.kind === "st" && n.x <= 300).map(n => n.name);
  Pt.title = i => {
    const g = genre(i);
    if (g === "fields") return pick(["Harvest near %", "The Poplars at %", "Fields above %", "Morning, %", "Haymaking at %"], i, 2).replace("%", pick(inland(), i, 3));
    if (g === "sea") return pick(["The Sea at %", "Boats off %", "A Calm, %", "The Breakwater, %"], i, 2).replace("%", pick(coast(), i, 3));
    if (g === "still") return pick(["Pears and a Copper Jug", "Lemons on a Blue Cloth", "Apples and a Brass Lamp", "Quinces on a Shelf", "Three Plums and a Knife", "Onions, with a Green Bottle"], i, 2);
    if (g === "portrait") return pick(["Portrait of a Young Puma", "The Stationmaster in His Sunday Cap", "An Old Puma, Asleep", "The Fisherman's Daughter", "The Mayor of %, Seated", "A Puma Reading"], i, 2).replace("%", pick(inland(), i, 3));
    if (g === "night") return pick(["Lamps at %", "Night over %", "The Square at %, by Moonlight"], i, 2).replace("%", pick(inland(), i, 3));
    return pick(["Willows on %", "Washing Day on %", "The Ferry across %"], i, 2).replace("%", pick(L.RIVERS.map(r => r.name), i, 3));
  };
  /* a picture w by h inside a gilt frame f pixels deep */
  Pt.picture = (i, w, h) => K.get(`painting:${i}:${w}x${h}`, () => {
    const f = w >= 24 ? 2 : 1, c = K.mk(w, h), g = c.getContext("2d"), iw = w - f * 2, ih = h - f * 2, gn = genre(i);
    const P = K.mk(iw, ih), p = P.getContext("2d"), q = k => K.hash(i, k, 93);
    const band = (y0, y1, a, b) => { for (let y = Math.floor(y0); y < y1; y++) for (let x = 0; x < iw; x++) K.px(p, x, y, K.mix(a, b, PX.clamp((y - y0) / Math.max(1, y1 - y0) + K.bayer(x, y) * 0.3, 0, 1))); };
    const hill = (base, amp, seed, ramp) => { for (let x = 0; x < iw; x++) { const t = Math.round(base - K.fbm(x / (iw * 0.35) + seed, seed) * amp); for (let y = t; y < ih; y++) K.px(p, x, y, ramp[PX.clamp(1 + Math.round((y - t) / (ih * 0.25) + K.bayer(x, y) * 0.8), 0, 4)]); } };
    if (gn === "fields" || gn === "river") {
      const dusk = q(4) > 0.6;
      band(0, ih * 0.5, dusk ? "#7a4a63" : "#94b8d8", dusk ? "#f0b070" : "#f0d9b0");
      if (q(5) > 0.4) K.disc(p, Math.round(iw * (0.2 + q(6) * 0.6)), Math.round(ih * 0.2), Math.max(1, iw / 14), Math.max(1, iw / 14), "#fff0c0");
      hill(ih * 0.52, ih * 0.12, q(7) * 9, M.olive); hill(ih * 0.66, ih * 0.1, q(8) * 9 + 3, gn === "river" ? M.field : M.tawny);
      if (gn === "river") { for (let y = Math.round(ih * 0.74); y < ih * 0.9; y++) for (let x = 0; x < iw; x++) K.px(p, x, y, M.water[(x + y * 3) % 7 === 0 ? 0 : 2]); }
      for (let k = 0; k < 3; k++) { const x = Math.round(iw * (0.15 + q(10 + k) * 0.7)), th = Math.round(ih * 0.3); K.rect(p, x, Math.round(ih * 0.6) - th, Math.max(1, iw / 20), th, M.olive[4]); }
    } else if (gn === "sea") {
      band(0, ih * 0.55, "#c4d6e2", "#f0d9b0");
      for (let y = Math.round(ih * 0.55); y < ih; y++) for (let x = 0; x < iw; x++) K.px(p, x, y, M.water[PX.clamp(1 + Math.round((y - ih * 0.55) / (ih * 0.2) + K.bayer(x, y)), 0, 4)]);
      for (let x = 0; x < iw; x += 3) K.px(p, x + (x % 2), Math.round(ih * 0.6 + q(x) * ih * 0.3), M.water[0]);
      const bx = Math.round(iw * (0.3 + q(5) * 0.4)), by = Math.round(ih * 0.62);
      K.poly(p, [[bx, by], [bx, by - ih * 0.36], [bx + iw * 0.18, by]], M.canvas[0]); K.rect(p, bx - iw * 0.08, by, iw * 0.3, Math.max(1, ih / 12), M.wood[3]);
    } else if (gn === "still") {
      band(0, ih * 0.62, "#3a2a1c", "#1a120c");
      for (let y = Math.round(ih * 0.62); y < ih; y++) for (let x = 0; x < iw; x++) K.px(p, x, y, (q(4) > 0.5 ? ["#5a74a0", "#3d5378", "#2c3d5c"] : [M.cream[1], M.cream[2], M.cream[3]])[PX.clamp(Math.round((y - ih * 0.62) / (ih * 0.15) + K.bayer(x, y)), 0, 2)]);
      const vx = Math.round(iw * 0.32), vr = Math.max(2, Math.round(iw * 0.13));
      for (let y = -vr; y <= vr; y++) for (let x = -vr; x <= vr; x++) if (x * x + y * y <= vr * vr) K.px(p, vx + x, Math.round(ih * 0.5) + y, M.copper[PX.clamp(Math.round(2 + (x + y) / vr * 1.4 + K.bayer(x, y)), 0, 4)]);
      K.rect(p, vx - vr * 0.4, ih * 0.5 - vr * 1.8, vr * 0.8, vr, M.copper[2]);
      const fruit = q(6) > 0.5 ? M.brass : q(7) > 0.5 ? M.wolfRed : M.olive, fr = Math.max(1, Math.round(iw * 0.07));
      for (let k = 0; k < 3; k++) { const fx = Math.round(iw * (0.55 + k * 0.13)), fy = Math.round(ih * 0.62 - fr); for (let y = -fr; y <= fr; y++) for (let x = -fr; x <= fr; x++) if (x * x + y * y <= fr * fr) K.px(p, fx + x, fy + y, fruit[PX.clamp(Math.round(2 + (x + y) / fr + K.bayer(x, y)), 0, 4)]); }
    } else if (gn === "portrait") {
      band(0, ih, q(4) > 0.5 ? "#3a4a36" : "#3a2a24", "#14100c");
      const cx = Math.round(iw / 2), cy = Math.round(ih * 0.42), rx = Math.max(2, Math.round(iw * 0.22)), ry2 = Math.max(2, Math.round(ih * 0.24)), T = q(5) > 0.5 ? M.puma : M.tawny;
      K.poly(p, [[cx - rx * 1.6, ih], [cx - rx * 0.9, cy + ry2 * 0.9], [cx + rx * 0.9, cy + ry2 * 0.9], [cx + rx * 1.6, ih]], q(6) > 0.5 ? "#2c3d5c" : M.wolfRed[3]);
      for (const s of [-1, 1]) K.poly(p, [[cx + s * rx * 0.4, cy - ry2 * 0.7], [cx + s * rx * 1.05, cy - ry2 * 1.35], [cx + s * rx * 1.0, cy - ry2 * 0.3]], T[2]);
      for (let y = -ry2; y <= ry2; y++) for (let x = -rx; x <= rx; x++) if ((x * x) / (rx * rx) + (y * y) / (ry2 * ry2) <= 1) K.px(p, cx + x, cy + y, T[PX.clamp(Math.round(2 + x / rx * 1.3 + y / ry2 * 0.6 + K.bayer(x, y) * 0.8), 0, 4)]);
      /* the muzzle, pale, its nose; the eyes */
      for (let y = 0; y <= Math.max(1, ry2 * 0.4); y++) for (let x = -Math.round(rx * 0.35); x <= Math.round(rx * 0.35); x++) if ((x * x) / Math.max(1, rx * rx * 0.12) + (y * y) / Math.max(1, ry2 * ry2 * 0.16) <= 1) K.px(p, cx + x, cy + Math.round(ry2 * 0.3) + y, M.cream[1]);
      K.rect(p, cx - Math.max(1, Math.round(rx * 0.12)), cy + Math.round(ry2 * 0.25), Math.max(2, Math.round(rx * 0.25)), Math.max(1, Math.round(ry2 * 0.12)), "#c98a7c");
      for (const s of [-1, 1]) { const ex2 = cx + s * Math.max(1, Math.round(rx * 0.45)), ey2 = cy - Math.round(ry2 * 0.15); K.rect(p, ex2 - (s < 0 ? 1 : 0), ey2, Math.max(1, Math.round(rx * 0.2)), Math.max(1, Math.round(ry2 * 0.12)), "#1a120c"); K.px(p, ex2, ey2, "#d8c060"); }
    } else {
      band(0, ih * 0.7, "#0b1430", "#1e2d55");
      K.disc(p, Math.round(iw * 0.75), Math.round(ih * 0.2), Math.max(1, iw / 12), Math.max(1, iw / 12), "#ece4c8");
      for (let x = 0; x < iw; x++) { const t = Math.round(ih * (0.45 + K.hash(Math.floor(x / Math.max(2, iw / 8)), 1, i) * 0.2)); for (let y = t; y < ih; y++) K.px(p, x, y, "#0e1018"); }
      for (let k = 0; k < Math.max(3, iw / 4); k++) K.px(p, Math.floor(q(20 + k) * iw), Math.round(ih * (0.62 + q(40 + k) * 0.3)), q(60 + k) > 0.4 ? "#ffcf6a" : "#e89a4a");
    }
    /* the gilt frame: lit on its upper left, a dark sight edge */
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { if (x >= f && y >= f && x < w - f && y < h - f) continue; const lv = (x < f || y < f ? 0.6 : -0.5) + K.bayer(x, y) * 0.4; K.px(g, x, y, M.brass[PX.clamp(Math.round(2 - lv * 1.5), 0, 4)]); }
    g.drawImage(P, f, f);
    return c;
  });

  /* ---- the end of the night ---- */
  End.why = S => S.phase === "won" ? "won" : S.end ? S.end.why : null;
  End.has = S => { const w = End.why(S); return !!w && w !== "abandon" && w !== "practice"; };
  const DAY_LIGHT = { key: "day", dir: [-0.5, 0.75, 0.45], amb: [0.62, 0.62, 0.66], sun: [1.0, 0.93, 0.82], lamps: [] };
  const S_ = 16;
  const KINDS = ["engine", "tender", "van0", "van1", "van2", "van3", "flat"];
  const LEN = { engine: 11.15, tender: 6.5, van0: 7.4, van1: 7.4, van2: 7.4, van3: 7.4, flat: 5.8 };

  /* the country side on, standing still: a far range, the fields falling away, a few trees, the embankment */
  function country(g, W, H, hor, ry, l, seed) {
    const d = c => K.dim(c, l);
    for (let x = 0; x < W; x++) { const h = Math.round(18 + K.fbm(x / 110, seed) * 34); K.rect(g, x, hor - h, 1, h, d("#4a5a7e")); K.px(g, x, hor - h, d("#7a8aa8")); }
    for (let y = hor; y < ry; y++) { const t = (y - hor) / (ry - hor); for (let x = 0; x < W; x++) K.px(g, x, y, d(M.field[PX.clamp(Math.round(1 + t * 2.4 + K.bayer(x, y) * 0.8), 0, 4)])); }
    for (let i = 0; i < W / 40; i++) {
      if (K.hash(i, seed, 7) < 0.5) continue;
      const type = K.hash(i, 4, 7) < 0.4 ? "poplar" : "oak", h = (type === "poplar" ? 44 : 30) * (0.7 + K.hash(i, 5, 7) * 0.5);
      const t = PX.World.tree(type, h, i % 3, l, 1);
      g.drawImage(t, Math.round(i * 40 + K.hash(i, 6, 7) * 20) - (t.width >> 1), Math.round(hor + 12 - t.height));
    }
    for (let y = ry - 10; y < H; y++) { const k = (y - ry) / (H - ry); K.rect(g, 0, y, W, 1, y < ry ? d(M.field[3]) : d(K.mix(M.stone[2], M.stone[4], PX.clamp(k * 1.4, 0, 1)))); }
  }
  /* the rail, and the sleepers' ends; a gap where the line is cut */
  function rail(g, W, ry, l, gap) {
    for (let x = 0; x < W; x += 11) if (!gap || x < gap[0] || x > gap[1]) K.rect(g, x, ry + 1, 6, 3, K.dim(M.wood[3], l));
    for (const [a, b] of gap ? [[0, gap[0]], [gap[1], W]] : [[0, W]]) { K.rect(g, a, ry - 1, b - a, 2, K.dim(M.steel[2], l)); K.rect(g, a, ry - 1, b - a, 1, K.dim(M.steel[0], l, 0.2)); }
  }
  /* the train standing, the engine leading at ex; tilt (radians) and drop for the engine and the tender off the rails */
  function train(g, ex, ry, light, tilt = 0, drop = 0, open = -1) {
    let x = ex;
    const at = {};
    for (const kind of KINDS) {
      if (kind !== "engine") x -= Math.round((LEN[kind] + 0.25) * S_);
      at[kind] = x;
    }
    for (const kind of KINDS.slice().reverse()) {
      const px = at[kind];
      if (px > g.canvas.width + 10 || px + LEN[kind] * S_ < -10) continue;
      const tt = kind === "engine" ? tilt : kind === "tender" ? tilt * 0.4 : 0, dd = kind === "engine" ? drop : kind === "tender" ? drop * 0.4 : 0;
      if (tt || dd) { g.save(); g.translate(px, ry + dd); g.rotate(tt); PX.Model.drawSide(g, kind, S_, 0, 0, 0.6, light); g.restore(); }
      else PX.Model.drawSide(g, kind, S_, px, ry, 0.6, light);
      if (kind === "van" + open) openVan(g, px, ry, light === DAY_LIGHT ? 1 : 0);
    }
    return at;
  }
  /* a van's door slid back: the dark inside, a crate at the opening, the lamp's light on it */
  function openVan(g, x, ry, day) {
    const dx = x + Math.round(2.9 * S_), dy = ry - Math.round(3.5 * S_), dw = Math.round(1.6 * S_), dh = Math.round(2.4 * S_);
    K.rect(g, dx - 1, dy - 1, dw + 2, dh + 2, "#07080b"); K.rect(g, dx, dy, dw, dh, day ? "#2a221a" : "#140e0a");
    const cw = Math.round(1.1 * S_), ch = Math.round(0.8 * S_), cx = dx + 2, cy = dy + dh - ch;
    for (let y = 0; y < ch; y++) for (let k = 0; k < cw; k++) K.px(g, cx + k, cy + y, M.wood[k % 6 === 0 || y === 0 ? 3 : 1 + Math.round(K.bayer(k, y) + 0.5)]);
    K.rect(g, dx + dw, dy - 2, Math.round(1.6 * S_), dh + 4, "#07080b"); K.rect(g, dx + dw + 1, dy - 1, Math.round(1.6 * S_) - 2, dh + 2, day ? M.paint[2] : M.paint[3]);
  }
  /* a puma: Duc's figure, turned as asked, a painting held up where the paws are */
  function puma(g, x, y, frame, left, held) {
    const sp = PX.People.duc(frame, "lever"), s2 = left ? K.flip(sp) : sp;
    g.drawImage(s2, Math.round(x - sp.width / 2), Math.round(y - sp.height));
    if (held >= 0) { const pic = Pt.picture(held, 20, 15); g.drawImage(pic, Math.round(x + (left ? -18 : 0)), Math.round(y - sp.height - 8)); }
  }

  let acc = 0;
  End.draw = (g, S, now, dt) => {
    const W = g.canvas.width, H = g.canvas.height, why = End.why(S), won = why === "won";
    const l = why === "dawn" ? Math.max(0.85, K.light(S.t)) : K.light(S.t), day = l > 0.5, light = day ? DAY_LIGHT : PX.Model.LIGHT_NIGHT;
    const hor = Math.round(H * 0.5), ry = Math.round(H * 0.82);
    g.drawImage(PX.World.skyImage(W, hor + 1, l, 1), 0, 0);
    if (won) port(g, S, W, H, hor, ry, l, now);
    else country(g, W, H, hor, ry, l, 3);
    /* where she stands: won, the open van a quarter across; lost, her front at the middle, clear of the sheet beside it */
    const ex = won ? Math.round(W * 0.25) + Math.round(7.65 * S_) + Math.round(6.75 * S_) - Math.round(3.7 * S_) : Math.round(W * 0.48) - Math.round(11.15 * S_);
    const front = ex + Math.round(11.15 * S_);
    const off = why === "derail" || why === "cut";
    if (!won) rail(g, W, ry, l, why === "cut" ? [front - 8, front + 40] : null);
    if (why === "buffer") stop(g, front, ry, l);
    if (why === "frontier") barrier(g, front + 26, ry, l);
    FX.draw(g, "back");
    train(g, ex, ry, light, off ? (why === "cut" ? 0.13 : 0.06) : why === "buffer" ? -0.03 : 0, off ? Math.round(0.5 * S_) : 0, won ? 0 : -1);
    if (won) platform(g, S, W, H, ex, ry, l, now);
    if (why === "frontier") for (let k = 0; k < 3; k++) { const w = PX.People.wolfFig(k === 1 ? "aim" : "stand", k); g.drawImage(K.flip(w), front + 8 + k * 16, ry + 4 - w.height + (k % 2) * 3); }
    /* steam and smoke as she stands */
    const dome = { x: ex + Math.round(6 * S_), y: ry - Math.round(3.9 * S_) }, chim = { x: ex + Math.round(9.35 * S_), y: ry - Math.round(4.3 * S_) };
    /* by the second, not the frame: so many puffs a second whatever the frame rate */
    const puffs = rate => { acc += dt * rate; const n = Math.floor(acc); acc -= n; return n; };
    if (why === "burst") for (let k = puffs(16); k > 0; k--) FX.smoke(dome.x + (Math.random() - 0.5) * 3 * S_, dome.y + Math.random() * S_, { r: 5, grow: 22, vx: (Math.random() - 0.5) * 30, vy: -14 - Math.random() * 20, life: 2.2, col: [236, 240, 246], a: 0.5, layer: "front" });
    else if (why === "boiler" || why === "motion" || why === "buffer" || off) for (let k = puffs(5); k > 0; k--) FX.smoke(dome.x, dome.y, { r: 2, grow: 10, vx: -4, vy: -10, life: 1.8, col: [220, 226, 236], a: 0.35, layer: "front" });
    else for (let k = puffs(3); k > 0; k--) FX.smoke(chim.x, chim.y, { r: 2, grow: 9, vx: -3, vy: -9, life: 2.6, col: day ? [150, 150, 158] : [92, 96, 110], a: 0.3, layer: "back" });
    if (off && Math.random() < dt * 3) FX.dust(front - Math.random() * 30, ry + 4, 2);
    if (why === "dawn") fighters(g, W, hor, ex, ry, now, dt);
    FX.draw(g, "front");
  };

  /* Port Clair: the sea to the west, the lighthouse on its mole, the town's roofs climbing behind the yard */
  function port(g, S, W, H, hor, ry, l, now) {
    const d = (c, glow) => K.dim(c, l, glow), sea = hor + Math.round(H * 0.07);
    for (let y = hor; y < sea; y++) for (let x = 0; x < W; x++) K.px(g, x, y, d(M.water[PX.clamp(Math.round(2 + (y - hor) / (sea - hor) * 1.6 + K.bayer(x, y) * 0.7), 0, 4)], 0.1));
    for (let k = 0; k < W / 6; k++) { const x = Math.floor(K.hash(k, 1, 51) * W * 0.5), y = hor + 1 + Math.floor(K.hash(k, 2, 51) * (sea - hor - 2)); if (Math.sin(now / 400 + k) > 0.3) K.rect(g, x, y, 2 + (k % 3), 1, d(M.water[0], 0.25)); }
    /* the mole and its lighthouse, the beam turning while it is dark */
    const lx = Math.round(W * 0.1), ly = hor + 2;
    K.rect(g, 0, ly, Math.round(W * 0.16), 3, d(M.stone[3]));
    for (let y = 0; y < 26; y++) K.rect(g, lx - 3 + (y < 4 ? 1 : 0), ly - y, y < 4 ? 5 : 6, 1, d(Math.floor(y / 5) % 2 ? M.wolfRed[2] : M.cream[1]));
    K.rect(g, lx - 2, ly - 31, 5, 5, "#ffe9b0"); K.rect(g, lx - 3, ly - 32, 7, 1, d(M.iron[2]));
    if (l < 0.6) { const a = now / 1600, dir = Math.cos(a) > 0 ? 1 : -1, sp = Math.abs(Math.sin(a)) * 0.6 + 0.08, len = W * 0.7; K.poly(g, [[lx, ly - 29], [lx + dir * len, ly - 29 - len * sp * 0.25], [lx + dir * len, ly - 29 + len * sp * 0.12]], `rgba(255,236,180,${(0.09 * (1 - l)).toFixed(3)})`); }
    /* the town: roofs and a church tower on the rise behind the yard, its windows lit */
    for (let i = 0; i < W / 22 + 1; i++) {
      const x = Math.round(W * 0.3 + i * 22), bh = Math.round(14 + K.hash(i, 1, 52) * 22), tower = K.hash(i, 2, 52) > 0.9;
      if (x > W) break;
      const top = sea - bh - (tower ? 18 : 0);
      K.rect(g, x, top, 20, sea - top + 40, d(M.stone[3])); K.poly(g, [[x - 2, top], [x + 10, top - 7 - (tower ? 8 : 0)], [x + 22, top]], d(M.slate[3]));
      for (let k = 0; k < 4; k++) if (K.hash(i, k, 53) > 0.45) K.rect(g, x + 3 + (k % 2) * 9, top + 4 + (k >> 1) * 8, 3, 4, l < 0.7 ? (K.hash(i, k, 54) > 0.3 ? "#ffcf6a" : "#e89a4a") : d("#2a3040"));
    }
    /* the yard between: dark ground to the platform */
    for (let y = sea; y < ry; y++) K.rect(g, 0, y, W, 1, d(K.mix(M.stone[3], M.coal[2], (y - sea) / (ry - sea))));
    K.rect(g, 0, ry - 1, W, 2, d(M.steel[2]));
    /* the board on the far platform, standing over her roofs: PORT CLAIR in the 5 by 7 face, twice its size */
    { const name = "PORT CLAIR", tw = K.text5w(name) * 2, bx = Math.round(W * 0.25) - (tw >> 1) - 6, by = ry - Math.round(4.6 * S_) - 26;
      K.rect(g, bx + 8, by + 18, 2, ry - by - 18, d(M.iron[2])); K.rect(g, bx + tw + 2, by + 18, 2, ry - by - 18, d(M.iron[2]));
      K.rect(g, bx, by, tw + 12, 20, "#07080b"); K.rect(g, bx + 1, by + 1, tw + 10, 18, d("#2a3a5a", 0.3));
      const t = K.mk(tw / 2, 7); K.text5(t.getContext("2d"), name, 0, 0, d("#f4f0e4", 0.45)); g.drawImage(t, 0, 0, t.width, 7, bx + 6, by + 3, tw, 14); }
  }
  /* the platform in front: its coping, the paving, the lamps, the bunting, the board, the pictures coming down */
  function platform(g, S, W, H, ex, ry, l, now) {
    const d = (c, glow) => K.dim(c, l, glow), top = ry - Math.round(0.45 * S_);
    for (let y = top; y < H; y++) for (let x = 0; x < W; x++) K.px(g, x, y, d(y < top + 2 ? M.stone[1] : M.stone[(x + (y >> 2) * 5) % 23 === 0 ? 4 : 3], 0.15));
    K.rect(g, 0, top + 2, W, 1, d(M.stone[4]));
    /* the lamps, and the glow on the stones under them */
    const lamps = [0.04, 0.46, 0.8].map(f => Math.round(W * f));
    for (const x of lamps) {
      const lt = top - Math.round(4.6 * S_);
      g.fillStyle = `rgba(255,214,140,${(0.16 * (1 - l)).toFixed(3)})`; K.disc(g, x, top + 6, 26, 6); K.disc(g, x, lt + 3, 9, 9);
      K.rect(g, x - 1, lt, 3, top - lt + 2, d(M.iron[2])); K.rect(g, x - 3, lt - 6, 7, 7, M.iron[3]); K.rect(g, x - 2, lt - 5, 5, 5, l < 0.7 ? "#ffe9b0" : d("#c8c0a8"));
    }
    /* bunting between the first two lamps: the pumas' tawny and cream */
    { const a = lamps[1], b = lamps[2], y0 = top - Math.round(4.6 * S_) + 4;
      for (let x = a; x < b; x += 7) { const t = (x - a) / (b - a), y = Math.round(y0 + Math.sin(t * Math.PI) * 10); K.px(g, x, y, d(M.iron[1])); K.poly(g, [[x, y + 1], [x + 5, y + 1], [x + 2.5, y + 6]], d(((x - a) / 7) % 2 ? M.cream[1] : M.tawny[1], 0.2)); } }
    /* the pictures coming down: a trolley at the van's door, frames leaned on it, pumas lifting them */
    const van = ex - Math.round(7.65 * S_) - Math.round(6.75 * S_) + Math.round(3.7 * S_), door = van, n = PX.Engine.paintings(S);
    const tx = door + 14, ty = top + 22;
    K.rect(g, tx - 2, ty - 3, 44, 3, d(M.wood[2], 0.3)); for (const wx of [tx + 2, tx + 36]) K.disc(g, wx, ty + 1, 2, 2, d(M.iron[1], 0.3));
    for (let k = 0; k < Math.min(4, n - 2); k++) { const pic = Pt.picture(k + 2, 18, 14); g.drawImage(pic, tx + k * 8, ty - 17 + (k % 2)); }
    const bob = Math.round(Math.sin(now / 300));
    if (n > 0) puma(g, door - 6, top + 16, 0, false, 0);
    if (n > 1) puma(g, tx + 58, top + 20 + bob, 1, true, 1);
    puma(g, door - 34, top + 22, 2, false, -1);
  }
  /* a buffer stop: a timber beam on its posts, red and white, the buffers to meet hers */
  function stop(g, x, ry, l) {
    const d = c => K.dim(c, l, 0.2);
    K.rect(g, x + 2, ry - 34, 6, 34, d(M.wood[3])); K.rect(g, x + 2, ry - 30, 16, 12, d(M.wolfRed[2]));
    for (let k = 0; k < 16; k += 6) K.rect(g, x + 2 + k, ry - 30, 3, 12, d(M.cream[1]));
    K.rect(g, x - 2, ry - 26, 5, 4, d(M.steel[1]));
  }
  /* the wolves' barrier: a striped pole across the line, a hut with their banner */
  function barrier(g, x, ry, l) {
    const d = c => K.dim(c, l, 0.2);
    K.rect(g, x + 30, ry - 46, 34, 46, d(M.wood[3])); K.poly(g, [[x + 27, ry - 46], [x + 47, ry - 58], [x + 67, ry - 46]], d(M.slate[3]));
    K.rect(g, x + 40, ry - 42, 12, 20, d(M.wolfRed[2])); K.rect(g, x + 44, ry - 38, 4, 4, d(M.cream[0]));
    K.rect(g, x - 4, ry - 22, 3, 22, d(M.iron[2]));
    for (let k = 0; k < 46; k++) K.rect(g, x - 2 + k, ry - 20, 1, 3, d(Math.floor(k / 6) % 2 ? M.wolfRed[1] : M.cream[1]));
  }
  /* daylight, and the fighters over her: they come down the line, strafe, climb away and come round again */
  function fighters(g, W, hor, ex, ry, now, dt) {
    for (let k = 0; k < 3; k++) {
      const per = 3600, t = ((now + k * per / 3) % per) / per, x = Math.round(-60 + t * (W + 120)), y = Math.round(hor - 70 + k * 16 + Math.pow(t - 0.5, 2) * 160);
      const sp = PX.Guns.planeSprite(17, 5, 24);
      g.drawImage(sp, x - (sp.width >> 1), y - (sp.height >> 1));
      if (t > 0.3 && t < 0.6 && Math.random() < 0.3 * PX.clamp(dt * 60, 0, 1)) { K.line(g, x, y + 4, x + 18, ry - 10, "rgba(255,226,150,.7)"); FX.dust(x + 18 + Math.random() * 20, ry - 2, 1); }
    }
  }
})();
