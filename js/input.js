/* The Puma Express -- keys, mouse and pads, turned into the engine's command
 * for the next step.
 *
 * In the cab, 1987's joystick: left and right move the paw from control to
 * control, up and down work the one it is on, Space or Enter uses it. Every
 * control also has a key of its own, and the mouse can click and drag them,
 * whatever the aids. At the guns, the station and the bridge, the arrows (or
 * W A S D, or the mouse) aim and Space fires. */
"use strict";
(() => {
  const I = PX.Input = { held: new Set(), pressed: new Set(), pad: new Set(), padPrev: new Set(), stick: null, cursor: 3, device: "keys",
    mouse: { x: 0, y: 0, in: false, down: false, pressed: false, movedAt: 0, drag: null }, view: null };
  const BIND = {
    ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
    KeyW: "w", KeyS: "s", KeyA: "a", KeyD: "d",
    Space: "act", Enter: "act", NumpadEnter: "act", KeyJ: "act", Numpad0: "act",
    KeyF: "door", KeyG: "shovel", KeyV: "valve", KeyH: "whistle", KeyZ: "brakeOff", KeyX: "brakeOn", KeyQ: "revBack", KeyE: "revFwd",
    Digit1: "front", Numpad1: "front", Digit2: "rear", Numpad2: "rear", Digit3: "cab", Numpad3: "cab", Digit4: "map", Numpad4: "map", Tab: "map", F7: "map",
    Escape: "pause", KeyP: "pause", F3: "pause", KeyL: "aids", F1: "abandon", ShiftLeft: "fast", ShiftRight: "fast",
  };
  I.BIND = BIND;
  I.actionFor = code => BIND[code] || null;

  I.down = ev => {
    const a = BIND[ev.code];
    if (!a) return false;
    I.device = "keys";
    if (!ev.repeat) I.pressed.add(a);
    I.held.add(a);
    return true;
  };
  I.up = ev => { const a = BIND[ev.code]; if (a) I.held.delete(a); };
  I.clear = () => { I.held.clear(); I.pad.clear(); I.pressed.clear(); I.stick = null; I.mouse.down = false; I.mouse.pressed = false; I.mouse.drag = null; };
  const on = a => I.held.has(a) || I.pad.has(a);
  const hit = a => I.pressed.has(a);

  /* the cab's cursor, moved by left and right */
  const ORDER = () => PX.Cab.ORDER;
  I.sel = () => ORDER()[I.cursor];

  /* the command for one step */
  I.cmd = (S, aids) => {
    const c = { aids };
    if (I.view) { c.view = I.view; I.view = null; }
    const m = I.mouse;
    const mouseAim = m.in && performance.now() - m.movedAt < 4000;
    let ax = 0, ay = 0;
    const aimKeys = S.phase !== "run" || S.view !== "cab";
    if (on("left") || (aimKeys && on("a"))) ax -= 1;
    if (on("right") || (aimKeys && on("d"))) ax += 1;
    if (on("up") || (aimKeys && on("w"))) ay -= 1;
    if (on("down") || (aimKeys && on("s"))) ay += 1;
    if (I.stick) { ax = Math.abs(I.stick.x) > 0.2 ? I.stick.x : 0; ay = Math.abs(I.stick.y) > 0.2 ? I.stick.y : 0; }
    const R = PX.Render;
    if (S.phase === "capture") {
      if (ax || ay) { c.ax = ax; c.ay = ay; }
      else if (mouseAim) c.aimAt = PX.Station.toScene(m.x, m.y);
      c.fire = on("act") || m.down;
      return c;
    }
    if (S.phase === "bridge") {
      if (ax || ay) { c.ax = ax; c.ay = ay; }
      else if (mouseAim) { const a = PX.BridgeArt.toAim(m.x, m.y); if (a) c.aimAt = a; }
      c.firePress = hit("act") || m.pressed;
      return c;
    }
    if (S.phase !== "run") return c;
    if (S.view !== "cab") {
      if (ax || ay) { c.ax = ax; c.ay = PX.clamp(ay, -1, 1); }
      else if (mouseAim) { const a = PX.Guns.toSight(m.x, m.y); if (a) c.aimAt = a; }
      c.fire = on("act") || m.down;
      return c;
    }
    /* the cab: the cursor */
    if (hit("left")) I.cursor = Math.max(0, I.cursor - 1);
    if (hit("right")) I.cursor = Math.min(ORDER().length - 1, I.cursor + 1);
    if (I.stick && !I.stickMoved && Math.abs(I.stick.x) > 0.6) { I.cursor = PX.clamp(I.cursor + Math.sign(I.stick.x), 0, ORDER().length - 1); I.stickMoved = true; }
    if (!I.stick || Math.abs(I.stick.x) < 0.3) I.stickMoved = false;
    const sel = I.sel(), up = on("up") || (I.stick && I.stick.y < -0.5), dn = on("down") || (I.stick && I.stick.y > 0.5);
    const upHit = hit("up") || hit("padUp"), dnHit = hit("down") || hit("padDown"), act = on("act"), actHit = hit("act");
    if (sel === "throttle") c.thr = up ? 1 : dn ? -1 : 0;
    if (sel === "brake") c.brk = up ? 1 : dn ? -1 : 0;
    if (sel === "reverser") { if (upHit) c.rev = 1; if (dnHit) c.rev = -1; }
    if (sel === "door" && (upHit || actHit)) c.door = true;
    if (sel === "shovel" && (up || act)) c.shovel = true;
    if (sel === "valve" && (up || act)) c.valve = true;
    if (sel === "whistle" && (upHit || actHit)) c.whistle = true;
    /* the controls' own keys, and the mouse */
    {
      if (on("w")) c.thr = 1; if (on("s")) c.thr = -1;
      if (on("brakeOn")) c.brk = 1; if (on("brakeOff")) c.brk = -1;
      if (hit("revFwd")) c.rev = 1; if (hit("revBack")) c.rev = -1;
      if (hit("door")) c.door = true;
      if (on("shovel")) c.shovel = true;
      if (on("valve")) c.valve = true;
      if (hit("whistle")) c.whistle = true;
      /* the mouse: a click picks a control and works it; the levers drag */
      if (m.pressed) {
        const k = PX.Cab.hit(m.x, m.y);
        if (k) {
          I.cursor = ORDER().indexOf(k); m.drag = k;
          if (k === "door") c.door = true;
          if (k === "whistle") c.whistle = true;
          if (k === "reverser") { const r = PX.Cab.last.ctl.reverser; c.rev = m.x > r.cx ? 1 : -1; }
        }
      }
      if (m.down && m.drag) {
        const r = PX.Cab.last && PX.Cab.last.ctl[m.drag];
        if (r && m.drag === "throttle") c.set = { thr: PX.clamp((m.x - r.x) / r.w, 0, 1) };
        if (r && m.drag === "brake") c.set = { brk: PX.clamp((m.y - r.y) / r.h, 0, 1) };
        if (m.drag === "shovel") c.shovel = true;
        if (m.drag === "valve") c.valve = true;
      }
      if (!m.down) m.drag = null;
    }
    if (on("whistleBtn")) c.whistle = c.whistle || hit("whistleBtn");
    return c;
  };
  I.endTick = () => { I.pressed.clear(); I.mouse.pressed = false; };

  /* ---- the mouse, over the play screen ---- */
  I.bindMouse = cv => {
    const at = ev => { const r = cv.getBoundingClientRect(); I.mouse.x = (ev.clientX - r.left) / r.width * cv.width; I.mouse.y = (ev.clientY - r.top) / r.height * cv.height; };
    cv.addEventListener("pointermove", ev => { at(ev); I.mouse.in = true; I.mouse.movedAt = performance.now(); });
    cv.addEventListener("pointerleave", () => { I.mouse.in = false; });
    cv.addEventListener("pointerdown", ev => { if (ev.button !== 0) return; at(ev); I.mouse.in = true; I.mouse.movedAt = performance.now(); I.mouse.down = true; I.mouse.pressed = true; I.device = "mouse"; try { cv.setPointerCapture(ev.pointerId); } catch (e) { /* fine */ } });
    addEventListener("pointerup", () => { I.mouse.down = false; });
  };

  /* ---- gamepads: the stick or the pad aims and moves the paw; A uses or fires; B whistles; bumpers change the view ---- */
  I.pollPad = () => {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const now = new Set();
    let sx = 0, sy = 0;
    for (const p of pads) {
      if (!p) continue;
      const b = i => p.buttons[i] && p.buttons[i].pressed;
      sx = p.axes[0] || 0; sy = p.axes[1] || 0;
      if (b(14)) now.add("left"); if (b(15)) now.add("right"); if (b(12)) now.add("up"); if (b(13)) now.add("down");
      if (b(0) || b(7)) now.add("act");
      if (b(1)) now.add("whistleBtn");
      if (b(2)) now.add("shovel");
      if (b(3)) now.add("door");
      if (b(4)) now.add("viewPrev"); if (b(5)) now.add("viewNext");
      if (b(6)) now.add("fast");
      if (b(8)) now.add("map");
      if (b(9)) now.add("pause");
    }
    I.stick = Math.hypot(sx, sy) > 0.25 ? { x: sx, y: sy } : null;
    const fresh = [...now].filter(a => !I.padPrev.has(a));
    for (const a of fresh) { I.device = "pad"; I.pressed.add(a); }
    if (I.stick) { I.device = "pad"; if (!I.padStickPrev || I.padStickPrev.y > -0.5) { if (sy < -0.5) I.pressed.add("padUp"); } if (!I.padStickPrev || I.padStickPrev.y < 0.5) { if (sy > 0.5) I.pressed.add("padDown"); } }
    I.padStickPrev = I.stick;
    I.padPrev = now;
    I.pad = now;
    return fresh;
  };
})();
