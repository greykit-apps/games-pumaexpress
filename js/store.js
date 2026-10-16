/* The Puma Express -- the settings, the high scores, a night left to come
 * back to, and nothing else. Every key begins pumaexpress_ (greykit.games
 * STANDARD.md §5), so Settings can forget them by that prefix and leave the
 * rest of greykit.com alone (§2). */
"use strict";
(() => {
  const KEY_PREFS = "pumaexpress_prefs_v1", KEY_SCORES = "pumaexpress_scores_v1", KEY_GAME = "pumaexpress_game_v1", KEY_NAME = "pumaexpress_name_v1";
  PX.KEY_MUTED = "pumaexpress_muted_v1";
  PX.KEY_DIFF = "pumaexpress_diff_v1";

  /* ---- the aids: Classic is 1987, Field is a modern helping hand ---- */
  PX.AID_LIST = [
    ["fireman", "A fireman aboard", "Someone else keeps the fire: shovels when the pressure drops, blows off before the red line. You drive."],
    ["lock", "Reverser lock", "The reverser will not move while she rolls, instead of the motion paying for it."],
    ["lookout", "Lookout", "Duc spots a cut in the line, a dead end or the frontier in good time and brakes for it, and slows her for points set against the straight."],
    ["route", "Route on the map", "The map lights the way the points will take you, to the coast or to wherever it ends."],
    ["planner", "Points from the map", "Click a junction on the map to set its points, as well as by whistle."],
    ["ahead", "Line ahead", "A panel with the next points, station and bridge, how far, and whose."],
    ["gunnery", "Gunnery help", "Brackets on fighters in range that light when the sight is on them; where a shell laid now would come down; Duc's way up the platform."],
    ["alarm", "Battle stations", "An air raid takes you straight to the gun that faces it."],
    ["fast", "Fast running", "Hold Shift on a quiet stretch and the night runs four times as fast."],
    ["dawn", "Soft dawn", "Dawn does not end the run: the fighters come thicker and every minute of daylight costs ten points."],
  ];
  PX.AIDS = { field: {}, classic: {} };
  for (const [k] of PX.AID_LIST) { PX.AIDS.field[k] = true; PX.AIDS.classic[k] = false; }

  /* the system's "reduce motion": screen shake starts off, and nothing on the HUD blinks */
  const CALM = typeof matchMedia === "function" ? matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };
  PX.calm = () => CALM.matches;

  PX.SPEEDS = { classic: ["Normal", 50], relaxed: ["Relaxed", 40], brisk: ["Brisk", 60] };
  /* learned: the first night's key strip has done its work; resume: a night left in the middle is kept */
  PX.prefs = Object.assign({ aids: "field", over: {}, speed: "classic", scanlines: false, shake: !CALM.matches, learned: false, resume: true }, PX.store.get(KEY_PREFS, {}));
  if (!PX.AIDS[PX.prefs.aids]) PX.prefs.aids = "field";
  /* the mouse and the control keys were an aid once; they work in every mode now */
  delete PX.prefs.over.direct;
  PX.savePrefs = () => PX.store.set(KEY_PREFS, PX.prefs);
  PX.aid = name => { const o = PX.prefs.over[name]; return o === undefined ? !!PX.AIDS[PX.prefs.aids][name] : !!o; };
  PX.setAids = set => { PX.prefs.aids = set; PX.prefs.over = {}; PX.savePrefs(); };
  PX.setAid = (name, on) => { if (on === !!PX.AIDS[PX.prefs.aids][name]) delete PX.prefs.over[name]; else PX.prefs.over[name] = on; PX.savePrefs(); };
  PX.aidsLabel = () => (PX.prefs.aids === "field" ? "Field" : "Classic") + (Object.keys(PX.prefs.over).length ? ", adjusted" : "");

  /* ---- a night left in the middle ---- */
  PX.loadGame = () => { const g = PX.store.get(KEY_GAME, null); return g && g.S && g.S.v === 1 ? g : null; };
  PX.saveGame = S => PX.store.set(KEY_GAME, { S, at: Date.now() });
  PX.clearGame = () => PX.store.del(KEY_GAME);

  /* ---- the high scores: the best ten, in this browser ---- */
  PX.scores = () => { const s = PX.store.get(KEY_SCORES, []); return Array.isArray(s) ? s : []; };
  PX.qualifies = score => score > 0 && (PX.scores().length < 10 || score > PX.scores()[9].score);
  PX.addScore = e => {
    const s = PX.scores().concat([e]).sort((a, b) => b.score - a.score).slice(0, 10);
    PX.store.set(KEY_SCORES, s);
    return s.indexOf(e);
  };
  PX.lastName = () => PX.store.get(KEY_NAME, "");
  PX.setLastName = n => PX.store.set(KEY_NAME, n);

  /* ---- Forget everything (STANDARD.md §2): this game's keys, by prefix ---- */
  PX.forgetEverything = () => {
    for (const area of ["localStorage", "sessionStorage"]) {
      try {
        const s = globalThis[area];
        for (let i = s.length - 1; i >= 0; i--) { const k = s.key(i); if (k && k.startsWith("pumaexpress")) s.removeItem(k); }
      } catch (e) { /* no storage */ }
    }
    location.reload();
  };
})();
