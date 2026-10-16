/* The Puma Express -- the namespace and the small helpers everything shares.
 *
 * DOM-free: tools/sim-check.js loads this file, and the engine, under node.
 * Nothing here may read the clock or Math.random: the engine's dice are
 * PX.rand(S), so a run is the same run every time it is driven from the
 * same seed and the same commands. */
"use strict";
var PX = globalThis.PX || {};
globalThis.PX = PX;

/* mulberry32, stepping the state it is handed: S.rs in a game */
PX.rand = o => {
  let t = (o.rs = (o.rs + 0x6D2B79F5) | 0);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
/* a private stream, for the line's layout and the art's noise */
PX.mulberry = seed => { const o = { rs: seed | 0 }; return () => PX.rand(o); };
PX.ri = (r, n) => Math.floor(r() * n);
PX.pick = (r, a) => a[Math.floor(r() * a.length)];
PX.shuffle = (r, a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

PX.clamp = (v, a, b) => v < a ? a : v > b ? b : v;
PX.lerp = (a, b, t) => a + (b - a) * t;
PX.smooth = t => { t = PX.clamp(t, 0, 1); return t * t * (3 - 2 * t); };

/* the clock: minutes after midnight, any day, as 21:40 */
PX.hhmm = m => { m = ((Math.floor(m) % 1440) + 1440) % 1440; return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0"); };

PX.esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

/* localStorage, tolerant of a private window or none at all */
PX.store = {
  get(k, d = null) { try { const v = globalThis.localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { globalThis.localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* no storage */ } },
  del(k) { try { globalThis.localStorage.removeItem(k); } catch (e) { /* no storage */ } },
};
