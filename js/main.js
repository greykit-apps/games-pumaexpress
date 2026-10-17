/* The Puma Express -- boot, title, the loop, and everything between.
 *
 * The greykit.games boot (the canon @gk-title block, STANDARD.md §3) while
 * the art is drawn, then the block's default title in the engine's green and
 * brass: the train running through the night behind the name and the menu
 * (§6's items and keys), the credit. A new night opens on the Resistance's
 * orders, then the yard at Velmont. The engine runs at fifty
 * steps a second (or forty, or sixty: Settings), whatever the screen's rate;
 * Duc says what he sees, and the engine is heard. */
"use strict";
(() => {
  const E = PX.Engine, C = PX.C, L = PX.Line, K = PX.K, UI = PX.UI, R = PX.Render, HUD = PX.HUD, SFX = PX.SFX, I = PX.Input, esc = PX.esc, $ = id => document.getElementById(id);
  const game = PX.game = { mode: "boot", S: null, ui: { mapView: false, aids: {}, cursor: null, fast: false }, step: 20, acc: 0, last: 0, warned: 0, teach: null, said: {} };

  /* ---- sound on and off (STANDARD.md §8) ---- */
  const readMuted = () => { try { return globalThis.localStorage.getItem(PX.KEY_MUTED) === "1"; } catch (e) { return false; } };
  SFX.muted = readMuted();
  game.toggleMute = () => {
    SFX.unlock();
    SFX.setMuted(!SFX.muted);
    try { globalThis.localStorage.setItem("pumaexpress_muted_v1", SFX.muted ? "1" : "0"); } catch (e) { /* no storage */ }
    syncSound();
    if (!SFX.muted) { SFX.play("menu"); if (game.mode === "title" && !SMALL.matches) SFX.startTune(); }
    if (game.mode === "play") HUD.toast(SFX.muted ? "Sound off" : "Sound on", "", 1200);
  };
  function syncSound() { const b = $("snd"); if (b) { b.setAttribute("aria-pressed", String(!SFX.muted)); b.classList.toggle("muted", SFX.muted); } }
  const SMALL = matchMedia("(max-width: 759px), (max-height: 479px)");

  game.applySpeed = () => { game.step = 1000 / (PX.SPEEDS[PX.prefs.speed] || PX.SPEEDS.classic)[1]; };
  game.applyLook = () => { $("stage").classList.toggle("scan", !!PX.prefs.scanlines); };
  game.syncAids = () => { for (const [k] of PX.AID_LIST) game.ui.aids[k] = PX.aid(k); };

  /* ---- the title: the canon default (@gk-title v0.4), in the engine's green lined out in brass ---- */
  function titleCfg() {
    const saved = PX.loadGame(), best = PX.scores()[0], d = C.DIFF[PX.store.get(PX.KEY_DIFF, 1)] || C.DIFF[1];
    return {
      name: "The Puma Express",
      scene: true,
      primary: saved ? "resume" : "new",
      items: [
        saved && { act: "resume", label: "Resume game", key: "R", meta: `${PX.hhmm(saved.S.t)}, ${L.nodes[L.edges[saved.S.tr.e].a].name.replace("Velmont junction", "Velmont")}` },
        { act: "new", label: "New game", key: "N", meta: d.name },
        { act: "practice", label: "Practice a fight", key: "P", meta: "station, air, bridge" },
        { act: "scores", label: "High scores", key: "O", meta: best ? best.score.toLocaleString("en-US") : "" },
        "gap",
        { act: "settings", label: "Settings", key: "S" },
        { act: "help", label: "Help", key: "?" },
        { act: "about", label: "About", key: "A" },
      ],
    };
  }
  function openTitle() {
    if (game.intro) game.intro.cancel();
    game.mode = "title";
    const el = $("title");
    el.innerHTML = titleHTML(titleCfg());
    el.querySelector(".scene").innerHTML = '<canvas class="pe-scene"></canvas>';
    el.hidden = false;
    $("game").hidden = true;
    document.body.classList.add("on-title");
    sizeScene();
  }
  function sizeScene() {
    const cv = document.querySelector("#title .pe-scene");
    if (!cv) return;
    const k = scaleK();
    cv.width = Math.ceil(innerWidth / k); cv.height = Math.ceil(innerHeight / k);
  }
  /* the canon entrance (the menu prints in, the name decodes), or, coming back to it, only the focus */
  function showTitle(print = true) {
    const t = document.querySelector("#title .gk-title");
    if (!t) return;
    if (print) return revealTitle(t);
    const b = t.querySelector(".gk-primary") || t.querySelector(".gk-menu button");
    if (b) b.focus({ preventScroll: true });
  }
  /* the opening, the first time the title shows: the train alone, then the name fading in a word at a time
     (each word WORDS seconds after the first, "The Puma" close together), a hold, then the menu. A key or a
     click skips to the end of it */
  const INTRO = { name: 1500, menu: 5800, done: 7000 }, WORDS = [0, 0.4, 1.4];
  /* hidden from the moment it is built, behind the boot; the returned start runs it once the boot is done */
  function introTitle() {
    const t = document.querySelector("#title .gk-title");
    if (!t || matchMedia("(prefers-reduced-motion: reduce)").matches) return () => showTitle();
    const later = t.querySelectorAll(".gk-menu, footer");
    /* each word in a span of its own, with its turn */
    let w = 0;
    for (const line of t.querySelectorAll("h1 span[data-t]")) line.innerHTML = line.dataset.t.split(" ").map(x => `<span class="pe-w" style="--w:${WORDS[Math.min(w++, WORDS.length - 1)]}s">${esc(x)}</span>`).join(" ");
    for (const n of later) n.inert = true;
    t.classList.add("pe-intro");
    const timers = [];
    const menu = () => {
      game.intro = null;
      for (const n of later) n.inert = false;
      t.classList.add("pe-name", "pe-menu", "gk-rise");
      showTitle(false);
      timers.push(setTimeout(() => t.classList.remove("pe-intro", "pe-name", "pe-menu"), INTRO.done - INTRO.menu));
    };
    const start = () => { if (game.intro === intro) timers.push(setTimeout(() => t.classList.add("pe-name"), INTRO.name), setTimeout(menu, INTRO.menu)); };
    const intro = game.intro = {
      cancel() { timers.forEach(clearTimeout); game.intro = null; },
      skip() { this.cancel(); game.skippedAt = performance.now(); for (const n of later) n.inert = false; t.classList.remove("pe-intro", "pe-name", "pe-menu"); showTitle(false); },
    };
    return start;
  }
  game.refreshTitle = () => { if (game.mode !== "title") return; openTitle(); showTitle(false); };
  game.toTitle = () => {
    UI.close(true);
    game.S = null; game.ui.mapView = false;
    SFX.stopLoops();
    I.clear(); HUD.clear(); PX.FX.clear();
    openTitle(); showTitle();
    if (!SMALL.matches) SFX.startTune();
  };
  function titleAct(a) {
    SFX.unlock();
    if (a === "resume") return resume();
    if (a === "new") return UI.newGame();
    if (a === "practice") return UI.practice();
    if (a === "scores") return UI.scores();
    if (a === "settings") return UI.settings();
    if (a === "help") return UI.help();
    if (a === "about") return UI.about();
  }
  function titleKey(ev) {
    const k = ev.key.length === 1 ? ev.key.toLowerCase() : ev.key;
    /* Tab goes round the title's own controls, never out of the page */
    if (k === "Tab") { const f = UI.focusables($("title")); if (f.length) { ev.preventDefault(); const i = f.indexOf(document.activeElement); f[i < 0 ? 0 : (i + (ev.shiftKey ? -1 : 1) + f.length) % f.length].focus(); } return; }
    if (k === "Enter" || k === " " || k === "Shift") return;
    const menu = document.querySelector("#title .gk-menu"), hit = menu && titleKeyButton(menu, k);
    if (hit) { ev.preventDefault(); titleAct(hit.dataset.act); return; }
    if (menu) titleArrow(menu, ev);
  }

  /* ---- a night ---- */
  game.start = diff => { PX.clearGame(); startPlay(E.newGame({ diff, seed: 1 + Math.floor(Math.random() * 2 ** 30) }), true); };
  game.practice = what => startPlay(E.newGame({ diff: 1, seed: 1 + Math.floor(Math.random() * 2 ** 30), practice: what }), true);
  function startPlay(S, fresh) {
    UI.close(true);
    game.S = S; game.mode = "play"; game.ui.mapView = false; game.warned = 0; game.said = {};
    SFX.stopTune();
    $("title").hidden = true; $("title").innerHTML = "";
    document.body.classList.remove("on-title");
    $("game").hidden = false;
    I.clear(); HUD.clear(); PX.FX.clear();
    game.syncAids(); fit();
    R.init($("screen"));
    game.acc = 0; game.odoAt = S.odo; game.chuff = 0; game.clack = 0;
    game.teach = fresh && !PX.prefs.learned && !S.practice ? { miles: 0 } : null;
    if (S.practice) HUD.say({ station: "Cover me to the lever and back. I only go while you're firing.", air: "Fighters coming. 1 for the front gun, 2 for the rear.", bridge: "Gunboats. Lay the cannon and watch where it falls." }[S.practice], "", 4200);
    else if (fresh) HUD.say("Velmont yards. Cover me to the points lever, then we take her.", "", 4600);
    else HUD.toast(`${PX.hhmm(S.t)}: back on the line`, "", 2000);
    if (S.phase === "station" && S.report) UI.report(S);
  }
  function resume() {
    const g = PX.loadGame();
    if (!g) return;
    startPlay(g.S, false);
    if (g.S.phase !== "station") game.pause();
  }
  game.setView = v => {
    const S = game.S; if (!S || game.mode !== "play") return;
    if (v === "map") { if (S.practice) return; game.ui.mapView = !game.ui.mapView; SFX.play("menu"); game.acc = 0; return; }
    game.ui.mapView = false;
    if (S.phase === "run" && (v === "front" || v === "rear" || v === "cab")) { I.view = v; SFX.play("menu"); }
  };
  /* not once the night is over: its end is showing, and the sheet after it is on its way */
  game.pause = () => { if (game.mode !== "play" || UI.sheet || PX.Ending.has(game.S)) return; I.clear(); checkpoint(); UI.pause(); };
  game.unpause = () => { game.acc = 0; game.last = performance.now(); };
  game.leave = () => { checkpoint(true); game.toTitle(); };
  game.abandon = () => { const S = game.S; if (!S) return; E.abandon(S); PX.clearGame(); finish(); };
  game.depart = msg => {
    const S = game.S; if (!S) return;
    const evs = E.depart(S, msg);
    events(S, evs);
    game.acc = 0; game.last = performance.now();
    checkpoint();
  };
  function checkpoint(force) {
    const S = game.S;
    if (!S || game.mode !== "play" || S.practice || S.phase === "over" || S.phase === "won") return;
    if (PX.prefs.resume || force) PX.saveGame(S);
  }
  function finish() {
    const S = game.S;
    SFX.stopLoops();
    if (!S.practice) PX.clearGame();
    game.mode = "over";
    HUD.end(null);
    UI.gameOver(S);
  }

  /* ---- what happened this step: sounds, and Duc's words ---- */
  const say = (t, tone, ms) => HUD.say(t, tone, ms);
  const toast = (t, tone, ms) => HUD.toast(t, tone, ms);
  const once = (k, gap = 6000) => { const now = performance.now(); if (game.said[k] && now - game.said[k] < gap) return false; game.said[k] = now; return true; };
  const nm = n => L.nodes[n].name, POINTS = L.POINTS, mi = d => d < 1 ? "under a mile" : `${Math.round(d)} miles`;
  const PART = { boiler: "the boiler", motion: "the running gear", brakes: "the brakes", cars: "a wagon" };
  function events(S, evs) {
    R.events(S, evs);
    for (const e of evs) {
      switch (e.t) {
        /* the station fight */
        case "shot": SFX.play("smg", 0.7); break;
        case "wolfDown": SFX.play("smg", 0.7); SFX.play("wolfDown"); if (e.left === 0) say("That's the last of them!", "green"); break;
        case "wolfFire": SFX.play("rifle", 0.8); break;
        case "ducHit": SFX.play("hit", 0.6); say(e.wounds >= 2 ? "I'm hit again! Keep them down!" : "I'm hit! Cover me!", "red", 2000); break;
        case "atLever": say("At the lever. Keep firing!", "", 2000); break;
        case "lever": SFX.play("lever"); say(e.opening ? "Points over! Back to the engine!" : "The road's clear! Coming back!", "green", 2000); break;
        case "aboard": say("Climb aboard!", "green", 2000); break;
        case "captured": SFX.play("captured"); if (e.opening) toast("The train is yours", "green", 3000); else toast(`${nm(e.n)} taken`, "green", 2600); break;
        case "ambush": SFX.play("alarm"); say(`They've blocked the line at ${nm(e.n)}. Cover me!`, "red", 3200); break;
        /* stations of ours */
        case "service": SFX.play("good"); game.ui.mapView = false; checkpoint(); UI.report(S); break;
        case "sent": SFX.play("telegraph"); if (e.msg === "station") toast(`${nm(e.n)}: ours until ${PX.hhmm(e.until)}`, "green", 3200); if (e.msg === "bridge") toast(`The ${L.edges[e.e].bridge.name}: clear until ${PX.hhmm(e.until)}`, "green", 3200); if (e.msg === "repair" && e.n >= 0) toast(`Fitters will wait at ${nm(e.n)}`, "green", 3000); break;
        case "taskLost": SFX.play("warn"); say(e.k === "station" ? `The Resistance has lost ${nm(e.n)}. The wolves are back in it.` : `The gunboats are back at the ${L.edges[e.e].bridge.name}.`, "red", 3600); break;
        /* the cab */
        case "shovel": SFX.play("shovel", e.auto ? 0.35 : 0.8); break;
        case "door": SFX.play("door"); break;
        case "rev": SFX.play("clunk"); break;
        case "revRolling": SFX.play("clunk"); SFX.play("hit", 0.5); say("Not while she's rolling! You'll wreck the motion!", "red", 2600); break;
        case "revLocked": if (once("revLocked", 2500)) toast("The reverser won't move while she rolls", "amber", 1800); break;
        case "doorShut": if (once("doorShut", 2500)) say("Open the firebox door first.", "amber", 1800); break;
        case "noCoal": if (once("noCoal", 9000)) say("No coal left! We need a station of ours.", "red", 3000); break;
        case "grateFull": if (once("grate", 4000)) say("The grate's full. Let it burn.", "", 1800); break;
        case "noWater": SFX.play("warn"); say("The water's gone! The firebox is burning dry!", "red", 3000); break;
        case "overPressure": SFX.play("warn"); say("Pressure's too high! Blow her off, or close the door!", "red", 2800); break;
        case "whistle": SFX.play("whistle"); break;
        case "pointsSet": SFX.play("points", 0.8); if (!e.map) say(e.turn ? `Points set ${POINTS[e.p]} at ${nm(e.n)}, off the straight. Under ${C.POINTS.rough} over them!` : `Points set ${POINTS[e.p]} at ${nm(e.n)}.`, e.turn ? "amber" : "", e.turn ? 3200 : 2400); break;
        case "pointsNone": say("No points ahead to set.", "", 1800); break;
        case "pointsMuddled": say("Too many blasts. They'll leave the points as they are.", "amber", 2200); break;
        case "overPoints": SFX.play("points", 0.4); break;
        case "rough": SFX.play("clunk"); say("Too fast over the points! Mind the wheels!", "amber", 2400); break;
        case "buffers": SFX.play("clunk"); say("Buffers. End of the line: back her out.", "amber", 2600); break;
        /* Duc's eyes */
        case "pointsAhead": say(e.turn ? `Points at ${nm(e.n)}, ${mi(e.d)}: set ${POINTS[e.p]}, off the straight. Bring her under ${C.POINTS.rough}!` : `Points at ${nm(e.n)}, ${mi(e.d)}: set ${POINTS[e.p]}.`, e.turn ? "amber" : "", e.turn ? 3600 : 3000); break;
        case "stationAhead": if (L.nodes[e.n].final) say("Port Clair! The coast! Bring her in!", "green", 3600); else say(e.held ? `${nm(e.n)}, ${mi(e.d)}. The wolves hold it: they'll have the line blocked. Stop her short!` : `${nm(e.n)} ahead. It's ours.`, e.held ? "amber" : "", e.held ? 3600 : 2800); break;
        case "bridgeAhead": if (e.guarded) say(`Gunboats at the ${L.edges[e.e].bridge.name}, ${mi(e.d)}. Stop her short of the bridge!`, "amber", 3600); break;
        case "emergency": SFX.play("screech"); say(e.n !== undefined ? `Emergency stop! They've blocked the line at ${nm(e.n)}!` : `Emergency stop! Gunboats on the river!`, "red", 3200); break;
        case "endAhead": SFX.play("warn"); say("Dead end ahead! Stop her!", "red", 3000); break;
        case "frontierAhead": SFX.play("alarm"); say("That's the Wolf frontier ahead! Stop and back her up!", "red", 3600); break;
        case "cutAhead": SFX.play("warn"); say(e.known ? "The cut in the line is ahead. Stop short of it!" : "The line's cut ahead! Brake! Brake!", "red", 3200); break;
        case "gunboats": SFX.play("alarm"); say("Gunboats! We can't cross under their guns. Man the cannon.", "red", 3200); break;
        /* the air */
        case "raid": SFX.play("alarm"); say(e.side > 0 ? "Aircraft! Coming down the line ahead!" : "Aircraft! Coming up behind!", "red", 2800); if (game.teach) game.teach.raid = true; break;
        case "view": if (e.auto) toast(e.view === "front" ? "Battle stations: the front gun" : "Battle stations: the rear gun", "amber", 1600); break;
        case "gun": SFX.play("gun", 0.55); break;
        case "strafe": SFX.play("strafe", 0.7); if (once("dive" + e.side, 2500)) SFX.play("dive", 0.6); break;
        case "planeHit": SFX.play("ricochet", 0.5); break;
        case "planeDown": SFX.play("boom", 0.7); if (once("gotHim", 3000)) say("Got him!", "green", 1500); break;
        case "crash": SFX.play("bigBoom", 0.4); break;
        case "comeAround": if (once("around", 5000)) say(e.side > 0 ? "He's coming round again, ahead!" : "He's coming round behind!", "amber", 2000); break;
        case "raidOver": say(e.downed ? `They've gone. ${e.downed} down.` : "They've gone.", "green", 2200); break;
        case "trainHit":
          SFX.play("hit", 0.8); HUD.flash();
          if (E.wear(S) >= 60 && game.warned < 1) { game.warned = 1; say("She's badly hurt. Ask for fitters at the next station.", "amber", 3600); }
          if (E.wear(S) >= 85 && game.warned < 2) { game.warned = 2; SFX.play("warn"); say(`She won't take much more. ${PART[e.part] === "the boiler" ? "The boiler's going." : ""}`, "red", 3000); }
          break;
        case "paintingsLost": toast(`${e.n} painting${e.n > 1 ? "s" : ""} lost · ${e.left} aboard`, "red", 2600); break;
        /* the bridge */
        case "cannon": SFX.play("cannon"); SFX.play("whizz", 0.5); break;
        case "splash": {
          SFX.play("splash", 0.7);
          const r = e.dRange > 30 ? "Long" : e.dRange < -30 ? "Short" : "", b = e.dBear > e.wb ? "right" : e.dBear < -e.wb ? "left" : "";
          say(r && b ? `${r} and ${b}!` : r ? `${r}!` : b ? `Wide ${b}!` : "Close!", "", 1600);
          break;
        }
        case "boatHit": SFX.play("boom"); break;
        case "boatSunk": SFX.play("bigBoom", 0.8); say(e.left ? `Sunk! ${e.left} to go.` : "Sunk!", "green", 1800); break;
        case "boatFire": SFX.play("boatGun", 0.7); break;
        case "nearMiss": SFX.play("splash", 0.9); break;
        case "boatsAllSunk": say("That's the last of them. The bridge is ours.", "green", 2600); break;
        case "bridgeClear": SFX.play("good"); break;
        /* the night */
        case "firstLight": say("The sky's paling in the east. Not long till dawn.", "amber", 3600); break;
        case "dawn": SFX.play("warn"); say("It's light. They'll see us for miles now.", "red", 3600); break;
        case "won": SFX.play("won"); HUD.end("Port Clair!", `The art is home: ${E.paintings(S)} paintings`, "ok"); setTimeout(finish, 3600); break;
        case "over": SFX.play(e.why === "burst" ? "burst" : e.why === "abandon" ? "menu" : e.why === "practice" ? "good" : "over");
          if (e.why === "practice") { setTimeout(finish, 900); break; }
          if (e.why !== "abandon") { const end = UI.ENDS[e.why]; HUD.end(end ? end[0] : "The night is over", end ? end[1] : "", "danger"); setTimeout(finish, 2600); }
          break;
      }
    }
  }
  /* the sounds that go on: the chuff and the rails by the miles run, the fire, the valves, the fighters, the wind */
  function sounds(S) {
    if (SFX.muted || !SFX.ctx) return;
    const d = Math.max(0, S.odo - game.odoAt); game.odoAt = S.odo;
    const scene = R.sceneOf(S, game.ui), out = scene === "front" || scene === "rear", cab = scene === "cab";
    const v = Math.abs(S.tr.v);
    game.chuff += d; game.clack += d;
    if (game.chuff > 0.022) { game.chuff = game.chuff % 0.022; const w = S.cab.thr * (S.cab.rev ? 1 : 0.2); SFX.play(w > 0.08 && E.psi(S) > 20 ? "chuff" : "chuffSoft", (out ? 0.45 : 0.7) * (0.35 + w * 0.65) * (v > 50 ? 0.7 : 1)); }
    if (game.clack > 0.07) { game.clack = game.clack % 0.07; SFX.play("clack", out ? 0.7 : 0.45); }
    SFX.loop("fire", cab && S.cab.door && S.phase === "run" ? 1 : 0, PX.clamp(S.cab.grate / 8, 0, 1));
    SFX.loop("valve", (S.cab.valve || (game.ui.aids.fireman && E.psi(S) > C.LOCO.red + 6)) && S.phase === "run" ? (cab ? 1 : 0.5) : 0);
    SFX.loop("wind", out ? PX.clamp(v / 60, 0.1, 1) : 0, v / 60);
    let plane = 0, pitch = 0.5;
    if (S.raid) for (const p of S.raid.planes) { if (p.st !== "run" || p.delay > 0) continue; const dist = Math.hypot(p.x, p.y, p.z), k = PX.clamp(1 - dist / 1600, 0, 1); if (k > plane) { plane = k; pitch = p.side * p.z > 0 ? 0.7 + k * 0.3 : 0.4 - k * 0.2; } }
    SFX.loop("plane", plane * (out ? 1 : 0.6), pitch);
  }
  /* the first night's key strip: what to do, where you are */
  const SEP = ' <span class="sep"></span> ';
  function teachHint(S) {
    const scene = R.sceneOf(S, game.ui);
    if (scene === "station") return HUD.hint(`<kbd>←</kbd><kbd>↑</kbd><kbd>↓</kbd><kbd>→</kbd> aim (or the mouse)${SEP}hold <kbd>Space</kbd> to fire${SEP}Duc moves only while you fire`);
    if (scene === "bridge") return HUD.hint(`<kbd>←</kbd><kbd>→</kbd> bearing${SEP}<kbd>↑</kbd><kbd>↓</kbd> range${SEP}<kbd>Space</kbd> fire${SEP}correct from the splash`);
    if (scene === "front" || scene === "rear") return HUD.hint(`<kbd>←</kbd><kbd>↑</kbd><kbd>↓</kbd><kbd>→</kbd> aim${SEP}<kbd>Space</kbd> fire${SEP}<kbd>1</kbd> front <kbd>2</kbd> rear${SEP}<kbd>3</kbd> back to the cab`);
    if (scene === "map") return HUD.hint(null);
    if (!game.teach) return;
    const c = S.cab;
    if (S.tr.v === 0 && c.brake > 0.1) return HUD.hint(`<kbd>Z</kbd> brake off${SEP}<kbd>W</kbd> open the throttle${SEP}or <kbd>←</kbd><kbd>→</kbd> pick a control, <kbd>↑</kbd><kbd>↓</kbd> work it`);
    if (S.tr.v < 6 && c.thr < 0.2) return HUD.hint(`<kbd>W</kbd> open the throttle`);
    HUD.hint(`Keep the pressure up${game.ui.aids.fireman ? " (the fireman feeds her)" : ": door open, shovel, door shut"}${SEP}<kbd>4</kbd> the map${SEP}stop at a station of ours for coal and water`);
  }

  /* ---- the loop ---- */
  function step() {
    const S = game.S;
    const cmd = I.cmd(S, game.ui.aids);
    const evs = E.tick(S, cmd);
    events(S, evs);
    I.endTick();
  }
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(100, now - game.last); game.last = now;
    if (game.mode === "title") { titleFrame(dt); return; }
    if (!game.S || (game.mode !== "play" && game.mode !== "over")) return;
    const S = game.S;
    if (game.mode === "play") {
      const fresh = I.pollPad();
      if (!UI.sheet) {
        for (const a of fresh) konamiStep("pad", a);
        if (fresh.includes("pause")) { game.pause(); return; }
        if (fresh.includes("map")) game.setView("map");
        if (fresh.includes("viewNext") || fresh.includes("viewPrev")) { const vs = ["front", "cab", "rear"], i = vs.indexOf(S.view); game.setView(vs[(i + (fresh.includes("viewNext") ? 1 : 2)) % 3]); }
      }
      /* fast running: a quiet stretch, Shift held, the aid on */
      game.ui.fast = !!game.ui.aids.fast && (I.held.has("fast") || I.pad.has("fast")) && S.phase === "run" && !S.raid && !game.ui.mapView && !S.practice;
      /* the night runs on while the map is up, as it did in 1987 */
      if (!UI.sheet && S.phase !== "station" && S.phase !== "over" && S.phase !== "won") {
        game.acc += dt * (game.ui.fast ? 4 : 1);
        let n = 0;
        while (game.acc >= game.step && n++ < 24) { game.acc -= game.step; step(); if (game.mode !== "play" || S.phase === "station") break; }
        if (n >= 24) game.acc = 0;
      }
      sounds(S);
      if (game.teach) { game.teach.miles = S.stats.miles; if (S.stats.miles > 12 && game.teach.raid) { game.teach = null; PX.prefs.learned = true; PX.savePrefs(); } }
      teachHint(S);
    }
    game.ui.cursor = S.phase === "run" && R.sceneOf(S, game.ui) === "cab" && game.mode === "play" ? I.sel() : null;
    R.draw(S, game.ui, now, dt / 1000);
    HUD.draw(S, game.ui, now);
  }
  function titleFrame(dt) {
    const cv = document.querySelector("#title .pe-scene");
    /* nothing to draw into until the window has a size (a pane still opening, a frame not yet laid out) */
    if (!cv || !cv.width || !cv.height || UI.sheet && UI.sheet.el.classList.contains("full")) return;
    R.title(cv, performance.now(), dt / 1000);
  }

  /* ---- the Konami code: up up down down left right left right B A, on the keys or a pad ---- */
  const KONAMI = { keys: ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "KeyB", "KeyA"],
    pad: ["up", "up", "down", "down", "left", "right", "left", "right", "whistleBtn", "act"] };
  const konamiAt = { keys: 0, pad: 0 };
  function konamiStep(src, x) {
    const seq = KONAMI[src], i = konamiAt[src];
    konamiAt[src] = x === seq[i] ? i + 1 : x === seq[0] ? (i === 2 ? 2 : 1) : 0;
    if (konamiAt[src] < seq.length) return;
    konamiAt.keys = konamiAt.pad = 0;
    if (!game.S || !E.konami(game.S)) return;
    game.warned = 0;
    SFX.play("captured");
    toast("Konami code: coal, water, a mended engine, and no more harm this night", "green", 4000);
  }

  /* ---- keys ---- */
  document.addEventListener("keydown", ev => {
    SFX.unlock();
    if (game.mode === "title" && !SFX.tune && !SMALL.matches) SFX.startTune();
    if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
    if (game.intro) { ev.preventDefault(); game.intro.skip(); return; }
    if (UI.sheet) { UI.key(ev); return; }
    const k = ev.key.length === 1 ? ev.key.toLowerCase() : ev.key;
    if (k === "m" && !(ev.target.closest && ev.target.closest("input"))) { ev.preventDefault(); game.toggleMute(); return; }
    if (game.mode === "title") { titleKey(ev); return; }
    if (game.mode !== "play") return;
    const a = I.actionFor(ev.code);
    if (a || ev.code === "F1" || ev.code === "F7") ev.preventDefault();
    if (!ev.repeat) konamiStep("keys", ev.code);
    if (game.ui.mapView) { if (a === "map" || a === "pause") game.setView("map"); else if (a === "front" || a === "rear" || a === "cab") game.setView(a); return; }
    if (a === "pause") { game.pause(); return; }
    if (a === "map" || a === "front" || a === "rear" || a === "cab") { if (!ev.repeat) game.setView(a); return; }
    if (a === "abandon") { if (!game.S.practice) UI.ask("Abandon the train? The night ends here, and its score still counts for the high scores.", "Abandon").then(y => { if (y) game.abandon(); }); return; }
    if (a === "aids") {
      PX.setAids(PX.prefs.aids === "field" ? "classic" : "field"); game.syncAids();
      HUD.toast(PX.prefs.aids === "field" ? "Field aids" : "Classic", "", 1400);
      return;
    }
    I.down(ev);
  });
  document.addEventListener("keyup", ev => I.up(ev));
  addEventListener("blur", () => { I.clear(); if (game.mode === "play") game.pause(); });
  document.addEventListener("visibilitychange", () => { if (document.hidden) { checkpoint(); if (game.mode === "play") game.pause(); } });
  addEventListener("pagehide", () => checkpoint());
  document.addEventListener("pointerdown", () => { SFX.unlock(); if (game.intro) game.intro.skip(); if (game.mode === "title" && !SFX.tune && !SMALL.matches) SFX.startTune(); }, true);
  document.addEventListener("pointerover", ev => {
    if (ev.pointerType !== "mouse") return;
    const b = ev.target.closest && ev.target.closest("button:not(:disabled), summary");
    if (!b || b === document.activeElement || !b.closest(".pe-sheet, #title") || b.closest(".sh-head")) return;
    const a = document.activeElement;
    if (a && a.matches("input")) return;
    if (document.querySelector(".pe-ask")) return;
    b.focus({ preventScroll: true });
  });
  /* the map: a click on a junction sets its points (a Field aid) */
  $("screen").addEventListener("pointerdown", ev => {
    const S = game.S;
    if (!S || !game.ui.mapView || !game.ui.aids.planner) return;
    const r = $("screen").getBoundingClientRect(), x = (ev.clientX - r.left) / r.width * $("screen").width, y = (ev.clientY - r.top) / r.height * $("screen").height;
    const n = PX.MapArt.junctionAt(x, y);
    if (n === null || S.pts[n] === undefined) return;
    events(S, E.setPoints(S, n, (S.pts[n] + 1) % 3));
  });
  /* not the click that skipped the opening, landing on a row that was not there when it was pressed */
  $("title").addEventListener("click", ev => { const b = ev.target.closest("[data-act]"); if (b && !(performance.now() - (game.skippedAt || 0) < 600)) titleAct(b.dataset.act); });
  $("snd").addEventListener("click", () => game.toggleMute());
  $("pausebtn").addEventListener("click", () => game.pause());
  $("screen").addEventListener("contextmenu", ev => ev.preventDefault());
  I.bindMouse($("screen"));

  /* ---- the stage: the whole window, about three hundred and sixty pixels high, square pixels ---- */
  /* whole-number scaling once the window has room for it; below that, as near 360 pixels high as it allows */
  const scaleK = () => { const kk = innerHeight / 360; return kk >= 1.5 ? Math.round(kk) : Math.max(1, kk); };
  function fit() {
    const k = scaleK();
    K.VW = Math.ceil(innerWidth / k); K.VH = Math.ceil(innerHeight / k); K.SCALE = k;
    /* the HUD grows with the picture's pixels, a little: 1 at k 2, 1.15 at 3, 1.3 at 4 and up; never so far that the
       bar along the top runs out of width (it needs 1300 for all its labels) */
    const hz = Math.max(1, Math.min(1 + (k - 2) * 0.15, 1.3, innerWidth / 1300)), ew = innerWidth / hz, root = document.documentElement;
    root.style.setProperty("--hz", hz.toFixed(3));
    /* and the bar folds by the width it has once grown, not the window's: the damage labels go first, then the
       view tabs' names, then the dawn countdown and the line ahead's labels */
    root.classList.toggle("hud-w1300", ew < 1300); root.classList.toggle("hud-w1160", ew <= 1160); root.classList.toggle("hud-w1100", ew <= 1100);
    const cv = $("screen");
    cv.width = K.VW; cv.height = K.VH;
    const st = $("stage");
    st.style.width = K.VW * k + "px"; st.style.height = K.VH * k + "px";
    if (R.g) R.init(cv);
  }
  addEventListener("resize", () => { fit(); sizeScene(); });

  /* ---- boot ---- */
  function boot() {
    game.applySpeed(); game.applyLook(); game.syncAids(); syncSound();
    injectTitleCSS();     /* the boot's and the title's; the title's colours and the sheets are css/pumaexpress.css */
    fit();
    const q = new URLSearchParams(location.search);
    const run = SMALL.matches || q.has("play") ? { finish: async () => {}, cancel() {} } : runBoot({ lines: [bootReloadLine(), "raising steam at Velmont"] });
    setTimeout(() => {
      PX.People.ducFace(); PX.People.paw();
      R.init($("screen"));
      HUD.build();
      if (q.has("play")) {
        /* debug: ?play=<0-2>&seed=<n> straight into a night; &practice=station|air|bridge; &skip=1 past the yard fight;
           &t=<minutes on from the midnight before: 22:30 is 1350, dawn 1920>; &view=cab|front|rear|map; &v=<mph>; &pause=1;
           &end=won|dawn|burst|boiler|motion|cut|derail|buffer|barricade|span|frontier to see how the night ends */
        const S = E.newGame({ diff: +(q.get("play") || 1), seed: +(q.get("seed") || 1), practice: q.get("practice") || null });
        if (q.has("skip") && !S.practice) { E.captured(S, []); E.depart(S, "none"); S.cab.brake = 0; }
        if (q.has("t")) S.t = +q.get("t");
        if (q.has("v")) { S.tr.v = +q.get("v"); S.cab.thr = 0.5; S.cab.brake = 0; }
        if (q.has("raid")) S.raidT = 0.5;
        startPlay(S, !q.has("skip"));
        const v = q.get("view");
        if (v === "map") game.ui.mapView = true; else if (v) S.view = v;
        if (q.has("pause")) game.pause();
        if (q.has("end")) { const ev = []; if (q.get("end") === "won") E.win(S, ev); else E.end(S, q.get("end"), ev); events(S, ev); }
      } else {
        openTitle();
        const opening = q.has("shot") || q.has("sheet") ? () => showTitle(false) : introTitle();
        const saved = PX.loadGame(), best = PX.scores()[0];
        run.finish(["the art is loaded", saved ? "a night in progress" : best ? `best: ${best.score.toLocaleString("en-US")}` : "steam up"]).then(() => {
          opening();
          const sheet = q.get("sheet");
          if (sheet && UI[sheet]) UI[sheet]();
        });
      }
      game.last = performance.now();
      requestAnimationFrame(frame);
    }, 60);
  }
  boot();
})();
