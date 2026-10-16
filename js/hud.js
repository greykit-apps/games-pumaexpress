/* The Puma Express -- the HUD: flat dark panels at the edges of the scene.
 *
 * Top left, the train: the score, the clock against dawn, the engine's
 * hurts, the paintings still aboard, the coal and the water. Top centre, the
 * four views and their keys; a gun's tab lights when fighters come at its
 * side. Top right (a Field aid), the line ahead: the next points, station and
 * bridge, and whose they are. At the foot, Duc's words, over the key strip.
 * On the map, a panel beside it with the night so far and the legend.
 * Nothing here is told by colour alone; written only when it changes. */
"use strict";
(() => {
  const C = PX.C, L = PX.Line, E = PX.Engine, K = PX.K, esc = PX.esc;
  const HUD = PX.HUD = { el: null, toasts: [], last: {}, built: false };
  const $ = id => document.getElementById(id);
  const set = (el, k, v, f) => { if (HUD.last[k] !== v) { HUD.last[k] = v; f(el, v); } };
  const bar = n => `<span class="h-bar">${"<i></i>".repeat(n)}</span>`;
  const url = c => c.toDataURL();

  HUD.build = () => {
    const el = HUD.el = $("hud");
    HUD.face = url(PX.People.ducFace());
    el.innerHTML = `
      <div class="hp" id="h-status">
        <div class="hs-left"><span class="num h-score">0</span><span class="h-code" hidden title="Konami code: coal, water and a mended engine, and no more harm this night">Code</span><span class="h-clock"><b class="num">21:00</b><span class="h-dawn"></span></span></div>
        <div class="hs-right">
          ${C.PARTS.slice(0, 3).map(([k, n]) => `<div class="h-row" data-p="${k}" title="${esc(n)}"><span class="lbl">${esc({ motion: "Gear" }[k] || n)}</span>${bar(10)}</div>`).join("")}
          <div class="h-row h-art"><span class="lbl">Paintings</span><b class="num h-paint">48</b></div>
          <div class="h-row h-sup"><span class="lbl">Coal</span><span class="h-gauge" data-g="coal"><i></i></span></div>
          <div class="h-row h-sup"><span class="lbl">Water</span><span class="h-gauge" data-g="water"><i></i></span></div>
        </div>
      </div>
      <nav class="h-views" aria-label="Views">
        <button data-view="front"><kbd>1</kbd>Front gun</button><button data-view="rear"><kbd>2</kbd>Rear gun</button><button data-view="cab"><kbd>3</kbd>Cab</button><button data-view="map"><kbd>4</kbd>Map</button>
      </nav>
      <div class="hp" id="h-ahead"><div class="ha-rows"></div></div>
      <div class="h-fast hp" hidden><span class="num">4×</span> fast running</div>
      <div class="h-low"><div class="h-toasts"></div><div class="hp h-ctl" hidden></div><div class="hp h-hint" hidden></div></div>
      <div class="hp h-end" hidden></div>
      <div class="h-flash"></div>
      <div class="h-mapside hp" hidden></div>`;
    el.querySelector(".h-views").addEventListener("click", ev => { const b = ev.target.closest("[data-view]"); if (b) PX.game.setView(b.dataset.view); });
    HUD.last = {};
    HUD.built = true;
  };

  /* Duc's words, with his face; or the game's own, without */
  HUD.toast = (text, tone = "", ms = 2800, duc = false) => {
    const box = HUD.el && HUD.el.querySelector(".h-toasts");
    if (!box) return;
    if (HUD.toasts.some(t => t.text === text && t.until > performance.now())) return;
    const d = document.createElement("div");
    d.className = "hp h-toast " + tone + (duc ? " duc" : "");
    d.innerHTML = (duc ? `<img src="${HUD.face}" width="40" height="40" alt="Duc:">` : "") + `<span>${esc(text)}</span>`;
    box.appendChild(d);
    const t = { text, d, until: performance.now() + ms };
    HUD.toasts.push(t);
    while (HUD.toasts.length > 2) HUD.toasts.shift().d.remove();
    const live = $("live"); if (live) live.textContent = (duc ? "Duc: " : "") + text;
  };
  HUD.say = (text, tone, ms) => HUD.toast(text, tone, ms || 3200, true);
  HUD.flash = () => { const f = HUD.el && HUD.el.querySelector(".h-flash"); if (!f) return; f.classList.remove("on"); void f.offsetWidth; f.classList.add("on"); };
  HUD.hint = html => { const h = HUD.el.querySelector(".h-hint"); if (!html) { h.hidden = true; HUD.hintNow = ""; return; } if (HUD.hintNow !== html) { HUD.hintNow = html; h.innerHTML = html; } h.hidden = false; };
  HUD.end = (title, sub, tone, more = "") => { const e = HUD.el.querySelector(".h-end"); if (!title) { e.hidden = true; return; } e.dataset.tone = tone; e.innerHTML = `<b>${esc(title)}</b><span>${esc(sub || "")}</span>${more}`; e.hidden = false; };
  HUD.clear = () => { HUD.toasts.forEach(t => t.d.remove()); HUD.toasts = []; HUD.end(null); HUD.hint(null); HUD.last = {}; };

  /* what the cab's cursor is on, and what its keys do */
  const CTL = {
    throttle: "<kbd>↑</kbd> open <kbd>↓</kbd> close",
    brake: "<kbd>↑</kbd> on <kbd>↓</kbd> off",
    reverser: "<kbd>↑</kbd> forward <kbd>↓</kbd> back · never while she rolls",
    door: "<kbd>Space</kbd> open or shut",
    shovel: "hold <kbd>Space</kbd> to fire her · the door must be open",
    valve: "hold <kbd>Space</kbd> to blow off steam",
    whistle: "<kbd>Space</kbd> once north, twice straight on, three times south",
  };
  const DIRECT = { throttle: "W S", brake: "X Z", reverser: "E Q", door: "F", shovel: "G", valve: "V", whistle: "H" };

  /* ---- every frame ---- */
  HUD.draw = (S, ui, now) => {
    if (!HUD.built) HUD.build();
    const el = HUD.el;
    HUD.toasts = HUD.toasts.filter(t => { if (t.until > now) return true; t.d.remove(); return false; });
    set(el.querySelector(".h-score"), "score", S.score, (e, v) => { e.textContent = v.toLocaleString("en-US"); });
    set(el.querySelector(".h-clock b"), "clock", PX.hhmm(S.t), (e, v) => { e.textContent = v; });
    const left = C.DAWN - S.t, dawnTxt = S.practice ? "practice" : left > 0 ? `dawn in ${Math.floor(left / 60)}h${String(Math.floor(left % 60)).padStart(2, "0")}` : "after dawn";
    set(el.querySelector(".h-dawn"), "dawn", dawnTxt + (left < 60 && left > 0 ? "!" : ""), (e, v) => { e.textContent = v; e.parentNode.classList.toggle("late", left < 90); });
    set($("h-status"), "konami", !!S.konami, (e, v) => { e.classList.toggle("konami", v); e.querySelector(".h-code").hidden = !v; });
    for (const [k] of C.PARTS.slice(0, 3)) {
      const v = Math.ceil(S.dmg[k] / 10);
      set(el.querySelector(`[data-p="${k}"] .h-bar`), "p" + k, v, (e, n) => { e.className = "h-bar" + (n >= 8 ? " crit" : n >= 5 ? " high" : ""); [...e.children].forEach((i, j) => i.classList.toggle("on", j < n)); e.setAttribute("aria-label", `${n * 10}% damaged`); });
    }
    set(el.querySelector(".h-paint"), "paint", E.paintings(S), (e, v) => { e.textContent = v; e.parentNode.classList.toggle("high", v < 40); });
    for (const k of ["coal", "water"]) {
      const v = Math.round(S.cab[k] / C.LOCO[k] * 20) * 5;
      set(el.querySelector(`[data-g="${k}"]`), "g" + k, v, (e, n) => { e.firstChild.style.width = n + "%"; e.className = "h-gauge" + (n <= 20 ? " crit" : n <= 40 ? " high" : ""); e.setAttribute("aria-label", `${k} ${n}%`); });
    }
    /* the views: which is showing, and a gun called for */
    const scene = PX.Render.sceneOf(S, ui), fight = S.phase === "capture" || S.phase === "bridge";
    const call = S.raid ? S.raid.planes.filter(p => p.st === "run" && p.delay <= 0).map(p => E.sight(p, "front") ? "front" : E.sight(p, "rear") ? "rear" : "").join(" ") : "";
    set(el.querySelector(".h-views"), "views", `${scene}|${call}|${fight}`, e => {
      e.hidden = fight;
      for (const b of e.querySelectorAll("button")) { const v = b.dataset.view; b.classList.toggle("on", v === scene); b.classList.toggle("call", call.includes(v) && v !== scene); b.setAttribute("aria-pressed", String(v === scene)); }
    });
    /* the line ahead */
    const showAhead = !!ui.aids.ahead && S.phase === "run" && !ui.mapView && !S.practice;
    set($("h-ahead"), "aheadOn", showAhead, (e, v) => { e.hidden = !v; });
    if (showAhead && now - (HUD.aheadAt || 0) > 250) { HUD.aheadAt = now; ahead(S); }
    /* the cab's control, named */
    const ctl = scene === "cab" && S.phase === "run" ? PX.Input.sel() : null;
    set(el.querySelector(".h-ctl"), "ctl", ctl, (e) => {
      if (!ctl) { e.hidden = true; return; }
      e.hidden = false;
      e.innerHTML = `<b>${esc(PX.Cab.NAMES[ctl])}</b> <span>${CTL[ctl]}</span> <span class="dk">${DIRECT[ctl].split(" ").map(k => `<kbd>${k}</kbd>`).join("")}</span>`;
    });
    set(el.querySelector(".h-fast"), "fast", !!ui.fast, (e, v) => { e.hidden = !v; });
    const ms = el.querySelector(".h-mapside");
    set(ms, "map", !!ui.mapView, (e, v) => { e.hidden = !v; });
    if (ui.mapView && now - (HUD.mapAt || 0) > 400) { HUD.mapAt = now; mapSide(S, ui); }
    $("stage").classList.toggle("hurt", E.wear(S) >= 80 && S.phase !== "over" && S.phase !== "won");
  };

  const POINTS = ["north", "straight on", "south"];
  const mi = d => d < 0.95 ? `${Math.max(1, Math.round(d * 10)) / 10} mi` : `${Math.round(d)} mi`;
  function ahead(S) {
    const rows = [], a = L.ahead(S, 60, S.tr.v === 0 ? S.tr.face : 0);
    const j = a.find(x => x.k === "node" && L.isJunction(x.n) && x.d > 0.1);
    if (j) rows.push(["Points", `${L.nodes[j.n].name}`, `${mi(j.d)} · <b class="pt">${POINTS[S.pts[j.n]]}</b>`, ""]);
    const st = a.find(x => x.k === "node" && L.nodes[x.n].kind === "st" && x.d > C.STATION_ZONE);
    if (st) { const held = S.st[st.n].held, fin = L.nodes[st.n].final; rows.push(["Station", L.nodes[st.n].name, `${mi(st.d)} · ${fin ? "<b class=\"ok\">the free coast</b>" : held ? "<b class=\"bad\">wolves</b>" : "ours"}`, held ? "bad" : ""]); }
    const br = a.find(x => x.k === "bridge" && x.d > 0);
    if (br) { const gd = S.br[br.e].guarded; rows.push(["Bridge", L.edges[br.e].bridge.river.replace("the ", ""), `${mi(br.d)} · ${gd ? "<b class=\"bad\">gunboats</b>" : "clear"}`, gd ? "bad" : ""]); }
    const cut = a.find(x => x.k === "cut" && S.cut[x.e].known);
    if (cut) rows.push(["Line cut", "", `${mi(cut.d)} · <b class="bad">stop short</b>`, "bad"]);
    const end = a.find(x => x.k === "end" || x.k === "wolf");
    if (end) rows.push([end.k === "wolf" ? "Frontier" : "Dead end", "", `${mi(end.d)} · <b class="bad">wrong way</b>`, "bad"]);
    if (!rows.length) rows.push(["", "Clear for sixty miles", "", ""]);
    const html = rows.map(([k, n, v, c]) => `<div class="ha-row ${c}"><span class="lbl">${k}</span>${n ? `<span class="ha-n">${esc(n)}</span>` : ""}<span class="ha-v">${v}</span></div>`).join("");
    const box = HUD.el.querySelector(".ha-rows");
    if (box.innerHTML !== html) box.innerHTML = html;
  }

  /* beside the map: the night so far, the Resistance's holds, the legend, the keys */
  function mapSide(S, ui) {
    const box = HUD.el.querySelector(".h-mapside"), M = PX.MapArt.mark;
    const tasks = S.tasks.filter(t => !t.done).map(t => `<div class="h-kr"><span>${t.k === "station" ? esc(L.nodes[t.n].name) : esc(L.edges[t.e].bridge.name)}</span><b class="ok">ours till ${PX.hhmm(t.until)}</b></div>`).join("");
    const rep = S.repairAt >= 0 ? `<div class="h-kr"><span>Fitters waiting</span><b>${esc(L.nodes[S.repairAt].name)}</b></div>` : "";
    const legend = K.get("legendHTML", () => {
      const mk = f => { const c = K.mk(16, 16), g = c.getContext("2d"); f(g); return `<img class="lg" src="${c.toDataURL()}" width="32" height="32" alt="">`; };
      return [[mk(g => M.station(g, 8, 8, "ours", "#e2ad6a")), "station, ours"], [mk(g => M.station(g, 8, 8, "held", "#e8573a")), "station, wolves"], [mk(g => M.station(g, 8, 8, "final", "#f2ecd8")), "Port Clair"],
        [mk(g => { K.rect(g, 4, 6, 9, 5, "#0b0d12"); K.rect(g, 5, 7, 7, 3, "#c9c2b4"); }), "bridge"], [mk(g => M.boat(g, 8, 8, "#e8573a")), "gunboats"], [mk(g => M.cross(g, 8, 8, "#e8573a")), "line cut"],
        [mk(g => { K.poly(g, [[8, 4], [12, 8], [8, 12], [4, 8]], "#9b9284"); }), "junction"], [mk(g => { K.ring(g, 8, 8, 6, "#e2ad6a", 2); K.line(g, 5, 8, 11, 8, "#fff", 2); }), "the train"]]
        .map(([i, n]) => `<span>${i}${n}</span>`).join("");
    });
    const html = `<h2>The line</h2>
      <p class="h-mvst">${PX.hhmm(S.t)} · ${S.t < C.DAWN ? `dawn in ${Math.floor((C.DAWN - S.t) / 60)}h${String(Math.floor((C.DAWN - S.t) % 60)).padStart(2, "0")}` : "after dawn"} · ${Math.round(S.stats.miles)} miles run</p>
      <div class="h-kr"><span>Stations taken</span><b class="num">${S.stats.stations}</b></div>
      <div class="h-kr"><span>Bridges cleared</span><b class="num">${S.stats.bridges}</b></div>
      <div class="h-kr"><span>Fighters down</span><b class="num">${S.stats.planes}</b></div>
      <div class="h-kr"><span>Paintings aboard</span><b class="num">${E.paintings(S)}</b></div>
      ${tasks}${rep}
      <div class="h-legend">${legend}</div>
      <p class="h-mvkeys">${ui.aids.planner ? "Click a junction to set its points. " : ""}<kbd>Tab</kbd> <kbd>4</kbd> or <kbd>Esc</kbd> back</p>`;
    if (box.innerHTML !== html) box.innerHTML = html;
  }
})();
