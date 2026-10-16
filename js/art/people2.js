/* The Puma Express -- the people again, at the hi-bit size: Duc running
 * up a platform, and the wolves at the station windows, shaded a pixel at a
 * time. P.ducRun(frame, pose) is 30 by 36, side on, facing right;
 * P.wolfBust(state, variant) is 30 by 38, facing you. */
"use strict";
(() => {
  const K = PX.K, M = PX.K.M, P = PX.People, INK = "#140e0a";
  const FUR = M.puma, BLUE = ["#7d9ac8", "#5a78a8", "#3d5378", "#2c3d5c", "#1c2840"], RED = ["#ff8a6a", "#e2402a", "#b52c1b", "#7d1c11", "#4c100a"];
  /* a limb: a thick stroke shaded across, lit on its upper side */
  function limb(g, x0, y0, x1, y1, w, ramp, k = 2) {
    const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2)), nx = -(y1 - y0), ny = x1 - x0, nl = Math.hypot(nx, ny) || 1;
    for (let i = 0; i <= n; i++) {
      const x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n;
      for (let t = -w / 2; t <= w / 2; t += 0.5) {
        const px = x + nx / nl * t, py = y + ny / nl * t, side = (nx / nl * t) * -0.6 + (ny / nl * t) * -0.8;
        g.fillStyle = ramp[PX.clamp(Math.round(k - side / (w / 2) * 1.1), 0, 4)];
        g.fillRect(Math.round(px), Math.round(py), 1, 1);
      }
    }
  }
  /* a shaded blob */
  function blob(g, cx, cy, rx, ry, ramp, k = 2) {
    for (let y = Math.floor(cy - ry); y <= cy + ry; y++) for (let x = Math.floor(cx - rx); x <= cx + rx; x++) {
      const dx = (x - cx) / rx, dy = (y - cy) / ry; if (dx * dx + dy * dy > 1) continue;
      const lv = -dx * 0.5 - dy * 0.7 + K.bayer(x, y) * 0.35;
      g.fillStyle = ramp[PX.clamp(Math.round(k - lv * 1.4), 0, 4)]; g.fillRect(x, y, 1, 1);
    }
  }

  /* ---- Duc: running, at the lever, hit ---- */
  P.ducRun = (frame, pose = "run") => K.get(`duc2:${pose}:${frame}`, () => {
    const c = K.mk(30, 36), g = c.getContext("2d"), ph = frame / 8 * Math.PI * 2, run = pose === "run";
    const bob = run ? Math.abs(Math.sin(ph)) * 1.2 : 0, hip = [13, 21 - bob], sh = [15, 11 - bob];
    /* the tail, long, the dark tip curling */
    const tail = [];
    for (let i = 0; i <= 10; i++) { const t = i / 10; tail.push([hip[0] - 2 - t * 10, hip[1] + 1 + Math.sin(t * 2.6 + ph * 0.5) * 2 - t * t * 5]); }
    for (let i = 0; i < tail.length - 1; i++) limb(g, tail[i][0], tail[i][1], tail[i + 1][0], tail[i + 1][1], i > 7 ? 2.4 : 2.8, i > 7 ? ["#5a3a22", "#4a2e1a", "#3a2414", "#2a1a0e", "#1a1008"] : FUR, 2);
    /* a leg: thigh and shin in the overalls, a paw at the end */
    const leg = (a, back) => {
      const ramp = back ? BLUE.map(q => K.mix(q, "#0a0e18", 0.35)) : BLUE;
      const kx = hip[0] + Math.sin(a) * 6.5, ky = hip[1] + Math.cos(a) * 6.5 * 0.9;
      const fa = a - (run ? Math.max(0, Math.sin(a + 1.2)) * 1.4 : 0.1);
      const fx = kx + Math.sin(fa) * 7, fy = Math.min(34, ky + Math.cos(fa) * 7.5);
      limb(g, hip[0], hip[1], kx, ky, 4.2, ramp); limb(g, kx, ky, fx, fy, 3.6, ramp);
      blob(g, fx + 1.5, fy + 0.5, 2.6, 1.6, back ? FUR.map(q => K.mix(q, "#1a1008", 0.35)) : FUR, 2);
    };
    const swing = run ? Math.sin(ph) * 0.9 : pose === "lever" ? 0.3 : -0.2;
    leg(-swing, true);
    /* the far arm, behind the body */
    const arm = (a, back, reach) => {
      const ramp = back ? BLUE.map(q => K.mix(q, "#0a0e18", 0.35)) : BLUE, fr = back ? FUR.map(q => K.mix(q, "#1a1008", 0.35)) : FUR;
      const ex = sh[0] + Math.sin(a) * 5, ey = sh[1] + Math.cos(a) * 5;
      const hx = reach ? reach[0] : ex + Math.sin(a + (run ? 1.2 : 0.4)) * 5, hy = reach ? reach[1] : ey + Math.cos(a + (run ? 1.2 : 0.4)) * 5;
      limb(g, sh[0], sh[1], ex, ey, 3.4, ramp); limb(g, ex, ey, hx, hy, 2.8, fr); blob(g, hx, hy, 1.8, 1.8, fr, 1);
    };
    arm(swing * 1.1, true);
    /* the body: the overalls' bib, the straps and their brass buttons */
    for (let y = sh[1] - 1; y <= hip[1] + 1; y++) {
      const k = (y - sh[1]) / (hip[1] - sh[1]), w = 4.2 + k * 0.8, cx = PX.lerp(sh[0], hip[0], k) + (run ? 0.8 : 0);
      for (let x = Math.round(cx - w); x <= cx + w; x++) { const lv = -(x - cx) / w * 0.6 + K.bayer(x, y) * 0.3; g.fillStyle = BLUE[PX.clamp(Math.round(2 - lv * 1.4), 0, 4)]; g.fillRect(x, y, 1, 1); }
    }
    K.px(g, sh[0] + 2, sh[1] + 3, M.brass[1]); K.px(g, sh[0] - 1, sh[1] + 3, M.brass[1]);
    K.rect(g, hip[0] - 3, hip[1] - 2, 8, 1, BLUE[4]);
    /* the near leg and arm */
    leg(swing, false);
    if (pose === "lever") arm(0, false, [sh[0] + 9, sh[1] - 6 + Math.round(Math.sin(frame) * 1)]);
    else if (pose === "hurt") arm(2.4, false, [sh[0] - 3, sh[1] + 6]);
    else arm(-swing * 1.1, false);
    /* the neckerchief, red, knotted */
    blob(g, sh[0] + 1, sh[1] - 1, 3.4, 1.8, RED, 2); K.px(g, sh[0] - 2, sh[1] + 1, RED[1]); K.px(g, sh[0] - 3, sh[1] + 2, RED[2]);
    /* the head: tawny, the cream muzzle forward, the dark line below the eye, the round ear, the cap */
    const hx = sh[0] + 2, hy = sh[1] - 6;
    blob(g, hx, hy, 4.6, 4.4, FUR, 2);
    blob(g, hx + 3.6, hy + 1.6, 2.6, 1.9, ["#fff6e4", "#fde6bd", "#ebd0a0", "#c8a878", "#9b7a50"], 1);
    K.px(g, hx + 6, hy + 0, "#5a2e22"); K.px(g, hx + 6, hy + 1, "#3a1e16");
    K.px(g, hx + 2, hy - 1, "#e8c24a"); K.px(g, hx + 3, hy - 1, INK); K.px(g, hx + 2, hy, "#4a3322"); K.px(g, hx + 3, hy + 1, "#4a3322");
    blob(g, hx - 2.6, hy - 3.6, 1.6, 1.8, ["#6a4a32", "#5a3e28", "#4a3322", "#3a2618", "#2a1a10"], 2); K.px(g, hx - 2, hy - 3, "#d9a487");
    /* the hickory cap, its peak forward */
    for (let y = hy - 6; y <= hy - 3; y++) for (let x = hx - 4; x <= hx + 3; x++) { const dy = (y - (hy - 3)) / 3.4, dx = (x - hx + 0.5) / 4.2; if (dx * dx + dy * dy > 1) continue; g.fillStyle = x % 2 === 0 ? "#c9d2e0" : y < hy - 4 ? "#4f6489" : "#3b4b6a"; g.fillRect(x, y, 1, 1); }
    K.rect(g, hx - 3, hy - 3, 10, 1, "#24304a"); K.rect(g, hx + 3, hy - 3, 4, 1, "#2a3550");
    return K.outline(c, INK);
  });

  /* ---- a wolf at a window: rising, aiming at you, firing, hit ---- */
  const WOLF = [["#e6e2dc", "#bdb7b0", "#948e88", "#6a6560", "#45413e"], ["#c4bfb8", "#9e9892", "#79736e", "#55514d", "#383533"]];
  const TUNIC = ["#7a8474", "#5d6559", "#4b5248", "#363c34", "#242822"];
  P.wolfBust = (st, v = 0) => K.get(`wolf2:${st}:${v}`, () => {
    const c = K.mk(30, 38), g = c.getContext("2d"), F = WOLF[v % 2], dead = st === "dead", aim = st === "aim" || st === "fire";
    const oy = dead ? 5 : 0, tilt = dead ? 2 : 0;
    /* shoulders: the field-grey tunic, the collar with its red tabs, the buttons */
    for (let y = 24 + oy; y < 38; y++) for (let x = 1; x < 29; x++) {
      const dx = (x - 15) / 14, top = 24 + oy + Math.round(Math.abs(dx) * 4); if (y < top) continue;
      const lv = -dx * 0.5 + K.bayer(x, y) * 0.35 - (y - 24) / 30;
      g.fillStyle = TUNIC[PX.clamp(Math.round(2 - lv * 1.4), 0, 4)]; g.fillRect(x, y, 1, 1);
    }
    K.rect(g, 9, 25 + oy, 4, 3, RED[2]); K.rect(g, 17, 25 + oy, 4, 3, RED[2]); K.rect(g, 9, 25 + oy, 4, 1, RED[1]); K.rect(g, 17, 25 + oy, 4, 1, RED[1]);
    K.px(g, 15, 30 + oy, M.brass[1]); K.px(g, 15, 34 + oy, M.brass[1]);
    /* the ruff of the neck */
    blob(g, 15, 23 + oy, 7, 3, F, 1);
    /* the ears, pointed, out from under the cap */
    for (const s of [-1, 1]) { const ex = 15 + s * 7 + tilt; K.poly(g, [[ex - 3, 9 + oy], [ex + s * 1, 1 + oy], [ex + 3, 9 + oy]], INK); K.poly(g, [[ex - 2, 9 + oy], [ex + s * 1, 3 + oy], [ex + 2, 9 + oy]], F[2]); K.px(g, ex, 7 + oy, "#8a6a60"); }
    /* the head and the long muzzle toward you */
    blob(g, 15 + tilt, 14 + oy, 8.5, 7.5, F, 2);
    blob(g, 15 + tilt, 19 + oy, 4.4, 3.6, ["#ffffff", "#ece8e2", "#cfcac2", "#a8a29a", "#7a756e"], 1);
    blob(g, 15 + tilt, 17 + oy, 2.2, 1.4, ["#4a4646", "#2a2828", "#1a1818", "#111", "#000"], 2);
    K.px(g, 14 + tilt, 16 + oy, "#8a8686");
    K.rect(g, 13 + tilt, 21 + oy, 5, 1, "#2a2626");
    /* the eyes: amber under heavy brows, narrowed to aim, crossed out when hit */
    for (const s of [-1, 1]) {
      const ex = 15 + s * 4 + tilt, ey = 12 + oy;
      if (dead) { K.line(g, ex - 1, ey - 1, ex + 1, ey + 1, INK); K.line(g, ex + 1, ey - 1, ex - 1, ey + 1, INK); continue; }
      K.rect(g, ex - 2, ey - 1, 4, 1, F[4]);
      K.rect(g, ex - 1, ey, 3, aim ? 1 : 2, aim ? "#ffc23a" : "#e0a34a"); K.px(g, ex, ey, INK);
    }
    /* the peaked cap: dark field grey, the red band, the silver badge, the peak's shadow */
    for (let y = 3 + oy; y <= 8 + oy; y++) for (let x = 6; x <= 24; x++) { const dx = (x - 15) / 9.5, dy = (y - (8 + oy)) / 5.5; if (dx * dx + dy * dy > 1) continue; g.fillStyle = TUNIC[y < 5 + oy ? 2 : 3]; g.fillRect(x + tilt, y, 1, 1); }
    K.rect(g, 6 + tilt, 7 + oy, 19, 2, RED[2]); K.rect(g, 6 + tilt, 7 + oy, 19, 1, RED[1]);
    K.rect(g, 14 + tilt, 5 + oy, 3, 2, "#d6d8dc"); K.px(g, 15 + tilt, 5 + oy, "#ffffff");
    K.rect(g, 5 + tilt, 9 + oy, 21, 1, "#141810"); K.rect(g, 7 + tilt, 10 + oy, 17, 1, "rgba(0,0,0,.4)");
    /* the rifle: across the chest, or up and pointing at you */
    if (aim) {
      blob(g, 21, 27, 2.6, 2, F, 1);
      K.rect(g, 18, 25, 6, 9, "#3a2a1a"); K.rect(g, 18, 25, 6, 1, "#5a4028");
      K.disc(g, 21, 24, 3, 3, "#1a1a1c"); K.disc(g, 21, 24, 2, 2, "#3a3c40"); K.disc(g, 21, 24, 1, 1, "#000000");
      if (st === "fire") { g.fillStyle = "rgba(255,230,150,.9)"; K.disc(g, 21, 24, 5, 5); K.disc(g, 21, 24, 3, 3, "#fffbe0"); }
    } else if (!dead) {
      limb(g, 3, 35, 27, 27, 2.4, ["#7a5a3a", "#5a4028", "#3a2a1a", "#2a1e12", "#1a120a"]);
      K.line(g, 20, 29, 28, 26, "#2a2c30", 1);
    }
    return K.outline(c, INK);
  });

  /* ---- a wolf at a window, at Duc's scale: waist up, 18 by 22, standing back in the lit room ---- */
  P.wolfFig = (st, v = 0) => K.get(`wolf3:${st}:${v}`, () => {
    const c = K.mk(18, 22), g = c.getContext("2d"), F = WOLF[v % 2], dead = st === "dead", aim = st === "aim" || st === "fire";
    const lean = dead ? 2 : 0, cx = 9;
    /* the tunic: shoulders and chest, the belt */
    for (let y = 11; y < 22; y++) for (let x = 3; x < 15; x++) {
      const dx = (x - cx) / 6, top = 11 + Math.round(Math.abs(dx) * 2); if (y < top) continue;
      const lv = -dx * 0.5 + K.bayer(x, y) * 0.35; g.fillStyle = TUNIC[PX.clamp(Math.round(2 - lv * 1.3), 0, 4)]; g.fillRect(x, y, 1, 1);
    }
    K.rect(g, 4, 19, 10, 1, "#1e1a14"); K.px(g, cx, 19, M.brass[1]);
    K.px(g, cx - 2, 12, RED[1]); K.px(g, cx + 2, 12, RED[1]);
    /* the head: the long muzzle, the ears up out of the cap */
    const hx = cx + lean, hy = 7 + (dead ? 1 : 0);
    K.poly(g, [[hx - 4, hy - 1], [hx - 3, hy - 6], [hx - 1, hy - 2]], INK); K.poly(g, [[hx + 1, hy - 2], [hx + 3, hy - 6], [hx + 4, hy - 1]], INK);
    K.px(g, hx - 3, hy - 4, F[2]); K.px(g, hx + 3, hy - 4, F[2]);
    blob(g, hx, hy, 3.6, 3.2, F, 2);
    blob(g, hx, hy + 2.4, 1.8, 1.4, ["#ffffff", "#ece8e2", "#cfcac2", "#a8a29a", "#7a756e"], 1);
    K.px(g, hx, hy + 2, "#1a1818");
    if (dead) { K.px(g, hx - 1, hy, INK); K.px(g, hx + 1, hy, INK); }
    else { K.px(g, hx - 1, hy, aim ? "#ffc23a" : "#e0a34a"); K.px(g, hx + 1, hy, aim ? "#ffc23a" : "#e0a34a"); }
    /* the peaked cap and its red band */
    K.rect(g, hx - 3, hy - 4, 7, 2, TUNIC[3]); K.rect(g, hx - 3, hy - 2, 7, 1, RED[2]); K.rect(g, hx - 4, hy - 1, 9, 1, "#141810");
    /* the rifle: across the chest, or up at the shoulder and pointing out of the window */
    if (aim) {
      limb(g, hx + 4, hy + 6, hx + 1, hy + 3, 2, ["#7a5a3a", "#5a4028", "#3a2a1a", "#2a1e12", "#1a120a"]);
      K.disc(g, hx + 1, hy + 4, 1.5, 1.5, "#1a1a1c"); K.px(g, hx + 1, hy + 4, "#000");
      if (st === "fire") { g.fillStyle = "rgba(255,230,150,.95)"; K.disc(g, hx + 1, hy + 4, 3, 3); K.px(g, hx + 1, hy + 4, "#fffbe0"); }
    } else if (!dead) limb(g, 3, 20, 15, 13, 1.6, ["#7a5a3a", "#5a4028", "#3a2a1a", "#2a1e12", "#1a120a"]);
    return K.outline(c, INK);
  });
})();
