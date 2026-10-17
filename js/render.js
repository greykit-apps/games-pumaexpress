/* The Puma Express -- the play screen: which scene is showing, and what the
 * engine's events look like in it.
 *
 * The cab, the two guns, a station fight, a bridge fight, the map, and how
 * the night ended (js/art/ending.js). Each is
 * drawn whole every frame onto the low-resolution canvas, which the page
 * scales up by a whole number. The title's picture is js/art/title.js. */
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
        case "over": if (e.why === "burst" || e.why === "boiler") R.shake = 10; if (e.why === "derail" || e.why === "cut" || e.why === "buffer" || e.why === "barricade" || e.why === "span") R.shake = 12; break;
      }
    }
  };
  function gunPoint(S, p) {
    const c = PX.Guns.last; if (!c || (S.view !== "front" && S.view !== "rear")) return null;
    const q = PX.Guns.proj(c, S.view, p); if (!q) return null;
    q.s = 13 / q.dist * 10; return q;
  }

  /* ---- the title's picture: js/art/title.js ---- */
  R.title = (cv, now, dt) => PX.TitleArt.draw(cv, now, dt);
})();
