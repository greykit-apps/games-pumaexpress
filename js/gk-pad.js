/* @gk-pad-begin v0.1 -- greykit.games shared code (games-meta STANDARD.md §16),
 * the gamepad in the menus. A guideline, not a rule: nothing checks it, and a
 * game may take it, change its copy, or leave it. The copy of record is
 * games-meta's canon/gk-pad.js; a game that takes a newer version takes it
 * whole.
 * Needs nothing else loaded, and changes nothing in @gk-title, @gk-intro or
 * @gk-table: their menus are already driven by keys, so this turns the pad
 * into the same keys -- arrows, Enter, Escape -- and lets them do the rest.
 * Plain script, no imports or exports, so a single-file game can paste it
 * into a classic <script>.
 *
 * Off the play screen, on the standard mapping:
 *   d-pad, left stick   the arrows: a press, then repeating while held
 *   A                   presses the focused button (a click); with nothing
 *                       focused, Enter
 *   B                   Escape: back, or close
 *   Start               Escape while a dialog is up, otherwise as A
 *   LB, RB              Shift+Tab and Tab
 *   right stick         scrolls the dialog, or the page
 * While the game claims the pad (its play screen is up), none of this: the
 * game reads the pad itself, and a button held across the change is spent,
 * so the press that paused a game does not also close the pause. */

/**
 * Start reading the pad for the menus. Call it once, at load.
 *   claimed   () => true while the game reads the pad itself; left out, never
 *   hold      what a press may do while §14's boot is up: "pad" (the default)
 *             lets A or Start continue past the hold, as a key would -- the
 *             browser does not count a pad as a touch of the page, so sound
 *             then stays off until the first key or click; "keys" leaves the
 *             boot and its hold to the keys and the mouse, so the title
 *             always arrives with its music
 *   start     () => "Escape" or "Enter": what Start presses, where the game
 *             knows better than "is a dialog up"
 *   buttons   more buttons as keys, { [button]: key }: { 3: "m" } makes Y
 *             the Sound key; standard numbering, 0 A, 1 B, 2 X, 3 Y, 8 Back
 * Returns { stop() }. Every key it sends carries ev.gkPad = true.
 */
