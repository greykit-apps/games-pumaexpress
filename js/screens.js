/* The Puma Express -- the screens with words on them: flat dark panels over
 * the scene (css/pumaexpress.css). How hard, before a night; the practice
 * fights; the pause; the station report and its telegraph; the end of the
 * night and the high scores; and Settings, Help and About from the title. */
"use strict";
(() => {
  const esc = PX.esc, C = PX.C, L = PX.Line, E = PX.Engine, K = PX.K;
  const UI = PX.UI = { sheet: null, aidOpen: false };
  const CREDIT = UI.CREDIT = 'Built by <a href="https://greykit.com/" target="_blank" rel="noopener">greykit.com</a>';
  const ICON_BACK = '<svg class="ic" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M7.5 2 L3.5 6 L7.5 10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="square"/></svg>';
  const ICON_X = '<svg class="ic" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M3 3 L9 9 M9 3 L3 9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="square"/></svg>';
  const num = n => Number(n).toLocaleString("en-US");
  const face = () => `<img class="px duc-face" src="${PX.HUD.face || PX.People.ducFace().toDataURL()}" width="80" height="80" alt="">`;

  /* ---- the sheet: a panel of its own over whatever was showing; popup, a window to one side ---- */
  UI.open = (title, { tabs, html, onClick, onClose, onKey, back, tab = 0, wide = false, closable = true, popup = false, side = false }) => {
    UI.close(true);
    const el = document.createElement("div");
    el.className = "pe-sheet " + (popup ? "pe-pop" : "full") + (side ? " side" : wide ? " wide" : "") + (tabs ? " tabbed" : "");
    el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-label", title);
    const draw = () => {
      el.innerHTML = '<div class="' + (popup ? "pe-win" : "sh-box") + '"><header class="sh-head">' + (back ? '<button data-back title="Back (Esc)">' + ICON_BACK + "Back</button>" : "") + "<h2>" + esc(title) + "</h2>" +
        (closable && !back && !popup ? '<button data-x title="Close (Esc)">' + ICON_X + "Close</button>" : "") + "</header>" +
        (tabs ? '<div class="sh-tabs" role="tablist" aria-label="' + esc(title) + '">' + tabs.map(([t], i) => '<button role="tab" id="tab-' + i + '" data-tab="' + i + '" aria-selected="' + (i === tab) + '" aria-controls="tabpanel" tabindex="' + (i === tab ? 0 : -1) + '">' + esc(t) + "</button>").join("") + "</div>" : "") +
        '<div class="sh-body"' + (tabs ? ' id="tabpanel" role="tabpanel" aria-labelledby="tab-' + tab + '" tabindex="0"' : "") + '><div class="sh-in">' + (tabs ? tabs[tab][1] : html()) + "</div></div></div>";
    };
    draw();
    const api = { refresh: () => { const b = el.querySelector(".sh-body"), y = b.scrollTop, f = document.activeElement && document.activeElement.dataset; draw(); el.querySelector(".sh-body").scrollTop = y; if (f) for (const k of ["set", "act", "d", "msg"]) if (f[k]) { const n = el.querySelector(`[data-${k}="${f[k]}"]`); if (n) n.focus({ preventScroll: true }); } }, close: () => UI.close(), el };
    const setTab = i => { tab = (i + tabs.length) % tabs.length; draw(); el.querySelector('[data-tab="' + tab + '"]').focus(); };
    el.addEventListener("click", ev => {
      if (popup && ev.target === el && closable) return UI.close();
      const b = ev.target.closest("button"); if (!b || b.disabled) return;
      PX.SFX.play("menu");
      if (b.hasAttribute("data-x")) return UI.close();
      if (b.hasAttribute("data-back")) return goBack();
      if (b.dataset.tab !== undefined) return setTab(+b.dataset.tab);
      if (onClick) onClick(b, api, ev);
    });
    el.addEventListener("toggle", ev => { if (ev.target.classList && ev.target.classList.contains("aid-list")) UI.aidOpen = ev.target.open; }, true);
    function goBack() { UI.close(true); back(); }
    document.body.appendChild(el);
    UI.sheet = { el, onClose, onKey, closable, back: back ? goBack : null, tabs: tabs ? setTab : null, tabAt: () => tab };
    for (const id of ["game", "title"]) { const n = document.getElementById(id); if (n) n.inert = true; }
    (el.querySelector("[autofocus]") || el.querySelector(".sh-body .primary") || el.querySelector('[role="tab"][aria-selected="true"]') || el.querySelector(".sh-body button:not(:disabled)") || el.querySelector("button")).focus({ preventScroll: true });
    return api;
  };
  UI.close = quiet => {
    if (!UI.sheet) return;
    const s = UI.sheet; UI.sheet = null;
    s.el.remove();
    for (const id of ["game", "title"]) { const n = document.getElementById(id); if (n) n.inert = false; }
    if (s.onClose && !quiet) s.onClose();
    if (!quiet && PX.game.mode === "title") PX.game.refreshTitle();
  };
  /* the arrows walk the buttons by where they sit on the screen */
  UI.walk = (root, key) => {
    const d = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[key], a = document.activeElement;
    if (!d || !a || !root.contains(a)) return false;
    const box = n => { const r = n.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, r }; }, o = box(a);
    let best = null, bestS = Infinity;
    for (const n of root.querySelectorAll("button:not(:disabled), summary, input")) {
      if (n === a || n.offsetParent === null || n.getAttribute("role") === "tab" || n.closest(".sh-head")) continue;
      const b = box(n), dx = b.x - o.x, dy = b.y - o.y, along = dx * d[0] + dy * d[1];
      if (along <= (d[0] ? o.r.width : o.r.height) / 4) continue;
      const s = along + Math.abs(d[0] ? dy : dx) * 3;
      if (s < bestS) { bestS = s; best = n; }
    }
    if (!best) return false;
    best.focus({ preventScroll: true }); best.scrollIntoView({ block: "nearest" });
    return true;
  };
  UI.key = ev => {
    const s = UI.sheet;
    if (s.onKey && s.onKey(ev)) return;
    if (ev.key === "Escape") { ev.preventDefault(); if (s.back) s.back(); else if (s.closable) UI.close(); return; }
    if (s.tabs && document.activeElement && document.activeElement.getAttribute("role") === "tab" && (ev.key === "ArrowRight" || ev.key === "ArrowLeft")) { ev.preventDefault(); s.tabs(s.tabAt() + (ev.key === "ArrowRight" ? 1 : -1)); return; }
    const inInput = ev.target.closest && ev.target.closest("input");
    if (ev.key.startsWith("Arrow") && !(inInput && (ev.key === "ArrowLeft" || ev.key === "ArrowRight")) && UI.walk(s.el, ev.key)) { ev.preventDefault(); return; }
    if (ev.key === "Tab") {
      const f = [...s.el.querySelectorAll('button:not(:disabled), input, summary, a[href], [tabindex]:not([tabindex="-1"])')].filter(n => n.offsetParent !== null);
      if (!f.length) return;
      ev.preventDefault();
      const i = f.indexOf(document.activeElement), d = ev.shiftKey ? -1 : 1;
      f[i < 0 ? 0 : (i + d + f.length) % f.length].focus();
    }
  };
  /* a question before something that cannot be undone: Cancel has the focus */
  UI.ask = (question, yes, title = yes + "?") => new Promise(resolve => {
    const back = document.activeElement, el = document.createElement("div");
    el.className = "pe-ask";
    el.setAttribute("role", "alertdialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-label", title);
    el.innerHTML = '<div class="pe-win"><header class="sh-head"><h2>' + esc(title) + '</h2></header><div class="sh-body"><p>' + esc(question) +
      '</p><div class="row end"><button data-no class="primary">Cancel</button><button data-yes class="danger">' + esc(yes) + "</button></div></div></div>";
    const done = v => { document.removeEventListener("keydown", onKey, true); el.remove(); if (back && back.isConnected && back.focus) back.focus({ preventScroll: true }); resolve(v); };
    const onKey = ev => {
      if (ev.key === "Escape") { ev.preventDefault(); ev.stopPropagation(); done(false); return; }
      if (ev.key === "Tab" || ev.key === "ArrowLeft" || ev.key === "ArrowRight") { const bs = [...el.querySelectorAll("button")], i = bs.indexOf(document.activeElement); ev.preventDefault(); bs[(i + (ev.shiftKey || ev.key === "ArrowLeft" ? -1 : 1) + bs.length) % bs.length].focus(); }
      ev.stopPropagation();
    };
    el.addEventListener("click", ev => { if (ev.target === el) return done(false); const b = ev.target.closest("button"); if (b) done(b.hasAttribute("data-yes")); });
    document.addEventListener("keydown", onKey, true);
    document.body.appendChild(el);
    el.querySelector("[data-no]").focus();
  });

  /* ---- a new night: how hard ---- */
  UI.newGame = () => {
    const last = PX.store.get(PX.KEY_DIFF, 1);
    UI.open("New game", { back: () => PX.game.toTitle(),
      html: () => `<p class="lede">The Wolf Empire has stripped the puma country's galleries and loaded the pictures on a train in the yards at Velmont, bound for their capital. Take the train, and run it west across the occupied country to Port Clair on the free coast before dawn.</p>
        <div class="diffs">${C.DIFF.map((d, i) => `<button data-d="${i}"${i === last ? " autofocus" : ""}><b><kbd>${i + 1}</kbd>${esc(d.name)}${i === last ? '<em class="last">last run</em>' : ""}</b><span>${esc(d.note)}</span><span class="when">The train is taken at ${PX.hhmm(d.start)}.</span></button>`).join("")}</div>
        <p class="note">Aids: <b>${esc(PX.aidsLabel())}</b>. Change them in Settings, or with <kbd>L</kbd> on the line.</p>`,
      onKey: ev => { const n = +ev.key; if (n >= 1 && n <= 3) { ev.preventDefault(); go(n - 1); return true; } return false; },
      onClick: b => { if (b.dataset.d !== undefined) go(+b.dataset.d); },
    });
    function go(d) { PX.store.set(PX.KEY_DIFF, d); UI.close(true); PX.game.start(d); }
  };
  /* ---- practice: one fight on its own ---- */
  UI.practice = () => {
    const P = [["station", "A station", "Cover Duc up the platform to the points lever and back while the wolves come to the windows."], ["air", "An air raid", "Fighters down the line from ahead and behind: the front gun and the rear."], ["bridge", "A bridge", "Gunboats on the river below: lay the cannon by bearing and range, and correct from the splash."]];
    UI.open("Practice", { back: () => PX.game.toTitle(),
      html: () => `<p class="lede">One fight, on its own, on Intermediate. Nothing on the line, no clock against you, and nothing saved.</p>
        <div class="diffs">${P.map(([k, n, note], i) => `<button data-d="${k}"${i === 0 ? " autofocus" : ""}><b><kbd>${i + 1}</kbd>${esc(n)}</b><span>${esc(note)}</span></button>`).join("")}</div>`,
      onKey: ev => { const n = +ev.key; if (n >= 1 && n <= 3) { ev.preventDefault(); UI.close(true); PX.game.practice(P[n - 1][0]); return true; } return false; },
      onClick: b => { if (b.dataset.d) { UI.close(true); PX.game.practice(b.dataset.d); } },
    });
  };

  /* ---- pause ---- */
  const KEYS_CAB = () => (PX.aid("direct") ? [["W S", "throttle"], ["X Z", "brake"], ["F", "door"], ["G", "shovel"], ["H", "whistle"], ["E Q", "reverser"]] : [["← →", "the controls"], ["↑ ↓", "work it"], ["Space", "use it"]]).concat([["1 2", "guns"], ["3", "cab"], ["4", "map"], ["L", "aids"]]);
  UI.pause = () => {
    const S = PX.game.S;
    UI.open("Paused", { popup: true,
      html: () => `<h3 class="mname">${S.practice ? "Practice" : `${PX.hhmm(S.t)} · ${esc(C.DIFF[S.diff].name)}`}</h3>
        <p class="meta">${num(S.score)} points · ${E.paintings(S)} paintings aboard · ${Math.round(S.stats.miles)} miles run</p>
        <div class="col"><button data-act="resume" class="primary">Resume</button>
        ${S.practice ? "" : `<button data-act="map">The map</button>`}
        <button data-act="settings">Settings</button><button data-act="help">Help</button>
        <button data-act="leave">Main menu</button></div>
        <div class="note keys legend">${KEYS_CAB().map(([k, w]) => `<span class="k">${k.split(" ").map(x => `<kbd>${x}</kbd>`).join(" ")}</span><span>${w}</span>`).join("")}</div>`,
      onClick: async b => {
        const a = b.dataset.act;
        if (a === "resume") UI.close();
        if (a === "map") { UI.close(); PX.game.setView("map"); }
        if (a === "settings") { UI.close(true); UI.settings(() => UI.pause()); }
        if (a === "help") { UI.close(true); UI.help(0, () => UI.pause()); }
        if (a === "leave") {
          if (S.practice) { UI.close(true); PX.game.toTitle(); return; }
          if (PX.prefs.resume) { UI.close(true); PX.game.leave(); return; }
          if (await UI.ask("Abandon this night? Its score still counts for the high scores.", "Abandon")) { UI.close(true); PX.game.abandon(); }
        }
      },
      onClose: () => PX.game.unpause(),
    });
  };

  /* the line ahead, cut from the map itself: the train, the next station and the bridge before it, so the
     message is chosen with the map in view; drawn at the map's own size and shown at the play screen's scale */
  const legMap = (S, R) => {
    const MA = PX.MapArt, k = K.SCALE || 1, W = K.VW, H = K.VH, keep = [MA.last, MA.junctions];
    const c = K.mk(W, H), g = c.getContext("2d");
    g.imageSmoothingEnabled = false;
    MA.draw(g, S, PX.game.ui, performance.now());
    const f = MA.last; MA.last = keep[0]; MA.junctions = keep[1];
    const pts = [L.xy(S)];
    if (R.next >= 0) pts.push([L.nodes[R.next].x, L.nodes[R.next].y]);
    if (R.bridge >= 0) { const e = L.edges[R.bridge]; pts.push([(L.nodes[e.a].x + L.nodes[e.b].x) / 2, (L.nodes[e.a].y + L.nodes[e.b].y) / 2]); }
    const xs = pts.map(p => f.x + p[0] * f.k), ys = pts.map(p => f.y + p[1] * f.k);
    const cw = Math.min(Math.floor(f.w), Math.floor(440 / k)), ch = Math.min(Math.floor(f.h), Math.floor(cw * 0.55));
    const cx = Math.round(PX.clamp((Math.min(...xs) + Math.max(...xs) - cw) / 2, f.x, f.x + f.w - cw)), cy = Math.round(PX.clamp((Math.min(...ys) + Math.max(...ys) - ch) / 2, f.y, f.y + f.h - ch));
    const o = K.mk(cw, ch); o.getContext("2d").drawImage(c, cx, cy, cw, ch, 0, 0, cw, ch);
    return `<figure class="leg"><figcaption class="who">The line ahead</figcaption><img class="px" src="${o.toDataURL()}" width="${cw * k}" height="${ch * k}" alt="The map about the train: the next station and the bridge before it"></figure>`;
  };

  /* ---- a station of ours: the report, and the telegraph (1987's four messages) ---- */
  const nm = n => esc(L.nodes[n].name);
  UI.report = S => {
    const R = S.report, n = R.n, opening = n === L.START && S.stats.stations <= 1;
    const lines = [];
    if (R.repaired) lines.push("The fitters have been at her: the boiler, the motion and the brakes are mended.");
    lines.push(opening ? "She's ours. Coal and water aboard, and the art behind us." : "Coal and water taken on.");
    for (const e of R.cuts) { const E0 = L.edges[e]; lines.push(`The line is cut between ${nm(E0.a)} and ${nm(E0.b)}.`); }
    if (R.held.length) lines.push(`The wolves hold ${R.held.map(nm).join(", ").replace(/, ([^,]*)$/, " and $1")}.`);
    if (R.guarded.length) lines.push(`Gunboats on ${R.guarded.map(e => esc(L.edges[e].bridge.river)).join(" and ")} at ${R.guarded.map(e => esc(L.edges[e].bridge.name.split(", ")[1])).join(" and ")}.`);
    lines.push({ quiet: "Their fighters have been quiet tonight.", busy: "Their fighters are busy tonight. Keep the guns warm.", heavy: "The light's coming, and their fighters with it." }[R.air]);
    const ns = R.next, nb = R.bridge;
    const ahead = ns >= 0 ? `The points as they lie take us to ${nm(ns)}${nb >= 0 ? `, by the ${esc(L.edges[nb].bridge.name)}` : ""}.` : "The points as they lie take us nowhere good. Check the map.";
    lines.push(ahead);
    const stOurs = ns >= 0 && !S.st[ns].held, brOurs = nb >= 0 && !S.br[nb].guarded;
    const opts = [
      ["station", "Take the next station", ns < 0 ? "No station ahead on these points." : L.nodes[ns].final ? "Port Clair is the free coast already." : stOurs ? `${nm(ns)} is ours already.` : `The Resistance rises at ${nm(ns)} and holds it for us for a while.`, ns < 0 || stOurs || L.nodes[ns].final],
      ["bridge", "Take the next bridge", nb < 0 ? "No bridge ahead before the coast." : brOurs ? `No gunboats at the ${esc(L.edges[nb].bridge.name)}.` : `The Resistance clears the ${esc(L.edges[nb].bridge.name)} for a while.`, nb < 0 || brOurs],
      ["repair", "Need repair", ns < 0 ? "No station ahead to send fitters to." : `Fitters will be waiting at ${nm(ns)}. It costs ${C.REPAIR_MIN} minutes there.`, ns < 0 || L.nodes[ns].final],
      ["none", "No message", "Save the wire. We go as we are.", false],
    ];
    const first = opts.findIndex(o => !o[3]), leg = legMap(S, R);
    UI.open(`${L.nodes[n].name}: the station report`, { wide: true, closable: false,
      html: () => `<div class="report">
        <div><div class="duc-says">${face()}<div><p class="who">Duc reads the report</p>${lines.map(l => `<p>${l}</p>`).join("")}<p class="meta">${PX.hhmm(S.t)} · ${S.t < C.DAWN ? `dawn in ${Math.floor((C.DAWN - S.t) / 60)}h${String(Math.floor((C.DAWN - S.t) % 60)).padStart(2, "0")}` : "after dawn"}</p></div></div>${leg}</div>
        <div><h3>The telegraph: one message</h3><div class="msgs">${opts.map(([k, t, note, dis], i) => `<button data-msg="${k}"${dis ? " disabled" : ""}${i === first ? " autofocus" : ""}><b><kbd>${i + 1}</kbd>${esc(t)}</b><span>${note}</span></button>`).join("")}</div>
        <p class="note">Then the line is yours. The whole map is on <kbd>4</kbd> once you are under way.</p></div></div>`,
      onKey: ev => { const k = +ev.key; if (k >= 1 && k <= 4 && !opts[k - 1][3]) { ev.preventDefault(); send(opts[k - 1][0]); return true; } return false; },
      onClick: b => { if (b.dataset.msg) send(b.dataset.msg); },
    });
    function send(m) { UI.close(true); PX.game.depart(m); }
  };

  /* ---- the end of the night ---- */
  const WHY = {
    won: "The train is in at Port Clair, and the art with it.",
    burst: "The boiler burst.", boiler: "The boiler gave out.", motion: "The running gear gave out, and she stands where she is.",
    cut: "She ran onto a cut in the line and went off the rails.", derail: "She took the points too fast and left the rails.", buffer: "She hit the buffers at the end of a dead line.",
    frontier: "She ran into the Wolf frontier, and the wolves have the train again.", dawn: "Dawn came before the coast, and in daylight their fighters had her.", abandon: "Abandoned.", practice: "Practice over.",
  };
  const TALLY = [["stations", "Stations taken"], ["bridges", "Bridges cleared"], ["guards", "Wolves shot at the stations"], ["boats", "Gunboats sunk"], ["planes", "Fighters shot down"], ["raids", "Air raids"]];
  const tally = S => `<table class="tally">${TALLY.filter(([k]) => S.stats[k]).map(([k, n]) => `<tr><td>${esc(n)}</td><td class="num">${S.stats[k]}</td></tr>`).join("")}<tr><td>Miles run</td><td class="num">${Math.round(S.stats.miles)}</td></tr></table>`;
  /* three of the paintings themselves, with their titles: home, or still aboard */
  const pics = (S, won) => {
    const n = Math.min(3, E.paintings(S));
    if (!n) return "";
    return `<div class="pics"><p class="who">${won ? "Home tonight, among them" : "Still aboard"}</p><div class="pics-row">${Array.from({ length: n }, (_, i) => `<figure><img class="px" src="${PX.Paintings.picture(i, 64, 48).toDataURL()}" width="128" height="96" alt=""><figcaption>${esc(PX.Paintings.title(i))}</figcaption></figure>`).join("")}</div></div>`;
  };
  UI.gameOver = S => {
    const why = S.end ? S.end.why : "abandon", won = why === "won";
    if (why === "practice") return UI.practiceOver(S);
    const rank = C.rankFor(S.score), next = C.RANKS.find(([at]) => at > S.score), can = PX.qualifies(S.score);
    const pos = PX.scores().filter(e => e.score >= S.score).length;
    const place = can ? (pos === 0 ? "A new best score" : `Number ${pos + 1} on the table`) : "";
    let placed = -1, naming = can, skipped = false;
    const title = won ? "Port Clair: the art is home" : "The night is over";
    const left = () => `<div><h3 class="mname big${won ? " ok" : why === "abandon" ? " dim" : ""}">${num(S.score)} points</h3>
        <p class="meta">${esc(WHY[why] || "")} ${PX.hhmm(S.t)} · ${esc(C.DIFF[S.diff].name)}</p>
        ${won ? `<p class="closeby">${E.paintings(S)} of ${C.WAGONS * C.PAINTINGS} paintings home · +${num(S.bonus)} for them</p>` : `<p class="closeby">${E.paintings(S)} paintings aboard · ${Math.round(S.stats.miles)} miles from Velmont</p>`}
        ${pics(S, won)}
        <p class="rank">Rated <b>${esc(rank)}</b></p>${next ? `<p class="note nextrank">Next: ${esc(next[1])}, at ${num(next[0])} points</p>` : ""}${tally(S)}</div>`;
    const ends = `<div class="row end"><button data-act="again" class="primary">Run again</button><button data-act="title">Title</button></div>`;
    /* the scene of the ending stays in view, the sheet beside it; an abandoned night has none */
    const side = PX.Ending.has(S);
    UI.open(title, { wide: true, side, closable: false,
      html: () => `<div class="report">${left()}
        <div>${naming ? `<p class="placed">${place}</p><p>Your name for the table:</p><div class="row"><label class="sr" for="pe-name">Your name</label><input id="pe-name" maxlength="14" value="${esc(PX.lastName())}" placeholder="Puma" autocomplete="off" autofocus><button data-act="save" class="primary">Save</button><button data-act="skip">Skip</button></div><p class="note">Left blank, it is saved as Puma.</p>` :
          `${skipped ? `<p class="placed">${place}</p><p class="note">Not saved to the table.</p>` : ""}${!skipped || PX.scores().length ? `<h3>High scores</h3>${scoresTable(PX.scores(), placed)}` : ""}`}</div></div>
        ${naming ? "" : ends}`,
      onKey: ev => { if (naming && ev.key === "Enter" && document.activeElement && document.activeElement.id === "pe-name") { ev.preventDefault(); save(); return true; } return false; },
      onClick: (b, api) => {
        const a = b.dataset.act;
        if (a === "save") save();
        if (a === "skip") { naming = false; skipped = true; api.refresh(); }
        if (a === "again") { UI.close(true); PX.game.start(S.diff); }
        if (a === "title") { UI.close(true); PX.game.toTitle(); }
      },
    });
    function save() {
      const i = document.getElementById("pe-name"), name = (i && i.value.trim().slice(0, 14)) || "Puma";
      PX.setLastName(name);
      placed = PX.addScore({ name, score: S.score, won, at: Date.now(), diff: C.DIFF[S.diff].name, rank, paintings: E.paintings(S), code: !!S.cheated });
      naming = false;
      UI.close(true);
      UI.open(title, { wide: true, side, closable: false,
        html: () => `<div class="report">${left()}<div>${place ? `<p class="placed">${place}</p>` : ""}<h3>High scores</h3>${scoresTable(PX.scores(), placed)}</div></div>${ends}`,
        onClick: b => { if (b.dataset.act === "again") { UI.close(true); PX.game.start(S.diff); } if (b.dataset.act === "title") { UI.close(true); PX.game.toTitle(); } },
      });
    }
  };
  UI.practiceOver = S => UI.open("Practice over", {
    closable: false,
    html: () => `<h3 class="mname big ok">${num(S.score)} points</h3><p class="meta">${S.stats.guards ? `${S.stats.guards} wolves shot · ` : ""}${S.stats.boats ? `${S.stats.boats} gunboats sunk · ` : ""}${S.stats.planes ? `${S.stats.planes} fighters down · ` : ""}the train ${E.wear(S) < 20 ? "hardly touched" : `${Math.round(E.wear(S))}% hurt`}</p>
      <div class="row end"><button data-act="again" class="primary">Again</button><button data-act="other">Another fight</button><button data-act="title">Title</button></div>`,
    onClick: b => { const a = b.dataset.act; UI.close(true); if (a === "again") PX.game.practice(S.practice); if (a === "other") { PX.game.toTitle(); UI.practice(); } if (a === "title") PX.game.toTitle(); },
  });
  const scoresTable = (list, mark = -1) => list.length ? `<table class="scores"><tr><th></th><th>Name</th><th class="num">Score</th><th>Night</th><th>Rated</th></tr>${list.map((e, i) => `<tr${i === mark ? ' class="mine"' : ""}><td class="num">${i + 1}</td><td>${esc(e.name)}</td><td class="num">${num(e.score)}</td><td>${e.won ? "home" : "lost"}, ${esc(e.diff)}${e.code ? " · code" : ""}</td><td>${esc(e.rank || "")}</td></tr>`).join("")}</table>` : `<p class="note">No scores yet: run the train, and the best ten are kept here, in this browser.</p>`;
  UI.scores = () => UI.open("High scores", {
    html: () => scoresTable(PX.scores()) + (PX.scores().length ? `<p class="note">The best ten, kept in this browser.</p>` : `<div class="row end"><button data-act="new" class="primary">New game</button></div>`),
    onClick: b => { if (b.dataset.act === "new") { UI.close(true); UI.newGame(); } },
  });

  /* ---- Settings (greykit.games STANDARD.md §7: the game's own, Sound, speed, This browser) ---- */
  function showSettings() {
    const pill = (on, label, act) => `<button data-set="${act}" class="pill${on ? " on" : ""}" aria-pressed="${on}">${label}</button>`;
    const toggle = (act, on, n) => `<button data-set="${act}" role="switch" aria-checked="${on}" aria-label="${esc(n)}" class="pill switch${on ? " on" : ""}">${on ? "On" : "Off"}</button>`;
    const sw = (k, n) => toggle("aidt:" + k, PX.aid(k), n);
    const line = (n, note, ctl) => `<tr><td><b>${esc(n)}</b><br><span class="note">${note}</span></td><td class="act">${ctl}</td></tr>`;
    UI.open("Settings", { wide: true,
      html: () => { const changed = Object.keys(PX.prefs.over).length, adj = changed ? ", adjusted" : ""; return `
        <h3>Aids</h3>
        <div class="row">${pill(PX.prefs.aids === "classic", "Classic" + (PX.prefs.aids === "classic" ? adj : ""), "aids:classic")}${pill(PX.prefs.aids === "field", "Field" + (PX.prefs.aids === "field" ? adj : ""), "aids:field")}</div>
        <p class="note">Classic drives as 1987 did: a cursor on the controls, your own fire to keep, and dawn the end of it. Field adds the helps below. <kbd>L</kbd> switches between them on the line.</p>
        <details class="aid-list"${UI.aidOpen ? " open" : ""}><summary>Set each aid on its own${changed ? ` (${changed} changed)` : ""}</summary>
        <table class="aids">${PX.AID_LIST.map(([k, n, note]) => `<tr><td><b>${esc(n)}</b><br><span class="note">${esc(note)}</span></td><td class="act">${sw(k, n)}</td></tr>`).join("")}</table></details>
        <h3>Look</h3>
        <table class="aids">${line("Scanlines", "Fine dark lines over the picture, like an old television.", toggle("scan", PX.prefs.scanlines, "Scanlines"))}
        ${line("Screen shake", "The screen jolts with hits and explosions." + (PX.calm() ? " Off to begin with, as this computer asks for less motion." : ""), toggle("shake", PX.prefs.shake, "Screen shake"))}</table>
        <h3>Sound</h3>
        <table class="aids">${line("Sound", "The engine, the whistle, the guns and the cannon; the tune on the title. <kbd>M</kbd> switches it anywhere.", toggle("mute", !PX.SFX.muted, "Sound"))}</table>
        <h3>Game speed</h3>
        <div class="row">${Object.entries(PX.SPEEDS).map(([k, [n]]) => pill(PX.prefs.speed === k, n, "speed:" + k)).join("")}</div>
        <p class="note">Relaxed slows the whole game down, the night's clock with it; Brisk speeds it up. Nothing else changes.</p>
        <h3>This browser</h3>
        <table class="aids">${line("Resume a night", "Leave a night in the middle and come back to it. Off, a night is played through.", toggle("resume", PX.prefs.resume, "Resume a night"))}</table>
        <div class="row"><button data-set="forget" class="danger">Forget everything</button></div>
        <p class="note">Clears everything The Puma Express keeps in this browser: the high scores, a night in progress, and these settings.</p>`; },
      onClick: async (b, api) => {
        const v = b.dataset.set; if (!v) return;
        if (v === "forget") {
          if (await UI.ask("Forget everything The Puma Express has saved in this browser: the high scores, a night in progress, and your settings? This cannot be undone.", "Forget everything")) PX.forgetEverything();
          return;
        }
        const [k, a] = v.split(":");
        if (k === "aids") PX.setAids(a);
        else if (k === "aidt") PX.setAid(a, !PX.aid(a));
        else if (k === "scan") { PX.prefs.scanlines = !PX.prefs.scanlines; PX.savePrefs(); PX.game.applyLook(); }
        else if (k === "shake") { PX.prefs.shake = !PX.prefs.shake; PX.savePrefs(); }
        else if (k === "resume") { PX.prefs.resume = !PX.prefs.resume; PX.savePrefs(); }
        else if (k === "mute") PX.game.toggleMute();
        else if (k === "speed") { PX.prefs.speed = a; PX.savePrefs(); PX.game.applySpeed(); }
        PX.game.syncAids();
        api.refresh();
      },
      onClose: () => { const f = UI.settingsAfter; UI.settingsAfter = null; if (f) f(); },
    });
  }
  UI.settings = after => { UI.settingsAfter = after; showSettings(); };

  /* ---- Help and About ---- */
  const img = (c, w, h, cls = "fig") => `<img class="px ${cls}" src="${c.toDataURL()}" width="${w}" height="${h}" alt="">`;
  UI.helpTabs = () => [
    ["The night", `<p><b>Run the train from Velmont to Port Clair before dawn.</b> The wolves have loaded it with the puma country's paintings. Take it, and bring as many home as you can.</p>
      <p>Stations the wolves hold stop you, and you fight for them. Gunboats stop you at bridges. Fighters come down the line between. Stop at a station of ours for coal and water and Duc's report, and send one message by telegraph.</p>
      <p>At dawn (08:00) it is over (Classic). Run onto a cut in the line, into the buffers, or over points too fast, and it is over too.</p>
      <p class="gk-credit">${CREDIT}</p>`],
    ["Driving", `<p><b>Fire, pressure, pull.</b> Coal on the grate heats the boiler; the <b>steam</b> gauge on the driver's board shows its pressure, and <b>heat</b> beside it how hot the water is. Open the <b>firebox door</b> and shovel when it falls; shut the door again, or the cold air steals the heat. Past the red line the boiler is hurt; much past it, it bursts. The <b>safety valve</b> blows off steam.</p>
      <p><b>The throttle</b> turns pressure into pull. <b>The reverser</b> sets forward or back: never move it while she rolls. <b>The brake</b> stops her; a station of ours services her when she stands at its platform.</p>
      <p><b>The points:</b> the repeater by the gauges shows how the next junction is set. Whistle once for the northern way, twice for straight on, three times for the southern. Take a turnout slowly.</p>
      <p>Coal and water run down as you go: the two gauges at the right of the bar along the top. In Classic the cursor is the only hand: <kbd>←</kbd> <kbd>→</kbd> pick a control, <kbd>↑</kbd> <kbd>↓</kbd> work it, <kbd>Space</kbd> uses it.</p>`],
    ["The fights", `<table class="enemy">
      <tr><td class="figc">${img(PX.People.wolf("aim", 0), 48, 60)}</td><td><p><b>A station.</b> Duc runs up the platform to the points lever and back, but only while you are firing: give him cover. Wolves come up at the windows, which light when they do. Shoot them before they shoot him, or the engine.</p></td></tr>
      <tr><td class="figc">${img(PX.Guns.plane("head", 48, false), 54, 34)}</td><td><p><b>Fighters.</b> <kbd>1</kbd> the front gun, <kbd>2</kbd> the rear. They strafe on the way in; a fighter that has passed is the other gun's. The tab at the top lights for the gun that is needed.</p></td></tr>
      <tr><td class="figc">${img(K.flip(PX.TrainArt.gunCar(1)), 54, 60)}</td><td><p><b>A bridge.</b> <kbd>←</kbd> <kbd>→</kbd> train the cannon, <kbd>↑</kbd> <kbd>↓</kbd> range it out and in, <kbd>Space</kbd> fires. Watch where the shell comes down, and correct. Sink every boat.</p></td></tr>
    </table>`],
    ["Keys", `<table class="keys">
      <tr><td>Views</td><td><kbd>1</kbd> front gun, <kbd>2</kbd> rear gun, <kbd>3</kbd> cab, <kbd>4</kbd> or <kbd>Tab</kbd> map</td></tr>
      <tr><td>The cab</td><td><kbd>←</kbd> <kbd>→</kbd> pick a control, <kbd>↑</kbd> <kbd>↓</kbd> work it, <kbd>Space</kbd> use it</td></tr>
      <tr><td>The cab (Field)</td><td><kbd>W</kbd> <kbd>S</kbd> throttle, <kbd>X</kbd> <kbd>Z</kbd> brake on and off, <kbd>E</kbd> <kbd>Q</kbd> reverser, <kbd>F</kbd> door, <kbd>G</kbd> shovel, <kbd>V</kbd> valve, <kbd>H</kbd> whistle; or the mouse</td></tr>
      <tr><td>Aim, fire</td><td><kbd>←</kbd> <kbd>↑</kbd> <kbd>↓</kbd> <kbd>→</kbd> or <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd>, <kbd>Space</kbd>; or the mouse (Field)</td></tr>
      <tr><td>Fast running</td><td>hold <kbd>Shift</kbd> (Field)</td></tr>
      <tr><td>Pause</td><td><kbd>Esc</kbd> or <kbd>P</kbd></td></tr>
      <tr><td>Aids</td><td><kbd>L</kbd> Classic or Field</td></tr>
      <tr><td>Sound</td><td><kbd>M</kbd></td></tr></table>
      <p class="note">Gamepad: the stick or pad picks, works and aims; A uses and fires; B whistles; the bumpers change view; Back is the map, Start pauses.</p>`],
  ];
  UI.help = (tab = 0, after) => UI.open("Help", { wide: true, tab, tabs: UI.helpTabs(), onClose: after });
  UI.aboutHTML = () => `<p><b>The Puma Express</b> is a heavily modified remake of <i>The Train: Escape to Normandy</i> (Accolade, 1987) for the Commodore 64: steal back a train of looted art and run it across occupied country to the coast before dawn, driving the engine by hand and fighting for every station and bridge on the way.</p>
    <p>The resistance are pumas here, and the occupiers the Wolf Empire. The line, the towns and the numbers are our own; the shape of the night is 1987's.</p>
    <p class="gk-credit">${CREDIT}</p>`;
  UI.about = after => UI.open("About", { html: UI.aboutHTML, onClose: after });
})();
