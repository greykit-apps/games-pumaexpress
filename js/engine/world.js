/* The Puma Express -- the night, step by step.
 *
 * E.newGame({diff, seed}) deals a night and starts it where 1987 did: in the
 * yards at Velmont, taking the train from the wolves. E.tick(S, cmd) runs one
 * step (C.DT of a real second, C.MIN_PER_STEP of the night) and returns what
 * happened, as events for the sound and the words on the screen.
 *
 * The phases: "capture" (a station fight), "station" (stopped at a station
 * of ours: coal, water, the report and the telegraph, waiting for
 * E.depart), "run" (on the line, where air raids come), "bridge" (gunboats),
 * then "won" or "over". The game waits in "station" for the player's
 * message; everything else runs on the clock. */
"use strict";
(() => {
  const C = PX.C, L = PX.Line, E = PX.Engine;

  E.newGame = ({ diff = 1, seed = 1, practice = null } = {}) => {
    const D = C.DIFF[diff];
    const S = {
      v: 1, seed, rs: seed | 0, diff, phase: "run", t: D.start, view: "cab", practice,
      tr: { e: L.adj[L.START][0], d: 0.12, face: 1, v: 0 },
      cab: E.newCab(),
      dmg: { boiler: 0, motion: 0, brakes: 0, cars: Array(C.WAGONS).fill(0) },
      score: 0, stats: { guards: 0, boats: 0, planes: 0, stations: 0, bridges: 0, miles: 0, raids: 0 },
      st: {}, br: {}, cut: {}, pts: {}, tasks: [], repairAt: -1, served: -1, visited: {},
      fight: null, raid: null, raidT: 0, aim: { x: 240, y: 120 }, gun: { yaw: 0, pitch: 0.14, shotT: 0 }, cannon: { bear: 0, range: 700 },
      warnT: {}, said: {}, nextId: 1, odo: 0, odoF: 0, end: null, dawnSaid: false, konami: false, cheated: false, steps: 0,
    };
    const r = PX.mulberry(seed * 7919 + diff);
    L.layout(S, r, D);
    /* the train faces west, out of the yard: the edge from Velmont runs to its junction */
    const e0 = L.edges[S.tr.e];
    S.tr.face = e0.a === L.START ? 1 : -1;
    S.tr.d = e0.a === L.START ? 0.12 : e0.len - 0.12;
    S.raidT = E.nextRaid(S) * 0.8;
    S.visited[L.START] = true;
    if (practice) E.practice(S, practice);
    else E.startStation(S, L.START, true);
    return S;
  };

  /* ---- a step ---- */
  E.tick = (S, cmd = {}) => {
    const ev = [];
    if (S.phase === "over" || S.phase === "won" || S.phase === "station") return ev;
    const aids = cmd.aids || {};
    S.steps++;
    if (cmd.view && cmd.view !== S.view && (cmd.view === "cab" || cmd.view === "front" || cmd.view === "rear")) { S.view = cmd.view; ev.push({ t: "view", view: S.view }); }
    for (const k of Object.keys(S.warnT)) S.warnT[k] -= C.DT;
    if (cmd.pts && aids.planner && S.pts[cmd.pts[0]] !== undefined) { S.pts[cmd.pts[0]] = cmd.pts[1]; ev.push({ t: "pointsSet", n: cmd.pts[0], p: cmd.pts[1], map: true }); }
    /* the clock */
    S.t += C.MIN_PER_STEP;
    if (S.t >= C.DAWN && !S.practice) {
      if (!aids.dawn) { E.end(S, "dawn", ev); return ev; }
      if (!S.dawnSaid) { S.dawnSaid = true; ev.push({ t: "dawn" }); }
      /* a soft dawn: ten points a minute of daylight */
      S.dawnDrain = (S.dawnDrain || 0) + C.MIN_PER_STEP * 10;
      if (S.dawnDrain >= 10) { S.dawnDrain -= 10; S.score = Math.max(0, S.score - 10); }
    } else if (S.t >= C.FIRST_LIGHT && !S.said.light && !S.practice) { S.said.light = true; ev.push({ t: "firstLight" }); }
    /* the Resistance's holds run out */
    for (const k of S.tasks) {
      if (k.done || S.t < k.until) continue;
      k.done = true;
      if (k.k === "station") { S.st[k.n].held = true; ev.push({ t: "taskLost", k: "station", n: k.n }); }
      if (k.k === "bridge") { S.br[k.e].guarded = true; ev.push({ t: "taskLost", k: "bridge", e: k.e }); }
    }

    if (S.phase === "capture") { E.stepStation(S, cmd, ev); return ev; }
    if (S.phase === "bridge") { E.stepBridge(S, cmd, ev); return ev; }
    if (S.phase !== "run") return ev;

    /* on the line: the cab, the steam, the gun */
    E.controls(S, cmd, aids, ev);
    E.steam(S, aids, ev);
    if (S.phase !== "run") return ev;
    if (S.view !== "cab") E.aimGun(S, cmd);
    if (S.raid) {
      E.stepRaid(S, cmd, ev);
      if (S.practice && !S.raid) { E.end(S, "practice", ev); return ev; }
      if (S.phase !== "run") return ev;
    } else if (!S.practice || S.practice === "air") {
      if (cmd.fire && (S.view === "front" || S.view === "rear") && S.gun.shotT <= 0) { S.gun.shotT = C.AIR.rof; ev.push({ t: "gun", view: S.view }); }
      S.gun.shotT = Math.max(0, S.gun.shotT - C.DT);
      S.raidT -= C.DT;
      const near = !S.practice && L.atStation(S) >= 0;
      if (S.raidT <= 0 && !near && !(S.practice && S.practice !== "air")) {
        E.startRaid(S, ev);
        if (aids.alarm && S.raid) { const v = S.raid.side > 0 ? "front" : "rear"; if (S.view !== v) { S.view = v; ev.push({ t: "view", view: v, auto: true }); } }
      }
    }
    if (S.practice) { S.odo += Math.abs(S.tr.v) * C.HOURS_PER_STEP; S.odoF += S.tr.v * C.HOURS_PER_STEP; return ev; }
    move(S, aids, ev);
    if (S.phase === "run") lookout(S, aids, ev);
    else S.look = null;
    return ev;
  };

  /* ---- along the line ---- */
  function move(S, aids, ev) {
    const t = S.tr;
    if (t.v === 0) { standing(S, ev); return; }
    let step = Math.abs(t.v) * C.HOURS_PER_STEP;
    S.stats.miles += step; S.odo += step; S.odoF += t.v * C.HOURS_PER_STEP;
    const m0 = L.mdir(S);
    let m = m0;
    for (let guard = 0; guard < 4 && step > 0; guard++) {
      const E0 = L.edges[t.e], from = t.d, room = m > 0 ? E0.len - t.d : t.d;
      const go = Math.min(step, room);
      t.d += m * go; step -= go;
      /* a cut in the line: off the rails */
      const c = S.cut[t.e];
      if (c && (from - c.at) * (t.d - c.at) <= 0) { c.known = true; E.end(S, "cut", ev); return; }
      if (step <= 0 && room > go) break;
      /* at a node */
      const n = m > 0 ? E0.b : E0.a, N = L.nodes[n];
      if (N.kind === "wolf") { E.end(S, "frontier", ev); return; }
      const exits = L.exits(n, t.e);
      if (!exits.length) {
        t.d = m > 0 ? E0.len : 0;
        if (Math.abs(t.v) > C.POINTS.buffer) { E.end(S, "buffer", ev); return; }
        t.v = 0; S.cab.thr = Math.min(S.cab.thr, 0.1); ev.push({ t: "buffers" }); return;
      }
      const p = S.pts[n] === undefined ? 1 : S.pts[n];
      const nx = L.choose(n, t.e, p);
      if (exits.length > 1) {
        const straight = L.choose(n, t.e, 1), v = Math.abs(t.v);
        if (nx !== straight && v > C.POINTS.rough) {
          if (v > C.POINTS.derail) { E.end(S, "derail", ev); return; }
          E.hurt(S, "motion", (v - C.POINTS.rough) * 1.1, ev, "points");
          ev.push({ t: "rough", v });
        }
        ev.push({ t: "overPoints", n, p, way: L.other(nx, n) });
      }
      /* onto the next edge, the same way along the ground */
      const NE = L.edges[nx], md = NE.a === n ? 1 : -1;
      t.face = md * Math.sign(t.v);
      t.e = nx; t.d = md > 0 ? 0 : NE.len;
      m = md;
    }
    arrive(S, aids, ev);
  }
  /* standing at a station of ours: she is serviced */
  function standing(S, ev) {
    const n = L.atStation(S);
    if (n < 0 || n === S.served || S.st[n].held) return;
    if (L.nodes[n].final) return;
    E.service(S, n, ev);
  }
  function arrive(S, aids, ev) {
    const n = L.atStation(S);
    if (S.served >= 0 && n !== S.served && milesTo(S, S.served) > 1.2) S.served = -1;
    if (n >= 0 && !S.visited[n]) { S.visited[n] = true; ev.push({ t: "station", n, held: S.st[n].held }); }
    if (n >= 0 && L.nodes[n].final) { E.win(S, ev); return; }
    /* what stops her: a station the wolves hold, a bridge their gunboats watch. Run up to either faster
     * than C.SET_PIECE_V and she cannot be pulled up: into the barricade, or onto the bridge under their
     * guns. Only as she reaches the place, though: a hold that runs out with her already inside it stops
     * her as it always did, since nobody could have braked for it. */
    const ahead = L.ahead(S, C.SET_PIECE_AT + 0.2), fast = Math.abs(S.tr.v) > C.SET_PIECE_V;
    for (const a of ahead) {
      if (a.k === "node" && L.nodes[a.n].kind === "st" && S.st[a.n].held && a.d <= C.BARRICADE_AT) {
        if (fast && a.d > C.BARRICADE_AT - 0.1) { E.end(S, "barricade", ev); S.end.n = a.n; return; }
        resolveTask(S, "station", a.n);
        ev.push({ t: "ambush", n: a.n, v: Math.abs(S.tr.v) });
        E.startStation(S, a.n, false); return;
      }
      if (a.k === "bridge" && S.br[a.e].guarded && a.d > 0 && a.d <= C.SET_PIECE_AT) {
        if (fast && a.d > C.SET_PIECE_AT - 0.1) { E.end(S, "span", ev); S.end.e = a.e; return; }
        resolveTask(S, "bridge", a.e);
        ev.push({ t: "gunboats", e: a.e, v: Math.abs(S.tr.v) });
        E.startBridge(S, a.e); return;
      }
    }
    /* the Resistance's work, reached in time */
    for (const a of ahead) {
      if (a.k === "node" && a.d < 0.6) resolveTask(S, "station", a.n);
      if (a.k === "bridge" && a.d < 0.4) resolveTask(S, "bridge", a.e);
    }
  }
  /* miles from the train to node n, if n is an end of her edge; far otherwise */
  function milesTo(S, n) { const t = S.tr, E0 = L.edges[t.e]; return E0.a === n ? t.d : E0.b === n ? E0.len - t.d : 99; }
  function resolveTask(S, k, x) {
    for (const t of S.tasks) if (!t.done && t.k === k && (k === "station" ? t.n === x : t.e === x)) { t.done = true; t.made = true; }
  }

  /* Duc's eyes: what he sees ahead, said once (1987: "Le Duc warns you when a switch is ahead") */
  function lookout(S, aids, ev) {
    const ahead = L.ahead(S, 6);
    let points = null;
    for (const a of ahead) {
      const key = a.k + ":" + (a.n !== undefined ? a.n : a.e);
      /* points set off the straight he calls further out, with the speed for them: from full speed she needs near three miles */
      const turn = a.k === "node" && L.isJunction(a.n) && L.choose(a.n, a.from, S.pts[a.n]) !== L.choose(a.n, a.from, 1);
      if (a.k === "node" && L.isJunction(a.n) && a.d < (turn ? 4.5 : 3.2) && a.d > 0.15 && !S.said[key]) {
        S.said[key] = true; ev.push({ t: "pointsAhead", n: a.n, d: a.d, p: S.pts[a.n], turn });
      }
      /* a station the wolves hold and a bridge their gunboats watch he calls further out too: she must be stood short of them */
      const block = a.k === "node" ? L.nodes[a.n].kind === "st" && S.st[a.n].held : a.k === "bridge" && S.br[a.e].guarded;
      if (a.k === "node" && L.nodes[a.n].kind === "st" && a.d < (block ? 6 : 4) && !S.said[key]) {
        S.said[key] = true; ev.push({ t: "stationAhead", n: a.n, d: a.d, held: S.st[a.n].held });
      }
      if (a.k === "bridge" && a.d < (block ? 6 : 4) && !S.said[key]) { S.said[key] = true; ev.push({ t: "bridgeAhead", e: a.e, d: a.d, guarded: S.br[a.e].guarded }); }
      if (aids.lookout && block) emergency(S, a, a.d - (a.k === "node" ? C.BARRICADE_AT : C.SET_PIECE_AT), key, ev);
      if (a.k === "end" && a.d < 2.5 && !S.said[key]) { S.said[key] = true; ev.push({ t: "endAhead", n: a.n, d: a.d }); }
      if (a.k === "wolf" && a.d < 5 && !S.said[key]) { S.said[key] = true; ev.push({ t: "frontierAhead", d: a.d }); }
      /* a cut: Duc sees it in the lamp a mile off; with the lookout aid, or when the report told of it, further, and she is braked for it */
      if (a.k === "cut") {
        const known = S.cut[a.e].known || aids.lookout;
        if ((known && a.d < 3.5) || a.d < 1.1) {
          if (!S.said[key]) { S.said[key] = true; ev.push({ t: "cutAhead", d: a.d, e: a.e, known }); S.cut[a.e].known = true; }
          if (aids.lookout) stopShort(S, a.d);
        }
      }
      if (aids.lookout && (a.k === "end" || a.k === "wolf") && a.d < 3) stopShort(S, a.d);
      /* points to be taken slower, if they are set against the straight */
      if (aids.lookout && !points && turn && a.d < 2.2) points = a;
    }
    easeFor(S, points);
    /* Field's lookout also slows her for a station she should stop at: no, that is the driver's; but for a stop at the end */
  }
  /* the lookout's hand on the brake: enough to stand short of d miles */
  function stopShort(S, d) {
    const v = Math.abs(S.tr.v); if (v < 0.5) return;
    /* the miles she needs to stop at this brake: v^2 / 2a, in miles (a in mph/s, the clock's rate) */
    const a = C.LOCO.brake * Math.max(0.15, 1 - S.dmg.brakes / 110), need = v * v / (2 * a) * (C.MIN_PER_STEP * C.HZ / 60) / 1;
    if (need > d - 0.35) { S.cab.thr = 0; S.cab.brake = Math.max(S.cab.brake, PX.clamp(need / Math.max(0.2, d - 0.35), 0.4, 1)); }
  }
  /* an emergency stop short of a held station's barricade or a watched bridge, d miles off: at the last
   * moment she can still be stood short of it, the throttle shut and the brake hard on, and Duc shouts */
  function emergency(S, a, d, key, ev) {
    const v = Math.abs(S.tr.v); if (v <= C.SET_PIECE_V || d <= 0) return;
    const dec = C.LOCO.brake * Math.max(0.15, 1 - S.dmg.brakes / 110), need = v * v / (2 * dec) * (C.MIN_PER_STEP * C.HZ / 60);
    if (need < d - 0.15) return;
    S.cab.thr = 0; S.cab.brake = 1;
    if (!S.said["stop:" + key]) { S.said["stop:" + key] = true; ev.push(a.k === "node" ? { t: "emergency", n: a.n, v } : { t: "emergency", e: a.e, v }); }
  }
  /* and for points set against the straight (a, or null when there are none in reach): the brake is a
   * lever that stays where it is left, so the lookout takes it only while she is too fast for them, and
   * gives the brake and then the throttle back as it found them, unless the driver has moved them since.
   * S.look is what it took: { thr, brake } as they were, and what it set them to. */
  function easeFor(S, a) {
    const c = S.cab, v = Math.abs(S.tr.v), vmax = C.POINTS.rough - 4;
    let h = S.look;
    if (a && v > vmax) {
      const dec = C.LOCO.brake * Math.max(0.15, 1 - S.dmg.brakes / 110), need = (v * v - vmax * vmax) / (2 * dec) * (C.MIN_PER_STEP * C.HZ / 60);
      if (need > a.d - 0.2) {
        if (!h) h = S.look = { thr: c.thr, brake: c.brake, setThr: -1, setBrake: -1 };
        c.thr = Math.min(c.thr, 0.15); c.brake = Math.max(c.brake, 0.7);
        h.setThr = c.thr; h.setBrake = c.brake;
        return;
      }
    }
    if (!h) return;
    /* slow enough for them: off the brake */
    if (h.setBrake >= 0 && c.brake === h.setBrake) c.brake = h.brake;
    h.setBrake = -1;
    /* over them: the throttle as it was */
    if (!a) { if (c.thr === h.setThr) c.thr = h.thr; S.look = null; }
  }

  /* ---- a station of ours: coal, water, repairs if asked for, the report ---- */
  E.service = (S, n, ev) => {
    const c = S.cab;
    S.served = n; S.phase = "station"; S.stopAt = n;
    S.tr.v = 0;
    c.coal = C.LOCO.coal; c.water = C.LOCO.water;
    S.t += C.SERVICE_MIN;
    let repaired = false;
    if (S.repairAt === n) {
      S.t += C.REPAIR_MIN; S.repairAt = -1; repaired = true;
      S.dmg.boiler = Math.max(0, S.dmg.boiler - 70); S.dmg.motion = Math.max(0, S.dmg.motion - 70); S.dmg.brakes = Math.max(0, S.dmg.brakes - 80);
    }
    S.report = E.report(S, n, repaired);
    ev.push({ t: "service", n, repaired });
  };
  /* what the Resistance at station n knows: the line within sixty miles, and what may be asked of it */
  E.report = (S, n, repaired) => {
    const near = new Set(), dist = { [n]: 0 }, q = [n];
    while (q.length) {
      const u = q.shift();
      for (const e of L.adj[u]) {
        const v = L.other(e, u), d = dist[u] + L.edges[e].len;
        near.add(e);
        if (d < 62 && (dist[v] === undefined || d < dist[v])) { dist[v] = d; q.push(v); }
      }
    }
    const cuts = [], held = [], guarded = [];
    for (const e of near) {
      if (S.cut[e]) { if (!S.cut[e].known) cuts.push(e); S.cut[e].known = true; }
      if (S.br[e] && S.br[e].guarded) guarded.push(e);
    }
    for (const k of Object.keys(dist)) if (+k !== n && L.nodes[k].kind === "st" && S.st[k].held) held.push(+k);
    const ns = L.nextStation(S), nb = L.nextBridge(S);
    const air = S.t >= C.FIRST_LIGHT - 60 ? "heavy" : S.diff === 2 ? "busy" : "quiet";
    return { n, repaired, cuts, held, guarded, next: ns, bridge: nb, air, known: Object.keys(S.cut).filter(e => S.cut[e].known).map(Number) };
  };
  /* the telegraph's message, and away: "station" take the next station, "bridge" take the next bridge, "repair", or "none" (1987's four) */
  E.depart = (S, msg) => {
    const ev = [], R = S.report;
    if (msg === "station" && R && R.next >= 0) {
      const d = distTo(S, x => x.k === "node" && x.n === R.next);
      const until = S.t + d / 30 * 60 + C.TASK_SLACK;
      if (S.st[R.next].held) { S.st[R.next].held = false; S.tasks.push({ k: "station", n: R.next, until }); }
      ev.push({ t: "sent", msg, n: R.next, until });
    } else if (msg === "bridge" && R && R.bridge >= 0) {
      const d = distTo(S, x => x.k === "bridge" && x.e === R.bridge);
      const until = S.t + d / 30 * 60 + C.TASK_SLACK;
      if (S.br[R.bridge].guarded) { S.br[R.bridge].guarded = false; S.tasks.push({ k: "bridge", e: R.bridge, until }); }
      ev.push({ t: "sent", msg, e: R.bridge, until });
    } else if (msg === "repair") {
      const ns = R ? R.next : -1;
      S.repairAt = ns;
      ev.push({ t: "sent", msg, n: ns });
    }
    S.report = null;
    S.phase = "run";
    return ev;
  };
  function distTo(S, f) { const a = L.ahead(S, 500).find(f); return a ? a.d : 60; }

  E.captured = (S, ev) => {
    const F = S.fight, n = F.n;
    S.st[n].held = false; S.stats.stations++;
    S.fight = null; S.phase = "run";
    ev.push({ t: "captured", n, opening: F.opening });
    if (S.practice) { E.end(S, "practice", ev); return; }
    E.service(S, n, ev);
  };
  E.bridgeCleared = (S, ev) => {
    const e = S.fight.e;
    S.br[e].guarded = false; S.stats.bridges++;
    S.fight = null; S.phase = "run";
    ev.push({ t: "bridgeClear", e });
    if (S.practice) E.end(S, "practice", ev);
  };
  E.win = (S, ev) => {
    S.phase = "won"; S.tr.v = 0;
    S.bonus = E.paintings(S) * C.SCORE.painting;
    S.score += S.bonus;
    S.end = { why: "won" };
    ev.push({ t: "won" });
  };
  E.end = (S, why, ev) => {
    if (S.phase === "over" || S.phase === "won") return;
    S.phase = "over"; S.end = { why };
    S.raid = null;
    ev.push({ t: "over", why });
  };
  /* the points at junction n, set from the map (a Field aid) */
  E.setPoints = (S, n, p) => { if (S.pts[n] === undefined || S.phase === "over" || S.phase === "won") return []; S.pts[n] = p; return [{ t: "pointsSet", n, p, map: true }]; };
  E.abandon = S => { const ev = []; E.end(S, "abandon", ev); return ev; };
  /* up up down down left right left right B A: coal, water, a mended engine, and no more harm this night */
  E.konami = S => {
    if (S.phase === "over" || S.phase === "won") return false;
    const c = S.cab;
    c.coal = C.LOCO.coal; c.water = C.LOCO.water;
    S.dmg.boiler = S.dmg.motion = S.dmg.brakes = 0;
    S.konami = true; S.cheated = true;
    return true;
  };

  /* ---- practice: one fight on its own ---- */
  E.practice = (S, what) => {
    if (what === "station") { const n = L.node("montfauve").i; S.st[n].held = true; E.startStation(S, n, false); }
    else if (what === "bridge") E.startBridge(S, L.BRIDGES[1]);
    else if (what === "air") { S.view = "front"; S.raidT = 2.5; S.tr.v = 42; S.cab.thr = 0.5; }
  };
})();
