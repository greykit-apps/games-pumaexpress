// The README's screenshots and the share card, drawn by the game itself in headless Chrome.
//
//   python3 -m http.server 8766 --bind 127.0.0.1     (from the repo root, in another terminal)
//   node tools/shots.mjs                              (all of them)
//   node tools/shots.mjs title og                     (just these)
//
// Each picture is a fresh Chrome profile (no saved night, so no Resume row) at 1280 x 720, the play
// screen at twice its pixels, opened on one of the page's debug links (DEVELOPMENT.md) and left to run
// a few seconds so the smoke has streamed back. The share card is tools/og.html at 1200 x 630. Chrome
// is driven over its DevTools protocol, because --screenshot captures before an animated page settles.
// Not deployed.
import { spawn } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = process.env.SHOTS_BASE || "http://127.0.0.1:8766/";
const CHROME = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
/* what to shoot, how long to let it run, and what must be true of the page before it is a picture of the game */
const ON_TITLE = "!!(window.PX && PX.game.mode === 'title' && document.querySelector('#title .gk-menu'))";
const PLAYING = "!!(window.PX && PX.game.mode === 'play')";
const SHOTS = {
  title: ["screenshots/title.png", "?shot=1", 10000, ON_TITLE],
  cab: ["screenshots/cab.png", "?play=1&seed=1&skip=1&view=cab&t=1402&v=35", 8000, PLAYING],
  station: ["screenshots/station.png", "?play=1&practice=station", 7000, PLAYING],
  bridge: ["screenshots/bridge.png", "?play=1&practice=bridge", 7000, PLAYING],
  og: ["og.png", "tools/og.html", 8000, "!!window.ogReady", 1200, 630],
};
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function shoot(out, path, wait, ready, w = 1280, h = 720) {
  const prof = mkdtempSync(join(tmpdir(), "pe-shots-")), port = 9300 + Math.floor(Math.random() * 500);
  const chrome = spawn(CHROME, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--mute-audio", `--user-data-dir=${prof}`,
    `--remote-debugging-port=${port}`, `--window-size=${w},${h}`, "--force-device-scale-factor=1", "about:blank"], { stdio: "ignore" });
  try {
    let targets;
    for (let i = 0; i < 50 && !targets; i++) { try { targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); } catch { await sleep(200); } }
    const ws = new WebSocket(targets.find(t => t.type === "page").webSocketDebuggerUrl);
    await new Promise(r => ws.addEventListener("open", r));
    let id = 0; const pending = new Map(), errors = [];
    ws.addEventListener("message", e => {
      const m = JSON.parse(e.data);
      if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
      if (m.method === "Runtime.exceptionThrown") errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
    });
    const send = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
    await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: false });
    await send("Emulation.setFocusEmulationEnabled", { enabled: true });
    await send("Page.enable"); await send("Runtime.enable");
    await send("Page.navigate", { url: BASE + path });
    await sleep(wait);
    /* a picture of a page that threw, or that never got going, is not a picture of the game */
    if (errors.length) throw new Error(`${path}: the page threw: ${errors[0]}`);
    const ok = await send("Runtime.evaluate", { expression: ready, returnByValue: true });
    if (!(ok.result && ok.result.result && ok.result.result.value)) throw new Error(`${path}: not ready after ${wait} ms`);
    const shot = await send("Page.captureScreenshot", { format: "png" });
    writeFileSync(join(ROOT, out), Buffer.from(shot.result.data, "base64"));
    console.log("wrote", out);
  } finally { chrome.kill("SIGKILL"); rmSync(prof, { recursive: true, force: true }); }
}

const want = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(SHOTS);
for (const k of want) {
  if (!SHOTS[k]) { console.error(`unknown shot ${k}; one of ${Object.keys(SHOTS).join(", ")}`); process.exit(1); }
  /* one at a time, and again if a load stalls: the dev server now and then drops a script */
  for (let tries = 1; ; tries++) {
    try { await shoot(...SHOTS[k]); break; }
    catch (e) { if (tries >= 3) { console.error(e.message); process.exit(1); } console.error(`${e.message}; again`); }
  }
}