function gkPad({ claimed = () => false, hold = "pad", start = null, buttons = {} } = {}) {
  if (!navigator.getGamepads) return { stop() {} };
  const DELAY = 380, EVERY = 110, ON = 0.5, OFF = 0.3, SCROLL = 18;
  const ARROW = { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight" };
  let raf = 0, was = true, prev = new Set(), spent = new Set(), pending = [], stick = null, sent = new Map();
  const next = {};

  /* the keys go where the keyboard's would: to the focused element, or the body */
  const target = () => { const a = document.activeElement; return a && a !== document.documentElement && a.isConnected ? a : document.body; };
  const CODE = { " ": "Space", Enter: "Enter", Escape: "Escape", Tab: "Tab" };
  const KC = { ArrowLeft: 37, ArrowUp: 38, ArrowRight: 39, ArrowDown: 40, Enter: 13, Escape: 27, Tab: 9, " ": 32 };
  function key(type, k, { shift = false, repeat = false } = {}, at = target()) {
    const code = CODE[k] || (k.startsWith("Arrow") ? k : /^[a-z]$/i.test(k) ? "Key" + k.toUpperCase() : /^\d$/.test(k) ? "Digit" + k : k);
    const ev = new KeyboardEvent(type, { key: k, code, shiftKey: shift, repeat, bubbles: true, cancelable: true, composed: true, view: window });
    /* games that still read keyCode */
    const kc = KC[k] || (k.length === 1 ? k.toUpperCase().charCodeAt(0) : 0);
    try { Object.defineProperty(ev, "keyCode", { get: () => kc }); Object.defineProperty(ev, "which", { get: () => kc }); } catch (e) { /* fine */ }
    ev.gkPad = true;
    at.dispatchEvent(ev);
    return ev;
  }
  /* a key goes down now and comes up when its button does, as a key would */
  function press(input, k, opt) {
    const at = target(), before = document.activeElement, ev = key("keydown", k, opt, at);
    if (!sent.has(input)) sent.set(input, { k, at });
    return { taken: ev.defaultPrevented || document.activeElement !== before };
  }
  function lift(input) {
    const s = sent.get(input);
    if (!s) return;
    sent.delete(input);
    key("keyup", s.k, {}, s.at.isConnected ? s.at : target());
  }

  /* the dialog on top, if one is up: where the arrows' own walk stays */
  const shown = n => n.getClientRects().length > 0 && (!n.checkVisibility || n.checkVisibility());
  const dialog = () => [...document.querySelectorAll('[aria-modal="true"], dialog[open]')].filter(shown).pop() || null;
  const FOCUSABLE = 'button:not(:disabled), a[href], input:not([type="hidden"]):not(:disabled), select:not(:disabled), textarea:not(:disabled), summary, [tabindex]:not([tabindex="-1"])';
  const focusables = () => {
    const scope = dialog() || document.body;
    return [...scope.querySelectorAll(FOCUSABLE)].filter(n => shown(n) && !n.closest("[inert]") && !(n.closest("details:not([open])") && n.tagName !== "SUMMARY"));
  };
  /* An arrow no screen took: walk to the nearest control that way, inside
     the dialog on top (the title's sheets leave the arrows to Tab). Up and
     down go round at the ends; a scroller with more to show that way
     scrolls first. */
  function walk(dir) {
    const all = focusables(), a = document.activeElement;
    if (!all.length) return;
    if (!all.includes(a)) { all[0].focus({ preventScroll: true }); return; }
    const [dx, dy] = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[dir];
    const c = n => { const r = n.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, r }; }, o = c(a);
    let best = null, score = Infinity;
    for (const n of all) {
      if (n === a) continue;
      const p = c(n), x = p.x - o.x, y = p.y - o.y, along = x * dx + y * dy;
      if (along <= (dx ? o.r.width : o.r.height) / 4) continue;
      const s = along + Math.abs(dx ? y : x) * 3;
      if (s < score) { score = s; best = n; }
    }
    if (!best && dy) {
      const sc = scroller(a);
      if (sc && (dy > 0 ? sc.scrollTop + sc.clientHeight < sc.scrollHeight - 1 : sc.scrollTop > 0)) { sc.scrollBy({ top: dy * sc.clientHeight * 0.8, behavior: "smooth" }); return; }
      best = dy > 0 ? all[0] : all[all.length - 1];
    }
    if (best) { best.focus({ preventScroll: true }); best.scrollIntoView({ block: "nearest", inline: "nearest" }); }
  }
  /* Tab no screen took: the next control along, round at the ends */
  function tab(back) {
    const all = focusables(), i = all.indexOf(document.activeElement);
    if (!all.length) return;
    const n = all[i < 0 ? 0 : (i + (back ? -1 : 1) + all.length) % all.length];
    n.focus({ preventScroll: true }); n.scrollIntoView({ block: "nearest", inline: "nearest" });
  }
  function scroller(from) {
    for (let n = from; n && n !== document.body; n = n.parentElement) {
      const st = getComputedStyle(n);
      if (/(auto|scroll)/.test(st.overflowY) && n.scrollHeight > n.clientHeight + 1) return n;
    }
    const d = dialog();
    if (d) for (const n of d.querySelectorAll("*")) if (/(auto|scroll)/.test(getComputedStyle(n).overflowY) && n.scrollHeight > n.clientHeight + 1) return n;
    return document.scrollingElement;
  }

  /* A, and Start where it is A: the focused control is clicked, as Enter
     or Space on it would; a text field, or no focus at all, gets Enter */
  const CLICKS = 'button, a[href], summary, input[type="checkbox"], input[type="radio"], input[type="button"], input[type="submit"], [role="button"], [role="tab"], [role="switch"], [role="menuitem"], [role="option"]';
  function activate(input) {
    const a = document.activeElement;
    if (a && a !== document.body && a.matches(CLICKS) && !a.closest("[inert]")) { a.click(); return; }
    press(input, "Enter");
  }

  function read() {
    const now = new Set();
    let lx = 0, ly = 0, ry = 0;
    for (const p of navigator.getGamepads()) {
      if (!p || !p.connected) continue;
      const b = i => p.buttons[i] && p.buttons[i].pressed, ax = i => p.axes[i] || 0;
      if (b(12)) now.add("up"); if (b(13)) now.add("down"); if (b(14)) now.add("left"); if (b(15)) now.add("right");
      if (b(0)) now.add("a"); if (b(1)) now.add("b"); if (b(9)) now.add("start");
      if (b(4)) now.add("lb"); if (b(5)) now.add("rb");
      for (const i in buttons) if (b(+i)) now.add("b" + i);
      if (Math.abs(ax(0)) > Math.abs(lx)) lx = ax(0);
      if (Math.abs(ax(1)) > Math.abs(ly)) ly = ax(1);
      if (Math.abs(ax(3)) > Math.abs(ry)) ry = ax(3);
    }
    /* the stick is one of the four arrows at a time, its stronger axis; it
       lets go only well inside the dead zone, so a stick resting near the
       edge does not chatter */
    const m = Math.max(Math.abs(lx), Math.abs(ly));
    if (stick && m < OFF) stick = null;
    else if (m > ON) stick = Math.abs(lx) > Math.abs(ly) ? (lx > 0 ? "right" : "left") : (ly > 0 ? "down" : "up");
    if (stick) now.add(stick);
    return { now, ry };
  }

  function tick() {
    if (document.hidden) return;
    const { now, ry } = read(), t = performance.now();
    const mine = !claimed();
    /* a change of hands spends every button already down: it pressed
       something on the other side, and must be let go before it counts here */
    if (mine !== was) { spent = new Set(now); pending = []; for (const k of [...sent.keys()]) lift(k); was = mine; }
    for (const k of [...spent]) if (!now.has(k)) spent.delete(k);
    for (const k of [...sent.keys()]) if (!now.has(k)) lift(k);
    /* A press is acted on one poll after it is seen. The game's own frame
       comes in between, so it always sees a press first: Start that closes
       a pause has already been passed over by the game's poll as a press
       made while paused, and cannot reach it again as a fresh one. Without
       this, a press landing between the game's frame and this poll closed
       the pause and opened it again. */
    const rose = [...now].filter(k => !prev.has(k) && !spent.has(k));
    prev = now;
    if (!mine) return;
    const fresh = pending.filter(k => !spent.has(k));
    pending = rose;

    /* the boot: the press that continues past the hold, or nothing */
    if (document.querySelector(".gk-boot")) {
      if (hold === "pad" && (fresh.includes("a") || fresh.includes("start"))) press("boot", "Enter");
      return;
    }
    for (const d of ["up", "down", "left", "right"]) {
      const first = fresh.includes(d);
      if (spent.has(d) || (!now.has(d) && !first)) { next[d] = 0; continue; }
      if (!first && !(next[d] && t >= next[d])) continue;
      next[d] = t + (first ? DELAY : EVERY);
      if (!press(d, ARROW[d], { repeat: !first }).taken) walk(d);
    }
    for (const k of fresh) {
      if (k === "a") activate(k);
      else if (k === "b") press(k, "Escape");
      else if (k === "start") {
        const s = start ? start() : dialog() ? "Escape" : "Enter";
        if (s === "Enter") activate(k); else press(k, s);
      } else if (k === "lb" || k === "rb") {
        if (!press(k, "Tab", { shift: k === "lb" }).taken) tab(k === "lb");
      } else if (k[0] === "b") press(k, buttons[k.slice(1)]);
    }
    if (Math.abs(ry) > 0.25) { const sc = scroller(document.activeElement || document.body); if (sc) sc.scrollTop += Math.sign(ry) * (Math.abs(ry) - 0.25) / 0.75 * SCROLL; }
  }

  /* one poll a frame while a pad is connected. It runs after the frame's
     other callbacks, so a game that polls the pad in its own frame has
     already seen the press and changed hands before this looks */
  const loop = () => { raf = requestAnimationFrame(loop); setTimeout(tick, 0); };
  const any = () => [...navigator.getGamepads()].some(p => p && p.connected);
  const go = () => { if (!raf) loop(); };
  const halt = () => { if (raf && !any()) { cancelAnimationFrame(raf); raf = 0; for (const k of [...sent.keys()]) lift(k); prev = new Set(); pending = []; stick = null; } };
  addEventListener("gamepadconnected", go);
  addEventListener("gamepaddisconnected", halt);
  if (any()) go();
  return {
    stop() { removeEventListener("gamepadconnected", go); removeEventListener("gamepaddisconnected", halt); cancelAnimationFrame(raf); raf = 0; for (const k of [...sent.keys()]) lift(k); }
  };
}
/* @gk-pad-end */
