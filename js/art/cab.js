/* The Puma Express -- the cab: where the game is driven from, seen from
 * the driver's side.
 *
 * Through the window, the country coming at you past the long boiler: its
 * brass bands, handrail, dome and safety valves, the chimney with the smoke
 * streaming back. Below, the backhead, the boiler's round black end, and the
 * controls 1987 gave the driver, laid out as a driver reaches for them: the
 * pressure and speed gauges either side of the boiler thermometer under the
 * steam manifold, the cab clock beside them, the water glass, the firebox door with its butterfly
 * doors, the regulator (the throttle) on its quadrant, the reverser on the
 * floor, the vacuum brake and its gauge on the cab side, the points
 * repeater, the whistle chain and the safety valve's pull hanging from the
 * roof; the coal and the shovel in the corner.
 *
 * It is night, and a cab at night is nearly black: the crew keep their eyes
 * for the road, so the lamps are small and hooded, and the fire is the light
 * that matters. Everything that does not move is painted once, then lit in
 * layers: the night and the lamps as the base, and on their own the glow a
 * shut firebox leaks onto the floor, the open fire, and dawn; a frame adds
 * each over the base as strongly as it is burning. What moves (needles,
 * levers, doors, the fire, the coal, a paw) is drawn over it in the light
 * where it stands, never quite lost in the dark.
 *
 * PX.Cab.layout(W, H) says where each control is, for the cursor and the
 * mouse; PX.Cab.draw paints it. */
