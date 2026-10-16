#!/usr/bin/env node
/*
 * The Puma Express, driven headless by the bot (js/engine/bot.js).
 *
 *   node tools/sim-check.js [--seeds N] [--verbose]
 *
 * Fails if the line is broken (a station or junction that cannot reach Port
 * Clair, a night dealt with no way through its cuts), if a step throws or
 * leaves a number that is not one, if the bot cannot bring the train in on
 * Easy every time and on Intermediate at least once, or if a night driven
 * twice from the same seed and commands comes out different. Expert, and
 * Classic (no aids, the fire fed by hand), are driven for the errors alone.
 */
"use strict";
const { load } = require("./lib.js");
const PX = load();
const L = PX.Line, E = PX.Engine, C = PX.C;
const args = process.argv.slice(2);
const seeds = +(args[args.indexOf("--seeds") + 1] || 2) || 2;
const verbose = args.includes("--verbose");
let fail = 0;
const bad = msg => { console.log("FAIL " + msg); fail++; };

/* ---- the line ---- */
for (const n of L.nodes) {
  if (n.kind === "wolf" || n.kind === "end" || n.final) continue;
  if (!L.route(n.i, L.FINAL)) bad(`line: no way from ${n.name} to Port Clair`);
}
for (const e of L.edges) if (!(e.len > 0.5)) bad(`line: edge ${L.nodes[e.a].name}-${L.nodes[e.b].name} is ${e.len} miles`);
const shortest = L.route(L.START, L.FINAL).reduce((s, e) => s + L.edges[e].len, 0);
console.log(`line: ${L.nodes.length} places, ${L.edges.length} lengths of track, ${L.BRIDGES.length} bridges, ${shortest.toFixed(0)} miles at the shortest`);

/* ---- a night ---- */
const finite = (o, path = "S", depth = 0) => {
  if (depth > 5 || o == null) return null;
  if (typeof o === "number") return Number.isFinite(o) ? null : path;
  if (typeof o !== "object") return null;
  for (const k of Object.keys(o)) { const r = finite(o[k], path + "." + k, depth + 1); if (r) return r; }
  return null;
};
function play(diff, seed, maxSteps, rec, classic) {
  const S = E.newGame({ diff, seed });
  if (!L.route(L.START, L.FINAL, S.cut)) throw new Error("dealt a night with no way through");
  const bot = PX.Bot.make({ classic });
  let steps = 0;
  const cmds = [], departs = [];
  let di = 0;
  for (; steps < maxSteps; steps++) {
    if (S.phase === "station") {
      const m = rec ? rec.departs[di++] : bot.depart(S);
      if (!rec) departs.push(m);
      E.depart(S, m);
    }
    const c = rec ? rec.cmds[steps] : bot.cmd(S);
    if (!rec) cmds.push(c);
    E.tick(S, c);
    if (S.phase === "over" || S.phase === "won") break;
    if (steps % 500 === 0) { const nf = finite(S); if (nf) throw new Error(`not a number: ${nf} at step ${steps}`); }
  }
  return { S, steps, cmds, departs };
}
const hash = S => { const s = JSON.stringify(S); let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return (h >>> 0).toString(16); };

const wins = [0, 0, 0];
for (const classic of [false, true]) for (const diff of [0, 1, 2]) for (let seed = 1; seed <= seeds; seed++) {
  const name = `${C.DIFF[diff].name}${classic ? " (Classic)" : ""}`;
  let r;
  try { r = play(diff, seed, 50 * 60 * 60, null, classic); } catch (e) { bad(`${name} seed ${seed}: ${e.stack}`); continue; }
  const S = r.S, mins = (r.steps / 50 / 60).toFixed(1);
  const why = S.phase === "won" ? "in at Port Clair" : S.end ? S.end.why : S.phase;
  const line = `${name} seed ${seed}: ${why} at ${PX.hhmm(S.t)} after ${mins} real min, ${S.stats.miles.toFixed(0)} miles, score ${S.score}, ${S.stats.stations} stations, ${S.stats.bridges} bridges, ${S.stats.planes} fighters, ${S.stats.raids} raids, wear ${Math.round(E.wear(S))}, ${E.paintings(S)} paintings`;
  if (S.phase === "won" && !classic) wins[diff]++;
  if (S.phase !== "won" && diff === 0 && !classic) bad(line); else console.log((S.phase === "won" ? "ok   " : "lost ") + line);
  if (seed === 1) {
    const again = play(diff, seed, r.steps + 1, r, classic);
    if (hash(again.S) !== hash(S)) bad(`${name} seed ${seed}: the replay came out different`);
    else console.log(`ok   ${name} seed ${seed}: the replay matches, step for step`);
  }
}
if (wins[1] === 0) bad(`Intermediate: the bot never brought the train in, in ${seeds} nights`);
/* the practice fights end */
for (const p of ["station", "bridge", "air"]) {
  const S = E.newGame({ diff: 1, seed: 3, practice: p }), bot = PX.Bot.make();
  let i = 0;
  for (; i < 50 * 60 * 6 && S.phase !== "over"; i++) E.tick(S, bot.cmd(S));
  if (S.phase !== "over") bad(`practice ${p}: never ended`); else console.log(`ok   practice ${p}: over in ${(i / 50).toFixed(0)} s, score ${S.score}`);
}
if (fail) { console.log(`sim-check: FAILED (${fail})`); process.exit(1); }
console.log("sim-check: every check passed");
