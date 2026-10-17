# Working on The Puma Express

Plain scripts, no build step and no dependencies at play time. The page loads its scripts in order from `index.html`, and everything the player sees is drawn and synthesised in the page. The tools in `tools/` need Node (CI uses Node 20).

Serve the repo over http while working on it, so the tools and the share card behave as they do online:

```bash
python3 -m http.server 8000
```

What the game is meant to be is in [PRODUCT.md](PRODUCT.md), and how it looks in [DESIGN.md](DESIGN.md).

## What's in here

| | |
|---|---|
| `index.html` | the page: the play canvas, the HUD's host, the title, the note for small screens |
| `css/gk-tokens.css` | the Tactical palette, byte for byte from games-meta `canon/` (STANDARD.md §4) |
| `css/pumaexpress.css` | the page, the HUD (flat dark panels over the scene), and the screens with words on them (dim lamplit paper and brass) |
| `fonts/` | Barlow Semi Condensed and Pixelify Sans (SIL Open Font License; the licences are beside them) |
| `js/gk-title.js` | the greykit.games boot and default title, `@gk-title` v0.4 taken whole from games-meta `canon/` (§3); `js/main.js` gives it the menu and the train behind it, and `css/pumaexpress.css` its green and brass |
| `js/util.js`, `js/engine/*.js` | the game itself, with no DOM in it and no clock or `Math.random`: every number (`const.js`), the line (`route.js`), the engine and its fire (`loco.js`), the three fights (`fights.js`), the night step by step (`world.js`) |
| `js/engine/bot.js` | a driver who never tires: runs the train behind the title, and drives every night in the tests |
| `js/art/kit.js` | what every picture shares: the canvas size, the material ramps, the dither, the night light, the pixel faces |
| `js/art/model.js`, `js/art/train.js` | the train built once in 3D and traced into pixels; the train side on |
| `js/art/cab.js`, `js/art/world.js` | the cab from the driver's side, and the country going by through its window and over the guns |
| `js/art/station.js`, `js/art/bridge.js`, `js/art/air.js` | the three fights: a held station, a guarded bridge, the guns and the fighters |
| `js/art/mapart.js` | the map, a driver's working map in dark paper and pale ink |
| `js/art/ending.js` | the end of the night: the train standing at Port Clair, or where the night was lost; and the forty-eight paintings, each drawn, each titled |
| `js/art/people.js`, `js/art/people2.js`, `js/art/fx.js` | Duc, the wolves and your paws; smoke, sparks, tracer and fire |
| `js/art/title.js` | the title's picture: the train running west across the night, the town on the crest, the river, the viaduct, her smoke |
| `js/render.js`, `js/hud.js` | which scene is showing, and the panels over it |
| `js/sfx.js` | Web Audio: the engine, the whistle, the guns, the title tune |
| `js/store.js`, `js/input.js`, `js/screens.js`, `js/main.js` | saves and the aids, controls, the sheets, and the loop |
| `tools/lib.js` | loads the engine headless, with no document, canvas or sound, for `sim-check.js` |
| `tools/sim-check.js` | the line sound, the bot bringing the train in, a replay matching step for step (`--seeds N`, `--verbose`) |
| `tools/stamp-assets.js` | stamps each script and stylesheet URL in `index.html` with its content hash (`--check` only reports) |
| `tools/check-assets.js` | every file the page and the manifest name exists (games-meta STANDARD.md §10) |
| `tools/make-icons.js` | `icon.svg`, the favicons and the home-screen icon (also the GitLab avatar), from one 40×40 drawing of the engine |
| `tools/og.html` | the share card, `og.png`, drawn from the title's own picture |
| `screenshots/` | the pictures in the README, at twice the 640×360 play screen |
| `tools/shots.mjs` | draws `screenshots/` and `og.png` in headless Chrome from a local server; run it after anything they show changes (instructions inside) |

## Before you commit

Run what CI runs:

```bash
node tools/check-assets.js
for f in js/*.js js/engine/*.js js/art/*.js tools/*.js; do node --check "$f"; done
node tools/sim-check.js --seeds 2
node tools/stamp-assets.js
```

`stamp-assets.js` rewrites `index.html` with fresh hashes. CI runs it with `--check` and fails on a stale stamp. greykit.com sits behind Cloudflare, which keeps scripts and stylesheets for 30 days, so an unstamped change would not reach players.

## Testing a scene directly

The page takes a query string that skips the boot and the title and drops into a night:

```
index.html?play=<0-2>&seed=<n>
```

- `skip=1` skips the fight for the yards at Velmont and leaves the train under way.
- `practice=station`, `practice=air` or `practice=bridge` opens one fight on its own.
- `view=cab`, `front`, `rear` or `map` picks the view; `v=<mph>` sets her running; `t=<minutes on from the midnight before the night>` sets the clock (22:30 is 1350, first light 1770, dawn 1920); `raid=1` brings fighters at once.
- `pause=1` opens on the pause menu.
- `end=won`, `dawn`, `burst`, `boiler`, `motion`, `cut`, `derail`, `buffer` or `frontier` ends the night at once, to see its scene and the end sheet beside it (pair `dawn` with `t=1925` for its daylight).

Without `play`, `sheet=<name>` opens a title sheet after the boot (`help`, `settings`, `about`, `scores`), and `shot=1` reveals the title without its print-in.

## Deploy

Merge requests run the `validate` job only. On `main`, `deploy` follows it and rsyncs the repo to `greykit.com/games/pumaexpress/` on DreamHost, leaving out `.git`, `.claude`, `.gitlab-ci.yml` and `tools/`. The SSH host key is pinned in `.gitlab-ci.yml` rather than scanned. See the comments there before changing it.

## Saves

Everything is in `localStorage` under keys beginning `pumaexpress_`, versioned with a `_v1` suffix: the settings, the high scores, a night in progress, the last name on the table, the last difficulty, and sound. They are defined at the top of `js/store.js`. Settings → *Forget everything* clears exactly those keys, as games-meta STANDARD.md requires.

## Reference disks

The original *The Train* disk images may sit beside the repo for reference. They are Accolade's and are gitignored (`*.d64`, `*.t64`, `*.zip`, `reference/`), and nothing of theirs may be copied into the game.