"use strict";
(() => {
  const K = PX.K, M = K.M, C = PX.C, L = PX.Line, World = PX.World, Cab = PX.Cab = {};
  Cab.ORDER = ["shovel", "door", "valve", "throttle", "whistle", "reverser", "brake"];
  Cab.NAMES = { shovel: "Coal shovel", brake: "Brake", valve: "Safety valve", door: "Firebox door", whistle: "Whistle", throttle: "Throttle", reverser: "Reverser" };
  const INK = "#0a0b0e";

  /* ---- where things are: drawn for 640 by 360, stretched to the screen ---- */
  Cab.layout = (W, H) => {
    const u = PX.clamp(W / 640, 0.82, 1.3), sy = H / 360, s = Math.min(1, Math.min(u, sy));
    const X = x => Math.round(W / 2 + (x - 320) * u), Y = y => Math.round(y * sy), R = r => Math.max(2, Math.round(r * s));
    const Lo = { W, H, u, sy, s, X, Y, R, winH: Y(168) };
    /* the backhead: the boiler's end, the fireman's side; it carries only the boiler's own fittings */
    { const r = Math.round(112 * Math.min(u, sy)); Lo.dome = { x: X(128), y: Y(262), rx: r, ry: r }; }
    Lo.manifold = { x: X(129), y: Y(182), w: Math.round(76 * u) };
    Lo.glass = { x: X(64), y: Y(200), w: Math.max(5, Math.round(7 * u)), h: Math.round(64 * sy) };
    /* the driver's gauge board, in front of the driver on the right: pressure, speed, the boiler's temperature, the points repeater */
    Lo.board = { x: X(332), y: Y(170), w: Math.round(160 * u), h: Y(242) - Y(170) };
    Lo.gauges = { psi: { x: X(366), y: Y(206), r: R(24) }, mph: { x: X(458), y: Y(206), r: R(24) }, temp: { x: X(412), y: Y(224), r: R(14) }, vac: { x: X(586), y: Y(204), r: R(15) } };
    Lo.pts = { x: X(412) - Math.round(18 * u), y: Y(180), w: Math.round(36 * u), h: Math.round(22 * sy) };
    /* the cab clock, screwed to the plate right of the board: below the whistle's pull, above the brake and the
       reverser, so nothing the paw takes hold of lies over it */
    Lo.clock = { x: X(531), y: Y(199), r: R(19) };
    /* the driver's spectacle window, beside the boiler: the plate is solid over the firebox, and the fireman's window
       is on the far side of the boiler, out of the driver's sight */
    /* the line's map on a card, clipped to the plate above the firebox */
    { const cw = Math.round(104 * u), ch2 = 84, cx0 = X(144), cy0 = Y(30), k = (cw - 12) / L.W;
      Lo.card = { x: cx0, y: cy0, w: cw, h: ch2, map: { x: cx0 + 6, y: cy0 + 20, k, h: Math.round(L.H * k) } }; }
    Lo.specs = [{ x0: X(276), y0: Y(28), x1: X(578), y1: Y(150), rt: Math.round(46 * s), rb: 10 }];
    Lo.ctl = {
      door: { x: X(128) - R(44), y: Y(292), w: R(88), h: Y(352) - Y(292), cx: X(128), cy: Y(320) },
      throttle: { x: X(330), y: Y(248), w: Math.round(108 * u), h: Y(312) - Y(248), cx: X(384), cy: Y(304), paw: [X(384) + R(46), Y(282)] },
      reverser: { x: X(466), y: Y(246), w: Math.round(58 * u), h: H - Y(246), cx: X(494), cy: H + 2 },
      brake: { x: X(548), y: Y(228), w: Math.round(80 * u), h: Y(300) - Y(228), cx: X(586), cy: Y(262), paw: [X(586) + R(14), Y(254)] },
      whistle: { x: X(470), y: Y(18), w: Math.round(40 * u), h: Y(152) - Y(18), cx: X(490), cy: Y(138) },
      valve: { x: X(74), y: Y(18), w: Math.round(40 * u), h: Y(152) - Y(18), cx: X(94), cy: Y(138) },
      shovel: { x: X(250), y: Y(306), w: Math.round(80 * u), h: H - Y(306), cx: X(290), cy: Y(334) },
    };
    /* the lamps, kept small so the crew keeps its night eyes: the hooded lamp along the top of the gauge board, and
       the one wide pool it spills below the board over the regulator, the reverser and the brake (a touch more on
       the regulator, the driver's hand is always on it); the small lamp over the vacuum gauge; the clock's, over it;
     the little lamp behind
       the water glass; and the moon, faint and cold, on the plate round the spectacle */
    Lo.lamps = [{ x: X(412), y: Y(176), rx: 118 * u, ry: 84 * sy, k: 1.05, col: [1.0, 0.8, 0.52] }, { x: X(486), y: Y(272), rx: 240 * u, ry: 82 * sy, k: 0.6, col: [1.0, 0.78, 0.5] },
      { x: X(384), y: Y(286), rx: 70 * u, ry: 50 * sy, k: 0.2, col: [1.0, 0.78, 0.5] }, { x: X(586), y: Y(232), rx: 52 * u, ry: 56 * sy, k: 0.3, col: [1.0, 0.78, 0.5] },
      { x: X(70), y: Y(232), rx: 34 * u, ry: 70 * sy, k: 0.85, col: [1.0, 0.8, 0.52] }, { x: X(427), y: Y(84), rx: 290 * u, ry: 150 * sy, k: 0.2, col: [0.55, 0.66, 0.95] },
      { x: X(531), y: Y(190), rx: 34 * u, ry: 36 * sy, k: 1.1, col: [1.0, 0.8, 0.52] }];
    /* the fire: with the door shut it leaks round the doors and through the draught slits onto the floor; open, it
       floods the cab from below */
    Lo.leak = { x: X(128), y: Y(370), rx: 160 * u, ry: 62 * sy, k: 1.0, col: [1.0, 0.5, 0.2] };
    Lo.fire = { x: X(128), y: Y(306), rx: 380 * u, ry: 300 * sy, k: 1.9, col: [1.0, 0.55, 0.22] };
    /* the night in the cab is nearly black; dawn greys it in, and by day the light through the windows fills it */
    Lo.amb = [0.1, 0.12, 0.19];
    Lo.dawn = [0.7, 0.66, 0.55];
    return Lo;
  };
  /* how the light stands this frame: dawn coming, the glow round a shut door, the open fire; each 0 to 1 */
  function lighting(S, now) {
    const c = S.cab, heat = PX.clamp(c.grate / 6, 0.12, 1), n = (s, k) => K.vnoise(now / s, k, 31) - 0.5;
    return {
      dawn: K.light(S.t),
      leak: (0.3 + heat * 0.7) * (0.9 + n(260, 1) * 0.3),
      fire: c.door ? (0.45 + heat * 0.55) * (0.86 + n(150, 2) * 0.34 + n(45, 3) * 0.12) : 0,
    };
  }
  /* the light at a point, as a colour multiplier: for what is drawn over the painted cab */
  function lightAt(Lo, x, y, lv) {
    const am = Lo.amb.map((v, i) => v + Lo.dawn[i] * lv.dawn);
    let r = am[0], g = am[1], b = am[2];
    for (const Lp of Lo.lamps.concat([Object.assign({}, Lo.leak, { k: Lo.leak.k * lv.leak }), Object.assign({}, Lo.fire, { k: Lo.fire.k * lv.fire })])) {
      const dx = (x - Lp.x) / (Lp.rx || Lp.r), dy = (y - Lp.y) / (Lp.ry || Lp.r), q = 1 - (dx * dx + dy * dy);
      if (q <= 0 || !Lp.k) continue;
      r += Lp.col[0] * q * q * Lp.k; g += Lp.col[1] * q * q * Lp.k; b += Lp.col[2] * q * q * Lp.k;
    }
    return [r, g, b];
  }
  const lit = (hex, m) => K.hex(K.rgb(hex).map((v, i) => v * m[i]));

  /* ---- drawing helpers for metal, glass and brass ---- */
  /* a ring or disc shaded as a round surface lit from the upper left: brass bezels, valve bodies, domes */
  function boss(g, x, y, r, ramp, hole = 0, bulge = 1) {
    for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) {
      const d = Math.hypot(i, j); if (d > r + 0.3 || d < hole) continue;
      const nx = i / r, ny = j / r, nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny)) * bulge;
      const lv = -nx * 0.55 - ny * 0.62 + nz * 0.45 + K.bayer(i, j) * 0.18;
      g.fillStyle = ramp[PX.clamp(Math.round(2.4 - lv * 2.6), 0, 4)]; g.fillRect(x + i, y + j, 1, 1);
    }
  }
  /* a bezel: a ring of brass, its inner edge in shadow */
  function bezel(g, x, y, r, w = 4) {
    const B = M.brass;
    for (let j = -r - 1; j <= r + 1; j++) for (let i = -r - 1; i <= r + 1; i++) {
      const d = Math.hypot(i, j); if (d > r + 0.5 || d < r - w) continue;
      const a = Math.atan2(j, i), lvO = -Math.cos(a) * 0.6 - Math.sin(a) * 0.7, mid = (d - (r - w)) / w;
      /* the outer half of the ring catches the light, the inner half is turned from it */
      const lv = (mid > 0.5 ? lvO : -lvO * 0.8) + K.bayer(i, j) * 0.2;
      g.fillStyle = B[PX.clamp(Math.round(2.2 - lv * 2.2), 0, 4)]; g.fillRect(x + i, y + j, 1, 1);
    }
    K.ring(g, x, y, r + 1, INK, 1);
  }
  /* a round pipe along a polyline, r its radius: shadowed underneath, lit along the top, a highlight */
  function pipe(g, pts, r, ramp) {
    const seg = (x0, y0, x1, y1) => {
      const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
      const nx = -(y1 - y0) / n, ny = (x1 - x0) / n;
      /* across the pipe, which way is up (toward the light) */
      const up = ny > 0 || (ny === 0 && nx > 0) ? -1 : 1;
      for (let k = 0; k <= n; k++) {
        const x = x0 + (x1 - x0) * k / n, y = y0 + (y1 - y0) * k / n;
        for (let t = -r; t <= r; t++) {
          const f = (t * up) / r;
          g.fillStyle = ramp[PX.clamp(Math.round(2 + f * 2.2), 0, 4)];
          g.fillRect(Math.round(x + nx * t), Math.round(y + ny * t), 1, 1);
        }
      }
    };
    for (let i = 0; i < pts.length - 1; i++) seg(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]);
    for (const [x, y] of pts.slice(1, -1)) boss(g, Math.round(x), Math.round(y), r + 1, M.brass);
  }
  /* a valve's handwheel, painted red, its spokes and rim */
  function handwheel(g, x, y, r, col = "red") {
    const ramp = col === "red" ? ["#ff9a7a", "#d8462c", "#a52c1a", "#6e1a0e", "#3e0e08"] : M.brass;
    for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) {
      const d = Math.hypot(i, j); if (d > r + 0.3) continue;
      const a = Math.atan2(j, i);
      const rim = d > r - Math.max(1.5, r * 0.28), spoke = [0, 1, 2, 3, 4].some(k => Math.abs(((a - k * Math.PI * 0.4) + Math.PI * 3) % (Math.PI * 0.4) - Math.PI * 0.2) > Math.PI * 0.2 - 0.32 / Math.max(1, d * 0.25));
      if (!(rim || d < 2 || (spoke && d < r))) continue;
      const lv = -Math.cos(a) * 0.5 - Math.sin(a) * 0.6;
      g.fillStyle = ramp[PX.clamp(Math.round(2 - lv * 1.8 + (rim ? 0 : 0.6)), 0, 4)]; g.fillRect(x + i, y + j, 1, 1);
    }
  }
  /* a little name plate: black enamel in a brass rim, the letters raised in polished brass, so it reads in the dark */
  const ENAMEL = "#16110b", SHEEN = "#d9b66c", plates = [];
  function plate(g, x, y, text) {
    const w = K.text5w(text) + 6, h = 11;
    x = Math.round(x - w / 2);
    plates.push([text, x + 3, y + 2]);
    K.rect(g, x, y, w, h, INK); K.rect(g, x + 1, y + 1, w - 2, h - 2, M.brass[2]); K.rect(g, x + 2, y + 2, w - 4, h - 4, ENAMEL); K.rect(g, x + 1, y + 1, w - 2, 1, M.brass[1]);
    K.text5(g, text, x + 3, y + 2, M.brass[0]);
  }

  /* a tag hanging from a pull: the plate, in the light where it hangs */
  function tag(g, x, y, text, m) {
    const w = K.text5w(text) + 6, h = 11, B = M.brass.map(q => lit(q, m));
    x = Math.round(x - w / 2); y = Math.round(y);
    K.rect(g, x + Math.round(w / 2), y - 2, 1, 2, INK);
    K.rect(g, x, y, w, h, INK); K.rect(g, x + 1, y + 1, w - 2, h - 2, B[2]); K.rect(g, x + 2, y + 2, w - 4, h - 4, lit(ENAMEL, m)); K.rect(g, x + 1, y + 1, w - 2, 1, B[1]);
    K.text5(g, text, x + 3, y + 2, B[0]);
  }

  /* ---- the painted cab: everything that does not move ---- */
  function paintCab(Lo) {
    const { W, H, X, Y, R, winH, u } = Lo;
    const c = K.mk(W, H), g = c.getContext("2d");
    plates.length = 0;
    /* the cab sides below the window: steel sheet in the engine's green, seams and rivets */
    for (let y = winH; y < H; y++) for (let x = 0; x < W; x++) {
      /* sheet steel: a soft sheen across each panel, a little dither, darker toward the floor */
      const panel = (x % 96) / 96, sheen = Math.sin(panel * Math.PI) * 0.6 - (y - winH) / (H - winH) * 0.5 + K.bayer(x, y) * 0.5;
      g.fillStyle = M.paint[PX.clamp(Math.round(2.4 - sheen * 1.2), 1, 4)]; g.fillRect(x, y, 1, 1);
      if (x % 96 === 0) { g.fillStyle = M.paint[4]; g.fillRect(x, y, 1, 1); }
    }
    for (const yy of [Y(206), Y(286)]) { K.rect(g, 0, yy, W, 1, M.paint[4]); K.rect(g, 0, yy + 1, W, 1, M.paint[1]); for (let x = 5; x < W; x += 10) K.rivet(g, x, yy + 4, M.paint[0], INK); }
    /* the floor: oak planks, worn pale where the crew stands */
    const fy = Y(344);
    for (let y = fy; y < H; y++) for (let x = 0; x < W; x++) { const plank = Math.floor((x + (y - fy) * 0.4) / 22); g.fillStyle = M.wood[(x + plank * 7) % 22 === 0 ? 4 : K.hash(plank, y >> 1, 3) > 0.7 ? 1 : 2]; g.fillRect(x, y, 1, 1); }
    K.rect(g, 0, fy - 1, W, 1, INK);
    /* the backhead: the boiler's round end, black, its flange riveted round */
    const D = Lo.dome;
    for (let y = D.y - D.ry; y < H; y++) for (let x = D.x - D.rx; x <= D.x + D.rx; x++) {
      const nx = (x - D.x) / D.rx, ny = (y - D.y) / D.ry; if (nx * nx + ny * ny > 1 && y < D.y) continue;
      if (Math.abs(nx) > 1) continue;
      const edge = nx * nx + ny * ny > 0.93 && y < D.y;
      const lv = -nx * 0.35 - Math.max(-1, ny) * 0.3 + K.bayer(x, y) * 0.2 + (K.hash(x >> 3, y >> 2, 8) - 0.5) * 0.15;
      g.fillStyle = edge ? M.iron[1] : M.iron[PX.clamp(Math.round(3 - lv * 1.6), 1, 4)]; g.fillRect(x, y, 1, 1);
    }
    for (let a = Math.PI * 1.02; a < Math.PI * 1.98; a += 0.045) K.rivet(g, Math.round(D.x + Math.cos(a) * (D.rx - 5)), Math.round(D.y + Math.sin(a) * (D.ry - 5)), M.iron[0], INK);
    /* the steam manifold across the top: a brass pipe, its valves with red handwheels */
    const mf = Lo.manifold;
    pipe(g, [[mf.x - mf.w / 2, mf.y], [mf.x + mf.w / 2, mf.y]], R(4), M.brass);
    for (let i = 0; i < 5; i++) { const vx = Math.round(mf.x - mf.w / 2 + 6 + i * (mf.w - 12) / 4); boss(g, vx, mf.y - R(6), R(3), M.brass); handwheel(g, vx, mf.y - R(11), R(5)); }
    /* copper pipes: down the backhead from the manifold to the injectors, and the gauges' siphons */
    const cp = M.copper;
    pipe(g, [[mf.x - mf.w / 2, mf.y], [mf.x - mf.w / 2 - 22 * u, mf.y + 10], [mf.x - mf.w / 2 - 22 * u, H]], R(3), cp);
    pipe(g, [[mf.x + mf.w / 2, mf.y], [mf.x + mf.w / 2 + 22 * u, mf.y + 10], [mf.x + mf.w / 2 + 22 * u, H]], R(3), cp);
    /* the gauge board: black-painted teak in a brass frame, screwed to the cab front */
    { const bd = Lo.board;
      K.rect(g, bd.x - 3, bd.y - 3, bd.w + 6, bd.h + 6, INK);
      for (let y = bd.y - 2; y < bd.y + bd.h + 2; y++) for (let x = bd.x - 2; x < bd.x + bd.w + 2; x++) {
        const edge = x < bd.x || y < bd.y || x >= bd.x + bd.w || y >= bd.y + bd.h;
        if (edge) { g.fillStyle = M.brass[(x < bd.x || y < bd.y) ? 1 : 3]; g.fillRect(x, y, 1, 1); continue; }
        const grain = K.vnoise(x / 30, y / 2.5, 41) * 0.6 + K.bayer(x, y) * 0.25;
        g.fillStyle = grain > 0.55 ? "#2a2018" : grain > 0.3 ? "#211912" : "#1a140e"; g.fillRect(x, y, 1, 1);
      }
      for (const [x, y] of [[bd.x + 4, bd.y + 4], [bd.x + bd.w - 6, bd.y + 4], [bd.x + 4, bd.y + bd.h - 6], [bd.x + bd.w - 6, bd.y + bd.h - 6]]) boss(g, x + 1, y + 1, 2, M.brass);
      /* pipes from the board's back, down behind it to the backhead */
      /* the gauge lamp: a long hood over the board's top edge, its tube glowing under the lip */
      const hx0 = bd.x + 12, hw = bd.w - 24, hy = bd.y - 6;
      K.rect(g, hx0 - 1, hy - 1, hw + 2, 7, INK); K.rect(g, hx0, hy, hw, 3, M.iron[2]); K.rect(g, hx0, hy, hw, 1, M.iron[1]);
      K.rect(g, hx0 + 2, hy + 3, hw - 4, 2, "#ffe6a8"); K.rect(g, hx0 + 4, hy + 3, hw - 8, 1, "#fff8e0");
    }
    /* the works plate in the middle of the backhead: an oval of brass, the engine's number and where she was built */
    { const ox0 = mf.x, oy0 = Math.round(Lo.Y(236)), rx = Math.round(30 * u), ry = 15;
      for (let j = -ry - 1; j <= ry + 1; j++) for (let i = -rx - 1; i <= rx + 1; i++) {
        const q = (i * i) / (rx * rx) + (j * j) / (ry * ry); if (q > 1.06) continue;
        const rim = q > 0.72, lv = -i / rx * 0.5 - j / ry * 0.6 + K.bayer(i, j) * 0.3;
        g.fillStyle = q > 1 ? INK : rim ? M.brass[PX.clamp(Math.round(2 - lv * 1.8), 0, 4)] : "#3a1a12"; g.fillRect(ox0 + i, oy0 + j, 1, 1);
      }
      const t1 = "VELMONT", t2 = "NO 87";
      K.text5(g, t1, Math.round(ox0 - K.text5w(t1) / 2), oy0 - 8, M.brass[1]);
      K.text3(g, "87", Math.round(ox0 - K.text3w("87") / 2), oy0 + 3, M.brass[1]);
      void t2;
    }
    /* the blower valve, a small handwheel below the manifold */
    handwheel(g, Math.round(mf.x - 30 * u), Lo.Y(206), R(5), "brass");
    boss(g, Math.round(mf.x - 30 * u), Lo.Y(206), R(2), M.brass);
    /* the injector handwheels low down either side */
    handwheel(g, Math.round(mf.x - mf.w / 2 - 22 * u), Y(300), R(9));
    handwheel(g, Math.round(mf.x + mf.w / 2 + 22 * u), Y(300), R(9));
    /* the gauges' faces */
    for (const [k, max, red, step] of [["psi", 300, C.LOCO.red, 100], ["mph", 80, 0, 40], ["temp", 500, 450, 0], ["vac", 1, 0, 0]]) face(g, Lo.gauges[k], max, red, step);
    /* each dial's name on a plate under it, the way the coal and the water have theirs */
    for (const [k, name] of [["psi", "STEAM"], ["mph", "SPEED"], ["temp", "HEAT"]]) { const G0 = Lo.gauges[k]; plate(g, G0.x, G0.y + G0.r + 2, name); }
    /* the water glass: brass fittings top and bottom with their cocks, the glass, a striped plate behind it */
    const wg = Lo.glass;
    for (let y = wg.y; y < wg.y + wg.h; y++) for (let x = wg.x; x < wg.x + wg.w; x++) { g.fillStyle = ((x - y) & 3) < 2 ? "#e9e4d8" : "#151515"; g.fillRect(x, y, 1, 1); }
    for (const yy of [wg.y - R(10), wg.y + wg.h]) { boss(g, wg.x + Math.floor(wg.w / 2), yy + R(5), R(6), M.brass); K.rect(g, wg.x + wg.w + 2, yy + R(4), R(10), R(2), M.brass[1]); boss(g, wg.x + wg.w + 2 + R(10), yy + R(5), R(2), M.brass); }
    K.rect(g, wg.x - 2, wg.y, 1, wg.h, M.brass[1]); K.rect(g, wg.x + wg.w + 1, wg.y, 1, wg.h, M.brass[3]);
    plate(g, wg.x + wg.w / 2, wg.y + wg.h + R(14), "WATER");
    /* the firehole: a brass ring round the door, the deflector plate above, the drip tray */
    const d = Lo.ctl.door;
    K.rect(g, d.x - 6, d.y - 6, d.w + 12, d.h + 12, INK);
    for (let y = d.y - 5; y < d.y + d.h + 5; y++) for (let x = d.x - 5; x < d.x + d.w + 5; x++) { const inner = x >= d.x && x < d.x + d.w && y >= d.y && y < d.y + d.h; if (inner) continue; const lv = (x < d.x ? 0.5 : x >= d.x + d.w ? -0.5 : 0) + (y < d.y ? 0.6 : y >= d.y + d.h ? -0.6 : 0) + K.bayer(x, y) * 0.3; g.fillStyle = M.brass[PX.clamp(Math.round(2 - lv * 1.6), 0, 4)]; g.fillRect(x, y, 1, 1); }
    for (let x = d.x - 4; x < d.x + d.w + 4; x += 8) { K.rivet(g, x, d.y - 4, M.brass[0], M.brass[4]); K.rivet(g, x, d.y + d.h + 2, M.brass[0], M.brass[4]); }
    K.rect(g, d.x, d.y, d.w, d.h, "#120a06");
    plate(g, d.cx, d.y - 20, "FIREBOX");
    /* the regulator's quadrant: a brass sector, notched, SHUT on the left, OPEN on the right */
    const t = Lo.ctl.throttle, tl = R(50);
    for (let a = -165; a <= -25; a += 1) { const q = a * Math.PI / 180; for (let rr = tl - R(10); rr <= tl - R(6); rr++) K.px(g, t.cx + Math.cos(q) * rr, t.cy + Math.sin(q) * rr, a % 10 === 0 ? M.brass[4] : rr === tl - R(10) ? M.brass[3] : M.brass[1]); }
    boss(g, t.cx, t.cy, R(7), M.steel);
    K.text3(g, "0", Math.round(t.cx - tl + 2), Math.round(t.cy - R(14)), M.brass[1]);
    plate(g, t.cx, t.cy + R(10), "THROTTLE");
    /* the reverser's quadrant plate, by the driver's feet */
    const rv = Lo.ctl.reverser, rl = Math.min(R(118), rv.h - 14);
    for (let a = -118; a <= -62; a += 0.25) { const q = a * Math.PI / 180; for (let rr = rl - R(28); rr <= rl - R(10); rr++) { const edge = rr === rl - R(28) || rr === rl - R(10); K.px(g, rv.cx + Math.cos(q) * rr, rv.cy + Math.sin(q) * rr, edge ? INK : rr > rl - R(13) ? M.steel[1] : M.steel[2]); } }
    for (let a = -116; a <= -64; a += 4) { const q = a * Math.PI / 180; K.px(g, rv.cx + Math.cos(q) * (rl - R(11)), rv.cy + Math.sin(q) * (rl - R(11)), M.steel[4]); }
    for (const s2 of [-1, 0, 1]) { const q = (-90 + s2 * 20) * Math.PI / 180; K.rect(g, rv.cx + Math.cos(q) * (rl - R(19)) - 2, rv.cy + Math.sin(q) * (rl - R(19)) - 3, 5, 6, INK); K.text3(g, s2 < 0 ? "B" : s2 > 0 ? "F" : "M", Math.round(rv.cx + Math.cos(q) * (rl - R(34)) - 1), Math.round(rv.cy + Math.sin(q) * (rl - R(34)) - 2), M.brass[1]); }
    plate(g, rv.cx + Math.round(52 * u), Y(318), "REVERSER");
    /* the vacuum brake on the cab side: its gauge above, the ejector body and handle's boss */
    const b = Lo.ctl.brake;
    boss(g, b.cx, b.cy, R(12), M.brass);
    boss(g, b.cx, b.cy, R(5), M.steel);
    pipe(g, [[b.cx + R(10), b.cy + R(6)], [b.cx + R(26), b.cy + R(20)], [b.cx + R(26), H]], R(3), M.steel);
    plate(g, b.cx, b.y + b.h - 4, "BRAKE");
    /* the driver's side: a tip-up wooden seat, a shelf with an oil can and the rule book */
    { const sx0 = X(602), sy0 = Y(300), sw = Math.round(52 * u);
      void sx0; void sy0; void sw;
      const shy = Y(192), shx = X(306);
      {
        K.rect(g, shx - 22, shy, 46, 4, INK); K.rect(g, shx - 21, shy, 44, 3, M.wood[2]);
        /* the oil can: a brass body, a long spout */
        boss(g, shx - 8, shy - 7, 7, M.copper); K.rect(g, shx - 14, shy - 6, 13, 6, M.copper[2]); K.line(g, shx - 2, shy - 9, shx + 12, shy - 22, M.brass[2], 2);
        K.rect(g, shx + 6, shy - 12, 12, 12, "#5a1a12"); K.rect(g, shx + 7, shy - 11, 10, 1, "#8a2a1c"); K.rect(g, shx + 7, shy - 12, 1, 12, "#e9e4d8");
      }
    }
    /* the fire irons hanging by the coal: the rake and the dart */
    { const fx = X(240), fy = Y(208);
      K.line(g, fx, fy, fx + 10, fy + 70, INK, 4); K.line(g, fx, fy, fx + 10, fy + 70, M.iron[1], 2);
      K.line(g, fx + 14, fy - 4, fx + 30, fy + 66, INK, 4); K.line(g, fx + 14, fy - 4, fx + 30, fy + 66, M.iron[1], 2);
      K.ring(g, fx, fy - 4, 4, M.iron[1], 2); K.ring(g, fx + 14, fy - 8, 4, M.iron[1], 2); K.rect(g, fx - 2, fy - 12, 32, 3, M.iron[2]); }
    /* the points repeater: a brass box, a glass, three lamps for the blasts */
    const pb = Lo.pts;
    K.rect(g, pb.x - 3, pb.y - 3, pb.w + 6, pb.h + 6, INK);
    boss(g, pb.x + pb.w / 2, pb.y + pb.h / 2, 0, M.brass);
    for (let y = pb.y - 2; y < pb.y + pb.h + 2; y++) for (let x = pb.x - 2; x < pb.x + pb.w + 2; x++) { const inner = x >= pb.x && x < pb.x + pb.w && y >= pb.y && y < pb.y + pb.h; if (inner) continue; g.fillStyle = M.brass[(x < pb.x || y < pb.y) ? 1 : 3]; g.fillRect(x, y, 1, 1); }
    K.rect(g, pb.x, pb.y, pb.w, pb.h, "#0d0b08");

    /* the coal: the tender's shovelling plate and the opening onto the heap */
    const sh = Lo.ctl.shovel;
    K.rect(g, sh.x - 4, sh.y - 6, sh.w + 8, H - sh.y + 6, INK);
    K.rect(g, sh.x - 4, sh.y - 6, sh.w + 8, 3, M.steel[2]);
    K.rect(g, sh.x - 4, sh.y - 6, 4, H - sh.y + 6, M.steel[3]); K.rect(g, sh.x + sh.w, sh.y - 6, 4, H - sh.y + 6, M.steel[3]);
    plate(g, sh.x + sh.w / 2, sh.y - 20, "COAL");
    /* the cab roof's boards and its steel rib */
    const wy0 = Y(16);
    for (let y = 0; y < wy0; y++) for (let x = 0; x < W; x++) { const board = Math.floor(x / 24); g.fillStyle = M.wood[x % 24 === 0 ? 4 : K.hash(board, y >> 1, 9) > 0.8 ? 2 : 3]; g.fillRect(x, y, 1, 1); }
    K.rect(g, 0, wy0 - 3, W, 3, M.iron[2]); K.rect(g, 0, wy0 - 3, W, 1, M.iron[1]);
    for (let x = 6; x < W; x += 14) K.rivet(g, x, wy0 - 2, M.iron[0], INK);
    /* the spectacle plate: the cab's front, a sheet of the engine's green from the roof down to the boiler,
       its two windows either side of the firebox, each in a brass frame bolted through, hinged at the top */
    /* D: the backhead, as above */
    for (let y = wy0; y < winH; y++) for (let x = 0; x < W; x++) {
      const nx = (x - D.x) / D.rx, ny = (y - D.y) / D.ry; if (nx * nx + ny * ny <= 1) continue;
      const sheen = Math.sin((x / W) * Math.PI) * 0.5 - (y - wy0) / (winH - wy0) * 0.35 + K.bayer(x, y) * 0.45;
      g.fillStyle = M.paint[PX.clamp(Math.round(2.3 - sheen * 1.3), 1, 4)]; g.fillRect(x, y, 1, 1);
    }
    /* where the plate meets the firebox: an angle iron round it, riveted */
    for (let a = Math.PI * 1.06; a < Math.PI * 1.94; a += 0.01) for (let dr = 0; dr < 3; dr++) K.px(g, D.x + Math.cos(a) * (D.rx + dr), D.y + Math.sin(a) * (D.ry + dr), dr === 2 ? M.paint[0] : M.iron[2]);
    for (let a = Math.PI * 1.1; a < Math.PI * 1.9; a += 0.09) K.rivet(g, Math.round(D.x + Math.cos(a) * (D.rx + 7)), Math.round(D.y + Math.sin(a) * (D.ry + 7)), M.paint[0], INK);
    /* the plate's seams */
    for (const sx of [X(254), X(600)]) { K.rect(g, sx, wy0, 1, winH - wy0, M.paint[4]); K.rect(g, sx + 1, wy0, 1, winH - wy0, M.paint[1]); for (let y = wy0 + 8; y < winH - 4; y += 12) K.rivet(g, sx + 4, y, M.paint[0], INK); }
    for (const sp of Lo.specs) {
      /* the brass frame: a band round the glass, lit on its upper left */
      for (let y = sp.y0 - 6; y <= sp.y1 + 6; y++) for (let x = sp.x0 - 6; x <= sp.x1 + 6; x++) {
        if (inSpec(x, y, sp, 0)) continue;
        if (inSpec(x, y, sp, 4)) { const lv = (x < (sp.x0 + sp.x1) / 2 ? 0.4 : -0.4) + (y < (sp.y0 + sp.y1) / 2 ? 0.5 : -0.5) + K.bayer(x, y) * 0.3; g.fillStyle = M.brass[PX.clamp(Math.round(2 - lv * 1.5), 0, 4)]; g.fillRect(x, y, 1, 1); }
        else if (inSpec(x, y, sp, 5)) { g.fillStyle = INK; g.fillRect(x, y, 1, 1); }
      }
      /* bolts round it */
      const per = [];
      for (let x = sp.x0 + sp.rt; x <= sp.x1 - sp.rt; x += 13) per.push([x, sp.y0 - 9]);
      for (let x = sp.x0 + 6; x <= sp.x1 - 6; x += 13) per.push([x, sp.y1 + 8]);
      for (let y = sp.y0 + sp.rt; y <= sp.y1 - 4; y += 13) { per.push([sp.x0 - 9, y]); per.push([sp.x1 + 8, y]); }
      for (let a = 0; a <= Math.PI / 2; a += Math.PI / 6) { per.push([sp.x0 + sp.rt - Math.cos(a) * (sp.rt + 9), sp.y0 + sp.rt - Math.sin(a) * (sp.rt + 9)]); per.push([sp.x1 - sp.rt + Math.cos(a) * (sp.rt + 9), sp.y0 + sp.rt - Math.sin(a) * (sp.rt + 9)]); }
      for (const [x, y] of per) if (y > wy0 + 1) K.rivet(g, Math.round(x), Math.round(y), M.brass[1], INK);
      /* the hinges at the top: a spectacle swings up to be cleaned */
      for (const hx of [sp.x0 + (sp.x1 - sp.x0) * 0.3, sp.x0 + (sp.x1 - sp.x0) * 0.7]) { K.rect(g, Math.round(hx) - 6, sp.y0 - 8, 12, 4, INK); K.rect(g, Math.round(hx) - 5, sp.y0 - 7, 10, 2, M.brass[2]); K.rect(g, Math.round(hx) - 5, sp.y0 - 7, 10, 1, M.brass[0]); }
    }
    /* the route card, clipped to the plate: the line as a strip map, Velmont at the top, Port Clair at the foot */
    { const { w: cw, h: ch2, x: cx0, y: cy0 } = Lo.card;
      K.rect(g, cx0 + 2, cy0 + 2, cw, ch2, "rgba(0,0,0,.45)");
      for (let y = cy0; y < cy0 + ch2; y++) for (let x = cx0; x < cx0 + cw; x++) { const age = K.vnoise(x / 9, y / 9, 61) * 0.5 + K.bayer(x, y) * 0.2; g.fillStyle = age > 0.55 ? "#d9cba6" : age > 0.3 ? "#e4d8b8" : "#ece2c6"; g.fillRect(x, y, 1, 1); }
      K.rect(g, cx0, cy0, cw, 1, "#c4b48c"); K.rect(g, cx0, cy0 + ch2 - 1, cw, 1, "#a8986e"); K.rect(g, cx0 + cw - 1, cy0, 1, ch2, "#b4a47a");
      /* the corner turned down */
      K.poly(g, [[cx0 + cw - 9, cy0 + ch2], [cx0 + cw, cy0 + ch2 - 9], [cx0 + cw, cy0 + ch2]], M.paint[2]); K.poly(g, [[cx0 + cw - 9, cy0 + ch2], [cx0 + cw, cy0 + ch2 - 9], [cx0 + cw - 9, cy0 + ch2 - 9]], "#c9b88e");
      K.text5(g, "THE LINE", cx0 + 6, cy0 + 6, "#7a1f14");
      K.rect(g, cx0 + 6, cy0 + 14, cw - 12, 1, "#7a1f14");
      /* the railway, drawn small: the coast and the rivers faint, the lines in ink, the stations as dots */
      const mp = Lo.card.map, mx = v => mp.x + v * mp.k, my = v => mp.y + v * mp.k;
      for (let i = 0; i < L.COAST.length - 1; i++) { const [x0, y0] = L.COAST[i], [x1, y1] = L.COAST[i + 1]; K.line(g, mx(x0), PX.clamp(my(y0), mp.y, mp.y + mp.h), mx(x1), PX.clamp(my(y1), mp.y, mp.y + mp.h), "#8fa6b8"); }
      for (let y = mp.y; y < mp.y + mp.h; y += 3) K.rect(g, mp.x, y, 2, 1, "#a8b8c4");
      for (const r of L.RIVERS) for (let i = 0; i < r.pts.length - 1; i++) { const [x0, y0] = r.pts[i], [x1, y1] = r.pts[i + 1]; K.line(g, mx(x0), PX.clamp(my(y0), mp.y, mp.y + mp.h), mx(x1), PX.clamp(my(y1), mp.y, mp.y + mp.h), "#7d9ab0"); }
      for (const e of L.edges) { const A = L.nodes[e.a], B = L.nodes[e.b], wolf = A.kind === "wolf" || B.kind === "wolf"; K.line(g, mx(A.x), my(A.y), mx(B.x), my(B.y), wolf ? "#a07060" : "#2a2620"); }
      for (const N of L.nodes) {
        const x = Math.round(mx(N.x)), y = Math.round(my(N.y));
        if (N.final) { K.rect(g, x - 1, y - 1, 3, 3, "#b52c1b"); continue; }
        if (N.kind === "st") { K.rect(g, x - 1, y - 1, 3, 3, "#2a2620"); K.px(g, x, y, "#ece2c6"); }
        if (N.start) K.rect(g, x - 1, y - 1, 3, 3, "#2a2620");
      }
      /* the two ends, named in pencil */
      K.text5(g, "PC", Math.round(mx(L.node("portclair").x)) - 4, Math.round(my(L.node("portclair").y)) + 4, "#7a1f14");
      K.text5(g, "V", Math.round(mx(L.node("velmont").x)) - 2, Math.round(my(L.node("velmont").y)) + 4, "#2a2620");
      /* the brass clip holding it */
      const kx = cx0 + Math.round(cw / 2);
      K.rect(g, kx - 12, cy0 - 5, 24, 9, INK); K.rect(g, kx - 11, cy0 - 4, 22, 7, M.brass[2]); K.rect(g, kx - 11, cy0 - 4, 22, 2, M.brass[0]); K.rect(g, kx - 11, cy0 + 2, 22, 1, M.brass[3]);
      K.rivet(g, kx - 1, cy0 - 1, M.brass[0], M.brass[4]);
    }
    /* the fire extinguisher on its bracket: a red cylinder, brass head and plunger, its hose looped down */
    { const ex = X(52), ey = Y(54), ew = Math.max(10, Math.round(14 * u)), eh = 54;
      K.rect(g, ex - 3, ey - 2, ew + 6, eh + 8, "rgba(0,0,0,.35)");
      for (let y = ey; y < ey + eh; y++) for (let x = ex; x < ex + ew; x++) {
        const k = (x - ex) / (ew - 1), lv = Math.cos((k - 0.32) * Math.PI) + K.bayer(x, y) * 0.25 - (y - ey) / eh * 0.25;
        g.fillStyle = ["#ff8a6a", "#e2402a", "#b52c1b", "#7d1c11", "#4c100a"][PX.clamp(Math.round(3 - lv * 2.4), 0, 4)]; g.fillRect(x, y, 1, 1);
      }
      for (let x = ex; x < ex + ew; x++) { K.px(g, x, ey, INK); K.px(g, x, ey + eh, INK); }
      /* a rounded shoulder and base */
      K.rect(g, ex + 1, ey - 3, ew - 2, 3, "#b52c1b"); K.rect(g, ex + 2, ey - 4, ew - 4, 1, "#e2402a");
      /* the label band */
      K.rect(g, ex, ey + 18, ew, 12, "#e9e0c4"); K.rect(g, ex, ey + 18, ew, 1, "#b8ac8c"); K.rect(g, ex, ey + 29, ew, 1, "#b8ac8c");
      K.text3(g, "F", ex + Math.round(ew / 2) - 1, ey + 21, "#7a1f14");
      /* the brass head and the plunger knob */
      boss(g, ex + Math.round(ew / 2), ey - 7, 4, M.brass);
      K.rect(g, ex + Math.round(ew / 2) - 1, ey - 14, 3, 6, M.brass[2]); boss(g, ex + Math.round(ew / 2), ey - 15, 2, M.brass);
      /* the hose from the head, looped and clipped */
      K.line(g, ex + ew - 1, ey - 6, ex + ew + 5, ey + 8, INK, 3); K.line(g, ex + ew + 5, ey + 8, ex + ew + 4, ey + 34, INK, 3); K.line(g, ex + ew + 4, ey + 34, ex + ew - 1, ey + 40, INK, 3);
      K.line(g, ex + ew - 1, ey - 6, ex + ew + 5, ey + 8, "#2e2a26", 1); K.line(g, ex + ew + 5, ey + 8, ex + ew + 4, ey + 34, "#2e2a26", 1);
      K.rect(g, ex + ew - 2, ey + 39, 4, 4, M.brass[2]);
      /* the bracket's two straps, bolted to the plate */
      for (const sy2 of [ey + 8, ey + eh - 10]) { K.rect(g, ex - 3, sy2, ew + 6, 4, INK); K.rect(g, ex - 2, sy2 + 1, ew + 4, 2, M.steel[1]); K.rivet(g, ex - 2, sy2 + 1, M.steel[0], INK); K.rivet(g, ex + ew, sy2 + 1, M.steel[0], INK); }
    }
    /* grab rails on the plate's outer edges */
    for (const x of [X(8), X(626)]) { K.rect(g, x, wy0 + 24, 3, winH - wy0 - 40, M.brass[2]); K.rect(g, x, wy0 + 24, 1, winH - wy0 - 40, M.brass[0]); }
    /* the vacuum gauge's lamp: a small hood over the gauge, its tube showing under the lip */
    { const G = Lo.gauges.vac, hw = G.r * 2 + 6, hx0 = G.x - hw / 2, hy = G.y - G.r - 9;
      K.rect(g, hx0 - 1, hy - 1, hw + 2, 6, INK); K.rect(g, hx0, hy, hw, 3, M.iron[2]); K.rect(g, hx0, hy, hw, 1, M.iron[1]);
      K.rect(g, hx0 + 2, hy + 3, hw - 4, 1, "#ffe6a8"); }
    /* the cab clock: a brass drum on four lugs, its lamp hooded over it like the vacuum gauge's */
    clockFace(g, Lo.clock);
    { const G = Lo.clock, hw = G.r * 2 - 4, hx0 = G.x - hw / 2, hy = G.y - G.r - 12;
      K.rect(g, hx0 - 1, hy - 1, hw + 2, 6, INK); K.rect(g, hx0, hy, hw, 3, M.iron[2]); K.rect(g, hx0, hy, hw, 1, M.iron[1]);
      K.rect(g, hx0 + 2, hy + 3, hw - 4, 1, "#ffe6a8"); }
    /* the window: cut out, so the country shows through; the backhead's top and the lamp stay in front of it */
    cutWindow(c, Lo);
    c.plates = plates.slice();
    return c;
  }
  /* the painted cab in one light: the base is the night and the lamps; each other layer is one light alone, on
     black, for adding over it as strongly as that light is burning */
  const LAYERS = {
    base: Lo => [Lo.amb, Lo.lamps],
    dawn: Lo => [Lo.dawn, []],
    leak: Lo => [[0, 0, 0], [Lo.leak]],
    fire: Lo => [[0, 0, 0], [Lo.fire]],
  };
  const cabLayer = (Lo, k) => K.get(`cab:${Lo.W}x${Lo.H}:${k}`, () => {
    const raw = K.get(`cab:${Lo.W}x${Lo.H}:raw`, () => paintCab(Lo)), c = K.relight(K.copy(raw), ...LAYERS[k](Lo));
    /* the plates' raised letters are polished: they keep a sheen of the lamp however dark their corner of the cab */
    if (k === "base") { const g = c.getContext("2d"); for (const [t, x, y] of raw.plates) K.text5(g, t, x, y, SHEEN); }
    return c;
  });
  /* a spectacle's shape: a rounded box, its top corners rounder than its bottom ones; grown by e pixels */
  function inSpec(x, y, sp, e) {
    const x0 = sp.x0 - e, x1 = sp.x1 + e, y0 = sp.y0 - e, y1 = sp.y1 + e;
    if (x < x0 || x > x1 || y < y0 || y > y1) return false;
    const rt = sp.rt + e, rb = sp.rb + e;
    const cx = x < x0 + rt ? x0 + rt : x > x1 - rt ? x1 - rt : x;
    if (y < y0 + rt && (x < x0 + rt || x > x1 - rt)) return Math.hypot(x - cx, y - (y0 + rt)) <= rt;
    const cb = x < x0 + rb ? x0 + rb : x > x1 - rb ? x1 - rb : x;
    if (y > y1 - rb && (x < x0 + rb || x > x1 - rb)) return Math.hypot(x - cb, y - (y1 - rb)) <= rb;
    return true;
  }
  /* the glass: cut out of the painted cab, so the country shows through */
  function cutWindow(c, Lo) {
    const g = c.getContext("2d"), { W, winH } = Lo, img = g.getImageData(0, 0, W, winH), d = img.data;
    for (const sp of Lo.specs) for (let y = sp.y0; y <= sp.y1; y++) for (let x = sp.x0; x <= sp.x1; x++) if (inSpec(x, y, sp, 0)) d[(y * W + x) * 4 + 3] = 0;
    g.putImageData(img, 0, 0);
  }
  /* the glass itself, over the view: old, a little streaked and grimed at its edges */
  const glass = Lo => K.get(`glass:${Lo.W}x${Lo.H}`, () => {
    const c = K.mk(Lo.W, Lo.winH), g = c.getContext("2d");
    for (const sp of Lo.specs) for (let y = sp.y0; y <= sp.y1; y++) for (let x = sp.x0; x <= sp.x1; x++) {
      if (!inSpec(x, y, sp, 0)) continue;
      const edge = Math.min(x - sp.x0, sp.x1 - x, y - sp.y0, sp.y1 - y), streak = ((x + y * 0.9) % 71) < 1.2 && (y - sp.y0) < (sp.y1 - sp.y0) * 0.35 && (x - sp.x0) < (sp.x1 - sp.x0) * 0.4;
      let a = edge < 8 ? (8 - edge) / 8 * 0.22 : 0, col = "20,24,30";
      if (streak) { a = Math.max(a, 0.035); col = "220,230,255"; }
      if (y > sp.y1 - 6 && K.hash(x, y, 3) > 0.6) { a = 0.25; col = "40,34,28"; }
      if (a > 0) { g.fillStyle = `rgba(${col},${a.toFixed(3)})`; g.fillRect(x, y, 1, 1); }
    }
    return c;
  });
  /* a gauge's face: cream, a ring of ticks and figures, the red line (its name is on a plate under it) */
  function face(g, G, max, red, step) {
    const { x, y, r } = G;
    bezel(g, x, y, r, Math.max(3, Math.round(r * 0.16)));
    const fr = r - Math.max(3, Math.round(r * 0.16));
    for (let j = -fr; j <= fr; j++) for (let i = -fr; i <= fr; i++) {
      const d = Math.hypot(i, j); if (d > fr) continue;
      g.fillStyle = K.mix("#f4ecd4", "#cfc3a2", Math.pow(d / fr, 3) * 0.8 + (j / fr) * 0.08); g.fillRect(x + i, y + j, 1, 1);
    }
    const ang = f => (-225 + 270 * f) * Math.PI / 180;
    if (red) for (let a = ang(red / max); a <= ang(1) + 0.001; a += 0.02) for (let rr = fr - 4; rr <= fr - 2; rr++) K.px(g, x + Math.cos(a) * rr, y + Math.sin(a) * rr, "#c0311c");
    const minor = step ? max / (step / 4) : 20;
    for (let i = 0; i <= minor; i++) {
      const f = i / minor, a = ang(f), big = i % 4 === 0, r0 = fr - (big ? 5 : 3), r1 = fr - 2;
      K.line(g, x + Math.cos(a) * r0, y + Math.sin(a) * r0, x + Math.cos(a) * r1, y + Math.sin(a) * r1, red && f * max >= red ? "#a52a18" : "#2a241c");
      if (big && step && r >= 20) { const v = String(Math.round(f * max / (max >= 300 ? 100 : 1))); K.text3(g, v, Math.round(x + Math.cos(a) * (fr - 9) - K.text3w(v) / 2), Math.round(y + Math.sin(a) * (fr - 9) - 2), "#3a3226"); }
    }
  }
  /* the clock's case and face: a brass drum on a flange screwed to the plate, a cream face with the hours ticked round it,
     and the red line from first light to dawn, where the gauges keep theirs, so the hour hand coming into it says
     the night is running out */
  const clockAng = h => (h / 12 * 360 - 90) * Math.PI / 180;
  function clockFace(g, G) {
    const { x, y, r } = G, rim = Math.max(3, Math.round(r * 0.2)), fr = r - rim;
    K.disc(g, x, y, r + 4, r + 4, INK);
    boss(g, x, y, r + 3, M.brass, 0, 0.25);
    for (const q of [45, 135, 225, 315]) { const a = q * Math.PI / 180; K.rivet(g, Math.round(x + Math.cos(a) * (r + 2) - 1), Math.round(y + Math.sin(a) * (r + 2) - 1), M.brass[0], M.brass[4]); }
    K.ring(g, x, y, r + 1, INK, 1);
    bezel(g, x, y, r, rim);
    for (let j = -fr; j <= fr; j++) for (let i = -fr; i <= fr; i++) {
      const d = Math.hypot(i, j); if (d > fr) continue;
      g.fillStyle = K.mix("#f4ecd4", "#cfc3a2", Math.pow(d / fr, 3) * 0.8 + (j / fr) * 0.08); g.fillRect(x + i, y + j, 1, 1);
    }
    const h0 = (C.FIRST_LIGHT / 60) % 12, h1 = (C.DAWN / 60) % 12;
    for (let a = clockAng(h0); a <= clockAng(h1) + 0.001; a += 0.02) for (let rr = fr - 2; rr <= fr - 1; rr++) K.px(g, x + Math.cos(a) * rr, y + Math.sin(a) * rr, "#c0311c");
    for (let h = 1; h < 12; h++) {
      const a = clockAng(h), big = h % 3 === 0, r0 = fr - (big ? 5 : 3), r1 = fr - 1;
      K.line(g, x + Math.cos(a) * r0, y + Math.sin(a) * r0, x + Math.cos(a) * r1, y + Math.sin(a) * r1, h >= h0 && h <= h1 ? "#a52a18" : "#2a241c");
    }
    /* twelve is marked twice, so the face reads the right way up at a glance */
    K.line(g, x - 1, y - fr + 1, x - 1, y - fr + 5, "#2a241c"); K.line(g, x + 1, y - fr + 1, x + 1, y - fr + 5, "#2a241c");
  }

  /* ---- the boiler through the window: ray-traced once for this size, from the driver's eye ----
   * The barrel is a cylinder along the line (metres: centre 2.75 up, 0.8 round, from the backhead at
   * 1.4 to the smokebox front at 9.2), banded in brass; the dome on top, the safety valves and the
   * whistle by the cab, the handrail along its flank, the chimney at the front. Lit by the moon from
   * ahead and to the right, a little by the cab's lamp from behind. */
  function paintBoiler(Lo, cam) {
    const { W, winH } = Lo, c = K.mk(W, winH), g = c.getContext("2d"), img = g.createImageData(W, winH), d = img.data;
    const ox = cam.x, oy = cam.h, Z0 = cam.zb, Z1 = Z0 + 8.4, ZS = Z1 - 1.2;
    const LM = (() => { const v = [0.55, 0.62, 0.56], n = Math.hypot(...v); return v.map(q => q / n); })();
    const PAINT = M.paint.map(K.rgb), BRASS = M.brass.map(K.rgb), IRON = M.iron.map(K.rgb), COP = M.copper.map(K.rgb), STEEL = M.steel.map(K.rgb), RED = M.wolfRed.map(K.rgb);
    const BANDS = [0.55, 1.4, 3.1, 5.0, 6.7].map(b => b + Z0);
    /* the parts: each returns [t, normal, material] for a ray, or null */
    const cylZ = (dx, dy) => {
      /* x^2 + (y - YC)^2 = R0^2 along z: (ox + t dx)^2 + (oy - YC + t dy)^2 = R0^2 */
      const a = dx * dx + dy * dy, b = 2 * (ox * dx + (oy - YC) * dy), cc = ox * ox + (oy - YC) * (oy - YC) - R0 * R0, disc = b * b - 4 * a * cc;
      if (disc < 0) return null;
      const t = (-b - Math.sqrt(disc)) / (2 * a);
      if (t < Z0 || t > Z1) return null;
      const x = ox + t * dx, y = oy + t * dy;
      const band = BANDS.some(z => Math.abs(t - z) < 0.07), smoke = t > ZS;
      return { t, n: [x / R0, (y - YC) / R0, 0], m: smoke ? "iron" : band ? "brass" : "paint", x, y };
    };
    const sphere = (dx, dy, cx, cy, cz, r) => {
      const px = ox - cx, py = oy - cy, pz = -cz, a = dx * dx + dy * dy + 1, b = 2 * (px * dx + py * dy + pz), cc = px * px + py * py + pz * pz - r * r, disc = b * b - 4 * a * cc;
      if (disc < 0) return null;
      const t = (-b - Math.sqrt(disc)) / (2 * a), x = ox + t * dx, y = oy + t * dy, z = t;
      if (y < cy) return null;
      return { t, n: [(x - cx) / r, (y - cy) / r, (z - cz) / r] };
    };
    /* an upright cylinder at (cx, cz), radius r, from y0 to y1 */
    const cylY = (dx, dy, cx, cz, r, y0, y1) => {
      const px = ox - cx, pz = -cz, a = dx * dx + 1, b = 2 * (px * dx + pz), cc = px * px + pz * pz - r * r, disc = b * b - 4 * a * cc;
      if (disc < 0) return null;
      const t = (-b - Math.sqrt(disc)) / (2 * a), y = oy + t * dy;
      if (y < y0 || y > y1) {
        /* its top: a flat cap */
        if (dy < 0) { const tc = (y1 - oy) / dy, x = ox + tc * dx, z = tc; if ((x - cx) ** 2 + (z - cz) ** 2 <= r * r) return { t: tc, n: [0, 1, 0], top: true }; }
        return null;
      }
      const x = ox + t * dx, z = t;
      return { t, n: [(x - cx) / r, 0, (z - cz) / r], y };
    };
    const TOP = YC + R0;
    /* an axis-aligned box: the firebox, the running boards and their valances, the buffer beam */
    const box = (dx, dy, x0, x1, y0, y1, z0, z1) => {
      let tmin = -Infinity, tmax = Infinity, n = null;
      for (const [o, dd, a, b, ax] of [[ox, dx, x0, x1, 0], [oy, dy, y0, y1, 1], [0, 1, z0, z1, 2]]) {
        if (Math.abs(dd) < 1e-9) { if (o < a || o > b) return null; continue; }
        let t0 = (a - o) / dd, t1 = (b - o) / dd, sgn = -1;
        if (t0 > t1) { [t0, t1] = [t1, t0]; sgn = 1; }
        if (t0 > tmin) { tmin = t0; n = [0, 0, 0]; n[ax] = sgn; }
        if (t1 < tmax) tmax = t1;
        if (tmin > tmax) return null;
      }
      if (tmin <= 0.05 || !n) return null;
      return { t: tmin, n, x: ox + tmin * dx, y: oy + tmin * dy, z: tmin };
    };
    /* a splasher over a driving wheel: half a drum, its axis across the engine */
    const splasher = (dx, dy, xa, xb, cz, r, cy) => {
      const a = dy * dy + 1, b = 2 * ((oy - cy) * dy - cz), cc = (oy - cy) * (oy - cy) + cz * cz - r * r, disc = b * b - 4 * a * cc;
      let best2 = null;
      if (disc >= 0) { const t = (-b - Math.sqrt(disc)) / (2 * a), x = ox + t * dx, y = oy + t * dy; if (t > 0 && x >= xa && x <= xb && y >= cy) best2 = { t, n: [0, (y - cy) / r, (t - cz) / r], x, y, z: t }; }
      /* its flat face toward the middle of the engine, and the outer one */
      for (const xf of [xa, xb]) { if (Math.abs(dx) < 1e-9) continue; const t = (xf - ox) / dx; if (t <= 0) continue; const y = oy + t * dy, z = t; if (y >= cy && (y - cy) ** 2 + (z - cz) ** 2 <= r * r && (!best2 || t < best2.t)) best2 = { t, n: [xf === xa ? -1 : 1, 0, 0], x: xf, y, z, face: true }; }
      return best2;
    };
    /* an outside cylinder: a drum along the line, low at the front */
    const drum = (dx, dy, cx, cy, r, z0, z1) => {
      const px = ox - cx, py = oy - cy, a = dx * dx + dy * dy, b = 2 * (px * dx + py * dy), cc = px * px + py * py - r * r, disc = b * b - 4 * a * cc;
      if (disc < 0) return null;
      const t = (-b - Math.sqrt(disc)) / (2 * a); if (t < z0 || t > z1) return null;
      const x = ox + t * dx, y = oy + t * dy; return { t, n: [(x - cx) / r, (y - cy) / r, 0], x, y, z: t };
    };
    const RB = 1.45, RW = 1.38;
    for (let sy = 0; sy < winH; sy++) for (let sx = 0; sx < W; sx++) {
      const dx = (sx + 0.5 - cam.cx) / cam.f, dy = -(sy + 0.5 - cam.hor) / cam.f;
      let best = cylZ(dx, dy);
      const tryPart = (h, m) => { if (h && (!best || h.t < best.t)) { h.m = m; best = h; } };
      tryPart(sphere(dx, dy, 0, TOP - 0.12, Z0 + 3.5, 0.46), "brass");                       /* the dome */
      const ch = cylY(dx, dy, 0, Z1 - 0.5, 0.27, TOP - 0.2, TOP + 0.62); if (ch) { ch.m = ch.y > TOP + 0.52 || ch.top ? "copper" : "iron"; tryPart(ch, ch.m); }
      const lip = cylY(dx, dy, 0, Z1 - 0.5, 0.33, TOP + 0.5, TOP + 0.62); tryPart(lip, "copper");
      for (const vx of [-0.13, 0.13]) tryPart(cylY(dx, dy, vx, Z0 + 0.35, 0.06, TOP - 0.1, TOP + 0.2), "brass");   /* the safety valves */
      tryPart(cylY(dx, dy, 0.36, Z0 + 0.2, 0.035, TOP - 0.25, TOP + 0.12), "brass");                              /* the whistle */
      tryPart(cylY(dx, dy, 0.36, Z0 + 0.2, 0.07, TOP + 0.04, TOP + 0.16), "brass");
      /* the handrail: a rod along the right flank */
      { const hy = YC + 0.42, hx = 0.86, t = (hx - ox) / dx; if (dx < 0 && t > Z0 + 0.4 && t < Z1 - 0.7) { const y = oy + t * dy; if (Math.abs(y - hy) < 0.035) tryPart({ t, n: [0.3, 0.9, 0] }, "brass"); } }
      /* the firebox closing the boiler's back, square-topped, down to the running boards */
      { const h = box(dx, dy, -R0, R0, RB, YC, Z0, Z0 + 0.55); if (h) tryPart(h, "paint"); }
      /* the running boards either side, their valances with a lining stripe, the buffer beam in red */
      { const h = box(dx, dy, -RW, RW, RB - 0.06, RB, Z0, Z1 + 0.95); if (h) { h.m = h.n[1] > 0.5 ? ((Math.floor(h.x * 14) + Math.floor(h.z * 14)) % 3 === 0 ? "plateHi" : "plate") : "paint"; tryPart(h, h.m); } }
      { const h = box(dx, dy, -RW, RW, RB - 0.34, RB - 0.06, Z0, Z1 + 0.95); if (h) { h.m = Math.abs(h.y - (RB - 0.2)) < 0.025 ? "lining" : "paint"; tryPart(h, h.m); } }
      { const h = box(dx, dy, -RW - 0.02, RW + 0.02, RB - 0.5, RB + 0.02, Z1 + 0.95, Z1 + 1.2); if (h) { h.m = "beam"; tryPart(h, "beam"); } }
      for (const sx of [-1, 1]) {
        for (const cz of [1.0, 3.05, 5.1].map(z => z + Z0)) { const h = splasher(dx, dy, sx > 0 ? 0.86 : -1.3, sx > 0 ? 1.3 : -0.86, cz, 0.86, RB); if (h) { h.m = h.face ? "paint" : Math.abs(Math.hypot(h.y - RB, h.z - cz) - 0.86) < 0.04 && h.face ? "brass" : "paint"; if (!h.face && (Math.abs(h.x - (sx > 0 ? 1.3 : -1.3)) < 0.035)) h.m = "brass"; tryPart(h, h.m); } }
        tryPart(drum(dx, dy, sx * 1.12, RB - 0.38, 0.34, Z1 - 1.1, Z1 + 0.5), "iron");
      }
      /* the smokebox's saddle and the frames under the barrel, dark */
      { const h = box(dx, dy, -0.62, 0.62, RB, YC, Z0 + 0.55, Z1); if (h) tryPart(h, "iron"); }
      if (!best) continue;
      const n = best.n, nn = Math.hypot(...n) || 1, nx = n[0] / nn, ny = n[1] / nn, nz = n[2] / nn;
      const lam = Math.max(0, nx * LM[0] + ny * LM[1] - nz * LM[2]);
      /* the cab lamp behind and to the right, warm, faint */
      const cab = Math.max(0, nx * 0.4 + ny * 0.5 + nz * -0.2) * 0.25;
      const shiny = best.m === "brass" || best.m === "copper";
      const rimLight = Math.pow(Math.max(0, 1 - Math.abs(nx * (dx) + ny * (dy) + nz)), 3) * (shiny ? 0 : 0.25);
      const spec = shiny ? Math.pow(Math.max(0, ny * 0.8 + nx * 0.4), 14) * 1.4 : Math.pow(Math.max(0, ny * 0.85 + nx * 0.35), 30) * 0.5;
      const v = 0.18 + lam * 0.82 + cab + rimLight + K.bayer(sx, sy) * 0.12;
      const ramp = best.m === "brass" || best.m === "lining" ? BRASS : best.m === "copper" ? COP : best.m === "iron" ? IRON : best.m === "plate" ? IRON : best.m === "plateHi" ? STEEL : best.m === "beam" ? RED : PAINT;
      const q = ramp[PX.clamp(Math.round(4.2 - v * 3.6 - spec * 2), 0, 4)];
      /* night: the moonlight is cold */
      const tint = [0.62 + cab, 0.66 + cab * 0.8, 0.82 + cab * 0.5];
      const o = (sy * W + sx) * 4;
      d[o] = Math.min(255, q[0] * tint[0] + spec * 70); d[o + 1] = Math.min(255, q[1] * tint[1] + spec * 70); d[o + 2] = Math.min(255, q[2] * tint[2] + spec * 80); d[o + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    /* where the smoke and steam come from */
    const P = World.P;
    const chp = P(cam, 0, TOP + 0.64, Z1 - 0.5), vt = P(cam, 0, TOP + 0.22, Z0 + 0.35), wt = P(cam, 0.36, TOP + 0.18, Z0 + 0.2), dm = P(cam, 0, TOP + 0.36, Z0 + 3.5);
    c.pts = { chimney: { x: chp.x, y: chp.y }, valve: { x: vt.x, y: vt.y }, whistle: { x: wt.x, y: wt.y }, dome: { x: dm.x, y: dm.y } };
    return c;
  }

  /* ---- what moves ---- */
  function needle(g, G, v, max, col = "#151110") {
    const ang = f => (-225 + 270 * f) * Math.PI / 180, a = ang(PX.clamp(v / max, 0, 1.04)), fr = G.r - Math.max(3, Math.round(G.r * 0.16));
    const tx = G.x + Math.cos(a) * (fr - 3), ty = G.y + Math.sin(a) * (fr - 3), bx = G.x - Math.cos(a) * 4, by = G.y - Math.sin(a) * 4;
    K.line(g, bx + 1, by + 1, tx + 1, ty + 1, "rgba(0,0,0,.25)");
    K.line(g, bx, by, tx, ty, col, G.r >= 20 ? 2 : 1);
    K.line(g, G.x + Math.cos(a) * (fr * 0.6), G.y + Math.sin(a) * (fr * 0.6), tx, ty, "#b52c1b");
    boss(g, G.x, G.y, Math.max(2, Math.round(G.r * 0.12)), M.brass);
    /* the glass over it: a curved glint */
    for (let a2 = -2.5; a2 < -1.6; a2 += 0.05) K.px(g, G.x + Math.cos(a2) * (fr - 3), G.y + Math.sin(a2) * (fr - 3), "rgba(255,255,255,.55)");
  }
  function lever(g, x0, y0, x1, y1, w, m, handle) {
    const L0 = M.steel.map(c => lit(c, m));
    K.line(g, x0, y0, x1, y1, INK, w + 2);
    K.line(g, x0, y0, x1, y1, L0[2], w);
    K.line(g, x0 - 1, y0, x1 - 1, y1, L0[0], 1);
    if (handle) { const H0 = M.wood.map(c => lit(c, m)); K.disc(g, x1, y1, w + 3, w + 3, INK); K.disc(g, x1, y1, w + 2, w + 2, H0[2]); K.disc(g, x1 - 1, y1 - 1, w, w, H0[1]); K.px(g, x1 - 2, y1 - 2, H0[0]); }
  }
  function chain(g, x, y0, y1, m) {
    const c0 = lit(M.steel[1], m), c1 = lit(M.steel[3], m);
    for (let y = y0; y < y1; y += 3) { K.rect(g, x - 1, y, 3, 2, c1); K.px(g, x, y, c0); }
  }
  /* a paw on the controls: tawny, the pads pink, the sleeve of the overalls */
  const paw = () => K.get("paw2", () => {
    const c = K.mk(30, 34), g = c.getContext("2d"), T = M.puma;
    K.poly(g, [[8, 20], [24, 20], [28, 34], [5, 34]], "#3d5378"); K.rect(g, 7, 20, 18, 3, "#4f6a96"); K.rect(g, 8, 28, 16, 1, "#2c3d5c");
    K.disc(g, 15, 15, 9, 8, T[2]);
    for (let y = 7; y < 24; y++) for (let x = 5; x < 26; x++) { const dx = (x - 15) / 9, dy = (y - 15) / 8; if (dx * dx + dy * dy > 1) continue; const lv = -dx * 0.5 - dy * 0.6 + K.bayer(x, y) * 0.4 + (K.hash(x >> 1, y, 4) - 0.5) * 0.4; K.px(g, x, y, T[PX.clamp(Math.round(2 - lv * 1.6), 0, 4)]); }
    for (const [x, y] of [[6, 7], [11, 3], [18, 3], [23, 7]]) { K.disc(g, x, y, 3, 3, T[2]); K.disc(g, x - 1, y - 1, 1, 1, T[1]); K.px(g, x, y + 2, "#c98a7c"); }
    K.disc(g, 15, 14, 4, 3, "#d9978a"); K.disc(g, 14, 13, 2, 1, "#eab0a2");
    return K.outline(c, INK);
  });

  function moving(g, S, Lo, now, lv) {
    /* what the driver works is kept just in sight in the dark */
    const c = S.cab, m = (x, y) => lightAt(Lo, x, y, lv).map(v => Math.max(0.34, v));
    /* the firebox: the fire on its bars, flames, the butterfly doors sliding apart */
    const d = Lo.ctl.door, F = M.fire, heat = PX.clamp(c.grate / 6, 0.12, 1), open = c.door ? 1 : 0;
    const gap = Math.round(d.w / 2 * open);
    if (gap > 0) {
      /* the firebox: the brick arch overhead, flames licking up from the bed, the bed of coal white-hot in its cracks */
      const t0 = now / 1000;
      for (let y = d.y; y < d.y + d.h; y++) for (let x = d.cx - gap; x < d.cx + gap; x++) {
        const fx = (x - d.x) / d.w, fy = (y - d.y) / d.h;
        const bed = 0.62 + (K.vnoise(x / 7, 1, 3) - 0.5) * 0.18 - heat * 0.08;
        let col;
        if (fy < 0.16) {
          /* the brick arch, lit from below */
          const brick = ((y - d.y) % 5 === 0) || ((x + ((y - d.y) / 5 | 0) * 4) % 9 === 0);
          const glow = 0.4 + heat * 0.5 + fy * 1.5;
          col = brick ? K.hex([60 * glow, 22 * glow, 10 * glow]) : K.hex([150 * glow, 60 * glow, 30 * glow]);
        } else if (fy > bed) {
          /* lumps of coal, dark at their hearts, burning at their edges */
          const lump = K.vnoise(x / 3.2, y / 2.6, 11), crack = Math.abs(lump - 0.5) < 0.07 + heat * 0.06;
          const ember = K.vnoise(x / 2 + t0 * 0.6, y / 2, 12);
          col = crack ? (ember > 0.55 ? "#fff6c8" : "#ffc04a") : lump > 0.62 ? K.mix("#2a1206", "#a83a10", heat * ember) : K.mix("#1a0a04", "#6a2008", heat * ember * 0.8);
        } else {
          /* the flames: tongues rising from the bed, brightest low and in the middle */
          const up = (bed - fy) / bed, n = K.fbm2(x / 6 + Math.sin(t0 * 2 + y * 0.1) * 0.3, y / 7 + t0 * 3.2, 5);
          const center = 1 - Math.abs(fx - 0.5) * 1.3;
          const v = PX.clamp((n * 1.25 - up * 0.75 + center * 0.25) * (0.55 + heat * 0.6) + K.bayer(x, y) * 0.12, 0, 1);
          col = v > 0.78 ? "#fff3c4" : v > 0.62 ? "#ffd36a" : v > 0.46 ? "#ff9a2e" : v > 0.3 ? "#d8521a" : v > 0.16 ? "#8a2a0c" : "#3a1006";
        }
        K.px(g, x, y, col);
      }
    }
    /* the doors: two steel leaves, each with its handle and air vents */
    for (const side of [-1, 1]) {
      const x0 = side < 0 ? d.x : d.cx + gap, x1 = side < 0 ? d.cx - gap : d.x + d.w;
      if (x1 - x0 < 2) continue;
      /* the leaves face the crew: the glow they leak falls on the floor, not on themselves */
      const S0 = M.iron.map(q => lit(q, lightAt(Lo, d.cx, d.cy, Object.assign({}, lv, { leak: 0 })).map(v => Math.max(0.34, v))));
      for (let y = d.y; y < d.y + d.h; y++) for (let x = x0; x < x1; x++) { const lv = (x - x0) / Math.max(1, x1 - x0) * (side < 0 ? -0.6 : 0.6) - (y - d.y) / d.h * 0.4 + K.bayer(x, y) * 0.4; g.fillStyle = S0[PX.clamp(Math.round(1.6 - lv), 0, 3)]; g.fillRect(x, y, 1, 1); }
      K.rect(g, x0, d.y, x1 - x0, 1, S0[0]); K.rect(g, side < 0 ? x1 - 1 : x0, d.y, 1, d.h, INK);
      for (let y = d.y + 4; y < d.y + d.h - 2; y += 9) { K.rivet(g, x0 + 3, y, S0[0], INK); K.rivet(g, x1 - 5, y, S0[0], INK); }
      /* the draught slits: the fire shows through them */
      for (let i = 0; i < 3; i++) { const sw = x1 - x0 - 16; if (sw < 4) break; const gl = open ? "#1a0c06" : K.mix("#3a1a0a", "#ffb04a", heat * (0.6 + 0.4 * Math.sin(now / 90 + i))); K.rect(g, x0 + 8, d.y + 10 + i * 9, sw, 3, INK); K.rect(g, x0 + 8, d.y + 11 + i * 9, sw, 1, gl); }
      const hx = side < 0 ? x1 - 9 : x0 + 4, mb = m(hx, d.cy); K.rect(g, hx, d.cy - 6, 5, 13, INK); K.rect(g, hx + 1, d.cy - 5, 3, 11, lit(M.brass[1], mb)); K.px(g, hx + 1, d.cy - 5, lit(M.brass[0], mb));
    }
    /* shut, the fire shows as a hot line where the leaves meet and along their foot */
    if (!gap) {
      const hot = K.mix("#3a1406", "#ffb04a", heat * (0.75 + (K.vnoise(now / 120, 5, 31) - 0.5) * 0.4));
      K.rect(g, d.cx - 1, d.y + 2, 2, d.h - 3, INK); K.rect(g, d.cx, d.y + 3, 1, d.h - 5, hot);
      K.rect(g, d.x + 3, d.y + d.h - 1, d.w - 6, 1, hot);
    }
    /* the coal heap, low or high */
    const sh = Lo.ctl.shovel, coal = PX.clamp(c.coal / C.LOCO.coal, 0, 1), heap = Math.round((sh.h - 6) * (0.15 + 0.85 * coal));
    const cm = m(sh.cx, sh.cy), CO = M.coal.map(q => lit(q, cm));
    for (let x = sh.x; x < sh.x + sh.w; x++) {
      const hh = Math.round(heap * (0.82 + 0.18 * Math.sin(x / 9) + (K.hash(x >> 2, 3, 1) - 0.5) * 0.12));
      for (let y = H(Lo) - hh; y < H(Lo); y++) { const k = K.hash(x >> 1, y >> 1, 21), e = K.hash(x >> 2, y >> 2, 22); K.px(g, x, y, k > 0.9 ? CO[0] : e > 0.6 ? CO[1] : k > 0.4 ? CO[2] : CO[3]); }
    }
    /* the shovel: rests on the heap, swings to the door when used */
    const swing = c.shovelT > 0 ? Math.sin((1 - c.shovelT / C.LOCO.shovelGap) * Math.PI) : 0;
    const bx = PX.lerp(sh.cx - 6, d.x + d.w + 14, swing), by = PX.lerp(H(Lo) - heap - 4, d.cy + 4, swing);
    const hx = bx + 46 - swing * 14, hy = by + 30 - swing * 6;
    K.line(g, bx, by, hx, hy, INK, 4); K.line(g, bx, by, hx, hy, lit(M.wood[1], cm), 2);
    K.poly(g, [[bx - 10, by - 6], [bx + 4, by - 9], [bx + 7, by + 3], [bx - 7, by + 6]], lit(M.steel[1], cm));
    K.poly(g, [[bx - 9, by - 5], [bx + 3, by - 8], [bx + 3, by - 6], [bx - 8, by - 3]], lit(M.steel[0], cm));
    if (swing > 0.1) K.rect(g, bx - 5, by - 7, 8, 4, CO[2]);
    /* where the train is, pinned on the card's map */
    { const mp = Lo.card.map, [tx, ty] = L.xy(S), x = Math.round(mp.x + tx * mp.k), y = Math.round(mp.y + ty * mp.k), mc = m(x, y);
      K.rect(g, x - 1, y - 3, 3, 3, lit("#d8382a", mc)); K.px(g, x - 1, y - 3, lit("#ff9a82", mc)); K.rect(g, x, y, 1, 2, lit("#5a5a60", mc)); }
    /* the water in the glass */
    const wg = Lo.glass, lvl = PX.clamp(c.water / C.LOCO.water, 0, 1), wy = Math.round(wg.y + wg.h * (1 - lvl));
    if (lvl > 0) { K.rect(g, wg.x + 1, wy, wg.w - 2, wg.y + wg.h - wy, lvl < 0.2 ? "rgba(220,90,60,.75)" : "rgba(90,170,215,.7)"); K.rect(g, wg.x + 1, wy, wg.w - 2, 1, "#d8f2ff"); }
    K.rect(g, wg.x + 1, wg.y, 1, wg.h, "rgba(255,255,255,.35)");
    /* the needles */
    const G = Lo.gauges;
    needle(g, G.psi, PX.Engine.psi(S), 300);
    needle(g, G.mph, Math.abs(S.tr.v), 80);
    needle(g, G.temp, c.T, 500);
    needle(g, G.vac, c.brake, 1);
    /* the clock's hands: the night's time, the minute hand sweeping, the hour hand creeping toward the red */
    { const G = Lo.clock, fr = G.r - Math.max(3, Math.round(G.r * 0.2)), t = S.t / 60;
      const ah = clockAng(t % 12), am = clockAng((t % 1) * 12);
      for (const [a, len, w] of [[ah, fr * 0.55, 2], [am, fr - 2, 1]]) {
        const tx = G.x + Math.cos(a) * len, ty = G.y + Math.sin(a) * len, bx = G.x - Math.cos(a) * 3, by = G.y - Math.sin(a) * 3;
        K.line(g, bx + 1, by + 1, tx + 1, ty + 1, "rgba(0,0,0,.25)");
        K.line(g, bx, by, tx, ty, "#151110", w);
      }
      boss(g, G.x, G.y, 2, M.brass);
      for (let a2 = -2.5; a2 < -1.6; a2 += 0.05) K.px(g, G.x + Math.cos(a2) * (fr - 2), G.y + Math.sin(a2) * (fr - 2), "rgba(255,255,255,.55)"); }
    /* the points repeater: a lit arrow, three lamps for the blasts counted */
    const pb = Lo.pts, j = L.nextJunction(S);
    if (j && j.d < 25) arrow(g, pb.x + pb.w / 2, pb.y + pb.h / 2, S.pts[j.n], "#ffc35a");
    else K.rect(g, pb.x + 10, pb.y + pb.h / 2, pb.w - 20, 2, "#4a3a22");
    for (let i = 0; i < 3; i++) { const on = i < c.blasts; K.disc(g, pb.x + pb.w / 2 - 8 + i * 8, pb.y - 9, 2, 2, on ? "#ffc35a" : "#3a2c18"); if (on) { g.fillStyle = "rgba(255,195,90,.3)"; K.disc(g, pb.x + pb.w / 2 - 8 + i * 8, pb.y - 9, 4, 4); } }
    /* the regulator: its lever across the quadrant */
    const t = Lo.ctl.throttle, tl = Lo.R(50), ta = (-160 + 130 * c.thr) * Math.PI / 180;
    lever(g, t.cx, t.cy, t.cx + Math.cos(ta) * tl, t.cy + Math.sin(ta) * tl, 3, m(t.cx, t.cy - 30), true);
    /* the reverser: tall, from the floor */
    const rv = Lo.ctl.reverser, rl = Math.min(Lo.R(118), rv.h - 14), ra = (-90 + c.rev * 20) * Math.PI / 180;
    lever(g, rv.cx, rv.cy, rv.cx + Math.cos(ra) * rl, rv.cy + Math.sin(ra) * rl, 4, m(rv.cx, rv.cy - 60), true);
    /* the brake handle: from off (up) round to full on (down and out) */
    const b = Lo.ctl.brake, bang = -Math.PI * 0.5 - 0.3 + c.brake * 1.9, bl = Lo.R(30);
    lever(g, b.cx, b.cy, b.cx + Math.cos(bang) * bl, b.cy + Math.sin(bang) * bl, 3, m(b.cx, b.cy), true);
    /* the whistle chain and the valve's pull, hanging from the roof; pulled down when in use */
    const w = Lo.ctl.whistle, wd = c.whistleT > 0 ? 8 : 0, mw = m(w.cx, w.cy);
    /* the whistle's handle is a big brass T, polished by paws, so it catches what light there is */
    { const hy = w.cy - 2 + wd, hw = Math.round(16 * Lo.u), mb = mw.map(v => Math.max(0.6, v)), BR = M.brass.map(q => lit(q, mb));
      chain(g, w.cx, Lo.Y(16), hy - 6, mw);
      K.rect(g, w.cx - 2, hy - 7, 5, 6, INK); K.rect(g, w.cx - 1, hy - 6, 3, 5, BR[2]); K.px(g, w.cx - 1, hy - 6, BR[0]);
      K.rect(g, w.cx - hw - 1, hy - 4, hw * 2 + 3, 9, INK);
      for (const ex of [w.cx - hw, w.cx + hw]) K.disc(g, ex, hy, 6, 6, INK);
      pipe(g, [[w.cx - hw, hy], [w.cx + hw, hy]], 3, BR);
      for (const ex of [w.cx - hw, w.cx + hw]) boss(g, ex, hy, 5, BR);
      /* the glint along its top, and a spark on each knob */
      K.rect(g, w.cx - hw + 5, hy - 2, hw * 2 - 10, 1, "#fff2c4");
      for (const ex of [w.cx - hw, w.cx + hw]) K.px(g, ex - 2, hy - 3, "#fffbe8");
      tag(g, w.cx, hy + 8, "WHISTLE", mw); }
    const v = Lo.ctl.valve, vd = c.valve ? 8 : 0, mv = m(v.cx, v.cy);
    chain(g, v.cx, Lo.Y(16), v.cy - 6 + vd, mv); K.ring(g, v.cx, v.cy + vd, 5, INK, 3); K.ring(g, v.cx, v.cy + vd, 4, lit(M.brass[1], mv), 2);
    tag(g, v.cx, v.cy + 6 + vd, "VALVE", mv);
  }
  const H = Lo => Lo.H;
  /* the way the next points are set: straight on, or bending away north (up) or south (down) */
  function arrow(g, x, y, p, col) {
    x = Math.round(x); y = Math.round(y);
    g.fillStyle = "rgba(255,195,90,.16)"; g.fillRect(x - 18, y - 12, 36, 24);
    if (p === 1) {
      K.line(g, x - 13, y, x + 4, y, col, 3);
      K.poly(g, [[x + 3, y - 6], [x + 12, y], [x + 3, y + 6]], col);
    } else {
      const s = p === 0 ? -1 : 1;
      K.line(g, x - 13, y - s * 4, x - 4, y - s * 4, col, 3);
      K.line(g, x - 4, y - s * 4, x + 4, y + s * 4, col, 3);
      K.poly(g, [[x + 1, y + s * 9], [x + 10, y + s * 9], [x + 10, y]], col);
      /* the straight road, unlit */
      K.line(g, x - 2, y - s * 4, x + 10, y - s * 4, "rgba(255,195,90,.3)", 1);
    }
  }
  Cab.arrow = arrow;

  /* the cursor: the chosen control's corners lit, a paw on it */
  function cursor(g, Lo, sel, now) {
    const r = Lo.ctl[sel]; if (!r) return;
    const col = "#ffc35a", a = 6;
    g.fillStyle = col;
    for (const [x, y, dx, dy] of [[r.x, r.y, 1, 1], [r.x + r.w, r.y, -1, 1], [r.x, r.y + r.h, 1, -1], [r.x + r.w, r.y + r.h, -1, -1]]) {
      g.fillRect(Math.round(x - (dx < 0 ? 1 : 0)), Math.round(y - (dy < 0 ? 1 : 0)), dx * a, 1);
      g.fillRect(Math.round(x - (dx < 0 ? 1 : 0)), Math.round(y - (dy < 0 ? 1 : 0)), 1, dy * a);
    }
    const p = paw(), bob = Math.round(Math.sin(now / 260));
    const [px, py] = r.paw || [r.cx - 4, r.cy + 6];
    g.drawImage(p, Math.round(Math.min(Lo.W - p.width, px)), Math.round(Math.min(Lo.H - p.height + 6, py + bob)));
  }

  /* ---- the driver's eye ----
   * The backhead is the back of the boiler seen end on, so the camera is placed where that is true:
   * at the depth ZB where the boiler's 0.8 m radius spans the backhead's radius on the screen, and
   * across and up from the boiler's axis so its centre lands on the backhead's centre. The barrel
   * through the window then runs on from the backhead's rim to the horizon. */
  const YC = 2.75, R0 = 0.8;
  Cab.camera = (Lo, vp) => {
    const f = Lo.winH * 2.0, hor = vp.y + Math.round(vp.h * 0.42), cx = vp.x + Math.round(vp.w * 0.6), D = Lo.dome;
    const zb = R0 * f / D.rx, x = (cx - D.x) * zb / f, h = YC + (D.y - hor) * zb / f;
    const cam = World.cam(vp, { look: 1, h, x, hor: 0.42, cx: 0.6, lamp: true, f });
    cam.zb = zb;
    return cam;
  };

  /* ---- a frame ---- */
  Cab.draw = (g, S, ui, now, fx) => {
    const W = g.canvas.width, H0 = g.canvas.height, Lo = Cab.layout(W, H0);
    Cab.last = Lo;
    const vp = { x: 0, y: 0, w: W, h: Lo.winH };
    const cam = Cab.camera(Lo, vp), wc = World.turned(S, cam, now);
    World.sky(g, S, wc, now);
    World.hills(g, S, wc);
    World.ground(g, S, wc, now);
    const bo = K.get(`boiler:${W}x${H0}`, () => paintBoiler(Lo, cam));
    g.drawImage(bo, 0, 0);
    Cab.chimney = bo.pts.chimney; Cab.valveTop = bo.pts.valve; Cab.whistleTop = bo.pts.whistle; Cab.domeTop = bo.pts.dome;
    if (fx) fx(g, cam);
    g.drawImage(glass(Lo), 0, 0);
    /* steam: the safety valves blowing off, the whistle */
    const vt = Cab.valveTop, wt = Cab.whistleTop;
    if (S.cab.valve && vt) for (let i = 0; i < 8; i++) { const t = (now / 80 + i) % 8; g.fillStyle = `rgba(235,240,248,${(0.55 - t * 0.065).toFixed(2)})`; K.disc(g, vt.x + Math.sin(i * 3 + now / 70) * 3 - t * 2, vt.y - t * 7, 2 + t * 2.4, 2 + t * 1.6); }
    if (S.cab.whistleT > 0 && wt) for (let i = 0; i < 5; i++) { const t = (now / 50 + i) % 5; g.fillStyle = `rgba(240,244,250,${(0.6 - t * 0.11).toFixed(2)})`; K.disc(g, wt.x, wt.y - t * 5, 1.5 + t * 1.8, 1 + t); }
    /* the cab: the night and its lamps, then each other light added over it as strongly as it burns */
    const lv = lighting(S, now);
    g.drawImage(cabLayer(Lo, "base"), 0, 0);
    g.globalCompositeOperation = "lighter";
    for (const k of ["dawn", "leak", "fire"]) if (lv[k] > 0.01) { g.globalAlpha = PX.clamp(lv[k], 0, 1); g.drawImage(cabLayer(Lo, k), 0, 0); }
    g.globalAlpha = 1;
    /* the open fire on the inside of the glass, faint, low on the side toward it */
    if (lv.fire > 0) {
      const sp = Lo.specs[0], gr = g.createRadialGradient(sp.x0, sp.y1, 0, sp.x0, sp.y1, (sp.x1 - sp.x0) * 0.7);
      gr.addColorStop(0, `rgba(255,120,50,${(0.16 * lv.fire).toFixed(3)})`); gr.addColorStop(1, "rgba(255,120,50,0)");
      g.fillStyle = gr; g.fillRect(sp.x0, sp.y0, sp.x1 - sp.x0, sp.y1 - sp.y0);
    }
    g.globalCompositeOperation = "source-over";
    moving(g, S, Lo, now, lv);
    /* the haze of the cab caught in the firelight over the open door */
    if (lv.fire > 0) {
      const d = Lo.ctl.door, r = 150 * Lo.u, gr = g.createRadialGradient(d.cx, d.y, 0, d.cx, d.y, r);
      gr.addColorStop(0, `rgba(255,140,60,${(0.2 * lv.fire).toFixed(3)})`); gr.addColorStop(0.5, `rgba(200,80,30,${(0.07 * lv.fire).toFixed(3)})`); gr.addColorStop(1, "rgba(200,80,30,0)");
      g.globalCompositeOperation = "lighter"; g.fillStyle = gr; g.fillRect(d.cx - r, d.y - r, r * 2, r * 2); g.globalCompositeOperation = "source-over";
    }
    /* the dark closing in at the corners, less as dawn comes */
    { const gr = K.get(`vignette:${W}x${H0}`, () => { const v = g.createRadialGradient(W * 0.55, H0 * 0.45, Math.min(W, H0) * 0.3, W * 0.55, H0 * 0.45, Math.hypot(W, H0) * 0.62); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.55)"); return v; });
      g.globalAlpha = 1 - lv.dawn * 0.6; g.fillStyle = gr; g.fillRect(0, 0, W, H0); g.globalAlpha = 1; }
    if (ui.cursor) cursor(g, Lo, ui.cursor, now);
    /* a hurt boiler weeps steam at its joints */
    if (S.dmg.boiler > 35) for (let i = 0; i < Math.floor(S.dmg.boiler / 20); i++) {
      const D = Lo.dome, x = D.x + (K.hash(i, 1, 55) - 0.5) * D.rx * 1.4, y = D.y - D.ry * 0.5 + K.hash(i, 2, 55) * D.ry * 0.6, t = (now / 400 + K.hash(i, 3)) % 1;
      g.fillStyle = `rgba(230,236,244,${(0.35 * (1 - t)).toFixed(2)})`; K.disc(g, x + t * 4, y - t * 14, 1 + t * 5, 1 + t * 4);
    }
  };
  Cab.hit = (x, y) => {
    const Lo = Cab.last; if (!Lo) return null;
    for (const k of Cab.ORDER) { const r = Lo.ctl[k]; if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return k; }
    return null;
  };
})();
