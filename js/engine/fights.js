/* The Puma Express -- the fights, each its own scene (1987's three):
 *
 * The station. The wolves hold it, and the train is stopped short. Duc runs
 * up the platform to the points lever and back while you give him cover: he
 * moves only while you are firing (1987). Wolves come up at the lit windows,
 * take aim, and shoot at him or at the train.
 *
 * The air raid. Fighters come down the line from ahead or behind, strafe the
 * train and climb away, and come round again. The front gun covers ahead, the
 * rear gun behind; a fighter that has passed is the other gun's.
 *
 * The bridge. Gunboats on the river below hold it. The cannon is laid by
 * bearing and range; a shell takes time to land, and where it lands tells you
 * which way to correct (1987: high or low, left or right). Sink them all.
 *
 * All of it DOM-free and on the game's own dice. The station scene's numbers
 * are pixels of its own 480 by 300 picture; the air raid's are metres about
 * the train, aimed in radians; the bridge's are degrees and metres. */
"use strict";
(() => {
  const C = PX.C, L = PX.Line, E = PX.Engine, rnd = S => PX.rand(S), between = (S, [a, b]) => a + (b - a) * PX.rand(S);

  /* ---- the station ---- */
  /* the windows a wolf can come to: the station's two floors, its doorway, the signal box */
  const WIN = [];
  for (const x of [150, 190, 230, 290, 330, 370]) WIN.push({ x, y: 86, w: 22, h: 28 });
  for (const x of [150, 190, 330, 370]) WIN.push({ x, y: 144, w: 22, h: 30 });
  WIN.push({ x: 250, y: 140, w: 30, h: 38, door: true });
  WIN.push({ x: 424, y: 112, w: 36, h: 20, box: true });
  /* where the wolf stands in each: a figure about 15 units across and 18 high, back from the sill, a little to one side */
  WIN.forEach((w, i) => { w.fx = w.x + w.w / 2 + ((i * 7) % 5 - 2) * Math.max(0, (w.w - 15) / 6); w.fy = w.y + w.h - 17; });
  E.WINDOWS = WIN;
  E.PLATFORM_Y = 214;

  E.startStation = (S, n, opening) => {
    const D = C.DIFF[S.diff], SC = C.STATION;
    S.fight = {
      k: "station", n, opening: !!opening, wolves: [], left: opening ? Math.max(5, D.guards - 4) : D.guards, killed: 0,
      duc: { x: SC.ducFrom, ph: "run", thr: 0, hurtT: 0, wounds: 0, face: 1, step: 0 },
      cover: 0, shotT: 0, spawnT: 1.2, t: 0, doneT: 0, shots: [],
    };
    S.aim = { x: 270, y: 120 };
    S.tr.v = 0;
    S.phase = "capture";
  };

  function wolfAt(S, x, y) {
    for (const w of S.fight.wolves) {
      if (w.st === "dead" || w.st === "gone") continue;
      if (w.st !== "up" && w.st !== "aim" && w.st !== "fire") continue;
      const r = WIN[w.w];
      if (Math.abs(x - r.fx) <= 6.5 && y >= r.fy - 1.5 && y <= r.y + r.h + 1) return w;
    }
    return null;
  }

  E.stepStation = (S, cmd, ev) => {
    const F = S.fight, D = C.DIFF[S.diff], SC = C.STATION, dt = C.DT, duc = F.duc;
    F.t += dt;
    aimStation(S, cmd);
    /* your fire */
    F.shotT = Math.max(0, F.shotT - dt);
    F.cover = Math.max(0, F.cover - dt);
    if (cmd.fire && F.shotT <= 0 && duc.ph !== "done") {
      F.shotT = SC.rof; F.cover = SC.cover;
      const x = S.aim.x + (rnd(S) - 0.5) * 3, y = S.aim.y + (rnd(S) - 0.5) * 3;
      const w = wolfAt(S, x, y);
      if (w) {
        w.st = "dead"; w.t = 0; F.left--; F.killed++;
        S.score += C.SCORE.guard; S.stats.guards++;
        ev.push({ t: "wolfDown", x, y, w: w.w, left: F.left });
      } else ev.push({ t: "shot", x, y });
    }
    /* the wolves */
    const active = F.wolves.filter(w => w.st !== "dead" && w.st !== "gone").length;
    F.spawnT -= dt;
    if (F.spawnT <= 0 && F.left - active > 0 && active < D.active && duc.ph !== "done") {
      const free = WIN.map((_, i) => i).filter(i => !F.wolves.some(w => w.w === i && w.st !== "gone" && !(w.st === "dead" && w.t > 1.2)));
      if (free.length) {
        /* a wolf near Duc is the one that matters: the box and the end windows when he is out there */
        const i = PX.pick(() => rnd(S), free);
        F.wolves.push({ w: i, st: "up", t: 0, aimT: between(S, D.aimT), at: rnd(S) < (duc.ph === "aboard" ? 0 : 0.5) ? "duc" : "train" });
        ev.push({ t: "wolfUp", w: i });
      }
      F.spawnT = 0.5 + rnd(S) * 1.1;
    }
    for (const w of F.wolves) {
      w.t += dt;
      if (w.st === "up" && w.t > SC.upT) { w.st = "aim"; w.t = 0; }
      else if (w.st === "aim" && w.t > w.aimT) {
        w.st = "fire"; w.t = 0;
        ev.push({ t: "wolfFire", w: w.w });
        const out = duc.ph === "run" || duc.ph === "throw" || duc.ph === "back";
        if (w.at === "duc" && out) {
          if (rnd(S) < D.wolfHit * 1.1) { duc.hurtT = 1.5; duc.wounds++; ev.push({ t: "ducHit", wounds: duc.wounds }); }
        } else if (rnd(S) < D.wolfHit) E.hit(S, 2.6, ev, "rifle");
      } else if (w.st === "fire" && w.t > 0.3) { w.st = "duck"; w.t = 0; }
      else if (w.st === "duck" && w.t > 0.25) w.st = "gone";
    }
    F.wolves = F.wolves.filter(w => w.st !== "gone" && !(w.st === "dead" && w.t > 1.4));
    /* Duc: he moves while you fire, or freely once the last wolf is down */
    const clear = F.left <= 0 && !F.wolves.some(w => w.st !== "dead");
    const go = (F.cover > 0 || clear) && duc.hurtT <= 0;
    duc.hurtT = Math.max(0, duc.hurtT - dt);
    const sp = SC.ducSpeed * (duc.wounds >= 2 ? 0.75 : 1);
    if (duc.ph === "run") {
      if (go) { duc.x += sp * dt; duc.step += dt; duc.face = 1; }
      if (duc.x >= SC.lever) { duc.x = SC.lever; duc.ph = "throw"; ev.push({ t: "atLever" }); }
    } else if (duc.ph === "throw") {
      if (go) duc.thr += dt;
      if (duc.thr >= SC.throwT) { duc.ph = "back"; ev.push({ t: "lever", opening: F.opening }); }
    } else if (duc.ph === "back") {
      if (go) { duc.x -= sp * dt; duc.step += dt; duc.face = -1; }
      if (duc.x <= SC.ducFrom) { duc.x = SC.ducFrom; duc.ph = "aboard"; F.doneT = 0; ev.push({ t: "aboard" }); }
    } else if (duc.ph === "aboard") {
      F.doneT += dt;
      if (F.doneT > 1.1) { duc.ph = "done"; E.captured(S, ev); }
    }
  };
  function aimStation(S, cmd) {
    const a = S.aim, SC = C.STATION;
    if (cmd.aimAt) { a.x = cmd.aimAt.x; a.y = cmd.aimAt.y; }
    else if (cmd.ax || cmd.ay) { a.x += cmd.ax * 230 * C.DT; a.y += cmd.ay * 190 * C.DT; }
    a.x = PX.clamp(a.x, 4, SC.w - 4); a.y = PX.clamp(a.y, 20, SC.h - 40);
  }

  /* ---- the air raid ---- */
  const A = () => C.AIR;
  E.startRaid = (S, ev) => {
    const D = C.DIFF[S.diff], dawn = S.t >= C.FIRST_LIGHT ? 1 : 0;
    const n = Math.round(between(S, D.planes)) + dawn + (S.t >= C.DAWN ? 1 : 0);
    const side = rnd(S) < 0.6 ? 1 : -1, planes = [];
    for (let i = 0; i < n; i++) planes.push(newPass(S, { id: S.nextId++, hp: 4, passes: 0, max: 2 + (rnd(S) < 0.5 ? 1 : 0) }, side, i * 1.6));
    S.raid = { planes, t: 0, side };
    S.stats.raids++;
    ev.push({ t: "raid", side, n });
  };
  function newPass(S, p, side, delay) {
    p.side = side; p.u = 0; p.T = 6.5 + rnd(S) * 2; p.delay = delay;
    p.z0 = side * (1700 + rnd(S) * 300); p.z1 = -side * (900 + rnd(S) * 300);
    p.x0 = (rnd(S) - 0.5) * 460; p.x1 = (rnd(S) - 0.5) * 520;
    p.lo = 38 + rnd(S) * 40;
    p.st = "run"; p.burstT = 0;
    place(p);
    return p;
  }
  /* where a fighter is on its pass: down out of the sky, low over the train at z = 0, and up and away */
  function place(p) {
    const u = PX.clamp(p.u, 0, 1), u0 = p.z0 / (p.z0 - p.z1);
    p.z = PX.lerp(p.z0, p.z1, u);
    p.x = PX.lerp(p.x0, p.x1, u);
    const k = u < u0 ? (u0 - u) / u0 : (u - u0) / (1 - u0);
    p.y = p.lo + (u < u0 ? 290 : 340) * k * k;
  }
  /* a fighter's place in a gun's sight: yaw right of the gun's line, pitch up from level */
  E.sight = (p, view) => {
    const ca = A().camY;
    if (view === "front") { if (p.z < 25) return null; return { yaw: Math.atan2(p.x, p.z), pitch: Math.atan2(p.y - ca, p.z), dist: Math.hypot(p.x, p.y - ca, p.z) }; }
    if (view === "rear") { if (p.z > -25) return null; return { yaw: Math.atan2(-p.x, -p.z), pitch: Math.atan2(p.y - ca, -p.z), dist: Math.hypot(p.x, p.y - ca, p.z) }; }
    return null;
  };
  E.stepRaid = (S, cmd, ev) => {
    const R = S.raid, D = C.DIFF[S.diff], dt = C.DT, g = S.gun;
    R.t += dt;
    g.shotT = Math.max(0, g.shotT - dt);
    const manned = S.view === "front" || S.view === "rear";
    let firing = false;
    if (cmd.fire && manned && g.shotT <= 0) { g.shotT = A().rof; firing = true; ev.push({ t: "gun", view: S.view }); }
    for (const p of R.planes) {
      if (p.st === "gone") continue;
      if (p.delay > 0) { p.delay -= dt; continue; }
      if (p.st === "down") {
        p.u += dt / p.T * 0.8; p.fall = (p.fall || 0) + dt;
        place(p); p.y -= 60 * p.fall * p.fall; p.x += p.drift * p.fall;
        if (p.y <= 0) { p.st = "gone"; ev.push({ t: "crash", x: p.x, z: p.z }); }
        continue;
      }
      p.u += dt / p.T;
      place(p);
      /* its guns: on the run in, close enough to hit */
      const app = p.side * p.z;
      p.burstT -= dt;
      if (app > 110 && app < 760 && p.burstT <= 0) {
        p.burstT = 0.42 + rnd(S) * 0.2;
        ev.push({ t: "strafe", side: p.side, x: p.x, z: p.z });
        const near = 1 - (app - 110) / 650;
        if (rnd(S) < D.planeHit * (0.55 + 0.6 * near) * (p.hp < 3 ? 0.6 : 1)) E.hit(S, 3.2, ev, "fighter");
      }
      /* the gun's fire */
      if (firing) {
        const s = E.sight(p, S.view);
        if (s) {
          const r = Math.max(0.016, A().planeR / s.dist * 1.15) + A().spread;
          if (Math.hypot(s.yaw - g.yaw, s.pitch - g.pitch) < r && rnd(S) < 0.6) {
            p.hp--; ev.push({ t: "planeHit", id: p.id, x: p.x, y: p.y, z: p.z });
            if (p.hp <= 0) {
              p.st = "down"; p.fall = 0; p.drift = (rnd(S) - 0.5) * 40;
              S.score += C.SCORE.plane; S.stats.planes++;
              ev.push({ t: "planeDown", x: p.x, y: p.y, z: p.z });
            }
          }
        }
      }
      if (p.u >= 1) {
        p.passes++;
        if (p.passes >= p.max) { p.st = "gone"; ev.push({ t: "planeAway" }); }
        else { newPass(S, p, rnd(S) < 0.5 ? 1 : -1, 1.2 + rnd(S) * 2.5); ev.push({ t: "comeAround", side: p.side, id: p.id }); }
      }
    }
    if (R.planes.every(p => p.st === "gone")) {
      ev.push({ t: "raidOver", downed: R.planes.filter(p => p.hp <= 0).length });
      S.raid = null;
      S.raidT = nextRaid(S);
    }
  };
  /* seconds to the next raid: fewer in the dark, more toward dawn, and after it (a Field aid's price) */
  const nextRaid = S => {
    const D = C.DIFF[S.diff], dark = S.t < C.FIRST_LIGHT - 60 && S.t > C.START + 60 ? 1.25 : 1, late = S.t >= C.DAWN ? 0.5 : 1;
    return between(S, D.raidGap) * dark * late;
  };
  E.nextRaid = nextRaid;
  E.aimGun = (S, cmd) => {
    const g = S.gun, a = A();
    if (cmd.aimAt && cmd.aimAt.yaw !== undefined) { g.yaw = cmd.aimAt.yaw; g.pitch = cmd.aimAt.pitch; }
    else if (cmd.ax || cmd.ay) { g.yaw += cmd.ax * a.aimRate * C.DT; g.pitch -= cmd.ay * a.aimRate * 0.8 * C.DT; }
    g.yaw = PX.clamp(g.yaw, -a.yawMax, a.yawMax); g.pitch = PX.clamp(g.pitch, a.pitchMin, a.pitchMax);
  };

  /* ---- the bridge ---- */
  E.startBridge = (S, e) => {
    const D = C.DIFF[S.diff], boats = [];
    for (let i = 0; i < D.boats; i++) {
      boats.push({ id: i, bear: -26 + (52 / (D.boats - 1 || 1)) * i + (rnd(S) - 0.5) * 8, range: 380 + rnd(S) * 900, vb: (rnd(S) < 0.5 ? -1 : 1) * (0.6 + rnd(S) * 1.2), vr: (rnd(S) - 0.5) * 30, hp: S.diff === 0 ? 1 : 2, st: "ok", fireT: 2.5 + rnd(S) * 4, t: 0 });
    }
    S.fight = { k: "bridge", e, boats, shells: [], incoming: [], reload: 0, t: 0, last: null, doneT: 0 };
    S.cannon = { bear: 0, range: 700 };
    S.tr.v = 0;
    S.phase = "bridge";
  };
  E.stepBridge = (S, cmd, ev) => {
    const F = S.fight, D = C.DIFF[S.diff], B = C.BRIDGE, dt = C.DT, c = S.cannon;
    F.t += dt;
    if (cmd.aimAt && cmd.aimAt.bear !== undefined) { c.bear = cmd.aimAt.bear; c.range = cmd.aimAt.range; }
    else { c.bear += (cmd.ax || 0) * B.bearRate * dt; c.range -= (cmd.ay || 0) * B.rangeRate * dt; }
    c.bear = PX.clamp(c.bear, -B.bearMax, B.bearMax); c.range = PX.clamp(c.range, B.rangeMin, B.rangeMax);
    F.reload = Math.max(0, F.reload - dt);
    if (F.doneT > 0) { F.doneT += dt; if (F.doneT > 1.8) E.bridgeCleared(S, ev); return; }
    if (cmd.firePress && F.reload <= 0) {
      F.reload = B.reload;
      const sh = { bear: c.bear + (rnd(S) - 0.5) * 0.9, range: c.range * (1 + (rnd(S) - 0.5) * 0.035), t: 0 };
      sh.T = 0.5 + sh.range / B.shellV;
      F.shells.push(sh);
      ev.push({ t: "cannon" });
    }
    for (const sh of F.shells) {
      sh.t += dt;
      if (sh.t < sh.T) continue;
      sh.done = true;
      let hit = null, best = null, bd = Infinity;
      for (const b of F.boats) {
        if (b.st !== "ok") continue;
        const wb = Math.max(0.9, 1050 / b.range);
        if (Math.abs(sh.bear - b.bear) < wb && Math.abs(sh.range - b.range) < B.hitRange) hit = b;
        const d = Math.abs(sh.bear - b.bear) / wb + Math.abs(sh.range - b.range) / 120;
        if (d < bd) { bd = d; best = b; }
      }
      if (hit) {
        hit.hp--;
        ev.push({ t: "boatHit", id: hit.id, bear: sh.bear, range: sh.range });
        if (hit.hp <= 0) {
          hit.st = "sinking"; hit.t = 0; S.score += C.SCORE.boat; S.stats.boats++;
          ev.push({ t: "boatSunk", id: hit.id, left: F.boats.filter(b => b.st === "ok").length });
        }
        F.last = { hit: true };
      } else {
        /* where it fell, against the nearest boat: the correction you need */
        const fb = best ? sh.bear - best.bear : 0, fr = best ? sh.range - best.range : 0;
        F.last = { bear: fb, range: fr, wb: best ? Math.max(0.9, 1050 / best.range) : 1 };
        ev.push({ t: "splash", bear: sh.bear, range: sh.range, dBear: fb, dRange: fr, wb: F.last.wb });
      }
    }
    F.shells = F.shells.filter(s => !s.done);
    /* the boats: drift along the river, and fire on the train */
    for (const b of F.boats) {
      b.t += dt;
      if (b.st === "sinking") { if (b.t > 2.2) b.st = "gone"; continue; }
      if (b.st !== "ok") continue;
      b.bear += b.vb * dt; b.range += b.vr * dt;
      if (Math.abs(b.bear) > B.bearMax - 3) b.vb = -Math.sign(b.bear) * Math.abs(b.vb);
      if (b.range < 340 || b.range > 1380) b.vr = -b.vr;
      b.fireT -= dt;
      if (b.fireT <= 0) {
        b.fireT = between(S, D.boatGap);
        ev.push({ t: "boatFire", id: b.id });
        const hitT = rnd(S) < D.boatHit;
        F.incoming.push({ t: 0, T: 0.9 + b.range / 900, hit: hitT, x: (rnd(S) - 0.5) * 2 });
      }
    }
    for (const s of F.incoming) {
      s.t += dt;
      if (s.t >= s.T && !s.done) {
        s.done = true;
        if (s.hit) E.hit(S, 5, ev, "boat"); else ev.push({ t: "nearMiss", x: s.x });
      }
    }
    F.incoming = F.incoming.filter(s => !s.done);
    if (!F.boats.some(b => b.st === "ok") && F.doneT === 0) { F.doneT = 0.01; ev.push({ t: "boatsAllSunk" }); }
  };
})();
