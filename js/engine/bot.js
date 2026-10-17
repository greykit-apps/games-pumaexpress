/* The Puma Express -- a driver who never tires: drives the line to the coast
 * for tools/sim-check.js, and runs the train behind the title.
 *
 * PX.Bot.make({classic}) returns { cmd(S), depart(S) }. It works as a player
 * would, through the same commands: the whistle for the points, the throttle
 * and brake for the speed, the shovel through an open door (unless the
 * fireman is aboard), the guns and the cannon by aiming. It knows where the
 * line is cut, which no player does; a fair driver, not a fair witness. */
"use strict";
(() => {
  const C = PX.C, L = PX.Line, E = PX.Engine;
  const FIELD = { fireman: true, lock: true, lookout: true, planner: false, alarm: true, dawn: true };
  const CLASSIC = {};

  PX.Bot = {
    make({ classic = false } = {}) {
      const st = { whistle: 0, gap: 0, rs: 90210 };
      const aids = classic ? CLASSIC : FIELD;
      /* the exit wanted at junction n arriving along e, by the shortest way west round every cut */
      function wanted(S, n, e) {
        const cuts = Object.assign({}, S.cut, { [e]: true });
        for (const [k, b] of Object.entries(S.br)) if (b.guarded && S.diff === 2) { /* go round nothing: bridges are fought */ }
        const r = L.route(n, L.FINAL, cuts);
        return r && r.length ? r[0] : -1;
      }
      function drive(S, c) {
        const t = S.tr, cab = S.cab, v = Math.abs(t.v), P = E.psi(S);
        /* face the coast: the way to the coast is the way she should be going */
        const ahead = L.ahead(S, 60, t.face);
        /* the points ahead */
        const j = ahead.find(a => a.k === "node" && L.isJunction(a.n) && a.d > 0.1);
        let vmax = 54, stopAt = Infinity;
        if (j) {
          const want = wanted(S, j.n, j.from);
          if (want >= 0) {
            const p = [1, 0, 2].find(q => L.choose(j.n, j.from, q) === want);
            if (p !== undefined && S.pts[j.n] !== p && st.whistle === 0 && cab.blasts === 0 && cab.blastT <= 0 && j.d < 8) { st.whistle = p + 1; st.gap = 0; }
            if (want !== L.choose(j.n, j.from, 1)) vmax = Math.min(vmax, j.d < 2.4 ? C.POINTS.rough - 6 : 54);
          }
        }
        if (st.whistle > 0) { st.gap -= C.DT; if (st.gap <= 0 && cab.whistleT <= 0) { c.whistle = true; st.whistle--; st.gap = 0.3; } }
        /* stop at a station of ours when coal or water run short, or the fitters wait there */
        const stn = ahead.find(a => a.k === "node" && L.nodes[a.n].kind === "st" && a.d > C.STATION_ZONE);
        if (stn && !S.st[stn.n].held && !L.nodes[stn.n].final) {
          const need = cab.coal < 60 || cab.water < 60 || S.repairAt === stn.n;
          if (need) stopAt = stn.d + 0.05;
        }
        /* a held station or a watched bridge: crawl up to it, under the speed she can be pulled up from */
        const blk = ahead.find(a => (a.k === "node" && L.nodes[a.n].kind === "st" && S.st[a.n].held && a.d > C.BARRICADE_AT - 0.1) || (a.k === "bridge" && S.br[a.e].guarded && a.d > C.SET_PIECE_AT - 0.1));
        if (blk) stopAt = Math.min(stopAt, blk.d - (blk.k === "node" ? C.BARRICADE_AT : C.SET_PIECE_AT) + 0.1);
        const cut = ahead.find(a => a.k === "cut" || a.k === "end" || a.k === "wolf");
        if (cut) stopAt = Math.min(stopAt, cut.d - 0.4);
        if (stopAt < Infinity) { const vs = Math.sqrt(Math.max(0, 2 * 3.2 * stopAt * 120)); vmax = Math.min(vmax, vs); }
        /* throttle and brake */
        const want = t.face > 0 ? 1 : 1;
        if (cab.rev !== want && v < 0.5) c.rev = want - cab.rev > 0 ? 1 : -1;
        const target = vmax < 3 ? 0 : vmax;
        if (v < target - 4) { c.thr = 1; c.brk = -1; }
        else if (v > target + 2) { c.thr = -1; c.brk = 1; }
        else { c.thr = v < target ? 0.4 : -0.4; c.brk = -1; }
        if (target === 0 && v < 1) { c.brk = 1; c.thr = -1; }
        /* the fire, by hand */
        if (!aids.fireman) {
          if (P < 205 && cab.grate < 9 && cab.coal >= 1) { if (!cab.door) c.door = true; else c.shovel = true; }
          else if (cab.door) c.door = true;
          if (P > C.LOCO.red) c.valve = true;
        }
      }
      return {
        aids,
        cmd(S) {
          const c = { aids };
          if (S.phase === "capture") {
            const F = S.fight;
            const ws = F.wolves.filter(w => (w.st === "aim" || w.st === "up") && w.t > 0.25).sort((a, b) => b.t - a.t);
            if (ws.length) { const r = E.WINDOWS[ws[0].w]; c.aimAt = { x: r.fx, y: r.fy + 5 }; }
            c.fire = true;
            return c;
          }
          if (S.phase === "bridge") {
            const F = S.fight, b = F.boats.filter(x => x.st === "ok").sort((p, q) => p.range - q.range)[0];
            if (b) {
              const lead = b.vb * (0.5 + b.range / C.BRIDGE.shellV);
              c.aimAt = { bear: b.bear + lead + (PX.rand(st) - 0.5) * 1.4, range: b.range + (PX.rand(st) - 0.5) * 50 };
              c.firePress = F.reload <= 0;
            }
            return c;
          }
          if (S.phase !== "run") return c;
          drive(S, c);
          if (S.raid) {
            const ps = S.raid.planes.filter(p => p.st === "run" && p.delay <= 0);
            let best = null;
            for (const p of ps) for (const view of ["front", "rear"]) { const s = E.sight(p, view); if (s && (!best || s.dist < best.s.dist)) best = { s, view }; }
            if (best) {
              c.view = best.view;
              if (S.view === best.view) { c.aimAt = { yaw: best.s.yaw, pitch: best.s.pitch }; c.fire = best.s.dist < 900; }
            }
          } else if (S.view !== "cab") c.view = "cab";
          return c;
        },
        /* the telegraph: repairs when she is hurt, else clear the way ahead */
        depart(S) {
          const R = S.report;
          if (E.wear(S) > 45 && R.next >= 0) return "repair";
          if (R.next >= 0 && S.st[R.next].held) return "station";
          if (R.bridge >= 0 && S.br[R.bridge].guarded) return "bridge";
          return "none";
        },
      };
    },
  };
  PX.Bot.FIELD = FIELD;
})();
