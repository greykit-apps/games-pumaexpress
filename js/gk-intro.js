/* @gk-intro-begin v0.1 -- greykit.games shared code (games-meta STANDARD.md §14),
 * the integrated intro. A guideline, not a rule: nothing checks it, and a game
 * may take it, change its copy, or leave it. The copy of record is games-meta's
 * canon/gk-intro.js; a game that takes a newer version takes it whole.
 * Needs the @gk-title block loaded first (runBoot, reduced, escHTML,
 * decodeTitle, revealTitle) and changes nothing in it: the boot stays canon's
 * byte for byte, and this drives it from outside. Plain script, no imports or
 * exports, so a single-file game can paste it into a classic <script>.
 *
 * The integrated intro, in order:
 *   1. canon's boot, with a boot sound of the game's (silent on a cold load:
 *      the browser holds audio back until the page has been touched);
 *   2. the boot holds at its end on "Click or press a key to continue" --
 *      that press is what lets the title's music play;
 *   3. the boot fades quickly and the title fades in over the game's own
 *      live or drawn scene, the title music starting;
 *   4. the name arrives on a timer; then the menu prints in as the shade
 *      comes up behind it, with the Sound and Music switches top right and
 *      the greykit.com credit centred under the menu.
 * A key or a click during 3-4 skips to the end of it. */

