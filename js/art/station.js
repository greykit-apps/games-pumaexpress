/* The Puma Express -- a station the wolves hold, side on, at night.
 *
 * The engine stopped short on the left (traced from the model, the same
 * engine as everywhere else). The station: dressed stone in courses with
 * quoins at its corners, tall sash windows in stone surrounds with their
 * shutters, a hipped slate roof with two chimney stacks, a clock in the
 * gable keeping the night's own time. Along the platform an iron-columned
 * canopy with a dagger-boarded valance and the station's name on it, gas
 * lanterns, posters, a bench, a luggage trolley; at the end the signal box
 * on its brick base, its stairs, and the points lever below it. The town's
 * roofs behind, two lines of track in front.
 *
 * Wolves come up at the windows, which light as they do (1987: "shoot the
 * lit windows"). Duc runs up the platform under your fire to the lever and
 * back. The scene is 480 by 300 of its own units, as the engine's window
 * list is, drawn about the middle of the screen at sc pixels a unit. */
"use strict";
(() => {
  const K = PX.K, M = K.M, C = PX.C, E = PX.Engine, L = PX.Line, P = PX.People, FX = PX.FX, St = PX.Station = {};
  const INK = "#0b0d12";

  St.geo = (W, H) => { const sc = Math.min(H / 300, W / 400); return { sc, ox: Math.round((W - 480 * sc) / 2), oy: Math.round((H - 300 * sc) / 2) }; };
  St.toScene = (x, y) => { const o = St.last || { ox: 0, oy: 0, sc: 1 }; return { x: (x - o.ox) / o.sc, y: (y - o.oy) / o.sc }; };

  /* ---- the station, painted once a night and a size ---- */
  const paint = (n, W, H, l) => K.get(`stn2:${n}:${W}x${H}:${Math.round(l * 8)}`, () => {
    const G = St.geo(W, H), sc = G.sc, X = u => G.ox + u * sc, Y = v => G.oy + v * sc, S = v => Math.max(1, Math.round(v * sc));
    const c = K.mk(W, H), g = c.getContext("2d");
    /* per pixel, in scene units */
    const fill = (u0, v0, u1, v1, f) => { const x0 = Math.max(0, Math.floor(X(u0))), x1 = Math.min(W, Math.ceil(X(u1))), y0 = Math.max(0, Math.floor(Y(v0))), y1 = Math.min(H, Math.ceil(Y(v1))); for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const col = f((x - G.ox) / sc, (y - G.oy) / sc, x, y); if (col) { g.fillStyle = col; g.fillRect(x, y, 1, 1); } } };
    const S0 = M.stone, SL = M.slate;
    /* the town behind: roofs, gables, chimneys, a spire, the odd window lit */
    const left = -G.ox / sc, right = (W - G.ox) / sc;
    let u = left - 10, bi = 0;
    while (u < right) {
      const bw = 26 + K.hash(bi, n, 3) * 30, bh = 60 + K.hash(bi, n, 4) * 70, gable = K.hash(bi, n, 5) > 0.5;
      const base = 214, top = base - bh, u0 = u, u1 = u + bw;
      fill(u0, top - (gable ? 14 : 0), u1, base, (uu, vv) => {
        const roofTop = gable ? top - 14 + Math.abs(uu - (u0 + u1) / 2) / (bw / 2) * 14 : top;
        if (vv < roofTop) return null;
        const roof = vv < top + 4 && !gable || (gable && vv < top);
        const win = (uu - u0) % 7 > 4.5 && (uu - u0) % 7 < 6.5 && (vv - top) % 11 > 6 && (vv - top) % 11 < 9.5; return roof ? "#1e2638" : (win && K.hash(Math.floor((uu - u0) / 7), Math.floor((vv - top) / 11), bi + n * 31) > 0.86 && l < 0.6 ? "#d89a4a" : "#161d2c");
      });
      if (K.hash(bi, n, 6) > 0.6) fill(u0 + 4, top - 22, u0 + 8, top + 2, () => "#141a28");
      u += bw + 1; bi++;
    }
    { const sx = 70; fill(sx - 6, 70, sx + 6, 214, () => "#151c2b"); fill(sx - 1, 30, sx + 1, 70, (uu, vv) => Math.abs(uu - sx) < 1 - (70 - vv) / 50 ? "#151c2b" : null); fill(sx - 6, 62, sx + 6, 70, (uu, vv) => Math.abs(uu - sx) < (vv - 52) * 0.6 ? "#151c2b" : null); }
    /* the roof: hipped, slated in courses, its ridge; two chimney stacks of brick, their pots */
    fill(122, 38, 412, 76, (uu, vv) => {
      const k = (vv - 38) / 38, x0 = 150 - k * 28, x1 = 384 + k * 28; if (uu < x0 || uu > x1) return null;
      const row = Math.floor((vv - 38) / 3), off = row % 2 ? 2.5 : 0, edge = (vv - 38) % 3 < 0.6, joint = ((uu + off) % 5) < 0.45;
      const hip = uu < x0 + 2 || uu > x1 - 2;
      return hip ? SL[1] : edge ? SL[3] : joint ? SL[3] : K.hash(Math.floor((uu + off) / 5), row, 9) > 0.8 ? SL[1] : SL[2];
    });
    fill(150, 37, 384, 40, (uu, vv) => vv < 38 ? SL[0] : SL[1]);
    for (const cx of [168, 366]) {
      fill(cx - 7, 18, cx + 7, 44, (uu, vv) => { const row = Math.floor(vv / 2.4), off = row % 2 ? 2 : 0; return ((uu + off) % 4 < 0.5 || vv % 2.4 < 0.45) ? "#4a2a20" : K.hash(Math.floor((uu + off) / 4), row, 2) > 0.6 ? "#8a4632" : "#73392a"; });
      fill(cx - 8, 16, cx + 8, 19, () => S0[1]);
      for (const px of [-4, 0, 4]) fill(cx + px - 1.4, 10, cx + px + 1.4, 16, (uu) => uu < cx + px ? "#b0603a" : "#8a4630");
    }
    /* the gable with its clock */
    fill(236, 14, 298, 44, (uu, vv) => { const half = (vv - 14) / 30 * 31; if (Math.abs(uu - 267) > half) return null; const edge = Math.abs(uu - 267) > half - 2; return edge ? S0[0] : S0[2]; });
    fill(256, 21, 278, 43, (uu, vv) => { const d = Math.hypot(uu - 267, vv - 32); if (d > 10.5) return null; if (d > 9.4) return M.brass[2]; if (d > 8.6) return INK; return K.mix("#f2ead4", "#d4c8a8", d / 9); });
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; K.px(g, X(267 + Math.cos(a) * 7.4), Y(32 + Math.sin(a) * 7.4), "#2a2420"); }
    /* the walls: dressed stone in courses, quoins at the corners, a cornice under the roof */
    fill(132, 74, 402, 214, (uu, vv) => {
      const quoin = uu < 142 || uu > 392, row = Math.floor((vv - 74) / 6), off = row % 2 ? 9 : 0;
      const ql = quoin && (row % 2 ? (uu < 137 || uu > 397) : true);
      const mortar = (vv - 74) % 6 < 0.55 || ((uu - 132 + off) % 18) < 0.55;
      if (mortar) return S0[4];
      const tone = K.hash(Math.floor((uu - 132 + off) / 18), row, n) * 1.6 + (K.hash(Math.floor(uu * 1.5), Math.floor(vv * 1.5), 7) - 0.5) * 0.6;
      return ql ? S0[tone > 1 ? 0 : 1] : S0[tone > 1.25 ? 1 : tone > 0.4 ? 2 : 3];
    });
    fill(128, 70, 406, 76, (uu, vv) => vv < 71 ? S0[0] : vv > 74.5 ? S0[4] : Math.floor(uu / 3) % 2 && vv > 73 ? S0[3] : S0[1]);
    /* the string course between the floors */
    fill(130, 133, 404, 137, (uu, vv) => vv < 134 ? S0[0] : vv > 136 ? S0[4] : S0[1]);
    /* the windows' stone surrounds, lintels with a keystone, sills; the shutters folded back either side */
    for (const w of E.WINDOWS) {
      if (w.box) continue;
      if (w.door) {
        fill(w.x - 4, w.y - 18, w.x + w.w + 4, w.y + w.h, (uu, vv) => { const d = Math.hypot(uu - (w.x + w.w / 2), vv - w.y); if (vv < w.y && d > w.w / 2 + 4) return null; if (vv < w.y && d < w.w / 2) return null; if (vv >= w.y && uu > w.x && uu < w.x + w.w) return null; return (d > w.w / 2 + 2.5 && vv < w.y) ? S0[3] : S0[1]; });
        /* the fanlight: radial glazing over the door */
        fill(w.x, w.y - w.w / 2, w.x + w.w, w.y, (uu, vv) => { const d = Math.hypot(uu - (w.x + w.w / 2), vv - w.y); if (d > w.w / 2) return null; const a = Math.atan2(vv - w.y, uu - (w.x + w.w / 2)); return (Math.abs(((a * 8 / Math.PI) % 1)) < 0.12 || d < 3) ? "#3a3026" : l < 0.7 ? "#3a3a52" : "#5a6070"; });
        continue;
      }
      fill(w.x - 3, w.y - 3, w.x + w.w + 3, w.y + w.h + 2, (uu, vv) => (uu > w.x && uu < w.x + w.w && vv > w.y && vv < w.y + w.h) ? null : S0[uu < w.x ? 1 : 2]);
      fill(w.x - 4, w.y - 7, w.x + w.w + 4, w.y - 3, (uu, vv) => Math.abs(uu - (w.x + w.w / 2)) < 2.4 ? S0[0] : vv < w.y - 6 ? S0[1] : S0[2]);
      fill(w.x - 5, w.y + w.h + 1, w.x + w.w + 5, w.y + w.h + 4, (uu, vv) => vv < w.y + w.h + 2 ? S0[0] : S0[3]);
      for (const side of [-1, 1]) {
        const s0 = side < 0 ? w.x - 3 - w.w * 0.5 : w.x + w.w + 3, s1 = s0 + w.w * 0.5;
        fill(s0, w.y - 1, s1, w.y + w.h + 1, (uu, vv) => { const louver = (vv - w.y) % 2.2 < 0.7; const edge = uu < s0 + 1 || uu > s1 - 1 || vv < w.y + 0.6 || vv > w.y + w.h; return edge ? "#2a3646" : louver ? "#33445a" : "#4c6480"; });
      }
    }
    /* posters on the wall between the lower windows, faded */
    for (const [pu, pc] of [[212, ["#b84a2a", "#e8d8a8"]], [292, ["#2a5a7a", "#e8d8a8"]]]) {
      fill(pu, 150, pu + 18, 174, (uu, vv) => { if (vv < 152 || vv > 172 || uu < pu + 1 || uu > pu + 17) return "#d8cca8"; if (vv < 158) return pc[0]; if (vv > 167) return Math.floor(uu) % 3 ? "#5a5040" : pc[1]; return K.hash(Math.floor(uu), Math.floor(vv), 5) > 0.5 ? pc[1] : pc[0]; });
    }
    /* the canopy: its roof, the valance of dagger boards, the station's name on it */
    fill(92, 178, 432, 184, (uu, vv) => vv < 179 ? "#5a6270" : vv > 183 ? "#1a1e26" : "#2e3440");
    fill(92, 184, 432, 197, (uu, vv) => {
      const b = (uu - 92) % 4, tip = 194 + Math.abs(b - 2) * 1.5;
      if (vv > tip) return null;
      return b < 0.5 ? "#7a8a6a" : vv > 192 ? "#a8b890" : "#c8d4b0";
    });
    { const name = L.nodes[n].name.toUpperCase(), tw = K.text5w(name), bw = tw / sc + 10;
      fill(267 - bw / 2, 185, 267 + bw / 2, 193, (uu, vv) => (vv < 185.6 || vv > 192.4 || uu < 267 - bw / 2 + 0.6 || uu > 267 + bw / 2 - 0.6) ? "#e9e4d8" : "#1d3a6a");
      K.text5(g, name, Math.round(X(267) - tw / 2), Math.round(Y(189) - 3), "#f4f0e4"); }
    /* the columns and their brackets */
    for (const cu of [112, 220, 316, 414]) {
      fill(cu - 1.6, 194, cu + 1.6, 214, (uu) => uu < cu - 0.5 ? "#4a5260" : uu > cu + 0.6 ? "#1e2228" : "#2e343e");
      fill(cu - 3, 211, cu + 3, 214, () => "#2e343e");
      for (const s of [-1, 1]) fill(cu + (s < 0 ? -9 : 0), 184, cu + (s < 0 ? 0 : 9), 197, (uu, vv) => { const d = Math.hypot(uu - (cu + s * 9), vv - 197); return Math.abs(d - 8) < 0.9 ? "#2e343e" : null; });
    }
    /* a bench, a luggage trolley */
    fill(300, 203, 332, 214, (uu, vv) => (vv < 204.5 || (vv > 207 && vv < 208.6)) ? "#7a5232" : (uu < 302 || uu > 330) && vv > 204 ? "#22262c" : null);
    fill(222, 205, 246, 214, (uu, vv) => vv < 207 ? "#5a4028" : (Math.hypot(uu - 226, vv - 211.5) < 2.5 || Math.hypot(uu - 242, vv - 211.5) < 2.5) ? "#1e2226" : null);
    fill(224, 199, 236, 205, (uu, vv) => vv < 200 ? "#8a6a42" : "#6a4a2a");
    /* the platform: flagstones, the white edge, the face below */
    fill(left, 214, right, 227, (uu, vv) => {
      if (vv < 218) { const fl = ((uu + (Math.floor(vv) % 2) * 6) % 13) < 0.6 || vv > 217.4; return fl ? S0[3] : K.hash(Math.floor(uu / 13), 3, 2) > 0.5 ? S0[1] : S0[2]; }
      if (vv < 219.6) return "#e9e4d8";
      const row = Math.floor((vv - 219.6) / 2.2), off = row % 2 ? 3 : 0; return ((uu + off) % 6 < 0.5 || (vv - 219.6) % 2.2 < 0.5) ? "#2a1a14" : "#6a3a28";
    });
    /* the signal box: brick base, timber cabin with its long window, a hipped roof, the stairs */
    fill(412, 140, 470, 214, (uu, vv) => { const row = Math.floor(vv / 2.6), off = row % 2 ? 2.5 : 0; return ((uu + off) % 5 < 0.55 || vv % 2.6 < 0.5) ? "#3a2018" : K.hash(Math.floor((uu + off) / 5), row, 6) > 0.7 ? "#8a4632" : "#6e3626"; });
    fill(424, 156, 444, 176, (uu, vv) => { const d = Math.hypot(uu - 434, vv - 166); return vv < 166 && d > 10 ? null : (uu > 426 && uu < 442 && vv > 160) ? "#141822" : "#a85a3e"; });
    fill(408, 100, 474, 141, (uu, vv) => (uu - 408) % 3.5 < 0.5 ? M.wood[4] : vv > 139 ? M.wood[4] : M.wood[2]);
    fill(420, 108, 464, 136, (uu, vv) => (uu > 422 && uu < 462 && vv > 110 && vv < 134) ? null : "#e9e0c8");
    fill(402, 86, 480, 101, (uu, vv) => { const k = (vv - 86) / 15, x0 = 420 - k * 18, x1 = 462 + k * 18; if (uu < x0 || uu > x1) return null; return (vv - 86) % 3 < 0.6 ? SL[3] : SL[2]; });
    for (let i = 0; i < 12; i++) fill(394 + i * 1.2, 140 + i * 6.2, 404 + i * 1.2, 141.6 + i * 6.2, () => M.wood[2]);
    fill(392, 140, 394, 214, () => M.wood[3]);
    /* the line: ballast, the main line's rails on their chairs and sleepers, and a second line nearer */
    fill(left, 227, right, 300, (uu, vv) => { const q = K.hash(Math.floor(uu * 1.4), Math.floor(vv * 1.4), 8); return q > 0.85 ? "#5a544a" : q > 0.55 ? "#3e3a34" : "#2e2b27"; });
    for (const ry of [243, 276]) {
      const big = ry > 250 ? 1.3 : 1;
      for (let su = Math.floor(left / 6) * 6; su < right; su += 6) fill(su, ry + 1 * big, su + 4 * big, ry + 3.5 * big, () => "#3a2a1c");
      fill(left, ry - 3 * big, right, ry + 1 * big, (uu, vv) => vv < ry - 2.4 * big ? "#c4ccd6" : vv < ry - 1.6 * big ? "#7d8792" : vv < ry ? "#3c434c" : "#5b636e");
      for (let su = Math.floor(left / 6) * 6; su < right; su += 6) fill(su + 0.5, ry - 0.4, su + 2.5 * big, ry + 1.2 * big, () => "#23272c");
    }
    /* night: the moon's cold light, the gas lanterns under the canopy warm */
    const lamps = [166, 268, 362].map(lu => ({ x: X(lu), y: Y(202), r: 75 * sc, k: 0.95, col: [1, 0.78, 0.48] }));
    const A = PX.World.ambient(l);
    K.relight(c, [A[0] * 1.15, A[1] * 1.15, A[2] * 1.12], lamps);
    /* the lanterns themselves, lit, on their brackets */
    for (const lu of [166, 268, 362]) {
      const x = Math.round(X(lu)), y = Math.round(Y(197));
      K.rect(g, x, y, 1, S(4), "#1a1d22");
      K.rect(g, x - S(2.4), y + S(4), S(4.8) + 1, S(6), "#2a2d34"); K.rect(g, x - S(1.8), y + S(4.8), S(3.6), S(4.6), "#ffe6a0"); K.rect(g, x - S(1.2), y + S(5.4), S(2.4), S(3), "#fff8dc");
      K.rect(g, x - S(2.8), y + S(4), S(5.6) + 1, 1, "#4a4e56");
    }
    /* the sky goes behind it all */
    const out = K.mk(W, H), og = out.getContext("2d");
    og.drawImage(PX.World.skyImage(W, Math.ceil(Y(214)) + 1, l, 1), 0, 0);
    og.drawImage(c, 0, 0);
    out.lamps = lamps;
    return out;
  });

  /* a window: dark glass, or lit where a wolf has come to it */
  function windowAt(g, G, w, lit, l, now) {
    const X = u => G.ox + u * G.sc, Y = v => G.oy + v * G.sc, x0 = Math.round(X(w.x)), y0 = Math.round(Y(w.y)), x1 = Math.round(X(w.x + w.w)), y1 = Math.round(Y(w.y + w.h));
    if (lit) {
      for (let y = y0; y < y1; y++) { const k = (y - y0) / (y1 - y0); g.fillStyle = K.mix("#ffd88a", "#e8903a", k * 0.7); g.fillRect(x0, y, x1 - x0, 1); }
      const grd = g.createRadialGradient((x0 + x1) / 2, (y0 + y1) / 2, 2, (x0 + x1) / 2, (y0 + y1) / 2, 46 * G.sc);
      grd.addColorStop(0, "rgba(255,190,100,.22)"); grd.addColorStop(1, "rgba(255,190,100,0)"); g.fillStyle = grd; g.fillRect(x0 - 50 * G.sc, y0 - 50 * G.sc, x1 - x0 + 100 * G.sc, y1 - y0 + 100 * G.sc);
    } else {
      for (let y = y0; y < y1; y++) { const k = (y - y0) / (y1 - y0); g.fillStyle = K.mix("#1e2840", "#0e1422", k); g.fillRect(x0, y, x1 - x0, 1); }
      if (l < 0.7) { g.fillStyle = "rgba(170,190,230,.14)"; for (let i = 0; i < (x1 - x0) * 0.6; i++) g.fillRect(x0 + 2 + i, y0 + 2 + i, 1, 1); }
    }
    return { x0, y0, x1, y1 };
  }
  function bars(g, b, door) {
    if (door) return;
    g.fillStyle = "rgba(30,22,16,.9)";
    g.fillRect(Math.round((b.x0 + b.x1) / 2), b.y0, 1, b.y1 - b.y0);
    for (const f of [0.33, 0.66]) g.fillRect(b.x0, Math.round(b.y0 + (b.y1 - b.y0) * f), b.x1 - b.x0, 1);
  }

  St.draw = (g, S, ui, now) => {
    const W = g.canvas.width, H = g.canvas.height, G = St.geo(W, H), F = S.fight, l = K.light(S.t), sc = G.sc;
    const X = u => G.ox + u * sc, Y = v => G.oy + v * sc;
    St.last = G;
    g.drawImage(paint(F.n, W, H, l), 0, 0);
    /* the clock keeps the night's time */
    { const cx = X(267), cy = Y(32), hh = (S.t / 60) % 12, mm = S.t % 60, ha = hh / 12 * Math.PI * 2 - Math.PI / 2, ma = mm / 60 * Math.PI * 2 - Math.PI / 2;
      K.line(g, cx, cy, cx + Math.cos(ha) * 4.4 * sc, cy + Math.sin(ha) * 4.4 * sc, "#1a1410", 1); K.line(g, cx, cy, cx + Math.cos(ma) * 6.6 * sc, cy + Math.sin(ma) * 6.6 * sc, "#1a1410", 1); K.px(g, cx, cy, "#8a2a1c"); }
    /* the wolves' banners on the front, while it is theirs */
    for (const bu of [214, 314]) {
      const x0 = Math.round(X(bu)), y0 = Math.round(Y(78)), w = Math.round(14 * sc), h = Math.round(34 * sc);
      for (let y = y0; y < y0 + h; y++) { const wave = Math.round(Math.sin(now / 600 + y * 0.15) * 0.8); for (let x = x0; x < x0 + w; x++) { const k = (x - x0) / w; g.fillStyle = k < 0.15 ? "#7d1c11" : k > 0.85 ? "#8a2214" : "#b52c1b"; g.fillRect(x + wave, y, 1, 1); } }
      K.poly(g, [[x0, y0 + h], [x0 + w / 2, y0 + h - 6 * sc], [x0 + w, y0 + h], [x0 + w, y0 + h + 2], [x0, y0 + h + 2]], "#0e1220");
      const ex = x0 + w / 2, ey = y0 + h * 0.4;
      K.disc(g, ex, ey, 5 * sc, 5 * sc, "#2a0a06"); K.disc(g, ex, ey, 4.2 * sc, 4.2 * sc, "#d3cfca");
      K.poly(g, [[ex - 4 * sc, ey - 2 * sc], [ex - 3 * sc, ey - 7 * sc], [ex - 1 * sc, ey - 3 * sc]], "#d3cfca"); K.poly(g, [[ex + 1 * sc, ey - 3 * sc], [ex + 3 * sc, ey - 7 * sc], [ex + 4 * sc, ey - 2 * sc]], "#d3cfca");
      K.disc(g, ex, ey + 2 * sc, 2 * sc, 1.6 * sc, "#ece8e2"); K.px(g, ex - 1.5 * sc, ey - 0.5 * sc, "#b52c1b"); K.px(g, ex + 1.5 * sc, ey - 0.5 * sc, "#b52c1b");
      K.rect(g, x0 - 1, y0 - 2, w + 2, 2, M.brass[2]);
    }
    /* the windows and who is at them */
    const at = {};
    for (const wf of F.wolves) if (wf.st !== "gone") at[wf.w] = wf;
    E.WINDOWS.forEach((w, i) => {
      const wf = at[i], b = windowAt(g, G, w, !!wf && wf.st !== "dead", l, now);
      if (wf) {
        g.save(); g.beginPath(); g.rect(b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0); g.clip();
        /* a wolf at Duc's scale, waist up behind the sill, stepping up to it and dropping back */
        const st = wf.st === "duck" ? "up" : wf.st, spr = P.wolfFig(st, i % 2);
        const rise = wf.st === "up" ? Math.min(1, wf.t / C.STATION.upT) : wf.st === "duck" ? 1 - wf.t / 0.25 : wf.st === "dead" ? 1 - Math.min(1, wf.t / 0.5) : 1;
        g.drawImage(spr, Math.round(X(w.fx) - spr.width / 2), Math.round(b.y1 - spr.height + 3 + (1 - rise) * 18));
        g.restore();
        if (wf.st === "fire" && wf.t < 0.08) FX.flash(X(w.fx) + 2, b.y1 - 9, 5);
      }
      bars(g, b, w.door);
    });
    /* the points lever by the signal box: thrown once Duc has pulled it */
    const thrown = F.duc.thr >= C.STATION.throwT || F.duc.ph === "back" || F.duc.ph === "aboard" || F.duc.ph === "done";
    const lx = X(C.STATION.lever), ly = Y(212), la = thrown ? 0.55 : -0.55, ll = 22 * sc;
    K.rect(g, lx - 8 * sc, ly - 3 * sc, 18 * sc, 5 * sc, "#2a2e36"); K.rect(g, lx - 8 * sc, ly - 3 * sc, 18 * sc, 1, "#4a505a");
    K.line(g, lx, ly - 2 * sc, lx + Math.sin(la) * ll, ly - 2 * sc - Math.cos(la) * ll, "#0b0d12", 4);
    K.line(g, lx, ly - 2 * sc, lx + Math.sin(la) * ll, ly - 2 * sc - Math.cos(la) * ll, "#d8d2c4", 2);
    K.line(g, lx + Math.sin(la) * ll * 0.6, ly - 2 * sc - Math.cos(la) * ll * 0.6, lx + Math.sin(la) * ll, ly - 2 * sc - Math.cos(la) * ll, "#c0311c", 2);
    K.rect(g, lx - Math.sin(la) * 6 * sc - 3, ly - 2 * sc + Math.cos(la) * 3 * sc - 2, 6, 5, "#3a3e46");
    /* the engine, stopped short on the left: you are on her buffer beam */
    const s = Math.round(16 * sc);
    PX.Model.drawSide(g, "engine", s, Math.round(X(94) - 11.15 * s), Math.round(Y(240)), 0);
    /* Duc */
    const d = F.duc;
    if (d.ph !== "done" && !(d.ph === "aboard" && F.doneT > 0.4)) {
      const pose = d.hurtT > 0 ? "hurt" : d.ph === "throw" || d.ph === "aboard" ? "lever" : "run";
      const fr = pose === "run" ? Math.floor(d.step * 11) % 8 : pose === "lever" ? Math.floor(now / 160) % 4 : 0;
      let spr = P.ducRun(fr, pose);
      if (d.face < 0 && pose === "run") spr = K.get(`duc2F:${fr}`, () => K.flip(P.ducRun(fr, "run")));
      g.drawImage(spr, Math.round(X(d.x) - spr.width / 2), Math.round(Y(E.PLATFORM_Y) - spr.height + 2 - (d.ph === "aboard" ? F.doneT * 24 * sc : 0)));
      if (d.hurtT > 0 && Math.floor(now / 100) % 2) K.rect(g, X(d.x) - 1, Y(E.PLATFORM_Y) - 40 * sc, 3, 3, "#ff5a3a");
    }
    FX.draw(g, "front");
    /* you: crouched behind sandbags in the foreground, a submachine gun laid on the sight */
    shooter(g, W, H, X(S.aim.x), Y(S.aim.y), F.shotT > C.STATION.rof * 0.5, now);
    /* your sight */
    const ax = X(S.aim.x), ay = Y(S.aim.y), col = "#ffc35a";
    K.ring(g, ax, ay, 7, "rgba(10,10,14,.7)", 1); K.ring(g, ax, ay, 6, col, 1);
    g.fillStyle = col; g.fillRect(Math.round(ax) - 12, Math.round(ay), 5, 1); g.fillRect(Math.round(ax) + 8, Math.round(ay), 5, 1); g.fillRect(Math.round(ax), Math.round(ay) - 12, 1, 5); g.fillRect(Math.round(ax), Math.round(ay) + 8, 1, 5);
    /* Duc's way up the platform, how far he has come (a Field aid) */
    if (ui.aids.gunnery) {
      const y = Math.round(Y(E.PLATFORM_Y + 4)), x0 = X(C.STATION.ducFrom), x1 = X(C.STATION.lever);
      for (let x = x0; x <= x1; x += 6) K.rect(g, x, y, 3, 1, x <= X(F.duc.x) ? "rgba(255,195,90,.85)" : "rgba(233,228,216,.3)");
    }
  };
  /* the flash and the strike of your own fire, from the engine's buffer beam to the sight */
  /* the player's own place: sandbags at the lower right, the gun swinging on the sight, a puma's paws on it */
  function shooter(g, W, H, sx, sy, firing, now) {
    const bx = Math.round(W * 0.8), by = H + 4;
    /* the sandbags, piled */
    const bag = (cx, cy, rx, ry) => { for (let y = Math.floor(cy - ry); y <= cy + ry; y++) for (let x = Math.floor(cx - rx); x <= cx + rx; x++) { const dx = (x - cx) / rx, dy = (y - cy) / ry; if (dx * dx + dy * dy > 1) continue; const lv = -dx * 0.4 - dy * 0.7 + K.bayer(x, y) * 0.3 + (K.hash(x >> 1, y >> 1, 4) - 0.5) * 0.3; g.fillStyle = M.canvas[PX.clamp(Math.round(2.6 - lv * 1.6), 0, 4)]; g.fillRect(x, y, 1, 1); } K.ring(g, cx, cy, Math.round(Math.min(rx, ry)), "rgba(0,0,0,0)"); };
    for (const [dx, dy, rx, ry] of [[-70, -10, 26, 11], [-24, -12, 26, 11], [22, -10, 26, 11], [68, -12, 26, 11], [-46, -28, 25, 10], [0, -30, 25, 10], [46, -28, 25, 10]]) bag(bx + dx, H + dy, rx, ry);
    /* the gun: its line from the shoulder to the sight */
    const dx = sx - bx, dy = sy - by, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d, nx = -uy, ny = ux, kick = firing ? 2 : 0;
    const P = t => [bx + ux * (t - kick), by + uy * (t - kick)];
    const [s0x, s0y] = P(26), [r1x, r1y] = P(64), [b1x, b1y] = P(104);
    /* the stock and receiver, dark wood and blued steel; the perforated barrel shroud; the drum */
    K.line(g, bx, by, s0x, s0y, INK, 12); K.line(g, bx, by, s0x, s0y, M.wood[2], 10); K.line(g, bx - nx * 3, by - ny * 3, s0x - nx * 3, s0y - ny * 3, M.wood[1], 2);
    K.line(g, s0x, s0y, r1x, r1y, INK, 11); K.line(g, s0x, s0y, r1x, r1y, M.iron[2], 9); K.line(g, s0x - nx * 3, s0y - ny * 3, r1x - nx * 3, r1y - ny * 3, M.iron[0], 1);
    K.line(g, r1x, r1y, b1x, b1y, INK, 8); K.line(g, r1x, r1y, b1x, b1y, M.iron[3], 6);
    for (let t = 0.1; t < 0.95; t += 0.12) { const x = PX.lerp(r1x, b1x, t), y = PX.lerp(r1y, b1y, t); K.disc(g, x - nx, y - ny, 1, 1, INK); }
    K.disc(g, PX.lerp(s0x, r1x, 0.55) + nx * 9, PX.lerp(s0y, r1y, 0.55) + ny * 9, 9, 9, INK); K.disc(g, PX.lerp(s0x, r1x, 0.55) + nx * 9, PX.lerp(s0y, r1y, 0.55) + ny * 9, 8, 8, M.iron[2]); K.disc(g, PX.lerp(s0x, r1x, 0.55) + nx * 7, PX.lerp(s0y, r1y, 0.55) + ny * 7, 3, 3, M.iron[1]);
    /* your paws: one on the grip, one under the shroud */
    const paw = PX.People.paw();
    g.drawImage(paw, Math.round(PX.lerp(s0x, r1x, 0.15) - 8 + nx * 6), Math.round(PX.lerp(s0y, r1y, 0.15) - 6 + ny * 6));
    g.drawImage(paw, Math.round(PX.lerp(r1x, b1x, 0.25) - 8 + nx * 5), Math.round(PX.lerp(r1y, b1y, 0.25) - 6 + ny * 5));
    St.muzzle = { x: b1x + ux * 3, y: b1y + uy * 3 };
    if (firing) FX.flash(St.muzzle.x, St.muzzle.y, 6, { life: 0.05 });
  }
  St.fire = (S, hit) => {
    const G = St.last; if (!G) return;
    const m = St.muzzle || { x: G.ox + 400 * G.sc, y: G.oy + 290 * G.sc }, fx = m.x, fy = m.y, tx = G.ox + S.aim.x * G.sc, ty = G.oy + S.aim.y * G.sc;
    FX.flash(fx, fy, 4, { life: 0.05 });
    FX.tracer(fx, fy, tx, ty, { life: 0.08, col: "#fff0b0" });
    if (hit) FX.burst(tx, ty, 10, { sp: 50, col: "#ff6a4a" }); else { FX.burst(tx, ty, 4, { sp: 36, col: "#ffe2a0" }); FX.dust(tx, ty, 0.8); }
  };
})();
