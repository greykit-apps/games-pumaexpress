/* The Puma Express -- the play screen: which scene is showing, and what the
 * engine's events look like in it.
 *
 * The cab, the two guns, a station fight, a bridge fight, the map, and how
 * the night ended (js/art/ending.js). Each is
 * drawn whole every frame onto the low-resolution canvas, which the page
 * scales up by a whole number. The title's picture is here too: the train
 * running west through the night, side on, its smoke streaming back. */
"use strict";
(() => {
  const K = PX.K, C = PX.C, L = PX.Line, FX = PX.FX, SFX = PX.SFX;
  const R = PX.Render = { cv: null, g: null, shake: 0, frame: 0, scene: null };

  R.init = cv => { R.cv = cv; R.g = cv.getContext("2d"); R.g.imageSmoothingEnabled = false; };
  /* the scene now: a fight takes the screen whatever the view */
  R.sceneOf = (S, ui) => PX.Ending.has(S) ? "end" : ui.mapView ? "map" : S.phase === "capture" ? "station" : S.phase === "bridge" ? "bridge" : S.view;

  /* changing places -- cab, the guns, the map -- dips through black: the last frame
   * of the old place darkens, then the new one comes up out of it */
  const POSTS = ["cab", "front", "rear", "map"], F_OUT = 0.12, F_IN = 0.16;
  let fade = null, snap = null, drawnAt = -1e9;
  const dark = f => f.t < F_OUT ? f.t / F_OUT : 1 - (f.t - F_OUT) / F_IN;
  function startFade(W, H, now) {
    /* only between places on a running night, not into one from the title or a fight */
    if (!POSTS.includes(R.scene) || now - drawnAt > 250) { fade = null; return; }
    if (!snap) snap = document.createElement("canvas");
    if (snap.width !== W || snap.height !== H) { snap.width = W; snap.height = H; }
    snap.getContext("2d").drawImage(R.cv, 0, 0);
    /* changing again mid-fade: carry on from how dark it already is */
    const d = fade ? dark(fade) : 0;
    fade = { t: d * F_OUT, base: d };
  }

  R.draw = (S, ui, now, dt) => {
    const g = R.g, W = R.cv.width, H = R.cv.height;
    R.frame++;
    const scene = R.sceneOf(S, ui);
    if (scene !== R.scene) {
      if (POSTS.includes(scene)) startFade(W, H, now); else fade = null;
      R.scene = scene; FX.use(scene === "map" ? "map" : scene);
    }
    drawnAt = now;
    if (scene !== "map") FX.step(dt);
    g.save();
    if (R.shake > 0.3 && PX.prefs.shake && scene !== "map") { g.translate(Math.round((Math.random() - 0.5) * R.shake), Math.round((Math.random() - 0.5) * R.shake)); }
    R.shake *= 0.86;
    if (scene === "end") PX.Ending.draw(g, S, now, dt);
    else if (scene === "map") PX.MapArt.draw(g, S, ui, now);
    else if (scene === "station") PX.Station.draw(g, S, ui, now);
    else if (scene === "bridge") PX.BridgeArt.draw(g, S, ui, now);
    else if (scene === "cab") { PX.Cab.draw(g, S, ui, now, () => FX.draw(g, "back")); FX.draw(g, "front"); smokeCab(S, dt); }
    else { PX.Guns.draw(g, S, ui, now, dt); smokeGun(S, dt); }
    /* the night's light on everything: a cool wash at full dark */
    g.restore();
    if (S.phase === "over" && S.end && (S.end.why === "burst" || S.end.why === "boiler")) { g.fillStyle = "rgba(255,240,220,.12)"; g.fillRect(0, 0, W, H); }
    if (fade) {
      const a = dark(fade);
      if (fade.t < F_OUT) {
        /* the old place, already as dark as the fade it interrupted, darkening the rest of the way */
        g.drawImage(snap, 0, 0);
        g.fillStyle = `rgba(0,0,0,${1 - (1 - a) / (1 - fade.base)})`;
      } else g.fillStyle = `rgba(0,0,0,${a})`;
      g.fillRect(0, 0, W, H);
      fade.t += dt;
      if (fade.t >= F_OUT + F_IN) fade = null;
    }
  };

  /* smoke from the chimney, by the beat of the exhaust */
  let puffAcc = 0;
  function smokeCab(S, dt) {
    const ch = PX.Cab.chimney; if (!ch) return;
    const v = Math.abs(S.tr.v), work = S.cab.thr * (0.3 + v / 50) + 0.08;
    puffAcc += dt * (1.5 + v / 6);
    while (puffAcc > 1) {
      puffAcc -= 1;
      const l = K.light(S.t), grey = l > 0.5 ? [150, 150, 158] : [92, 96, 110];
      /* streaming back over the boiler toward the cab: up and out from the line, growing as it comes */
      FX.smoke(ch.x + (Math.random() - 0.5) * 2, ch.y, { r: 1.5 + work * 1.5, grow: 8 + v * 0.45, vx: -(3 + v * 0.32) - Math.random() * 3, vy: -(7 + v * 0.22) - Math.random() * 4, life: 0.9 + Math.random() * 0.5, col: grey, a: 0.22 + work * 0.22, layer: "back" });
      if (S.cab.thr > 0.6 && v > 25 && Math.random() < 0.12) FX.spark(ch.x, ch.y, { vx: 10 + Math.random() * 30, vy: -40 - Math.random() * 40, g: 50, col: "#ffad3c", life: 0.8 });
    }
  }
  function smokeGun(S, dt) {
    if (S.view !== "front") return;
    const ch = PX.Guns.chimney; if (!ch) return;
    const v = Math.abs(S.tr.v), work = S.cab.thr * (0.3 + v / 50) + 0.08;
    puffAcc += dt * (1.5 + v / 6);
    while (puffAcc > 1) {
      puffAcc -= 1;
      const l = K.light(S.t), grey = l > 0.5 ? [150, 150, 158] : [88, 92, 106];
      /* blown back toward us: it grows as it comes */
      FX.smoke(ch.x + (Math.random() - 0.5) * 3, ch.y, { r: 1.5 + work * 1.5, grow: 9 + v * 0.35, vx: (Math.random() - 0.5) * 8, vy: -8 - v * 0.12, life: 0.8 + Math.random() * 0.4, col: grey, a: 0.2 + work * 0.2, layer: "back" });
    }
  }

  /* ---- what happened, as the scene shows it ---- */
  R.events = (S, evs) => {
    for (const e of evs) {
      switch (e.t) {
        case "shot": PX.Station.fire(S, false); break;
        case "wolfDown": PX.Station.fire(S, true); break;
        case "gun": if (S.view === "front" || S.view === "rear") PX.Guns.fire(S); break;
        case "planeHit": { const q = gunPoint(S, e); if (q) FX.burst(q.x, q.y, 5, { sp: 30, col: "#ffe2a0" }); break; }
        case "planeDown": { const q = gunPoint(S, e); if (q) FX.boom(q.x, q.y, PX.clamp(q.s * 6, 0.6, 2)); R.shake = Math.max(R.shake, 2); break; }
        case "crash": { const q = gunPoint(S, { x: e.x, y: 0, z: e.z }); if (q) { FX.boom(q.x, q.y, 1.4); } break; }
        case "strafe": { if (S.view !== "cab" && R.scene !== "map") { const c = PX.Guns.last; if (c) for (let i = 0; i < 3; i++) FX.dust(c.cx + (Math.random() - 0.5) * c.vp.w * 0.6, c.hor + 20 + Math.random() * (c.vp.h - c.hor - 30), 1); } break; }
        case "trainHit": R.shake = Math.max(R.shake, e.src === "boat" ? 6 : 3); if (R.scene === "cab" && PX.Cab.last) { const Lo = PX.Cab.last; FX.burst(Lo.cx + (Math.random() - 0.5) * Lo.W * 0.6, Lo.py + Math.random() * (Lo.H - Lo.py), 6, { sp: 50 }); } break;
        case "cannon": PX.BridgeArt.fire(); break;
        case "splash": PX.BridgeArt.splash(e.bear, e.range, false); break;
        case "boatHit": PX.BridgeArt.splash(e.bear, e.range, true); { const G = PX.BridgeArt.last; if (G) FX.boom(G.xB(e.bear), G.yR(e.range) - 4, 1.2); } break;
        case "boatFire": PX.BridgeArt.boatFire(e.id); break;
        case "nearMiss": PX.BridgeArt.nearMiss(e.x); R.shake = Math.max(R.shake, 2); break;
        case "over": if (e.why === "burst" || e.why === "boiler") R.shake = 10; if (e.why === "derail" || e.why === "cut" || e.why === "buffer") R.shake = 12; break;
      }
    }
  };
  function gunPoint(S, p) {
    const c = PX.Guns.last; if (!c || (S.view !== "front" && S.view !== "rear")) return null;
    const q = PX.Guns.proj(c, S.view, p); if (!q) return null;
    q.s = 13 / q.dist * 10; return q;
  }

  /* ---- the title's picture: the train running west across the night, side on ----
   * The sky and its moon, a far range, rolling hills with their copses, poplars and oaks going by, the
   * embankment with its ballast and sleepers, telegraph poles and fence posts rushing past, and the
   * train itself: the engine, her tender and the art vans, traced from the model, her smoke streaming
   * back over them lit by the moon, the firebox glowing under the cab. */
  let tOff = 0, tAng = 0;
  R.title = (cv, now, dt) => {
    const g = cv.getContext("2d"), W = cv.width, H = cv.height, Mo = PX.Model, World = PX.World;
    g.imageSmoothingEnabled = false;
    const sc = H / 360, ry = Math.round(H * 0.83), hor = Math.round(H * 0.6);
    const speed = 70 * sc;
    tOff += dt * speed; tAng += dt * speed / (0.78 * 15 * sc);
    g.drawImage(World.skyImage(W, hor + 1, 0, 1), 0, 0);
    /* a far range, blue in the moonlight, its ridges lit */
    const ridge = (k, base, amp, freq, seed, col, lit) => {
      for (let x = 0; x < W; x++) { const u = (x + tOff * k) / freq; const h = Math.round(base + K.fbm(u, seed) * amp); g.fillStyle = col; g.fillRect(x, hor - h, 1, h + (H - hor)); g.fillStyle = lit; g.fillRect(x, hor - h, 1, 1); }
    };
    ridge(0.04, 26 * sc, 46 * sc, 120 * sc, 1, "#26324e", "#4a5a7e");
    ridge(0.12, 6 * sc, 26 * sc, 70 * sc, 2, "#1a2438", "#32425e");
    /* villages on the hills: a few lights */
    for (let i = Math.floor(tOff * 0.12 / 90); i < (tOff * 0.12 + W) / 90 + 1; i++) {
      if (K.hash(i, 1, 33) < 0.6) continue;
      const x = Math.round(i * 90 - tOff * 0.12), y = hor - Math.round(6 * sc + K.hash(i, 2, 33) * 8 * sc);
      for (let k = 0; k < 4; k++) K.px(g, x + k * 3, y + (k % 2), K.hash(i, k, 34) > 0.5 ? "#ffcf6a" : "#e89a4a");
    }
    /* the fields to the line, falling away dark */
    K.vgrad(g, 0, hor, W, ry - hor, ["#1a2620", "#141d18", "#0f1712"]);
    /* the copses and the poplars, a middle distance */
    for (let i = Math.floor(tOff * 0.35 / 26) - 2; i < (tOff * 0.35 + W) / 26 + 2; i++) {
      if (K.hash(i, 3, 7) < 0.45) continue;
      const type = K.hash(i, 4, 7) < 0.4 ? "poplar" : "oak", h = (type === "poplar" ? 44 : 30) * sc * (0.7 + K.hash(i, 5, 7) * 0.5);
      const t = World.tree(type, h, i % 3, 0, 1), x = Math.round(i * 26 - tOff * 0.35 + K.hash(i, 6, 7) * 14);
      g.drawImage(t, x - (t.width >> 1), Math.round(hor + 10 * sc - t.height + K.hash(i, 8, 7) * 6 * sc));
    }
    /* the embankment: grass, then the ballast shoulder */
    for (let y = ry - Math.round(10 * sc); y < H; y++) { const k = (y - ry) / (H - ry); g.fillStyle = y < ry ? "#2a3428" : K.mix("#3a3630", "#14120f", PX.clamp(k * 1.4, 0, 1)); g.fillRect(0, y, W, 1); }
    for (let x = 0; x < W; x++) { const q = K.hash(Math.floor(x + tOff), 1, 3); if (q > 0.5) K.px(g, x, ry + 2 + Math.floor(q * 6 * sc), q > 0.85 ? "#6a6458" : "#4a453d"); }
    /* the sleepers' ends and the rail */
    for (let x = -((tOff) % (11 * sc)); x < W; x += 11 * sc) K.rect(g, Math.round(x), ry + 1, Math.round(6 * sc), Math.round(3 * sc), "#3a2a1c");
    K.rect(g, 0, ry - 1, W, Math.max(2, Math.round(2 * sc)), "#4a525c"); K.rect(g, 0, ry - 1, W, 1, "#a8b2be");
    /* the train: the engine leading, at the right, the rest going off to the left */
    const s = Math.round(15 * sc), kinds = ["engine", "tender", "van0", "van1", "van2", "van3", "flat"];
    let x = Math.round(W * 0.93) - Math.round(11.4 * s);
    const placed = [];
    for (let i = 0; i < kinds.length; i++) {
      const kind = kinds[i], sp = Mo.sideSprite(kind, s, Mo.LIGHT_NIGHT);
      placed.push([kind, x]);
      if (x + sp.width < 0) break;
      const next = kinds[i + 1];
      if (next) x -= Math.round((Mo.sideSprite(next, s, Mo.LIGHT_NIGHT).len + 0.25) * s);
    }
    /* the firebox's glow on the ballast under the cab */
    const ex = placed[0][1], cabX = ex + Math.round(1.0 * s);
    const grd = g.createRadialGradient(cabX, ry, 2, cabX, ry, 50 * sc);
    grd.addColorStop(0, "rgba(255,140,50,.35)"); grd.addColorStop(1, "rgba(255,140,50,0)"); g.fillStyle = grd; g.fillRect(cabX - 60 * sc, ry - 40 * sc, 120 * sc, 60 * sc);
    for (const [kind, px] of placed.slice().reverse()) Mo.drawSide(g, kind, s, px, ry, tAng);
    /* the lamp's beam ahead, and its glow */
    const lamp = { x: ex + Math.round(10.75 * s), y: ry - Math.round(1.7 * s) };
    K.poly(g, [[lamp.x, lamp.y - 1], [W + 40, lamp.y - 30 * sc], [W + 40, lamp.y + 24 * sc]], "rgba(255,240,190,.07)");
    g.fillStyle = "rgba(255,240,190,.3)"; K.disc(g, lamp.x + 2, lamp.y, 5 * sc, 5 * sc);
    /* smoke streaming back from the chimney, rising */
    FX.use("title");
    const ch = { x: ex + Math.round(9.35 * s), y: ry - Math.round(4.3 * s) };
    tPuff += dt * 9;
    while (tPuff > 1) {
      tPuff -= 1;
      FX.smoke(ch.x, ch.y, { r: 2.5 * sc, grow: 12 * sc, vx: -speed * 0.9 - Math.random() * 12, vy: -16 * sc - Math.random() * 10, life: 3.2, col: [98, 104, 122], a: 0.5, layer: "back" });
      if (Math.random() < 0.05) FX.spark(ch.x, ch.y, { vx: -40, vy: -40, g: 30, col: "#ffad3c", life: 1.2 });
    }
    /* steam from the cylinder cocks now and then */
    if (Math.random() < 0.2) FX.smoke(ex + Math.round(8.2 * s), ry - Math.round(0.9 * s), { r: 1.5 * sc, grow: 8 * sc, vx: -speed * 0.6, vy: -4, life: 0.8, col: [220, 226, 236], a: 0.35, layer: "front" });
    FX.step(dt);
    FX.draw(g, "back");
    FX.draw(g, "front");
    /* the foreground rushing by: poles with their wires, fence posts, grass */
    for (let i = Math.floor(tOff * 1.6 / (150 * sc)) - 1; i < (tOff * 1.6 + W) / (150 * sc) + 1; i++) {
      const px = Math.round(i * 150 * sc - tOff * 1.6), top = Math.round(ry - 120 * sc);
      K.rect(g, px, top, Math.round(4 * sc), H - top, "#0d0a08"); K.rect(g, px - Math.round(10 * sc), top + Math.round(6 * sc), Math.round(24 * sc), Math.round(3 * sc), "#0d0a08");
      for (const f of [-8, 10]) K.px(g, px + f * sc, top + 4 * sc, "#c9c6bc");
      g.fillStyle = "rgba(10,12,18,.9)";
      for (let k = 0; k < 150 * sc; k += 2) { const t2 = k / (150 * sc), sag = Math.sin(t2 * Math.PI) * 10 * sc; g.fillRect(px + k, Math.round(top + 5 * sc + sag), 1, 1); }
    }
    for (let i = Math.floor(tOff * 2.2 / (34 * sc)) - 1; i < (tOff * 2.2 + W) / (34 * sc) + 1; i++) { const px = Math.round(i * 34 * sc - tOff * 2.2); K.rect(g, px, H - Math.round(30 * sc), Math.round(3 * sc), Math.round(30 * sc), "#080706"); }
    for (let x = 0; x < W; x++) { const h = Math.round((4 + K.hash(Math.floor((x + tOff * 2.4) / 3), 2, 9) * 10) * sc); K.rect(g, x, H - h, 1, h, "#060805"); }
    FX.use(R.scene || "cab");
  };
  let tPuff = 0;
})();
