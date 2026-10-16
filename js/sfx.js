/* The Puma Express -- sound, all of it synthesised: no audio files.
 *
 * The engine talks the whole night: a chuff at every beat of the cylinders,
 * quick when she runs and slow when she starts; the rail joints clacking
 * under the wagons; the fire's roar when the door is open; the safety valves'
 * roar when they blow; the whistle, a three-note steam chord. Fighters drone
 * and dive, the guns hammer, the cannon thumps, the river throws up water.
 * On the title, a tune of our own (the 1987 game's was Paul Butler's): an
 * accordion over a walking bass and the train's own rhythm, in D minor. */
"use strict";
(() => {
  const A = PX.SFX = { ctx: null, muted: false, out: null, loops: {}, tune: null };
  let noiseBuf = null;

  A.unlock = () => {
    if (A.ctx) { if (A.ctx.state === "suspended") A.ctx.resume(); return; }
    try { const Ctx = globalThis.AudioContext || globalThis.webkitAudioContext; A.ctx = new Ctx(); } catch (e) { A.ctx = null; return; }
    const a = A.ctx;
    A.out = a.createGain(); A.out.gain.value = A.muted ? 0 : 0.5; A.out.connect(a.destination);
    A.comp = a.createDynamicsCompressor(); A.comp.threshold.value = -16; A.comp.ratio.value = 4; A.comp.connect(A.out);
    noiseBuf = a.createBuffer(1, a.sampleRate * 2, a.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  };
  A.setMuted = m => { A.muted = m; if (A.out) A.out.gain.value = m ? 0 : 0.5; if (m) { A.stopTune(); for (const k of Object.keys(A.loops)) A.loop(k, 0); } };

  function tone(f0, f1, ms, type, vol, dest, at = 0) {
    const a = A.ctx, o = a.createOscillator(), g = a.createGain(), t = a.currentTime + 0.005 + at;
    o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + ms / 1000);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0008, t + ms / 1000);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + ms / 1000 + 0.02);
  }
  function hiss(ms, vol, freq, dest, q = 0.8, at = 0, type = "lowpass", f1 = null, attack = 0) {
    const a = A.ctx, s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(), t = a.currentTime + 0.005 + at;
    s.buffer = noiseBuf; f.type = type; f.frequency.setValueAtTime(freq, t); if (f1) f.frequency.exponentialRampToValueAtTime(f1, t + ms / 1000); f.Q.value = q;
    if (attack) { g.gain.setValueAtTime(0.0008, t); g.gain.exponentialRampToValueAtTime(vol, t + attack); } else g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0008, t + ms / 1000);
    s.connect(f); f.connect(g); g.connect(dest); s.start(t, Math.random()); s.stop(t + ms / 1000 + 0.02);
  }
  /* the steam whistle: three partials, a breath of steam, a slight rise as it opens */
  function whistle(d, ms = 420, vol = 0.07) {
    const a = A.ctx, t = a.currentTime + 0.005;
    for (const f of [466, 587, 698]) {
      const o = a.createOscillator(), g = a.createGain();
      o.type = "triangle"; o.frequency.setValueAtTime(f * 0.94, t); o.frequency.linearRampToValueAtTime(f, t + 0.06);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.04); g.gain.setValueAtTime(vol, t + ms / 1000 - 0.08); g.gain.linearRampToValueAtTime(0, t + ms / 1000);
      o.connect(g); g.connect(d); o.start(t); o.stop(t + ms / 1000 + 0.02);
    }
    hiss(ms, 0.05, 2400, d, 1.2, 0, "bandpass", null, 0.03);
  }

  const SOUNDS = {
    chuff: d => { hiss(150, 0.42, 520, d, 0.7, 0, "lowpass", 160); hiss(90, 0.16, 2600, d, 0.6, 0, "bandpass"); },
    chuffSoft: d => { hiss(120, 0.14, 420, d, 0.7, 0, "lowpass", 140); },
    clack: d => { tone(1900, 1500, 18, "square", 0.025, d); tone(1700, 1300, 18, "square", 0.02, d, 0.06); hiss(25, 0.08, 3800, d, 1.5, 0, "bandpass"); },
    whistle: d => whistle(d),
    shovel: d => { hiss(160, 0.22, 1400, d, 1.1, 0, "bandpass", 700); hiss(220, 0.25, 260, d, 0.6, 0.16, "lowpass", 90); },
    door: d => { tone(220, 160, 90, "square", 0.05, d); hiss(60, 0.18, 1800, d, 1.4, 0, "bandpass"); },
    lever: d => { tone(330, 260, 60, "square", 0.05, d); tone(180, 140, 80, "square", 0.04, d, 0.04); },
    clunk: d => { tone(120, 70, 140, "sine", 0.3, d); hiss(80, 0.2, 900, d, 1, 0, "bandpass"); },
    points: d => { tone(900, 700, 40, "square", 0.04, d); tone(240, 160, 120, "sine", 0.25, d, 0.04); },
    gun: d => { hiss(45, 0.3, 2600, d, 0.7, 0, "bandpass"); tone(150, 80, 35, "square", 0.06, d); },
    smg: d => { hiss(40, 0.26, 3000, d, 0.8, 0, "bandpass"); tone(220, 110, 30, "square", 0.04, d); },
    rifle: d => { hiss(160, 0.32, 2200, d, 0.6, 0, "bandpass", 600); tone(300, 90, 70, "square", 0.05, d); },
    ricochet: d => { tone(2400, 900, 220, "sine", 0.04, d); },
    strafe: d => { for (let i = 0; i < 4; i++) hiss(40, 0.18, 1800, d, 0.8, i * 0.06, "bandpass"); },
    hit: d => { tone(1300, 600, 110, "square", 0.07, d); hiss(140, 0.35, 2400, d, 1, 0, "bandpass"); tone(160, 80, 200, "sine", 0.25, d, 0.02); },
    wolfDown: d => { tone(320, 180, 160, "square", 0.04, d); },
    boom: d => { hiss(1100, 0.9, 420, d, 0.5, 0, "lowpass", 90); tone(80, 28, 700, "sine", 0.6, d); hiss(300, 0.35, 2600, d, 0.4, 0.02); },
    bigBoom: d => { hiss(2200, 1, 360, d, 0.5, 0, "lowpass", 60); tone(60, 22, 1500, "sine", 0.7, d); for (let i = 1; i < 4; i++) hiss(700, 0.4, 500, d, 0.5, i * 0.18, "lowpass", 100); },
    cannon: d => { tone(70, 30, 600, "sine", 0.8, d); hiss(900, 0.7, 700, d, 0.5, 0, "lowpass", 80); hiss(120, 0.4, 3000, d, 0.5); },
    whizz: d => { tone(1400, 500, 700, "sine", 0.04, d); },
    splash: d => { hiss(600, 0.45, 1600, d, 0.6, 0, "bandpass", 400); hiss(1000, 0.18, 3000, d, 0.5, 0.12, "highpass"); },
    boatGun: d => { tone(110, 50, 260, "sine", 0.32, d); hiss(200, 0.25, 900, d); },
    dive: d => { tone(900, 260, 1600, "sawtooth", 0.035, d); hiss(1600, 0.12, 1200, d, 0.8, 0, "bandpass", 500); },
    warn: d => { for (let i = 0; i < 3; i++) tone(1200, 1200, 70, "square", 0.05, d, i * 0.14); },
    alarm: d => { for (let i = 0; i < 4; i++) { tone(700, 700, 120, "square", 0.05, d, i * 0.3); tone(520, 520, 120, "square", 0.05, d, i * 0.3 + 0.15); } },
    good: d => { [523, 659, 784].forEach((f, i) => tone(f, f, 120, "square", 0.05, d, i * 0.1)); },
    captured: d => { [392, 523, 659, 784].forEach((f, i) => tone(f, f, 140, "square", 0.06, d, i * 0.11)); },
    won: d => { whistle(d, 900, 0.08); [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, f, i === 6 ? 600 : 150, "square", 0.06, d, 0.9 + i * 0.14)); },
    over: d => { [392, 349, 330, 262].forEach((f, i) => tone(f, f, 280, "square", 0.07, d, i * 0.26)); },
    burst: d => { SOUNDS.bigBoom(d); hiss(2600, 0.6, 3000, d, 0.4, 0.1, "highpass"); },
    menu: d => tone(900, 900, 18, "square", 0.04, d),
    tick: d => tone(1600, 1600, 14, "square", 0.03, d),
    telegraph: d => { const dot = [0, 0.1, 0.2, 0.42, 0.52, 0.62]; dot.forEach((t, i) => tone(820, 820, i % 3 === 2 ? 90 : 45, "sine", 0.06, d, t)); },
  };

  /* name; vol 0..1 */
  A.play = (name, vol = 1) => {
    if (A.muted || !A.ctx || !SOUNDS[name] || vol <= 0.01) return;
    const g = A.ctx.createGain(); g.gain.value = vol; g.connect(A.comp);
    SOUNDS[name](g);
    setTimeout(() => g.disconnect(), 3500);
  };

  /* what keeps sounding: the fire, the valves, a fighter's engine, the wind at the guns */
  A.loop = (name, level, pitch = 1) => {
    if (!A.ctx) return;
    let Lp = A.loops[name];
    if (!Lp) {
      if (level <= 0 || A.muted) return;
      const a = A.ctx, g = a.createGain();
      g.gain.value = 0; g.connect(A.comp);
      const s = a.createBufferSource(), f = a.createBiquadFilter();
      s.buffer = noiseBuf; s.loop = true; s.connect(f); f.connect(g);
      if (name === "fire") { f.type = "lowpass"; f.frequency.value = 300; f.Q.value = 0.6; Lp = { g, set: p => f.frequency.setTargetAtTime(220 + p * 260, a.currentTime, 0.2), stop: () => s.stop() }; s.start(); }
      else if (name === "valve") { f.type = "highpass"; f.frequency.value = 2400; Lp = { g, set: () => {}, stop: () => s.stop() }; s.start(); }
      else if (name === "wind") { f.type = "bandpass"; f.frequency.value = 500; f.Q.value = 0.5; Lp = { g, set: p => f.frequency.setTargetAtTime(300 + p * 700, a.currentTime, 0.3), stop: () => s.stop() }; s.start(); }
      else {
        /* a fighter: a propeller's buzz over a roar */
        const o = a.createOscillator(), og = a.createGain();
        f.type = "bandpass"; f.frequency.value = 800; f.Q.value = 0.7; o.type = "sawtooth"; o.frequency.value = 110; og.gain.value = 0.05;
        o.connect(og); og.connect(g); s.start(); o.start();
        Lp = { g, set: p => { o.frequency.setTargetAtTime(80 + p * 80, a.currentTime, 0.1); f.frequency.setTargetAtTime(500 + p * 900, a.currentTime, 0.1); }, stop: () => { s.stop(); o.stop(); } };
      }
      A.loops[name] = Lp;
    }
    Lp.set(pitch);
    const v = A.muted ? 0 : Math.max(0, Math.min(1, level)) * ({ fire: 0.35, valve: 0.22, wind: 0.18, plane: 0.3 }[name] || 0.3);
    Lp.g.gain.setTargetAtTime(v, A.ctx.currentTime, 0.1);
  };
  A.stopLoops = () => { for (const [k, Lp] of Object.entries(A.loops)) { try { Lp.stop(); } catch (e) { /* already */ } delete A.loops[k]; } };

  /* ---- the title tune: ours. D minor at 104: an accordion with its tremolo,
   * an oom-pah of bass and chord, the train's rhythm on brushes; it opens and
   * closes on the whistle. Lengths are sixteenths. ---- */
  const NOTE = n => { const m = /^([A-G])(b|#)?(\d)$/.exec(n); const k = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]] + (m[2] === "b" ? -1 : m[2] === "#" ? 1 : 0); return 440 * Math.pow(2, (k + (+m[3] + 1) * 12 - 69) / 12); };
  const parse = s => s.split(/\s+/).filter(x => x && x !== "|").map(t => { const [n, l] = t.split(":"); return [n === "r" ? 0 : NOTE(n), parseInt(l, 10)]; });
  const LEAD = parse(`r:16 |
    D5:4 F5:4 A5:6 G5:2 | F5:4 E5:4 D5:8 | D5:4 F5:4 Bb5:6 A5:2 | G5:4 F5:4 E5:8 |
    G5:4 Bb5:4 D6:6 C6:2 | Bb5:4 A5:4 F5:8 | E5:4 F5:4 G5:4 A5:4 | A5:12 r:4 |
    D6:4 C6:4 A5:6 F5:2 | A5:4 G5:4 F5:8 | E5:4 G5:4 C6:6 Bb5:2 | A5:4 G5:4 D5:8 |
    D5:4 F5:4 Bb5:4 D6:4 | C#6:8 A5:8 | D6:6 A5:2 F5:4 E5:4 | D5:16`);
  /* the harmony, a bar at a time: bass root, bass fifth, and the chord's notes */
  const HARM = [["D2", "A2", "D4 F4 A4"], ["D2", "A2", "D4 F4 A4"], ["D2", "A2", "D4 F4 A4"], ["Bb1", "F2", "D4 F4 Bb4"], ["A1", "E2", "C#4 E4 A4"],
    ["G1", "D2", "D4 G4 Bb4"], ["D2", "A2", "D4 F4 A4"], ["A1", "E2", "C#4 E4 G4"], ["A1", "E2", "C#4 E4 A4"],
    ["D2", "A2", "D4 F4 A4"], ["F1", "C2", "C4 F4 A4"], ["C2", "G2", "C4 E4 G4"], ["G1", "D2", "D4 G4 Bb4"],
    ["Bb1", "F2", "D4 F4 Bb4"], ["A1", "E2", "C#4 E4 A4"], ["D2", "A2", "D4 F4 A4"], ["D2", "A2", "D4 F4 A4"]];
  const STEP = 60 / 104 / 4, BARS = HARM.length, N = BARS * 16;
  const EV = Array.from({ length: N }, () => []);
  { let t = 0; for (const [f, l] of LEAD) { if (f && t < N) EV[t].push(["l", f, l]); t += l; } }
  HARM.forEach(([r, fv, ch], b) => {
    const at = b * 16;
    if (b === 0) { EV[0].push(["w"]); }
    EV[at].push(["b", NOTE(r), 3]); EV[at + 8].push(["b", NOTE(fv), 3]);
    const cn = ch.split(" ").map(NOTE);
    EV[at + 4].push(["c", cn, 3]); EV[at + 12].push(["c", cn, 3]);
    /* the train on the brushes: chuff-a chuff-a, the accent on the beat */
    for (let i = 0; i < 16; i += 2) EV[at + i].push(["k", i % 4 === 0 ? 1 : 0.55]);
  });
  EV[N - 16].push(["w"]);

  A.startTune = () => {
    if (A.muted || !A.ctx || A.tune) return;
    const a = A.ctx, g = a.createGain();
    g.gain.value = 0.5; g.connect(A.comp);
    const room = a.createDelay(1), fb = a.createGain(), wet = a.createGain();
    room.delayTime.value = STEP * 3; fb.gain.value = 0.22; wet.gain.value = 0.18;
    room.connect(fb); fb.connect(room); room.connect(wet); wet.connect(g);
    /* the accordion: two reeds a hair apart, a fast tremolo */
    const reed = (f, at, dur, vol) => {
      const e = a.createGain(), lp = a.createBiquadFilter(), trem = a.createOscillator(), tg = a.createGain(), end = at + dur - 0.02;
      lp.type = "lowpass"; lp.frequency.value = 2600;
      trem.frequency.value = 6.2; tg.gain.value = vol * 0.18; trem.connect(tg); tg.connect(e.gain);
      e.gain.setValueAtTime(0, at); e.gain.linearRampToValueAtTime(vol, at + 0.03); e.gain.setValueAtTime(vol, end - 0.04); e.gain.linearRampToValueAtTime(0, end);
      for (const [type, det] of [["square", -6], ["sawtooth", 6]]) { const o = a.createOscillator(); o.type = type; o.frequency.value = f; o.detune.value = det; o.connect(lp); o.start(at); o.stop(end + 0.02); }
      lp.connect(e); e.connect(g); e.connect(room); trem.start(at); trem.stop(end + 0.02);
    };
    const bass = (f, at, dur) => { const o = a.createOscillator(), e = a.createGain(), lp = a.createBiquadFilter(); o.type = "triangle"; o.frequency.value = f; lp.type = "lowpass"; lp.frequency.value = 500; e.gain.setValueAtTime(0, at); e.gain.linearRampToValueAtTime(0.45, at + 0.01); e.gain.exponentialRampToValueAtTime(0.01, at + dur); o.connect(lp); lp.connect(e); e.connect(g); o.start(at); o.stop(at + dur + 0.02); };
    const brush = (at, v) => { const s = a.createBufferSource(), f = a.createBiquadFilter(), e = a.createGain(); s.buffer = noiseBuf; f.type = "bandpass"; f.frequency.value = 2800; f.Q.value = 0.6; e.gain.setValueAtTime(0.0008, at); e.gain.exponentialRampToValueAtTime(0.12 * v, at + 0.02); e.gain.exponentialRampToValueAtTime(0.001, at + 0.13); s.connect(f); f.connect(e); e.connect(g); s.start(at, Math.random()); s.stop(at + 0.16); };
    const steam = at => { for (const f of [466, 587, 698]) { const o = a.createOscillator(), e = a.createGain(); o.type = "triangle"; o.frequency.setValueAtTime(f * 0.95, at); o.frequency.linearRampToValueAtTime(f, at + 0.1); e.gain.setValueAtTime(0, at); e.gain.linearRampToValueAtTime(0.05, at + 0.08); e.gain.setValueAtTime(0.05, at + 0.9); e.gain.linearRampToValueAtTime(0, at + 1.1); o.connect(e); e.connect(g); e.connect(room); o.start(at); o.stop(at + 1.15); } };
    const st = { g, fb, t0: a.currentTime + 0.1, n: 0, timer: null };
    const sched = () => {
      const late = a.currentTime + 0.02 - st.t0;
      if (st.n * STEP < late) st.n = Math.ceil(late / STEP);
      for (let at; (at = st.t0 + st.n * STEP) < a.currentTime + 1.5; st.n++) {
        for (const e of EV[st.n % N]) {
          if (e[0] === "l") reed(e[1], at, e[2] * STEP, 0.07);
          else if (e[0] === "b") bass(e[1], at, e[2] * STEP);
          else if (e[0] === "c") for (const f of e[1]) reed(f, at, e[2] * STEP, 0.022);
          else if (e[0] === "k") brush(at, e[1]);
          else if (e[0] === "w") steam(at);
        }
      }
    };
    sched();
    st.timer = setInterval(sched, 250);
    A.tune = st;
  };
  A.stopTune = () => {
    if (!A.tune) return;
    clearInterval(A.tune.timer);
    const { g, fb } = A.tune;
    g.gain.setTargetAtTime(0, A.ctx.currentTime, 0.15);
    setTimeout(() => { g.disconnect(); fb.disconnect(); }, 1800);
    A.tune = null;
  };
})();