const INTRO_CSS = `
/* ---- the hold at the end of the boot ---- */
.gk-boot.gki-hold{cursor:pointer}
.gk-boot.gki-hold .gk-skip{display:none}
.gk-boot .gki-prompt{position:absolute;left:16px;right:16px;top:calc(50% + var(--S) / 2 + 84px);text-align:center;
  font-size:13px;letter-spacing:.22em;text-transform:uppercase;color:var(--text);opacity:0;
  animation:gki-in .5s ease-out forwards,gki-breathe 2.6s ease-in-out .5s infinite}
.gk-boot .gki-prompt::before,.gk-boot .gki-prompt::after{content:"";display:inline-block;width:6px;height:6px;margin:0 14px 2px;
  border:1px solid var(--accent);transform:rotate(45deg)}
@keyframes gki-in{to{opacity:1}}
/* the cat blinks while it waits, as greykit.com's mark does (greykitweb
   consulting/index.html, .hero-mark .lid): an eyelid in the face's silver --
   the mark is drawn inverted at brightness .72 -- closing over the eye, every
   eight seconds, the first soon after the hold. The boot shows the mark
   flipped, so the lid sits mirrored from the site's, at +6deg, a little larger
   so it covers the whole eye (71-90% across, 45-60% down the flipped mark). */
.gk-boot .gki-lid{position:absolute;left:66.5%;top:41%;width:29%;height:24%;background:#b8b8b8;border-radius:50%;
  transform:rotate(6deg) scaleY(0);transform-origin:50% 10%;pointer-events:none}
.gk-boot.gki-hold .gki-lid{animation:gki-blink 8s ease-in-out -6s infinite}
@keyframes gki-blink{0%,92.5%{transform:rotate(6deg) scaleY(0)}94%,95.2%{transform:rotate(6deg) scaleY(1)}96.7%,100%{transform:rotate(6deg) scaleY(0)}}
@keyframes gki-breathe{0%,100%{opacity:1}50%{opacity:.42}}

/* ---- the integrated title: the credit centred under the menu (gkIntegrate
   moves the footer there), the switches top right ---- */
.gk-title.gki main>footer{width:min(460px,100%);margin-top:18px;text-align:center;font-size:16px;letter-spacing:.02em;color:var(--t-dim)}
/* the credit: the words lower-cased on screen (the page keeps §1's string
   byte for byte), the name lit in the title's highlight */
.gk-title.gki .gk-credit{text-transform:lowercase}
.gk-title.gki .gk-credit a{color:var(--t-hi,var(--accent));text-decoration:none}
.gk-title.gki .gk-credit a:hover,.gk-title.gki .gk-credit a:focus-visible{text-decoration:underline;text-underline-offset:3px}
.gki-toggles{position:absolute;z-index:2;top:20px;right:24px;display:flex;gap:10px}
.gki-tg{display:flex;align-items:center;gap:9px;height:36px;padding:0 10px 0 11px;font:inherit;color:var(--t-ink,var(--text));cursor:pointer;
  background:var(--t-panel,var(--panel));border:1px solid var(--t-line,var(--line));border-radius:18px}
.gki-tg:hover{border-color:var(--t-focus,var(--accent))}
.gki-tg:focus-visible{outline:2px solid var(--t-focus,var(--accent));outline-offset:2px}
.gki-tg svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.gki-tg .gki-sw{position:relative;width:32px;height:18px;border-radius:9px;box-sizing:border-box;
  border:1px solid var(--t-line,var(--line));background:color-mix(in srgb,var(--bg) 70%,transparent);transition:background .18s,border-color .18s}
.gki-tg .gki-sw::after{content:"";position:absolute;top:2px;left:2px;width:12px;height:12px;border-radius:50%;
  background:var(--t-dim,var(--dim));transition:transform .18s cubic-bezier(.3,.7,.4,1),background .18s}
.gki-tg[aria-pressed="true"] .gki-sw{background:color-mix(in srgb,var(--t-focus,var(--accent)) 30%,transparent);border-color:var(--t-focus,var(--accent))}
.gki-tg[aria-pressed="true"] .gki-sw::after{transform:translateX(14px);background:var(--t-focus,var(--accent))}
.gki-tg[aria-pressed="false"]{color:var(--t-dim,var(--dim))}
/* music the master Sound switch has silenced: still its own switch, dimmed */
.gki-tg.gki-held{opacity:.5}
@media (max-width:640px){.gki-toggles{top:12px;right:12px;gap:6px}.gki-tg{height:32px;padding:0 8px;gap:7px}}

/* ---- the entrance: everything but the scene waits; the name on its timer,
   then the menu, the shade (the tint), the switches and the credit together ---- */
.gk-title.gki-intro>.gk-shade,.gk-title.gki-intro h1>span,.gk-title.gki-intro .gk-sub,.gk-title.gki-intro .gk-menu,
.gk-title.gki-intro main>footer,.gk-title.gki-intro .gki-toggles,.gk-title.gki-intro h1 .gki-w{opacity:0}
.gk-title.gki-intro h1>span.gki-on{opacity:1;transition:opacity 1.4s ease-in-out}
.gk-title.gki-intro h1 .gki-w.gki-on{opacity:1;transition:opacity 1.4s ease-in-out}
.gk-title.gki-intro.gki-menu>.gk-shade,.gk-title.gki-intro.gki-menu .gk-sub,.gk-title.gki-intro.gki-menu .gk-menu,
.gk-title.gki-intro.gki-menu main>footer,.gk-title.gki-intro.gki-menu .gki-toggles{opacity:1;transition:opacity 1s ease-out}
.gk-title h1 .gki-w{display:inline;color:inherit}
/* the title fading up from the boot's ground */
.gk-title.gki-fade{animation:gki-in .6s ease-out both}
@media (prefers-reduced-motion:reduce){.gk-title.gki-fade{animation:none}}
`;

function injectIntroCSS() {
  if (!document.getElementById("gk-intro-css")) document.head.insertAdjacentHTML("beforeend", '<style id="gk-intro-css">' + INTRO_CSS + "</style>");
}

/* @gk-meow-begin -- the cat on the pulse: a recording, trimmed, levelled and
   encoded as MP3 by games-meta's tools/build-meow.sh, which rewrites this
   block. Empty, the boot sound falls back to the arcade's coin. */
const GK_MEOW = "";
/* @gk-meow-end */

/* the meow, decoded once per context; null when there is none or it will not decode */
const gkMeowCache = new WeakMap();
function gkMeowBuffer(ac) {
  if (!GK_MEOW || !ac) return Promise.resolve(null);
  if (!gkMeowCache.has(ac)) {
    const bin = atob(GK_MEOW.slice(GK_MEOW.indexOf(",") + 1)), bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    gkMeowCache.set(ac, new Promise(res => ac.decodeAudioData(bytes.buffer, res, () => res(null))).catch(() => null));
  }
  return gkMeowCache.get(ac);
}

