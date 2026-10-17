---
name: The Puma Express
description: The Train's night run redrawn as hi-bit pixel art lit by moon, lamp and firebox; its title the greykit default in the engine's green and brass, its sheets paper in lamplight, its HUD dark glass.
colors:
  lamp-brass: "#f2c14e"
  lamp-brass-lit: "#ffd978"
  good-news-green: "#7fd28a"
  warning-amber: "#f0a43c"
  danger-red-orange: "#e8573a"
  danger-text: "#ff9a80"
  puma-tawny: "#e2ad6a"
  night-page: "#0b1018"
  hud-panel: "rgba(16,22,32,.84)"
  panel-ink: "#121821"
  control-rest: "#1b2330"
  control-lit: "#263142"
  off-white-text: "#ece7dc"
  muted-text: "#aab0b8"
  faint-text: "#8d949d"
  hairline: "rgba(233,228,216,.10)"
  edge-line: "rgba(233,228,216,.18)"
  stage-black: "#05070f"
  title-night: "#070b1c"
  lamp-glow: "#ffc35a"
  window-light: "#ffcf6a"
  machine-outline: "#0b0d12"
  fur-outline: "#1a120c"
  gauge-cream: "#f4ecd4"
  gauge-red-line: "#c0311c"
  map-paper: "#121c2c"
  map-pale-ink: "#d9d2bf"
  red-pencil: "#6e180e"
  red-pencil-lit: "#85200f"
  paper-lit: "#bfb192"
  paper-edge: "#ae9f7f"
  paper-field: "#cdc1a1"
  telegram-buff: "#c6b583"
  tape: "#d3cab2"
  paper-ink: "#22180f"
  paper-ink-muted: "#33251a"
  paper-ink-faint: "#3d2e1e"
  paper-green: "#163d19"
  paper-amber: "#4c2f00"
  paper-danger: "#8a2214"
  paper-danger-text: "#64130b"
  paper-light-ink: "#f0e5c8"
  title-brass: "#f0c062"
  title-panel-green: "rgba(28,43,35,.82)"
  title-line: "rgba(232,189,92,.4)"
typography:
  display:
    fontFamily: "Barlow Semi Condensed, Bahnschrift SemiCondensed, Bahnschrift, Arial Narrow, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(44px, 6.4vw, 92px)"
    fontWeight: 700
    lineHeight: 0.9
    letterSpacing: "0.005em"
  headline:
    fontFamily: "Barlow Semi Condensed, Bahnschrift SemiCondensed, Bahnschrift, Arial Narrow, Segoe UI, system-ui, sans-serif"
    fontSize: "26px"
    fontWeight: 600
    lineHeight: 1.1
  title:
    fontFamily: "Barlow Semi Condensed, Bahnschrift SemiCondensed, Bahnschrift, Arial Narrow, Segoe UI, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: 1.15
  body:
    fontFamily: "Barlow Semi Condensed, Bahnschrift SemiCondensed, Bahnschrift, Arial Narrow, Segoe UI, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: 1.45
  label:
    fontFamily: "Barlow Semi Condensed, Bahnschrift SemiCondensed, Bahnschrift, Arial Narrow, Segoe UI, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    letterSpacing: "0.14em"
  numeral:
    fontFamily: "Pixelify Sans, ui-monospace, monospace"
    fontSize: "22px"
    fontWeight: 500
    lineHeight: 1
  key:
    fontFamily: "Pixelify Sans, ui-monospace, monospace"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1
  typed:
    fontFamily: "Pixelify Sans, ui-monospace, monospace"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.32
rounded:
  paper: "2px"
  pixel: "2px"
  key: "3px"
  control: "4px"
  panel: "6px"
  sheet: "8px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button:
    backgroundColor: "rgba(240,229,200,.22)"
    textColor: "{colors.paper-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
  button-focus:
    backgroundColor: "rgba(240,229,200,.45)"
    textColor: "{colors.paper-ink}"
  button-primary:
    backgroundColor: "{colors.red-pencil}"
    textColor: "{colors.paper-light-ink}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
  button-primary-focus:
    backgroundColor: "{colors.red-pencil-lit}"
    textColor: "{colors.paper-light-ink}"
  button-danger:
    textColor: "{colors.paper-danger-text}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
  button-danger-focus:
    backgroundColor: "{colors.paper-danger}"
    textColor: "{colors.paper-light-ink}"
  button-head:
    textColor: "{colors.paper-ink-muted}"
    rounded: "{rounded.control}"
    padding: "6px 10px"
  pill:
    textColor: "{colors.paper-ink-muted}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
  pill-on:
    backgroundColor: "rgba(110,24,14,.10)"
    textColor: "{colors.paper-ink}"
  choice-card:
    backgroundColor: "rgba(240,229,200,.22)"
    textColor: "{colors.paper-ink}"
    rounded: "{rounded.panel}"
    padding: "14px 16px 16px"
  choice-card-focus:
    backgroundColor: "{colors.red-pencil}"
    textColor: "{colors.paper-light-ink}"
  menu-row:
    textColor: "{colors.paper-ink}"
    height: "40px"
    padding: "0 22px"
  keycap:
    textColor: "{colors.paper-ink}"
    typography: "{typography.key}"
    rounded: "{rounded.key}"
    padding: "3px 6px"
  input:
    backgroundColor: "{colors.paper-field}"
    textColor: "{colors.paper-ink}"
    rounded: "{rounded.control}"
    padding: "8px 10px"
  sheet:
    backgroundColor: "{colors.paper-lit}"
    textColor: "{colors.paper-ink}"
    rounded: "{rounded.paper}"
    width: "min(820px, 100%)"
  title-menu:
    backgroundColor: "{colors.title-panel-green}"
    textColor: "{colors.off-white-text}"
    rounded: "{rounded.sheet}"
    width: "min(460px, 100%)"
  orders:
    backgroundColor: "{colors.paper-lit}"
    textColor: "{colors.paper-ink}"
    rounded: "{rounded.paper}"
    width: "min(540px, 100%)"
  telegram:
    backgroundColor: "{colors.telegram-buff}"
    textColor: "{colors.paper-ink}"
    rounded: "{rounded.paper}"
    width: "min(440px, 100%)"
  hud-panel:
    backgroundColor: "{colors.hud-panel}"
    textColor: "{colors.off-white-text}"
    rounded: "{rounded.panel}"
    padding: "7px 14px"
  status-bar:
    backgroundColor: "linear-gradient(rgba(8,10,14,.92), rgba(8,10,14,.74))"
    textColor: "{colors.off-white-text}"
    padding: "6px 14px"
