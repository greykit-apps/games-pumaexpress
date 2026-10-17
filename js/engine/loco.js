/* The Puma Express -- the engine itself: a steam locomotive, its fire, its
 * boiler, and the controls in the cab (1987's set, from C64-Wiki): the
 * throttle, the reverser, the brake, the firebox door and the shovel, the
 * safety valve, the whistle. Three gauges watch it: pressure, speed and the
 * boiler's temperature, with the water glass beside them.
 *
 * Coal on the grate burns into heat; heat raises the water's temperature and
 * so its pressure; the throttle spends that pressure as pull. An open door
 * lets cold air over the fire. Too little pressure and she stalls; too much
 * and the boiler is hurt, and then it goes. Throw the reverser while she
 * rolls and the motion pays for it.
 *
 * Speeds are miles an hour; the dynamics run in real seconds (C.DT a step),
 * the distance in the night's hours, so a mile goes by in a second or two. */
"use strict";
(() => {
  const C = PX.C, L = PX.Line;
  const E = PX.Engine = PX.Engine || {};

  E.newCab = () => ({ thr: 0, rev: 1, brake: 0.6, door: false, valve: false, grate: 7, T: 392, coal: C.LOCO.coal, water: C.LOCO.water, shovelT: 0, blasts: 0, blastT: 0, whistleT: 0, fireT: 0, dry: 0 });
  E.psi = S => C.LOCO.psi(S.cab.T);

  /* one shovelful: the door must be open (the fireman's shovel goes through it) */
  function shovel(S, ev, auto) {
    const c = S.cab;
    if (c.shovelT > 0) return;
    if (!auto && !c.door) { ev.push({ t: "doorShut" }); c.shovelT = 0.5; return; }
    if (c.coal < 1) { ev.push({ t: "noCoal" }); c.shovelT = 1.2; return; }
    if (c.grate >= C.LOCO.grateMax) { ev.push({ t: "grateFull" }); c.shovelT = 0.8; return; }
    c.coal -= 1; c.grate += 1; c.shovelT = C.LOCO.shovelGap * (auto ? 1.3 : 1);
    ev.push({ t: "shovel", auto: !!auto });
  }

  /* the controls, from the step's command */
  E.controls = (S, cmd, aids, ev) => {
    const c = S.cab, t = S.tr, dt = C.DT;
    if (cmd.set) {
      if (cmd.set.thr !== undefined) c.thr = PX.clamp(cmd.set.thr, 0, 1);
      if (cmd.set.brk !== undefined) c.brake = PX.clamp(cmd.set.brk, 0, 1);
    }
    if (cmd.thr) c.thr = PX.clamp(c.thr + cmd.thr * 0.55 * dt, 0, 1);
    if (cmd.brk) c.brake = PX.clamp(c.brake + cmd.brk * 0.9 * dt, 0, 1);
    if (cmd.rev) {
      const to = PX.clamp(c.rev + cmd.rev, -1, 1);
      if (to !== c.rev) {
        if (Math.abs(t.v) > 1.5) {
          if (aids.lock) { ev.push({ t: "revLocked" }); }
          else { c.rev = to; hurt(S, "motion", C.LOCO.revDamage, ev, "reverser"); ev.push({ t: "revRolling" }); }
        } else { c.rev = to; ev.push({ t: "rev", rev: to }); }
      }
    }
    if (cmd.door) { c.door = !c.door; ev.push({ t: "door", open: c.door }); }
    if (cmd.shovel) shovel(S, ev, false);
    c.valve = !!cmd.valve;
    if (cmd.whistle) {
      c.whistleT = 0.42; c.blasts++; c.blastT = 1.15;
      c.T -= C.LOCO.whistle;
      ev.push({ t: "whistle", n: c.blasts });
    }
  };

  /* the fire, the boiler, the pull: one step */
  E.steam = (S, aids, ev) => {
    const c = S.cab, t = S.tr, Lc = C.LOCO, dt = C.DT, D = C.DIFF[S.diff];
    c.shovelT = Math.max(0, c.shovelT - dt);
    c.whistleT = Math.max(0, c.whistleT - dt);
    /* the blasts, counted: a pause after them sets the points ahead */
    if (c.blastT > 0) {
      c.blastT -= dt;
      if (c.blastT <= 0) {
        const n = c.blasts; c.blasts = 0;
        const j = L.nextJunction(S);
        if (n > 3) ev.push({ t: "pointsMuddled" });
        else if (!j) ev.push({ t: "pointsNone" });
        else { S.pts[j.n] = n - 1; ev.push({ t: "pointsSet", n: j.n, p: n - 1, d: j.d, turn: L.choose(j.n, j.from, n - 1) !== L.choose(j.n, j.from, 1) }); }
      }
    }
    /* the fireman (a Field aid): keeps the pressure near working, and blows off before the red line */
    let P = Lc.psi(c.T);
    if (aids.fireman) {
      const want = c.thr > 0.05 || Math.abs(t.v) > 2 ? Lc.work + 12 : Lc.work - 20;
      if (P < want && c.grate < 8 && c.coal >= 1) shovel(S, ev, true);
      if (c.door && c.shovelT <= 0) c.door = false;
    }
    /* the fire */
    const v = Math.abs(t.v);
    const draught = 0.35 + 0.65 * Math.min(1, c.thr * (0.3 + v / 40));
    const burn = Math.min(c.grate, Lc.burn * (0.4 + 0.8 * draught) * (c.door ? 1.25 : 1) * dt);
    c.grate -= burn;
    const heat = Lc.heat * Math.min(1, c.grate / 4) * (0.55 + 0.45 * draught) * (c.door ? Lc.doorLoss : 1);
    /* the steam the cylinders take: little in mid gear, nothing without pressure */
    let use = Lc.useHeat * c.thr * (0.25 + Math.min(1.2, v / 45)) * (c.rev ? 1 : 0.12);
    if (P < 8) use = 0;
    const valve = c.valve || (aids.fireman && P > Lc.red + 6) ? Lc.valve : 0;
    const leak = S.dmg.boiler * 0.025;
    c.T += (heat - (c.T - 60) * Lc.cool - use - valve - leak) * dt;
    /* water: the tender feeds the boiler while it has any */
    c.water = Math.max(0, c.water - (use + valve * 0.3) * Lc.waterUse * dt);
    if (c.water <= 0) {
      /* a dry boiler: the crown of the firebox burns */
      c.dry += dt;
      if (c.grate > 1) hurt(S, "boiler", 3.2 * dt, ev, "dry");
      if (c.dry > 0.5 && (c.dry % 6) < dt) ev.push({ t: "noWater" });
    } else c.dry = 0;
    c.T = PX.clamp(c.T, Lc.tempMin, Lc.tempMax);
    P = Lc.psi(c.T);
    if (P > Lc.hurt) {
      hurt(S, "boiler", (P - Lc.hurt) * 0.06 * dt * D.dmg, ev, "pressure");
      if ((S.warnT.press || 0) <= 0) { ev.push({ t: "overPressure" }); S.warnT.press = 5; }
    }
    if (P > Lc.burst && S.phase !== "over") { E.end(S, "burst", ev); return; }
    /* the pull, the drag, the grade, the brake */
    const E0 = L.edges[t.e];
    const motion = 1 - S.dmg.motion / 160;
    const pull = Lc.pull * c.thr * Math.min(1.25, P / Lc.work) * Math.max(0.12, 1.22 - v / Lc.vmax) * c.rev * motion;
    const grade = -Lc.grade * E0.grade * t.face;
    let a = pull + grade;
    const sgn = Math.sign(t.v);
    a -= sgn * (Lc.drag * v + Lc.drag2 * v * v);
    const brake = Lc.brake * c.brake * Math.max(0, 1 - S.dmg.brakes / 110);
    if (v < 0.25 && Math.abs(pull + grade) < 0.12 + brake) { t.v = 0; return; }
    const nv = t.v + a * dt;
    /* the brake slows her toward a stand, never past it */
    const after = Math.abs(nv) - brake * dt;
    t.v = after <= 0 ? 0 : Math.sign(nv) * after;
    if (Math.abs(t.v) > 82) t.v = Math.sign(t.v) * 82;
  };

  /* damage to a part; every 25 to a wagon costs paintings */
  function hurt(S, part, n, ev, why) {
    if (S.konami) return;
    if (part === "cars") {
      const w = Math.min(C.WAGONS - 1, Math.floor(PX.rand(S) * C.WAGONS));
      const was = E.paintingsIn(S, w);
      S.dmg.cars[w] = Math.min(100, S.dmg.cars[w] + n * 1.6);
      const now = E.paintingsIn(S, w);
      if (now < was) ev.push({ t: "paintingsLost", w, n: was - now, left: E.paintings(S) });
      return;
    }
    S.dmg[part] = Math.min(100, S.dmg[part] + n);
    if (S.dmg[part] >= 100 && (part === "boiler" || part === "motion") && S.phase !== "over") E.end(S, part === "boiler" ? "boiler" : "motion", ev);
  }
  E.hurt = hurt;
  /* a hit from the enemy: which part it finds */
  E.hit = (S, n, ev, src) => {
    const r = PX.rand(S), part = r < 0.32 ? "boiler" : r < 0.56 ? "motion" : r < 0.72 ? "brakes" : "cars";
    hurt(S, part, n * C.DIFF[S.diff].dmg, ev, src);
    ev.push({ t: "trainHit", part, src });
    return part;
  };
  E.paintingsIn = (S, w) => Math.max(0, Math.ceil(C.PAINTINGS * (1 - S.dmg.cars[w] / 100) - 0.001));
  E.paintings = S => S.dmg.cars.reduce((s, _, w) => s + E.paintingsIn(S, w), 0);
  E.wear = S => Math.max(S.dmg.boiler, S.dmg.motion);
})();