/**
 * The default boot sound, timed to canon's boot: a hum as the face appears,
 * a sweep as it slides, the cat's meow on the pulse (greykit.com/arcade's coin
 * where there is no recording), and a glint of noise on the glint. A game
 * passes its own pitch, or a sound of its own instead.
 *   ac, out   the AudioContext and the node to play into
 *   root      the hum and sweep's note in Hz (default E4, 329.63)
 *   rate      the meow's playback rate: below 1 a bigger, lower cat, above 1 a
 *             kitten (default 1)
 *   meow      false plays the coin even with a recording
 *   gain      overall level (default 0.22)
 */
function gkBootSound(ac, out, { root = 329.63, rate = 1, meow = true, gain = 0.22 } = {}) {
  const t = ac.currentTime + 0.02, bus = ac.createGain();
  bus.gain.value = gain;
  bus.connect(out);
  const tone = (type, f, at, peak, rise, fall, f2) => {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, t + at);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + at + rise);
    g.gain.setValueAtTime(0.0001, t + at);
    g.gain.exponentialRampToValueAtTime(peak, t + at + rise);
    g.gain.exponentialRampToValueAtTime(0.0001, t + at + rise + fall);
    o.connect(g);
    g.connect(bus);
    o.start(t + at);
    o.stop(t + at + rise + fall + 0.05);
    return g;
  };
  /* the hum, as the face shows */
  tone("sine", root / 4, 0, 0.5, 0.45, 1.5);
  /* the sweep, as it slides (0.5s-1.1s), through a filter opening with it */
  const lp = ac.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.setValueAtTime(400, t + 0.5);
  lp.frequency.exponentialRampToValueAtTime(3200, t + 1.1);
  lp.connect(bus);
  const sw = ac.createOscillator(), sg = ac.createGain();
  sw.type = "triangle";
  sw.frequency.setValueAtTime(root / 2, t + 0.5);
  sw.frequency.exponentialRampToValueAtTime(root, t + 1.1);
  sg.gain.setValueAtTime(0.0001, t + 0.5);
  sg.gain.exponentialRampToValueAtTime(0.18, t + 0.8);
  sg.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
  sw.connect(sg);
  sg.connect(lp);
  sw.start(t + 0.5);
  sw.stop(t + 1.25);
  /* on the pulse (1.15s): the meow, if there is one and it has decoded by
     then -- else greykit.com/arcade's coin, the sound a game is launched
     with there (greykitweb arcade/index.html, TUNES.coin and blip): B5 then
     E6 on a square wave, each falling away, at the arcade's own level */
  const coin = () => {
    let at = t + 1.15;
    for (const [f, len] of [[988, 0.07], [1319, 0.24]]) {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = "square";
      o.frequency.value = f;
      g.gain.setValueAtTime(0.035 / gain, at);
      g.gain.exponentialRampToValueAtTime(0.0001, at + len);
      o.connect(g);
      g.connect(bus);
      o.start(at);
      o.stop(at + len + 0.02);
      at += len;
    }
  };
  if (!meow || !GK_MEOW) coin();
  else gkMeowBuffer(ac).then(buf => {
    if (!buf || ac.currentTime > t + 1.1) return coin();
    const s = ac.createBufferSource(), g = ac.createGain();
    s.buffer = buf;
    s.playbackRate.value = rate;
    /* the recording is levelled to -16 LUFS; this sits it over the hum */
    g.gain.value = 1 / gain * 0.9;
    s.connect(g);
    g.connect(bus);
    s.start(t + 1.15);
  });
  /* the glint (1.2s): a breath of high noise */
  const n = ac.createBufferSource(), buf = ac.createBuffer(1, ac.sampleRate * 0.3 | 0, ac.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  n.buffer = buf;
  const bp = ac.createBiquadFilter(), ng = ac.createGain();
  bp.type = "bandpass";
  bp.frequency.value = 7000;
  bp.Q.value = 1.5;
  ng.gain.setValueAtTime(0.0001, t + 1.2);
  ng.gain.exponentialRampToValueAtTime(0.12, t + 1.26);
  ng.gain.exponentialRampToValueAtTime(0.0001, t + 1.5);
  n.connect(bp);
  bp.connect(ng);
  ng.connect(bus);
  n.start(t + 1.2);
  n.stop(t + 1.55);
}