---

# Design System: The Puma Express

## Overview

**Creative North Star: "The Footplate at Night"**

The Puma Express is *The Train: Escape to Normandy* run again as hi-bit pixel art, and every picture in it is a night picture. The sky and the fields are deep blues. What light there is comes from the moon, the engine's lamp on the line ahead, lit windows in farms and stations, and the firebox. Nothing casts a shadow on the ground; things fall away into the dark and the haze instead. Shading runs in five-step material ramps with a 4x4 ordered dither between the steps, and a dark outline goes round what stands in front. The train is built once as a 3D model and traced into pixels, so the engine in the station, on the title and over the front gun is the same engine. The cab is the heart of it: the backhead, the gauges and the levers a driver reaches for, painted twice (by moon and lamp, and by the open fire) and blended by how the fire is burning.

The chrome is made of two materials. During play it is flat, dark, translucent glass with hairline edges, held to the top edge and the foot of the screen so the cab's window and backhead stay clear. The title is the greykit games' default (`@gk-title` v0.4) worn in the engine's colours: the name down the left, its second line in brass, and the menu in one green panel lined out in brass, over the train running through the night. Everything you stop to read after it is paper from the Resistance's own world, pinned up where a lamp only just reaches it, so it never glares against the night: a new night opens on the typed orders to seize the train, the pause is a telegram from Duc, and every sheet and window is the same dim paper. Brass becomes red pencil there, for what is ready and chosen. Words use a condensed workhorse sans. Numbers and keys use a pixel face, which is how the chrome joins the pixel picture without mimicking it; where the paper is typed (the orders, the telegram's tape) the pixel face is the typewriter. No page anywhere is a separate "app"; only the title shares its layout with the other greykit games.

Two things stay out of the default picture. The CRT: scanlines are an opt-in setting, off by default. And daylight: the sky pales from first light at 05:30 and is full day by 08:30, but dawn at 08:00 ends a Classic night, so daylight is how the game is lost, not how it looks. Per PRODUCT.md it must also never look like a mobile game. That rules out glossy or bevelled buttons, cartoon gloss and free-to-play energy.

**Key Characteristics:**
- A low-resolution canvas aimed at 360 pixels high and as wide as the window, scaled by a whole number once the window is 540 pixels high or more, and always nearest-neighbour.
- Night light: moonlit ambient, the lamp's beam on the line, lit windows and the firebox's glow. No cast shadows.
- Five-step material ramps, light to dark, with a 4x4 ordered dither and a one-pixel dark outline.
- One train, modelled in metres and ray-traced into pixel art for every view and size it appears at.
- On the title, the engine's green lined out in brass. During play, dark translucent panels, hairline borders, warm off-white words. Everywhere you stop to read, dim lamplit paper, ink, red pencil and brass.
- Lamp brass (red pencil on paper) for ready and chosen, amber for a warning, red-orange for danger, green for good news. None of them is decoration.
- Two voices: a condensed sans for words and a pixel face for numbers and keys.

## Colors

The world has two palettes, and the chrome has two grounds. The picture is moonlit, lamp-warmed and ramp-built. The HUD is near-black and warm off-white, with brass and three signal colours on top; its contrast figures are measured against the HUD panel over the night page. Sheets and windows are paper, with ink, red pencil and darkened signal colours (see Paper below), measured against the paper at its darkest edge.

### Primary
- **Lamp Brass** (lamp-brass, `--pe-yellow`): ready, chosen, the way forward, on the HUD. It rings the chosen view tab and its keycap, names the control in hand, sets the fast-forward note and the Konami code's tag, and draws the focus outlines on the view tabs and the corner buttons. 10.8:1 on the panel. On paper its job passes to red pencil.
- **Red Pencil** (red-pencil, `--pe-yellow` re-read on paper): ready and chosen on paper. It fills the primary button and the focused choice card, washes and arrows the focused row of the telegram, underlines the selected tab, fills the "on" pill's square, marks your row in the high scores, sets the "placed" line and your rank, and draws the input's focus border, the caret and the selection. Paper light ink sits on it at 9.3:1. **Red Pencil Lit** (red-pencil-lit, `--pe-yellow-hi`) is the focused primary button and the focused tab's underline. Red pencil set as words (the rating, "A new best score", your row in the table) takes a shade darker, #5c120a (`--pe-yellow-text`), to hold 5.2:1 at the paper's edge; the telegram's printed red heads take #521009. Links on paper are paper danger text (4.9:1 at the edge).
- **Title Brass** (title-brass, `--gk-title-hi`): the second line of the name on the title, "Express". The title's focused row takes lamp brass (`--gk-title-focus`), as the HUD does.
- **Title Panel Green** (title-panel-green, `--gk-title-panel`) and **Title Line** (title-line, `--gk-title-line`): the title menu's panel, the engine's paint at 82%, so the night shows through a little, and its brass hairline edge and rule. Off-white words hold about 13:1 on it over the night, and 7:1 even where the engine's lamp shows through.
- **Lamp Glow** (lamp-glow): the same job inside the picture. The cab cursor's corners, the points repeater's arrow and its three blast lamps, the gun sight when it is on a fighter, the map's route line and the way a junction is set, and the bridge's range and bearing marks. It is warmer and brighter than lamp brass because it is drawn as light.

### Secondary
- **Warning Amber** (warning-amber, `--pe-amber`): something needs attention soon. It colours the clock and the dawn countdown inside 90 minutes of dawn, damage bars at five segments or more, coal and water at 40% or less, and the paintings count under 40. Amber toasts set their words in #ffd9a0. 8.7:1 on the panel.

### Tertiary
- **Danger Red-Orange** (danger-red-orange, `--pe-red`): danger as a fill or an edge. Damage bars at eight segments, coal and water at 20% or less, the danger button's border and focused fill, the edge of a losing end banner, the blinking view tab of a gun that is needed, wolf stations, gunboats and cuts on the map. **Danger Text** (danger-text, `--pe-red-text`) carries danger as words: a losing end banner ("The boiler bursts"), "wolves" and "gunboats" in the line ahead, held station names on the map (8.8:1). A red toast is #ffd7cc on a deep red fill, rgba(140,36,18,.92) (7.3:1).
- **Good-News Green** (good-news-green, `--pe-green`): something has gone your way. A won night's score and end banner, "ours till 04:10" beside the map, "the free coast" in the line ahead, and the map's "TO 04:10" under a station or bridge the Resistance holds. Green toasts set their words in #d6f5da. It never means ready or chosen: that is brass. 10.0:1.
- **Puma Tawny** (puma-tawny, `--pe-tawny`): the pumas' own colour. In chrome it does not appear. On the map it is a station of ours and the ring round the train. In the picture it is the `tawny` and `puma` fur ramps.

### Neutral
- **Night Page** (night-page): the page, input fields, the small-screen note.
- **Stage Black** (stage-black): behind the play canvas, the theme colour, and the colour `K.dim` pulls the ground toward as the night deepens.
- **Title Night** (title-night): behind the title's canvas, the second step of the night sky ramp.
- **HUD Panel** (hud-panel): HUD panels at 84%, so the scene shows through a little more during play. The top status bar does not use it: it is its own near-black gradient, 92% at the top to 74% at its foot. The corner buttons sit at 86%.
- **Panel Ink** (panel-ink): dark words on a brass or red-orange fill on the HUD.
- **Control Rest / Control Lit** (control-rest, control-lit): a control at rest and a control focused.
- **Off-White Text** (off-white-text): every word on the HUD, at 14.8:1 on the panel. HUD labels use it at 80% and the key hint at 75%.
- **Muted Text** (muted-text, 8.3:1) and **Faint Text** (faint-text, 5.9:1): secondary words, metadata, placeholders and the muted sound button.
- **Hairline / Edge Line** (hairline, edge-line): dividers inside panels, and the outer edge of sheets and controls. HUD panels take an 8% edge.
- **Sprite Outlines** (machine-outline, fur-outline): the one-pixel ring round what stands in front. Blue-black for machines: #0b0d12 for the train art, the guns' sprites and the map's marks, #0a0b0e in the cab, #07080b round the traced train. Gunboats 16 pixels long or more take a lighter #141a26, and fighters 24 pixels or more #1a2030 under a pale moonlit rim (#d4dcea) on their upper edges, so they part from the night; smaller ones go without. Warm brown-black for the people: #1a120c in `people.js`, #140e0a in `people2.js`.
- **Lit Window** (window-light): a farm or village window, a lit station window, the sparks. Its pair #e89a4a is the dimmer window.
- **Gauge Cream / Gauge Red Line** (gauge-cream, gauge-red-line): the dial faces in the cab and the arc past the red line.
- **Map Paper / Map Pale Ink** (map-paper, map-pale-ink): the map's dark paper and its station names. The track is #cfc8b2.

### Paper
Every sheet and window (`.pe-sheet`, `.pe-ask`) redefines the chrome's tokens as ink on paper, so one set of component rules serves both grounds. The paper is a radial lamp fall-off from the top left, lit to edge, under a faint fractal grain (an inline SVG, `--pe-grain`), with a 1px inset edge and a soft inner shadow.
- **Paper** (paper-lit to paper-edge, #c6b899 at the lamp): sheets, the ask window and the end of the night. **Telegram Buff** (telegram-buff, #c6b583 to #a89768): the pause. **Tape** (tape): the telegram's pasted strips. **Paper Field** (paper-field, `--pe-bg`): a field written into, and the gap inside a focus ring.
- **Paper Ink** (paper-ink, `--pe-text`): every word, 8.2:1 lit, 6.7:1 at the edge. **Muted** (paper-ink-muted, 5.7:1 at the edge) and **Faint** (paper-ink-faint, 5:1): secondary words. The orders and the telegram keep their own pair, #22180f and #36281a.
- **Paper Light Ink** (paper-light-ink, `--pe-ink`): words on a red-pencil or danger fill; a focused card's secondary words take it at 85%.
- **Paper Green / Amber / Danger / Danger Text** (`--pe-green`, `--pe-amber`, `--pe-red`, `--pe-red-text`): the signal colours darkened to hold 4.7:1 or better at the paper's edge. Their meanings do not change.
- **Rubber-stamp red** (#8e2216 on the orders, #6e180e elsewhere): the "Most secret" stamp and the paw, set with `mix-blend-mode: multiply` so the paper shows through. The telegram's printed heads are the same red made darker (#521009), flat, as they are words to read.

The picture's own colours live in `js/art/kit.js`. `K.M` holds twenty materials of five shades each, lit to dark: brass, copper, steel, iron, the engine's paint (a green near black at night), tawny, puma, wolf, wolfDk, wolfRed, field, stone, slate, wood, cream, fire, water, coal, canvas and olive. `K.sky` blends three five-stop skies (night, pre-dawn, day) by the light, and `K.light` gives that light from the clock: 0.12 fading to 0 over the first 50 minutes, 0 until first light, then rising to 1 at 08:30. The art picks steps from the ramps by light and noise. Do not mix free hexes into the picture.

### Named Rules
**The Brass Rule.** Brass (red pencil, on paper) means ready or chosen, amber means warning, red-orange means danger, green means good news. These hues carry state and nothing else, and state never travels by colour alone: a damage bar is a count of segments, a gauge is a length, the line ahead writes "wolves" or "gunboats", and the map gives every station, cut and guarded bridge a shape of its own.

**The Ink Ring Focus Rule.** Focus is a ring in the ground's own ink: paper ink on paper, off-white on the HUD's glass. Where a control can be chosen as well as focused (the pills and the switches), only "chosen" is red pencil (brass on the HUD). An ordinary button's focus is the ink border and a 1px ring. Red pencil follows the focus only where focus *is* the choice: the row of the telegram, and the card that Enter will take. The title's menu is the canon's, so its focus is a lamp-brass wash and pointer.

## Typography

**Display Font:** Barlow Semi Condensed 500/600/700, self-hosted (falling back to Bahnschrift SemiCondensed, Arial Narrow and system-ui)
**Body Font:** Barlow Semi Condensed
**Label/Mono Font:** Pixelify Sans, self-hosted as one 400 to 700 variable file (falling back to ui-monospace), for numerals and keycaps only

**Character:** A condensed workhorse sans keeps words tight and readable, over the dark picture or on paper. The pixel face sets the score, the clock and the paintings count, so the numbers you act on share the picture's grain. Inside the picture there are two more faces, both drawn a pixel at a time in `kit.js`: a 5 by 7 capitals face for station names, signs and map labels (`K.text5`, six pixels an advance, accents folded to plain capitals), and a 3 by 5 figures face for the dial numbers (`K.text3`). The 3 by 5 face has figures and nothing else: a letter set in it draws nothing, so every word in the picture, a unit included, is the 5 by 7 face.

### Hierarchy
- **Display** (display): the name on the title only, "THE PUMA / EXPRESS" in two uppercase lines, the second in title brass, decoded in by the canon's entrance. There is no line under it.
- **Headline** (headline): sheet titles, in uppercase at weight 700, tracked 0.06em. The telegram's "Paused" is 30px, the orders' "The train at Velmont" 22px under its 12px eyebrow, the end-of-night banner on the HUD 46px at weight 700 (mixed case), and the map's side panel 24px.
- **Title** (title): the night's score. The end of the night raises it to 40px, coloured by outcome (green won, muted abandoned, ink otherwise). "A new best score" is 26px at weight 700 in red pencil.
- **Body** (body): sheet prose, capped at 72ch, with an 18px lede. Duc's report is 17px. The title's rows run at 20px (16px on the bottom row), the telegram's at 18px, both at weight 500, toasts at 17px weight 600, and the HUD at 15px with a 1.2 line height.
- **Label** (label): uppercase labels beside data and section headings inside sheets, in muted ink; the orders' numbered heads ("1. Situation.") and the telegram's printed heads ("Reply", "Office") are the same face. Table heads track at 0.12em. In the top status bar the labels drop to 11px at 0.1em.
- **Numeral** (numeral): the score at 22px, the clock at 18px weight 400 and the paintings count at 16px in the status bar; score and figure columns in tables, with tabular figures. The Konami code's tag is 12px.
- **Key** (key): every keycap, at 13px in sheets and 12px on the HUD.
- **Typed** (typed): where the paper is typed: the orders' paragraphs at 16px, the telegram's tape at 16px in uppercase tracked 0.05em, the "Most secret" stamp at 14px.

### Named Rules
**The Two Voices Rule.** Words are Barlow Semi Condensed, and numbers you act on and keys you press are Pixelify Sans. Never set prose in the pixel face except where the paper is typed (the orders, the telegram's tape, a rubber stamp), and never set the clock in the sans. Inside the picture, words are the 5 by 7 face, never a web font drawn onto the canvas.

## Layout

The play screen fills the window. `scaleK` in `js/main.js` takes k = window height / 360; when k is 1.5 or more it is rounded to the nearest whole number, and below that it is used as it is (never below 1). The canvas is then the window's width and height divided by k, rounded up, and `#stage` is that times k, so it can overhang the right and bottom edges by less than k pixels, which the page clips. A window 540 to 899 high gets k = 2 and a canvas 270 to 450 pixels high; 900 to 1259 gets k = 3 and 300 to 420; 1260 to 1619 gets k = 4 and 315 to 405. Between 480 and 539, k is the exact fraction and the canvas is 360 high, with uneven pixels. (`kit.js`'s header says "about 300 pixels high"; the code aims at 360.) The canvas is drawn whole every frame, and scaled with `image-rendering: pixelated`.

Each scene lays itself out inside that canvas. The cab is drawn for 640 by 360 and stretched to fit: across by the width over 640, held between 0.82 and 1.3, about the centre; down by the height over 360. The station is 480 by 300 units drawn about the middle at the smaller of height/300 and width/400 pixels a unit. The map keeps its own shape left of the side panel, its right edge at the larger of 62% of the width and the width less 230. The title's train is drawn at the window's height over 360, fifteen times that in pixels a metre.

The HUD sits above as DOM. A full-width status bar runs along the top: the score, the clock and "dawn in 6h30" on the left; the four view tabs at 236px from the left; the Boiler, Gear and Brakes damage bars, the paintings count, and the coal and water gauges on the right. The line ahead (a Field aid) is a centred strip hung from the bar's foot at 34px, square-topped, so it keeps as far above the cab's window as it can; crowded, it takes a second line rather than running off the screen. Duc's words (two toasts at most), the control in hand and the key hint stack in the bottom centre, 14px up, 7px apart. The end banner stands at 40% height. On the map a side panel (230px) runs down the right, 52px from the top and as tall as what it holds. Pause and sound sit bottom right at 36px, 12px in. The whole HUD grows with the picture's pixels (`--hz`, set in `fit()` in `js/main.js`): 1 at k = 2, 1.15 at 3, 1.3 at 4 and up, never so far that the bar has under 1300 CSS pixels for its labels. (`js/hud.js`'s header still describes corner panels at top left and top right; the stylesheet's last block turns them into the bar and the strip, and that is what renders.)

The pause window stands right of centre (min(440px, 100%)), inset clamp(24px, 6vw, 96px) from the right, over a scene dimmed by a left-to-right gradient from 5% to 66%, so the cab stays visible. Sheets centre over a 72% dim with a 3px blur at min(820px, 100%), or min(1080px, 100%) for wide sheets, inside a 32px margin, with 24px side padding inside. The end of the night is the one sheet that stands aside: min(560px, 100%), right of centre like the pause window over the same left-to-right gradient, in one column, so the scene of the ending stays in view (an abandoned night has no scene, and its sheet centres as usual). Tabbed sheets hold a fixed height of min(600px, 100vh - 64px). The ask window (min(520px, 100%)) centres over a 60% dim, above any sheet. The title is the canon's layout: the name and, 30px below, the menu panel (min(460px, 100%), 50px rows, Settings, Help and About sharing a 44px row under a brass rule), in a left column inset clamp(16px, 7vw, 120px) and centred down the window, with the train behind it shaded from the left and the credit at the bottom left. The orders are a sheet of their own (min(540px, 100%)), centred over the dimmed title after New game's choice of difficulty: the numbered paragraphs, the sign-off and the paw, and at the foot the night's difficulty and start time beside "To the yards". Back, or Esc, returns to the choice. The spacing rhythm is 4/8/16/24/32, with 6, 10, 12, 14 and 22 inside dense panels.

Desktop only: below 760 by 480 a note replaces the game. The status bar folds by the width it has once the HUD has grown, not the window's (classes `hud-w1300`, `hud-w1160` and `hud-w1100` on the page, set in `fit()`): under 1300 the damage bars thin to 4-pixel cells and the coal and water gauges to 40 pixels, every label kept, so no bar is told by its place alone; at 1160 and under the view tabs shrink to their keycaps, and at 1100 and under the dawn countdown and the line ahead's labels go; the score keeps its label at every width. At a window 860px wide and under, the new-game cards and the station report collapse to one column. A sheet whose next step matters (the end of the night, the end of a practice fight) holds it in a footer under a hairline, outside the scrolling body, so Run again or the name for the table is always in view. The pause window stands 48px down, clear of the status bar, and scrolls rather than clips; while it is up the line ahead stands down; under 760px high the telegram packs closer and its key legend runs three pairs to a row.

### Named Rules
**The Clear Window Rule.** Chrome holds the top edge and the foot. Nothing opaque covers the cab's window or its backhead during play, and windows over the scene stand to one side or over a dim, never over a blank page.

**The Whole Pixel Rule.** Every picture is drawn on whole pixels at the canvas's own size, and nothing in it is see-through: smoke, steam and spray are thinned by the 4x4 ordered dither (`K.dither`), opaque pixels taking a share of the 16, never by alpha (`K.rect`, `K.px` and the rest round every coordinate, and image smoothing is off) and upscaled with `image-rendering: pixelated`, by a whole number whenever the window is 540 pixels high or more. Never smooth or mix resolutions. The two exceptions are radial-gradient glows: a lit station window, and the firebox's glow on the ballast under the title's train.

## Elevation & Depth

The picture has night light, not a sun. The land is lit by a cold ambient (0.34, 0.40, 0.56 at full dark) that warms toward day; the engine's lamp throws a warm beam up the line that falls off over 240 metres; distance fades into a haze that is the sky's own lowest colour; and `K.dim` pulls the ground toward stage black as the light goes. The cab and the station are relit pixel by pixel (`K.relight`): the cab by the gauge lamp, the driver's oil lamp and the fire, the station by three gas lanterns under the canopy. The cab is painted twice, by moon and lamp and by the open fire, and the fire-lit copy is laid over at 85% with a flicker when the firebox door is open, and at 6 to 14% by the grate when it is shut. The traced train takes a moonlit key light from the side (`Mo.LIGHT_NIGHT`), and its lamp and firebox are drawn as glowing, unshaded. The HUD is flat panels lifted by soft ambient shadows; it reads as glass over the night, not as cards. Sheets and windows are paper: lit from the top left and darker toward the edges, as a lamp would leave them, with a 1px inset edge and the same deep drop below.

### Shadow Vocabulary
- **Sheet lift** (`box-shadow: inset 0 0 0 1px rgba(40,25,10,.45), inset 0 0 50px rgba(40,25,8,.14), 0 24px 70px rgba(0,0,0,.65)`): sheets and the ask window; the telegram takes 40px inside and .65 below.
- **HUD lift** (`box-shadow: inset 0 1px 0 rgba(255,255,255,.035), 0 8px 22px rgba(0,0,0,.28)`): HUD panels and toasts.
- **Status bar drop** (`box-shadow: 0 4px 14px rgba(0,0,0,.35)`): the top status bar.
- **Focus ring** (on paper `box-shadow: 0 0 0 1px #22180f`; primary and choice cards: `0 0 0 2px #cdc1a1, 0 0 0 4px #22180f`. On the HUD the same in off-white over the night page): the focused control.

### Named Rules
**The Night Light Rule.** Nothing in the picture casts a shadow. Depth comes from light falling off: moonlit ambient, a lamp's radius, the haze toward the horizon, and the dark outline round what stands in front. Never use a CSS drop shadow or a cast shadow on picture art.

## Shapes

Corners are small and consistent. The HUD's bar segments and gauges use 1px. The pill's square and a link's focus outline use a 2px pixel radius. Keycaps use 3px, with a heavier 2px bottom edge so they read as keys, and so does the Konami code's brass tag. Controls, inputs and Duc's face in a toast use 4px. HUD panels, choice cards, telegraph messages, Duc's face in the report and the corner buttons use 6px. Paper (sheets, windows, the orders, the telegram) is near square at 2px. The title's menu panel is the canon's 8px. The status bar is square. Borders are 1px hairlines; the pill's square is 1.5px. In the picture, sprites carry a one-pixel dark outline and are built from pixels: letter maps (`K.map`), discs and strokes (`people.js`), shading a pixel at a time (`people2.js`), and the ray-traced model (`model.js`), never vector paths left smooth. Small indicators are drawn as pixel grids (the map legend's marks, drawn at 16 pixels and shown at 32, and the paw stamp on the orders, 16 by 13 cells as an inline SVG) or as tiny inline SVG (back, close, pause, sound). There are no glyph-font icons.

## Components

### Buttons
Matte and quiet, lit only when focused. On paper they are slips of lighter paper.
- **Shape:** gently squared (control radius).
- **Default:** a 22% light-paper fill, a 34% ink border, ink words at weight 600. Focus lifts the fill to 45% with an ink border and a 1px ink ring. In sheets and on the title the pointer moves focus, so hover and focus are the same state.
- **Primary:** a red-pencil fill with light paper words. Focus brightens it to red pencil lit with a double ring (field, then ink).
- **Danger:** transparent, with a paper-danger border and danger-text words. Focus fills it paper danger with light paper words and no ring.
- **Head:** the sheet's Back and Close: transparent, muted ink, 15px, with an inline SVG chevron or cross. Focus gives them the default button's face without the ring.
- **Disabled:** 45% opacity.

### Toggle Pills and Switches
- **Style:** transparent buttons led by a 10px square (pixel radius), outlined when off and filled red pencil when on. The "on" pill takes a 10% red-pencil wash and a 60% red-pencil border. Focus is the ink ring; an "on" pill keeps a 16% wash under it. Switches are pills at least 84px wide that read "On" or "Off".

### The Title
The greykit games' default title, `@gk-title` v0.4, taken whole from games-meta `canon/` and coloured through its six names on `#title`: ink off-white, the name's second line title brass, the focus lamp brass, dim muted, the panel the engine's green and its line brass. The train runs behind it in `.scene`. The first time it shows, after the boot, it opens on the train alone: 1.5s on, the name and the shade behind it fade in over 2.2s, they hold, and at 5s the menu and the credit fade in over a second as the rows print in. Any key or click skips to the end, and that key or click does nothing else; under reduced motion it starts at the end. Coming back to the title later, the name decodes and the rows print in one at a time (skipped under reduced motion); the focused row takes a brass wash and a pointer at its left edge. Every row is a button with its key in its own `<kbd>`, which is how the canon `titleKeyButton` and `titleArrow` find it. New game's meta is the last difficulty played, Resume's the saved night's time and place, High scores' the best score.

### The Orders (before a night)
A new night opens on the Resistance's typed operation orders, a sheet of its own between New game's choice of difficulty and the yard at Velmont. Its head reads "Resistance · operation orders" over "The train at Velmont", stamped "Most secret" in red at -6 degrees. Then two numbered paragraphs typed in the pixel face: **1. Situation** (the paintings loaded at Velmont, bound for the Empire) and **2. Object** (the author's words: "Seize the train. Get it to Port Clair before dawn. Send Resistance orders from stations. Godspeed."). It is signed "For the Resistance. Burn after reading." with the paw. Its foot gives the difficulty and when the train is taken, beside the primary "To the yards", which has the focus, so Enter starts the night. Back, or Esc, returns to the choice of difficulty. It never names the wolves' capital or any place the train does not go. The eyebrow and the stamp are drawn in CSS and hidden from assistive technology; the paragraphs are read.

### Choice Cards (new game, practice, the telegraph)
Three difficulty or practice cards in a row, or the telegraph's four messages in a column. Each is a default button at panel radius with a keycap and a bold name over muted notes. The focused card fills red pencil with light paper words and the double ring, because it is the one Enter takes. The last difficulty played is only tagged ("last run", 12px uppercase), never lit.

### Keycaps
- **Style:** pixel face, key radius, a 2px bottom edge so it reads as a key. On paper: ink, a 30% light-paper fill and a 50% ink border; on a focused card the keycap goes transparent with a 50% light-paper border. On the HUD: off-white, a 6% off-white fill and a 28% off-white border.

### Sheets / Containers
- **Corner Style:** paper radius. **Background:** paper. **Border:** none; the 1px inset edge of the sheet lift. **Shadow:** sheet lift.
- **Structure:** a head (title, plus Back or Close) over a 3px double rule, optional tabs (muted, a 2px red-pencil underline when selected, red pencil lit when focused, 22px apart), and a scrolling body padded 22px 24px 26px. Tables rule their rows with ink hairlines. Pictures (Duc's face, the line ahead, the paintings, the fight figures in Help) sit on the paper as they are.
- **Pause window (the telegram):** a buff telegram form. Its printed head reads "Telegram · Resistance lines" in red over "Paused"; a ruled row gives the office (the cab), who it is from (Duc) and the time handed in; three strips of tape carry the night so far in the typed face ("Halted 22:48 stop Intermediate stop", the points and paintings aboard, the miles run and "dawn at 08:00 stop"; a practice fight says it is practice and nothing is saved); then "Reply" over the rows (Resume, The map, Settings, Help, Main menu, 38px, each led by its keycap as the title's rows are: P, the key that paused, resumes, 4 is the map as on the line, then S, ? and Q; the red-pencil wash and a 9px triangle at the right end), and the key legend at the foot on a 10% ink wash under a dashed rule.
- **Station report:** Duc's words with his face, and under them the line ahead: a crop of the map itself, drawn at the map's own size and shown at the play screen's scale, round the train, the next station and the bridge before it, so the telegraph's message is chosen with the map in view. The four messages stand beside them.
- **End of the night:** beside its scene (see Layout). Its head says how the night ended ("The boiler bursts", "Dawn", "Port Clair: the art is home"), the same words as the banner before it. The paintings lead, at the display size: "41 of 48 paintings home", or "48 paintings still aboard"; under them the banner's line, the miles from Velmont, the time and the difficulty. A lost night then gives Duc's word for next time, one line for each way to lose, with his face at 56px. Then three of the paintings themselves at 64 by 48 shown at twice that, their titles in italic muted words under them: "Home tonight, among them" or "Still aboard". The score comes after them ("Score 2,400", the figure in the pixel face), then the rating, the next rating, the tally and the table; the name for the table, or Run again and Title, wait in the footer.
- **Ask window:** a question before something that cannot be undone. Cancel is primary and holds the focus, so here the pointer lights what it is over by hover instead of taking the focus.

### HUD
- **Status bar:** the near-black gradient, a hairline at its foot, the status bar drop. The score carries its label, "Score", like everything else on the bar. A practice fight leaves off the coal, the water and the paintings, which it cannot move. Damage bars are ten segments (6 by 8, 2px gaps) at 13% off-white, lit solid off-white, amber at five and red-orange at eight. Coal and water are 54 by 8 gauges, amber at 40% and red-orange at 20%.
- **View tabs:** "1 Front gun", "2 Rear gun", "3 Cab", "4 Map". The view showing takes a 14% brass wash, a 45% brass border and a brass keycap border. A gun that is needed blinks red-orange (0.8s, two steps), steady at 30% under reduced motion. They hide during a station or bridge fight.
- **Panels:** hud-panel fill, an 8% border, panel radius, HUD lift. The line ahead's rows are inline, divided by hairlines, with the status word in brass, green or danger text (names 17px, values 15px, so the strip keeps as little of the window as it can). The control in hand names the control in brass, then its keys. With the Readings aid (Field) it leads with the steam, the speed and the heat in the pixel face, each with its unit and its label, the steam in danger text past the red line, and gives the control's own setting after its name (the throttle and brake as a percentage, the reverser and the door in words). The key hint is 75% off-white with hairline separators.
- **End banner:** not glass but a telegram from the line, the one moment of the HUD you stop to read: the buff telegram paper, "Telegram · Resistance lines" printed in red over the outcome in uppercase (paper green for Port Clair, paper danger text for a loss), and the line under it on a strip of tape in the typed face.
- **Toasts:** small panels stacked in the bottom centre, tinted by signal. Duc's carry his 40px face. Red toasts take the deep red fill.
- **Hurt and hit:** at 80% wear a red-orange vignette (rgba(160,30,10,.34)) pulses over the scene every 1.1s; a hit flashes rgba(255,70,30,.32) at the edges for 0.35s. Under reduced motion the vignette holds still and the flash is skipped.

### Inputs / Fields
- **Style:** paper-field fill, a 34% ink border, control radius, 18px words. **Focus:** the border turns red pencil and there is no glow. Placeholder text is faint.

### The Cab Gauges (picture)
Four dials on the driver's board, each a brass bezel round a gauge-cream face that shades to #cfc3a2 at the rim, swept through 270 degrees: pressure to 300 psi with a red line from 240 (figured 0 to 3, in hundreds), speed to 80 mph (figured 0, 40, 80), the boiler's temperature to 500 with a red line from 450, and the vacuum brake. Ticks are #2a241c, turning #a52a18 past the red line, with figures in the 3 by 5 face set in toward the rim, clear of the needle's hub; the needles are #151110. Every control and dial a newcomer is asked to read carries its name on a plate in the 5 by 7 face: black enamel (#16110b) in a brass rim, the letters raised in the brightest brass, so it still reads once the moon and the lamp have dimmed it: STEAM, SPEED and HEAT under the three dials on the board, WATER, FIREBOX, COAL, THROTTLE, REVERSER and BRAKE by theirs, and the whistle's and the safety valve's pulls a tag hanging from the handle (WHISTLE, VALVE), lit where it hangs. The vacuum gauge stands over the brake and goes without. The cab's ambient rises with the light after first light, the cab painted again in four steps, so by day it is lit as the country through its window is. Beside them the water glass, and the points repeater: a brass box with a dark glass that shows the next junction's setting as a lamp-glow arrow when it is within 25 miles, and three lamps over it for the whistle blasts counted. The cursor lights the chosen control's four corners in lamp glow, with a paw on it, set beside the throttle and the brake rather than over their plates. Damage shows as steam weeping from the boiler's joints.

### The End of the Night (picture)
When the night ends the picture changes to the train standing, side on as on the title, drawn by `js/art/ending.js` under the end banner and then beside the end sheet. Won, she stands at Port Clair: the sea to the west with the lighthouse on its mole (its beam turning while it is dark), the town's roofs and lit windows behind the yard, the station's board on the far platform over her roofs, a van open with a crate at the door, and on the platform in front the lamps, tawny and cream bunting, a trolley of framed paintings and pumas lifting more down. Lost, she stands where it ended, in the night's own light: in daylight with three fighters coming down the line at dawn; in a cloud of her own steam when the boiler bursts; weeping steam when the boiler or the motion gives out; nose down into the gap at a cut, or off the rails at the points; against a red and white buffer stop; at the wolves' striped barrier and hut on the frontier, wolves on the line. Steam and smoke are emitted by the second, not the frame. The train is traced with the night light, or a low day light (`key: "day"`) once the light passes half.

### The Paintings (picture)
The forty-eight paintings are drawn too (`PX.Paintings`): each a small picture in a two-pixel gilt frame, made from its number so it is the same painting every night, and every six in a row are six kinds (fields, a portrait of a puma, the sea, a still life, a town at night, a river), the order turning a step each six. Titles come from the line's own towns and rivers ("Morning, Montfauve", "Boats off Belcourt", "Portrait of a Young Puma"). The first aboard are the last lost, so the ones shown are always among those still on the train.

### The Map (picture)
A driver's working map: dark paper relief-shaded from the north-west with faint contours and stippled woods, the sea hatched west of the coast, the rivers in #3d6f96, the track as a pale line on a dark bed with sleeper ticks, and the line to the frontier in rust. Told by shape as well as colour: a station of ours is a tawny round, a held one a red-orange square, Port Clair a pale star, a cut a cross, a guarded bridge a boat, a junction a diamond. The train is a white arrow in a tawny ring that breathes every 0.4s (still under reduced motion). With the route aid the way the points lead is a lamp-glow line. Station names are map pale ink (11.3:1 on the paper) or danger text (8.3:1) when held; the region names "THE FREE COAST" and "WOLF EMPIRE" are quieter (4.1:1 and 2.2:1).

## Do's and Don'ts

### Do:
- **Do** draw every picture on whole pixels at the canvas's own size, and upscale by whole numbers wherever the window is 540 pixels high or more.
- **Do** light the night from its sources (moon, lamp, lit windows, firebox) and let depth come from fall-off and haze.
- **Do** build the picture's colour from the material ramps and skies in `js/art/kit.js`, light to dark, and outline what stands in front in blue-black for machines and brown-black for fur.
- **Do** trace the train from the model, so it is the same engine in every view.
- **Do** keep the HUD as flat dark translucent panels with 1px hairlines at 84%, and make everything you stop to read (sheets, windows, the title, the pause) dim lamplit paper from the Resistance's own world.
- **Do** reserve brass (red pencil on paper) for ready and chosen, amber for warning, red-orange for danger and green for good news, and pair each with a word, count, length or shape.
- **Do** set words in Barlow Semi Condensed and numbers and keys in Pixelify Sans.
- **Do** light only the focused control: red pencil (brass on the HUD) where focus is the choice, an ink ring everywhere else.
- **Do** check any new paper colour against the paper's darkest edge, not its lit centre: 4.5:1 there or better.

### Don't:
- **Don't** make green the "ready" colour. Ready and chosen are brass; green is only good news.
- **Don't** light a pill or switch in red pencil for being focused. Its focus is the ink ring; red pencil means it is on.
- **Don't** brighten the paper. It is lit by one lamp in a night game; a white sheet over the dark breaks both.
- **Don't** cover the cab's window or backhead with chrome during play.
- **Don't** use glossy, bevelled or gradient-filled buttons, or cartoon gloss (PRODUCT.md: never a mobile game). The focused row's fading wash (red pencil on the telegram, brass on the title) is the only gradient on a control; elsewhere gradients are only the paper's lamp fall-off, the dims and shades behind windows and the title, and the status bar.
- **Don't** cast shadows in the picture, or put a CSS drop shadow on picture art.
- **Don't** turn the scanlines on by default. They are a player's choice in Settings.
- **Don't** set prose in the pixel face unless the paper is typed, or use a system display face for the name.
- **Don't** use glyph or emoji icons. Draw icons as pixel grids or small inline SVG.
