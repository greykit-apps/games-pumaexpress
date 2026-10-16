/* The Puma Express -- the line: the railway across the puma country, from
 * the yards at Velmont in the east, where the Wolf Empire has loaded the art,
 * to Port Clair on the free coast in the west.
 *
 * The same map every night, as 1987's was. What changes from one night to the
 * next is whose hands it is in: which stations the wolves hold, which bridges
 * their gunboats watch, where the line has been cut. PX.Line.layout() deals
 * that from the seed, and always leaves a way through.
 *
 * Track is a graph. A node with three or more ways out is a junction, and the
 * points there are set by whistle: one blast for the northern way, two for
 * straight on, three for the southern (1987: up, middle, down). The train is
 * an edge, a distance along it, and the way the engine faces. */
"use strict";
(() => {
  const L = PX.Line = {};
  const MILES = 0.27;               /* miles to a unit of the map */

  /* x runs west to east (0 the coast), y north to south */
  const NODES = [
    ["velmont", "Velmont", 930, 300, "st", { start: true }],
    ["jeast", "Velmont junction", 868, 300, "jn"],
    ["brevent", "Brévent", 792, 172, "st"],
    ["hautrive", "Hautrive", 778, 322, "st"],
    ["jsouth", "Sorel junction", 734, 384, "jn"],
    ["frontier", "the Wolf frontier", 846, 566, "wolf"],
    ["vaux", "Vaux", 688, 470, "st"],
    ["corbeau", "Corbeau", 640, 140, "st"],
    ["montfauve", "Montfauve", 612, 312, "st"],
    ["saintombre", "Saint-Ombre", 560, 482, "st"],
    ["jmidn", "Carrières junction", 546, 162, "jn"],
    ["quarry", "the quarry", 520, 44, "end"],
    ["jmid", "Arles crossing", 520, 306, "jn"],
    ["jmids", "Ombrette junction", 480, 450, "jn"],
    ["lisiere", "Lisière", 424, 118, "st"],
    ["arlesse", "Arlesse", 420, 300, "st"],
    ["marcelles", "Marcelles", 384, 470, "st"],
    ["ravenne", "Ravenne", 282, 150, "st"],
    ["belcourt", "Belcourt", 270, 302, "st"],
    ["calveze", "Calvèze", 240, 452, "st"],
    ["jwestn", "Ravenne junction", 190, 212, "jn"],
    ["jwests", "Calvèze junction", 172, 360, "jn"],
    ["portclair", "Port Clair", 62, 286, "st", { final: true }],
  ];
  /* a, b, grade (percent, a to b), and a river crossed */
  const EDGES = [
    ["velmont", "jeast", 0.1],
    ["jeast", "brevent", 0.5],
    ["jeast", "hautrive", -0.2],
    ["brevent", "corbeau", -0.3, ["the Ombre", 0.62]],
    ["hautrive", "montfauve", -0.4, ["the Ombre", 0.44]],
    ["hautrive", "jsouth", 0.2],
    ["jsouth", "vaux", 0.4],
    ["jsouth", "frontier", -0.3],
    ["vaux", "saintombre", -0.2, ["the Ombre", 0.5]],
    ["corbeau", "jmidn", 0.6],
    ["jmidn", "quarry", 1.1],
    ["jmidn", "lisiere", -0.3],
    ["jmidn", "jmid", -0.5],
    ["montfauve", "jmid", 0.3],
    ["jmid", "arlesse", 0.4],
    ["jmid", "jmids", -0.2],
    ["saintombre", "jmids", 0.3],
    ["jmids", "marcelles", -0.1],
    ["lisiere", "ravenne", -0.6, ["the Sauve", 0.5]],
    ["arlesse", "belcourt", -0.5, ["the Sauve", 0.52]],
    ["marcelles", "calveze", -0.4, ["the Sauve", 0.45]],
    ["ravenne", "jwestn", -0.2],
    ["belcourt", "jwestn", 0.3],
    ["belcourt", "jwests", -0.3],
    ["calveze", "jwests", -0.2],
    ["jwestn", "portclair", -0.4],
    ["jwests", "portclair", -0.3],
  ];
  /* the rivers and the coast, for the map and the scenery */
  L.RIVERS = [
    { name: "the Ombre", pts: [[730, -10], [712, 90], [716, 172], [700, 250], [698, 320], [668, 410], [630, 470], [618, 560], [626, 620]] },
    { name: "the Sauve", pts: [[366, -10], [352, 80], [356, 134], [344, 220], [346, 300], [326, 390], [312, 462], [300, 540], [306, 620]] },
  ];
  L.COAST = [[54, -10], [40, 80], [48, 170], [30, 240], [44, 282], [26, 330], [36, 420], [22, 520], [30, 620]];
  L.W = 1000; L.H = 600;

  L.nodes = NODES.map(([id, name, x, y, kind, o], i) => Object.assign({ i, id, name, x, y, kind }, o || {}));
  const byId = Object.fromEntries(L.nodes.map(n => [n.id, n]));
  L.node = id => byId[id];
  L.edges = EDGES.map(([a, b, grade, br], i) => {
    const A = byId[a], B = byId[b], len = Math.round(Math.hypot(B.x - A.x, B.y - A.y) * MILES * 10) / 10;
    const e = { i, a: A.i, b: B.i, len, grade };
    if (br) {
      const at = br[1];
      const near = at < 0.5 ? A : B;
      e.bridge = { river: br[0], at: Math.round(len * at * 10) / 10, name: `${br[0].replace("the ", "")} bridge, ${near.name}` };
    }
    return e;
  });
  L.adj = L.nodes.map(n => L.edges.filter(e => e.a === n.i || e.b === n.i).map(e => e.i));
  L.other = (e, n) => L.edges[e].a === n ? L.edges[e].b : L.edges[e].a;
  L.isJunction = n => L.adj[n].length >= 3;
  L.START = byId.velmont.i;
  L.FINAL = byId.portclair.i;
  L.BRIDGES = L.edges.filter(e => e.bridge).map(e => e.i);
  L.STATIONS = L.nodes.filter(n => n.kind === "st").map(n => n.i);
  L.POINTS = ["north", "straight on", "south"];

  /* ---- which way the points send a train arriving at n along edge from ---- */
  const unit = (ax, ay, bx, by) => { const d = Math.hypot(bx - ax, by - ay) || 1; return [(bx - ax) / d, (by - ay) / d]; };
  L.exits = (n, from) => L.adj[n].filter(e => e !== from);
  /* p: 0 the northern way, 1 straight on, 2 the southern */
  L.choose = (n, from, p) => {
    const ex = L.exits(n, from);
    if (ex.length <= 1) return ex.length ? ex[0] : -1;
    const N = L.nodes[n], F = L.nodes[L.other(from, n)];
    const [hx, hy] = unit(F.x, F.y, N.x, N.y);
    let best = -1, bs = -Infinity;
    for (const e of ex) {
      const O = L.nodes[L.other(e, n)], [ux, uy] = unit(N.x, N.y, O.x, O.y);
      const s = p === 1 ? ux * hx + uy * hy : p === 0 ? -uy : uy;
      if (s > bs) { bs = s; best = e; }
    }
    return best;
  };
  /* the ways out of a junction, by setting: which settings lead where (two settings may lead the same way) */
  L.ways = (n, from) => [0, 1, 2].map(p => L.choose(n, from, p));

  /* ---- a night's layout, dealt from the seed ---- */
  L.layout = (S, r, D) => {
    const st = {}, br = {}, cut = {};
    for (const i of L.STATIONS) st[i] = { held: false, until: 0, seen: false };
    st[L.START].held = true;
    /* the further west, the less sure the wolves' grip: weight the dice a little */
    const mid = L.STATIONS.filter(i => i !== L.START && i !== L.FINAL);
    for (const i of mid) { const w = 1 - L.nodes[i].x / 1000; st[i].held = r() < D.held * (0.75 + 0.5 * (1 - w)); }
    const brs = PX.shuffle(r, L.BRIDGES.slice());
    for (const e of L.BRIDGES) br[e] = { guarded: false, until: 0 };
    for (const e of brs.slice(0, D.guarded)) br[e].guarded = true;
    /* the cuts: never the first mile out of a station, never where it leaves no way west */
    const pool = PX.shuffle(r, L.edges.map(e => e.i).filter(i => { const e = L.edges[i]; return L.nodes[e.a].kind !== "wolf" && L.nodes[e.b].kind !== "wolf" && L.nodes[e.b].kind !== "end" && e.a !== L.START && e.b !== L.START; }));
    let n = 0;
    for (const e of pool) {
      if (n >= D.cuts) break;
      cut[e] = { at: 0, known: false };
      if (!L.route(L.START, L.FINAL, cut)) { delete cut[e]; continue; }
      const E = L.edges[e];
      cut[e].at = Math.round((1.5 + r() * (E.len - 3)) * 10) / 10;
      n++;
    }
    S.st = st; S.br = br; S.cut = cut;
    /* the points, as the wolves left them */
    S.pts = {};
    for (const nd of L.nodes) if (L.isJunction(nd.i)) S.pts[nd.i] = PX.ri(r, 3);
  };

  /* ---- the shortest way from node a to node b, round the cuts given; a list of edges ---- */
  L.route = (a, b, cuts = {}, avoid = () => 0) => {
    const dist = L.nodes.map(() => Infinity), via = L.nodes.map(() => -1), done = L.nodes.map(() => false);
    dist[a] = 0;
    for (;;) {
      let u = -1;
      for (let i = 0; i < dist.length; i++) if (!done[i] && dist[i] < Infinity && (u < 0 || dist[i] < dist[u])) u = i;
      if (u < 0) return null;
      if (u === b) break;
      done[u] = true;
      if (L.nodes[u].kind === "wolf" || L.nodes[u].kind === "end") continue;
      for (const e of L.adj[u]) {
        if (cuts[e]) continue;
        const v = L.other(e, u), d = dist[u] + L.edges[e].len + avoid(e, v);
        if (d < dist[v]) { dist[v] = d; via[v] = e; }
      }
    }
    const out = [];
    for (let n = b; n !== a; n = L.other(via[n], n)) out.unshift(via[n]);
    return out;
  };

  /* ---- the train on the line ---- */
  /* the way she is going along her edge: +1 toward b, -1 toward a; when standing, the way she faces */
  L.mdir = S => { const t = S.tr; return t.v < 0 ? -t.face : t.face; };
  /* the node she is heading for, and how far */
  L.toward = S => { const t = S.tr, E = L.edges[t.e], m = L.mdir(S); return m > 0 ? [E.b, E.len - t.d] : [E.a, t.d]; };
  /* where she is on the map */
  L.xy = S => { const t = S.tr, E = L.edges[t.e], A = L.nodes[E.a], B = L.nodes[E.b], f = E.len ? t.d / E.len : 0; return [A.x + (B.x - A.x) * f, A.y + (B.y - A.y) * f]; };
  /* the station she is standing in, if any */
  L.atStation = S => {
    const t = S.tr, E = L.edges[t.e];
    if (t.d <= C().STATION_ZONE && L.nodes[E.a].kind === "st") return E.a;
    if (E.len - t.d <= C().STATION_ZONE && L.nodes[E.b].kind === "st") return E.b;
    return -1;
  };
  const C = () => PX.C;

  /* what lies ahead, the way she is going (or facing), following the points as set, out to max miles.
     Each: { k: "node"|"bridge"|"cut"|"end"|"wolf", d: miles, n|e } */
  /* what lies ahead, nearest first, as far as Port Clair: she is home there, so the way on past it is no
   * one's route. Only the picture (pastFinal) looks on along the rails beyond. */
  L.ahead = (S, max = 30, dirOverride = 0, pastFinal = false) => {
    const out = [], t = S.tr;
    let e = t.e, m = dirOverride || L.mdir(S), pos = t.d, run = 0;
    for (let guard = 0; guard < 40 && run <= max; guard++) {
      const E = L.edges[e];
      const fwd = x => m > 0 ? x - pos : pos - x;       /* miles ahead along this edge to a point at x */
      if (E.bridge) { const b = E.bridge.at, dd = fwd(b); if (dd > -0.2) out.push({ k: "bridge", d: run + dd, e }); }
      const c = S.cut[e];
      if (c) { const dd = fwd(c.at); if (dd > 0) out.push({ k: "cut", d: run + dd, e }); }
      const n = m > 0 ? E.b : E.a, dn = m > 0 ? E.len - pos : pos;
      run += dn;
      const N = L.nodes[n];
      out.push({ k: "node", d: run, n, from: e });
      if (N.kind === "wolf") { out.push({ k: "wolf", d: run, n }); break; }
      if (N.final && !pastFinal) break;
      const nx = L.choose(n, e, S.pts[n] === undefined ? 1 : S.pts[n]);
      if (nx < 0) { out.push({ k: "end", d: run, n }); break; }
      m = L.edges[nx].a === n ? 1 : -1;
      pos = m > 0 ? 0 : L.edges[nx].len;
      e = nx;
    }
    return out.filter(x => x.d <= max).sort((a, b) => a.d - b.d);
  };
  /* the next station and the next bridge the points lead to, for the telegraph */
  L.nextStation = S => { const a = L.ahead(S, 400).find(x => x.k === "node" && L.nodes[x.n].kind === "st" && x.d > C().STATION_ZONE); return a ? a.n : -1; };
  L.nextBridge = S => { const a = L.ahead(S, 400).find(x => x.k === "bridge" && x.d > 0.3); return a ? a.e : -1; };
  L.nextJunction = S => { const a = L.ahead(S, 400).find(x => x.k === "node" && L.isJunction(x.n) && x.d > 0.05); return a || null; };
})();