/**
 * The menu's tick: a dry click with a little pitch in it, for a row coming
 * under the pointer or the arrow keys. Short and quiet, so a run of them down
 * the menu reads as one gesture. It is an effect, not music: play it into the
 * game's effects, under the Sound switch, so it is what you hear with the
 * music off.
 *   ac, out   the AudioContext and the node to play into
 *   freq      the blip's pitch in Hz (default 2400)
 *   gain      level (default 0.12)
 */
function gkTick(ac, out, { freq = 2400, gain = 0.12 } = {}) {
  if (!ac || ac.state !== "running") return;
  const t = ac.currentTime, bus = ac.createGain();
  bus.gain.value = gain;
  bus.connect(out);
  /* the click: 12ms of noise through a bandpass, falling fast */
  const n = ac.createBufferSource(), buf = ac.createBuffer(1, ac.sampleRate * 0.015 | 0, ac.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
  n.buffer = buf;
  const bp = ac.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = freq * 1.6;
  bp.Q.value = 2;
  n.connect(bp);
  bp.connect(bus);
  n.start(t);
  /* the pitch: a 30ms sine blip under it */
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(freq, t);
  o.frequency.exponentialRampToValueAtTime(freq * 0.7, t + 0.03);
  g.gain.setValueAtTime(0.5, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
  o.connect(g);
  g.connect(bus);
  o.start(t);
  o.stop(t + 0.04);
}

/**
 * Ticks for a title's menu and switches: one when a row comes under the
 * pointer, and one when the keys move the focus to it. Not when the game
 * focuses a row itself (the default, as the menu lands), and not twice for
 * one row. Listens on the .gk-title, so a title mounted again needs it again.
 *   tick()   plays the tick -- the game's, into its effects
 */
function gkMenuTicks(title, tick) {
  let last = null;
  const rows = ".gk-menu button, .gki-tg";
  const hit = b => { if (b === last) return; last = b; try { tick(); } catch (e) { /* no sound */ } };
  title.addEventListener("pointerover", ev => {
    const b = ev.target.closest(rows);
    if (b && title.contains(b)) hit(b);
    else if (!b) last = null;
  });
  if (!gkMenuTicks.keys) { gkMenuTicks.keys = -1e9; window.addEventListener("keydown", () => { gkMenuTicks.keys = performance.now(); }, true); }
  title.addEventListener("focusin", ev => {
    const b = ev.target.closest(rows);
    if (b && performance.now() - gkMenuTicks.keys < 250) hit(b);
  });
}

/**
 * Whether this page may play sound now, without waiting for a press: after a
 * launcher's click (greykit.com/arcade goes to the game in the same tab), or on
 * a site the browser trusts. Firefox says so outright (getAutoplayPolicy);
 * elsewhere, a context the browser allows starts running within a moment of
 * resume(), and one it holds back does not start until the page is touched.
 * Resolves true or false within ms.
 *   ac   an AudioContext (the game's, or the intro's own)
 */
function gkSoundAllowed(ac, ms = 250) {
  return new Promise(resolve => {
    if (!ac) return resolve(false);
    try {
      if (navigator.getAutoplayPolicy) {
        const p = navigator.getAutoplayPolicy(ac);
        if (p === "allowed") return resolve(true);
        if (p === "disallowed") return resolve(false);
      }
    } catch (e) { /* not this browser's; ask the context */ }
    if (ac.state === "running") return resolve(true);
    let done = false;
    const end = ok => { if (!done) { done = true; resolve(ok); } };
    setTimeout(() => end(ac.state === "running"), ms);
    ac.resume().then(() => end(ac.state === "running"), () => end(false));
  });
}

/**
 * Start the integrated intro: canon's boot, and the boot sound with it.
 *   lines      the boot log's first lines, as runBoot takes them
 *   audio()    optional: the game's AudioContext, made or found. Its sound
 *              plays there, and the continue press resumes it. Left out, the
 *              intro keeps a small context of its own for the boot sound.
 *   bootSound  (ac, out) => void, the game's own; gkBootSound is the default,
 *              and false plays none
 * Returns { finish(opts), cancel() }. Mount the title under the boot while
 * it runs, then call finish() once the game is ready.
 */
function startIntro({ lines = [], audio = null, bootSound = gkBootSound } = {}) {
  injectIntroCSS();
  const t0 = performance.now();
  const boot = runBoot({ lines });
  const el = document.body.lastElementChild && document.body.lastElementChild.classList.contains("gk-boot") ? document.body.lastElementChild : null;
  /* the eyelid, shut away until the hold */
  const face = el && el.querySelector(".gk-lh .gk-pulse");
  if (face) face.insertAdjacentHTML("beforeend", '<div class="gki-lid"></div>');
  let ac = null;
  try { ac = audio ? audio() : null; } catch (e) { ac = null; }
  if (!ac && el && bootSound) {
    const AC = window.AudioContext || window.webkitAudioContext;
    try { ac = AC ? new AC() : null; } catch (e) { ac = null; }
  }
  /* may this page play sound already -- a launcher's click before it, or a
     site the browser trusts? The boot sound plays only then: a context the
     browser is holding back would play it later, late, over the title's music.
     The same answer lets finish() skip the hold. */
  const allowed = ac ? gkSoundAllowed(ac) : Promise.resolve(false);
  /* decode the meow now, so it is ready by the pulse */
  if (ac && bootSound === gkBootSound) gkMeowBuffer(ac);
  if (ac && el && bootSound) allowed.then(ok => { if (ok) try { bootSound(ac, ac.destination); } catch (e) { /* no sound */ } });

  /* the press that continues: any key but Escape and a lone modifier (the
     browser does not count those as a touch of the page), or any click.
     It resumes the audio there and then, inside the gesture, which some
     browsers insist on. */
  let pressed = false, onPress = null;
  const press = ev => {
    if (ev.type === "keydown" && (ev.key === "Escape" || ["Shift", "Control", "Alt", "Meta"].includes(ev.key))) return;
    if (ac && ac.state !== "running") ac.resume().catch(() => {});
    pressed = true;
    if (onPress) onPress();
  };
  window.addEventListener("keydown", press, true);
  window.addEventListener("pointerdown", press, true);
  const unhook = () => { window.removeEventListener("keydown", press, true); window.removeEventListener("pointerdown", press, true); };
  const say = html => {
    const log = el && el.querySelector(".gk-log");
    if (!log) return;
    const d = document.createElement("div");
    d.innerHTML = "&gt; " + html;
    log.appendChild(d);
  };

  return {
    /**
     * Finish the boot, hold for the press, and bring the title in.
     *   more        lines for the log now the game has loaded
     *   title       the mounted .gk-title (the page's, if left out)
     *   name        how the name arrives: "lines" (each line fades in on its
     *               turn), "words" (a word at a time), "decode" (canon's decode)
     *   timing      { name, step, menu, done } in ms after the title starts:
     *               the name's first line, the gap between lines or words, the
     *               menu, and the end of the fades
     *   prompt      the hold's words; "Click or press a key to continue", or
     *               "Tap to continue" on a touchscreen
     *   hold        "auto" (the default): hold only when the browser will not
     *               play sound yet -- coming from a launcher's click (the
     *               arcade), or on a site the browser already trusts, the boot
     *               goes straight into the title; "always": hold every time
     *   toggles     { sound: { get, set }, music: { get, set } } for the
     *               switches top right (gkToggles); left out, none
     *   tick        plays the menu's tick into the game's effects (gkTick is the
     *               sound to play); left out, the menu is silent
     *   onContinue  the press: resume the game's audio here (inside the gesture)
     *   onTitle     the title starts: start the title music here
     *   onDone      the menu is in and focused
     * Resolves when the menu is in, or the entrance was skipped.
     */
    async finish({ more = [], title = document.querySelector(".gk-title"), name = "lines", timing = {}, prompt = null, hold = "auto",
      toggles = null, tick = null, onContinue = () => {}, onTitle = () => {}, onDone = () => {} } = {}) {
      const T = Object.assign({ name: 600, step: 700, menu: 3000, done: 4200 }, timing);
      /* a touchscreen has no keys to press */
      if (!prompt) prompt = matchMedia("(hover: none) and (pointer: coarse)").matches ? "Tap to continue" : "Click or press a key to continue";
      const sw = title ? gkIntegrate(title, { toggles, tick }) : null;
      const focus = () => { const b = title && (title.querySelector(".gk-primary") || title.querySelector(".gk-menu button")); if (b) b.focus({ preventScroll: true }); };

      /* no boot (reduced motion, or a game that skipped it): the title at
         once, still; the music starts now if the page may play, else at the
         first touch of the page, and that touch still does what it was for */
      if (!el && !pressed && await allowed) pressed = true;
      if (!el) {
        unhook();
        const first = ev => {
          if (ev.type === "keydown" && (ev.key === "Escape" || ["Shift", "Control", "Alt", "Meta"].includes(ev.key))) return;
          window.removeEventListener("keydown", first, true);
          window.removeEventListener("pointerdown", first, true);
          if (ac && ac.state !== "running") ac.resume().catch(() => {});
          onContinue();
          onTitle();
        };
        if (pressed) { onContinue(); onTitle(); }
        else { window.addEventListener("keydown", first, true); window.addEventListener("pointerdown", first, true); }
        boot.cancel();
        focus();
        onDone();
        return { toggles: sw };
      }

      /* the title waits behind the boot, everything but its scene hidden */
      const later = title ? [...title.querySelectorAll(".gk-menu, footer, .gki-toggles")] : [];
      if (title) { title.classList.add("gki-intro"); for (const n of later) n.inert = true; }

      /* the rest of the log, then -- unless a press already came -- the hold */
      /* after the boot's own lines, as runBoot's finish would place them */
      const at = Math.max(150 + lines.length * 550, performance.now() - t0);
      for (const [i, l] of more.entries()) setTimeout(() => say(l), pressed ? 0 : Math.max(0, at + i * 300 - (performance.now() - t0)));
      /* never before the face has pulsed, nor before the log has had its say */
      const readyAt = Math.max(1850, at + more.length * 300 + 200);
      await new Promise(resolve => {
        if (pressed) return resolve();
        onPress = resolve;
        setTimeout(() => allowed.then(ok => {
          if (pressed) return;
          /* sound may already play, so the press would be for nothing: the
             boot ends as it always did, straight into the title */
          if (ok && hold !== "always") { onPress = null; return resolve(); }
          el.classList.add("gk-ready", "gki-hold");
          const p = document.createElement("div");
          p.className = "gki-prompt";
          p.textContent = prompt;
          el.appendChild(p);
        }), Math.max(0, readyAt - (performance.now() - t0)));
      });
      onPress = null;
      unhook();
      onContinue();

      /* the boot goes quickly -- the press was a skip to it, so it does not
         wait -- and the title fades up from under it */
      if (title) title.classList.add("gki-fade");
      /* a press while the boot fades is a skip of the entrance, not lost */
      let early = false;
      const earlyHit = ev => {
        if (ev.type === "keydown" && ["Shift", "Control", "Alt", "Meta"].includes(ev.key)) return;
        ev.preventDefault();
        ev.stopImmediatePropagation();
        early = true;
      };
      window.addEventListener("keydown", earlyHit, true);
      window.addEventListener("pointerdown", earlyHit, true);
      await boot.finish([]);
      window.removeEventListener("keydown", earlyHit, true);
      window.removeEventListener("pointerdown", earlyHit, true);
      onTitle();
      if (!title) { onDone(); return { toggles: sw }; }

      return new Promise(resolve => {
        const timers = [], ctl = new AbortController();
        const lines = [...title.querySelectorAll("h1 span[data-t]")];
        let steps = lines;
        if (name === "words") {
          steps = [];
          for (const l of lines) {
            l.innerHTML = l.dataset.t.split(" ").map(w => '<span class="gki-w">' + escHTML(w) + "</span>").join(" ");
            l.classList.add("gki-on");
            steps.push(...l.querySelectorAll(".gki-w"));
          }
        }
        steps.forEach((s, i) => timers.push(setTimeout(() => {
          s.classList.add("gki-on");
          if (name === "decode") decodeLine(s);
        }, T.name + i * T.step)));
        const end = () => {
          timers.forEach(clearTimeout);
          ctl.abort();
          for (const n of later) n.inert = false;
          focus();
          onDone();
          resolve({ toggles: sw });
        };
        timers.push(setTimeout(() => {
          title.classList.add("gki-menu", "gk-rise");
          end();
          setTimeout(() => title.classList.remove("gki-intro", "gki-menu", "gki-fade"), T.done - T.menu);
        }, T.menu));
        /* a key or a click during the entrance only ends it; it reaches nothing else */
        const skip = ev => {
          if (ev.type === "keydown" && ["Shift", "Control", "Alt", "Meta"].includes(ev.key)) return;
          ev.preventDefault();
          ev.stopImmediatePropagation();
          for (const l of lines) if (name !== "words") l.textContent = l.dataset.t;
          title.classList.remove("gki-intro", "gki-menu", "gki-fade");
          end();
        };
        window.addEventListener("keydown", skip, { capture: true, signal: ctl.signal });
        window.addEventListener("pointerdown", skip, { capture: true, signal: ctl.signal });
        if (early) skip({ type: "early", preventDefault() {}, stopImmediatePropagation() {} });
      });
    },
    cancel() { unhook(); boot.cancel(); }
  };
}

/* one line of the name decoding out of noise, by the clock, as canon's
   decodeTitle does the whole name */
function decodeLine(el) {
  const text = el.dataset.t, glyphs = "▚▞▖▗▘▝#/\\<>=+", t0 = performance.now(), ms = 700;
  const t = setInterval(() => {
    const p = (performance.now() - t0) / ms;
    if (!el.isConnected || p >= 1) { clearInterval(t); el.textContent = text; return; }
    const done = Math.floor(text.length * p);
    el.textContent = text.slice(0, done) + [...text.slice(done)].map(c => c === " " ? " " : glyphs[Math.random() * glyphs.length | 0]).join("");
  }, 28);
}

/**
 * The integrated title's layout, on a mounted .gk-title: the credit moved
 * under the menu, the switches top right, and the menu's ticks. finish()
 * calls it; a game that mounts its title again later (back from a game)
 * calls it again on the new one.
 *   toggles   { sound, music } as gkToggles takes them; left out, none
 *   tick()    the menu's tick, as gkMenuTicks takes it; left out, silent
 * Returns gkToggles' { refresh() }, or null with no toggles.
 */
function gkIntegrate(title, { toggles = null, tick = null } = {}) {
  title.classList.add("gki");
  const main = title.querySelector("main"), foot = title.querySelector(":scope > footer");
  if (main && foot) main.appendChild(foot);
  if (tick) gkMenuTicks(title, tick);
  return toggles ? gkToggles(title, toggles) : null;
}

/**
 * The Sound and Music switches, top right of a .gk-title. Each is a button
 * named for what it switches, pressed while that is on (STANDARD.md §8):
 * Sound is the master -- everything, music too, as M is -- and Music is the
 * music alone. A game with no music passes sound only.
 *   sound, music   { get() -> bool, set(on) }
 * Returns { refresh() }: call it when the game changes either another way
 * (M, Settings), so the switches show it.
 */
function gkToggles(title, { sound = null, music = null } = {}) {
  const ICON = {
    sound: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/></svg>',
    music: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/></svg>'
  };
  const wrap = document.createElement("div");
  wrap.className = "gki-toggles";
  const made = [];
  /* Music first, Sound -- the master -- in the corner */
  for (const [k, label, keyHint, ctl] of [["music", "Music", "", music], ["sound", "Sound", " (M)", sound]]) {
    if (!ctl) continue;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "gki-tg";
    b.setAttribute("aria-label", label);
    b.title = label + keyHint;
    b.innerHTML = ICON[k] + '<span class="gki-sw"></span>';
    b.addEventListener("click", ev => { ev.stopPropagation(); ctl.set(!ctl.get()); refresh(); });
    wrap.appendChild(b);
    made.push([b, k, ctl]);
  }
  const refresh = () => {
    for (const [b, k, ctl] of made) {
      b.setAttribute("aria-pressed", ctl.get() ? "true" : "false");
      if (k === "music") b.classList.toggle("gki-held", !!sound && !sound.get());
    }
  };
  refresh();
  title.appendChild(wrap);
  return { refresh };
}
/* @gk-intro-end */
