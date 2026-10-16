---
name: The Puma Express
description: The Train's night run redrawn as hi-bit pixel art lit by moon, lamp and firebox, under calm dark panels.
colors:
  lamp-brass: "#f2c14e"
  lamp-brass-lit: "#ffd978"
  good-news-green: "#7fd28a"
  warning-amber: "#f0a43c"
  danger-red-orange: "#e8573a"
  danger-text: "#ff9a80"
  puma-tawny: "#e2ad6a"
  night-page: "#0b1018"
  night-panel: "rgba(16,22,32,.94)"
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
typography:
  display:
    fontFamily: "Barlow Semi Condensed, Bahnschrift SemiCondensed, Bahnschrift, Arial Narrow, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(56px, 6.4vw, 92px)"
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
rounded:
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
    backgroundColor: "{colors.control-rest}"
    textColor: "{colors.off-white-text}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
  button-focus:
    backgroundColor: "{colors.control-lit}"
    textColor: "{colors.off-white-text}"
  button-primary:
    backgroundColor: "{colors.lamp-brass}"
    textColor: "{colors.panel-ink}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
  button-primary-focus:
    backgroundColor: "{colors.lamp-brass-lit}"
    textColor: "{colors.panel-ink}"
  button-danger:
    textColor: "{colors.danger-text}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
  button-danger-focus:
    backgroundColor: "{colors.danger-red-orange}"
    textColor: "{colors.panel-ink}"
  button-head:
    textColor: "{colors.muted-text}"
    rounded: "{rounded.control}"
    padding: "6px 10px"
  pill:
    textColor: "{colors.muted-text}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
  pill-on:
    backgroundColor: "rgba(242,193,78,.10)"
    textColor: "{colors.off-white-text}"
  choice-card:
    backgroundColor: "{colors.control-rest}"
    textColor: "{colors.off-white-text}"
    rounded: "{rounded.panel}"
    padding: "14px 16px 16px"
  choice-card-focus:
    backgroundColor: "{colors.lamp-brass}"
    textColor: "{colors.panel-ink}"
  menu-row:
    textColor: "{colors.off-white-text}"
    height: "50px"
    padding: "0 22px"
  keycap:
    textColor: "{colors.off-white-text}"
    typography: "{typography.key}"
    rounded: "{rounded.key}"
    padding: "3px 6px"
  input:
    backgroundColor: "{colors.night-page}"
    textColor: "{colors.off-white-text}"
    rounded: "{rounded.control}"
    padding: "8px 10px"
  sheet:
    backgroundColor: "{colors.night-panel}"
    textColor: "{colors.off-white-text}"
    rounded: "{rounded.sheet}"
    width: "min(820px, 100%)"
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

The chrome is the opposite material: flat, dark, translucent panels with hairline edges, held to the top edge and the foot of the screen so the cab's window and backhead stay clear. Words use a condensed workhorse sans. Numbers and keys use a pixel face, which is how the panels join the pixel picture without mimicking it. The menus are the same calm panels over a dimmed scene, or over the title's train running through the night. No page anywhere is a separate "app".

Two things stay out of the default picture. The CRT: scanlines are an opt-in setting, off by default. And daylight: the sky pales from first light at 05:30 and is full day by 08:30, but dawn at 08:00 ends a Classic night, so daylight is how the game is lost, not how it looks. Per PRODUCT.md it must also never look like a mobile game. That rules out glossy or bevelled buttons, cartoon gloss and free-to-play energy.

**Key Characteristics:**
- A low-resolution canvas aimed at 360 pixels high and as wide as the window, scaled by a whole number once the window is 540 pixels high or more, and always nearest-neighbour.
- Night light: moonlit ambient, the lamp's beam on the line, lit windows and the firebox's glow. No cast shadows.
- Five-step material ramps, light to dark, with a 4x4 ordered dither and a one-pixel dark outline.
- One train, modelled in metres and ray-traced into pixel art for every view and size it appears at.
- Dark translucent panels, hairline borders, warm off-white words.
- Lamp brass for ready and chosen, amber for a warning, red-orange for danger, green for good news. None of them is decoration.
- Two voices: a condensed sans for words and a pixel face for numbers and keys.

## Colors

The world has two palettes. The picture is moonlit, lamp-warmed and ramp-built. The chrome is near-black and warm off-white, with brass and three signal colours on top. Contrast figures below are measured against the night panel composited over the night page.

### Primary
- **Lamp Brass** (lamp-brass, `--pe-yellow`): ready, chosen, the way forward. It fills the primary button and the focused choice card, washes and arrows the focused menu row, underlines the selected tab, fills the "on" pill's square, rings the chosen view tab, names the control in hand, marks your row in the high scores, sets the "placed" line and your rank, and draws the input's focus border, the caret, the selection and focus outlines on links and corner buttons. 10.8:1 on the panel. **Lamp Brass Lit** (lamp-brass-lit, `--pe-yellow-hi`) is the focused primary button, the focused tab's underline and every link (13.4:1).
- **Lamp Glow** (lamp-glow): the same job inside the picture. The cab cursor's corners, the points repeater's arrow and its three blast lamps, the gun sight when it is on a fighter, the map's route line and the way a junction is set, and the bridge's range and bearing marks. It is warmer and brighter than lamp brass because it is drawn as light.

### Secondary
- **Warning Amber** (warning-amber, `--pe-amber`): something needs attention soon. It colours the clock and the dawn countdown inside 90 minutes of dawn, damage bars at five segments or more, coal and water at 40% or less, and the paintings count under 40. Amber toasts set their words in #ffd9a0. 8.7:1 on the panel.

### Tertiary
- **Danger Red-Orange** (danger-red-orange, `--pe-red`): danger as a fill or an edge. Damage bars at eight segments, coal and water at 20% or less, the danger button's border and focused fill, the edge of a losing end banner, the blinking view tab of a gun that is needed, wolf stations, gunboats and cuts on the map. **Danger Text** (danger-text, `--pe-red-text`) carries danger as words: a losing end banner ("The boiler bursts"), "wolves" and "gunboats" in the line ahead, held station names on the map (8.8:1). A red toast is #ffd7cc on a deep red fill, rgba(140,36,18,.92) (7.3:1).
- **Good-News Green** (good-news-green, `--pe-green`): something has gone your way. A won night's score and end banner, "ours till 04:10" beside the map, "the free coast" in the line ahead, and the map's "TO 04:10" under a station or bridge the Resistance holds. Green toasts set their words in #d6f5da. It never means ready or chosen: that is brass. 10.0:1.
- **Puma Tawny** (puma-tawny, `--pe-tawny`): the pumas' own colour. In chrome it appears only on "Puma" in the title mark. On the map it is a station of ours and the ring round the train. In the picture it is the `tawny` and `puma` fur ramps.

### Neutral
- **Night Page** (night-page): the page, input fields, the small-screen note.
- **Stage Black** (stage-black): behind the play canvas, the theme colour, and the colour `K.dim` pulls the ground toward as the night deepens.
- **Title Night** (title-night): behind the title's canvas, the second step of the night sky ramp.
- **Night Panel** (night-panel): sheets, the pause window, the ask window and the title menu, at 94%.
- **HUD Panel** (hud-panel): HUD panels at 84%, so the scene shows through a little more during play. The top status bar does not use it: it is its own near-black gradient, 92% at the top to 74% at its foot. The corner buttons sit at 86%.
- **Panel Ink** (panel-ink): dark words on a brass or red-orange fill (10.6:1 on brass, 13.1:1 on brass lit, 5.0:1 on red-orange). A focused card's secondary words use it at 72% (5.5:1).
- **Control Rest / Control Lit** (control-rest, control-lit): a control at rest and a control focused.
- **Off-White Text** (off-white-text): every word, at 14.8:1 on the panel. Menu rows at rest use it at 86% (11.1:1), HUD labels at 80% and the key hint at 75%. A focused menu row lifts to #fffaf0.
- **Muted Text** (muted-text, 8.3:1) and **Faint Text** (faint-text, 5.9:1): secondary words, metadata, placeholders and the muted sound button.
- **Hairline / Edge Line** (hairline, edge-line): dividers inside panels, and the outer edge of sheets and controls. HUD panels take an 8% edge.
- **Sprite Outlines** (machine-outline, fur-outline): the one-pixel ring round what stands in front. Blue-black for machines: #0b0d12 for the train art, the guns' sprites and the map's marks, #0a0b0e in the cab, #07080b round the traced train. Gunboats 16 pixels long or more take a lighter #141a26, and fighters 24 pixels or more #1a2030 under a pale moonlit rim (#d4dcea) on their upper edges, so they part from the night; smaller ones go without. Warm brown-black for the people: #1a120c in `people.js`, #140e0a in `people2.js`.
- **Lit Window** (window-light): a farm or village window, a lit station window, the sparks. Its pair #e89a4a is the dimmer window.
- **Gauge Cream / Gauge Red Line** (gauge-cream, gauge-red-line): the dial faces in the cab and the arc past the red line.
- **Map Paper / Map Pale Ink** (map-paper, map-pale-ink): the map's dark paper and its station names. The track is #cfc8b2.

The picture's own colours live in `js/art/kit.js`. `K.M` holds twenty materials of five shades each, lit to dark: brass, copper, steel, iron, the engine's paint (a green near black at night), tawny, puma, wolf, wolfDk, wolfRed, field, stone, slate, wood, cream, fire, water, coal, canvas and olive. `K.sky` blends three five-stop skies (night, pre-dawn, day) by the light, and `K.light` gives that light from the clock: 0.12 fading to 0 over the first 50 minutes, 0 until first light, then rising to 1 at 08:30. The art picks steps from the ramps by light and noise. Do not mix free hexes into the picture.

### Named Rules
**The Brass Rule.** Brass means ready or chosen, amber means warning, red-orange means danger, green means good news. These hues carry state and nothing else, and state never travels by colour alone: a damage bar is a count of segments, a gauge is a length, the line ahead writes "wolves" or "gunboats", and the map gives every station, cut and guarded bridge a shape of its own.

**The Off-White Focus Rule.** Where a control can be chosen as well as focused (the pills and the switches), focus is an off-white ring and only "chosen" is brass. An ordinary button's focus is the same off-white border and 1px ring. Brass follows the focus only where focus *is* the choice: the menu row and the card that Enter will take.

## Typography

**Display Font:** Barlow Semi Condensed 500/600/700, self-hosted (falling back to Bahnschrift SemiCondensed, Arial Narrow and system-ui)
**Body Font:** Barlow Semi Condensed
**Label/Mono Font:** Pixelify Sans, self-hosted as one 400 to 700 variable file (falling back to ui-monospace), for numerals and keycaps only

**Character:** A condensed workhorse sans keeps words tight and readable over a dark picture. The pixel face sets the score, the clock and the paintings count, so the numbers you act on share the picture's grain. Inside the picture there are two more faces, both drawn a pixel at a time in `kit.js`: a 5 by 7 capitals face for station names, signs and map labels (`K.text5`, six pixels an advance, accents folded to plain capitals), and a 3 by 5 figures face for the dial numbers (`K.text3`). The 3 by 5 face has figures and nothing else: a letter set in it draws nothing, so every word in the picture, a unit included, is the 5 by 7 face.

### Hierarchy
- **Display** (display): the title mark only, "THE / PUMA EXPRESS", in uppercase with a soft text shadow over the night. "The" sits above at 0.48em, tracked 0.14em, in muted text.
- **Headline** (headline): sheet titles. The pause window raises this to 40px, the end-of-night banner on the HUD to 46px at weight 700, and the map's side panel drops it to 24px.
- **Title** (title): the night's score and a pause window's time and difficulty. The end of the night raises it to 40px, coloured by outcome (green won, muted abandoned, off-white otherwise); the pause window drops it to 19px. "A new best score" is 26px at weight 700 in brass.
- **Body** (body): sheet prose, capped at 72ch, with an 18px lede. Duc's report is 17px. Menu rows run at 19 to 20px at weight 500, toasts at 17px weight 600, and the HUD at 15px with a 1.2 line height.
- **Label** (label): uppercase labels beside data and section headings inside sheets, in muted text. Table heads track at 0.12em. In the top status bar the labels drop to 11px at 0.1em.
- **Numeral** (numeral): the score at 22px, the clock at 18px weight 400 and the paintings count at 16px in the status bar; score and figure columns in tables, with tabular figures. The Konami code's tag is 12px.
- **Key** (key): every keycap, at 13px in sheets and 12px on the HUD.

### Named Rules
**The Two Voices Rule.** Words are Barlow Semi Condensed, and numbers you act on and keys you press are Pixelify Sans. Never set prose in the pixel face, and never set the clock in the sans. Inside the picture, words are the 5 by 7 face, never a web font drawn onto the canvas.

## Layout

The play screen fills the window. `scaleK` in `js/main.js` takes k = window height / 360; when k is 1.5 or more it is rounded to the nearest whole number, and below that it is used as it is (never below 1). The canvas is then the window's width and height divided by k, rounded up, and `#stage` is that times k, so it can overhang the right and bottom edges by less than k pixels, which the page clips. A window 540 to 899 high gets k = 2 and a canvas 270 to 450 pixels high; 900 to 1259 gets k = 3 and 300 to 420; 1260 to 1619 gets k = 4 and 315 to 405. Between 480 and 539, k is the exact fraction and the canvas is 360 high, with uneven pixels. (`kit.js`'s header says "about 300 pixels high"; the code aims at 360.) The canvas is drawn whole every frame, and scaled with `image-rendering: pixelated`.

Each scene lays itself out inside that canvas. The cab is drawn for 640 by 360 and stretched to fit: across by the width over 640, held between 0.82 and 1.3, about the centre; down by the height over 360. The station is 480 by 300 units drawn about the middle at the smaller of height/300 and width/400 pixels a unit. The map keeps its own shape left of the side panel, its right edge at the larger of 62% of the width and the width less 230. The title's train is drawn at the window's height over 360, fifteen times that in pixels a metre.

The HUD sits above as DOM. A full-width status bar runs along the top: the score, the clock and "dawn in 6h30" on the left; the four view tabs at 236px from the left; the Boiler, Gear and Brakes damage bars, the paintings count, and the coal and water gauges on the right. The line ahead (a Field aid) is a centred strip hung from the bar's foot at 34px, square-topped, so it keeps above the cab's window rather than over it. Duc's words (two toasts at most), the control in hand and the key hint stack in the bottom centre, 14px up, 7px apart. The end banner stands at 40% height. On the map a side panel (230px) runs down the right, 52px from the top and as tall as what it holds. Pause and sound sit bottom right at 36px, 12px in. The whole HUD grows with the picture's pixels (`--hz`, set in `fit()` in `js/main.js`): 1 at k = 2, 1.15 at 3, 1.3 at 4 and up, never so far that the bar has under 1300 CSS pixels for its labels. (`js/hud.js`'s header still describes corner panels at top left and top right; the stylesheet's last block turns them into the bar and the strip, and that is what renders.)

The pause window stands right of centre (min(440px, 100%)), inset clamp(24px, 6vw, 96px) from the right, over a scene dimmed by a left-to-right gradient from 5% to 66%, so the cab stays visible. Sheets centre over a 72% dim with a 3px blur at min(820px, 100%), or min(1080px, 100%) for wide sheets, inside a 32px margin, with 24px side padding inside. The end of the night is the one sheet that stands aside: min(560px, 100%), right of centre like the pause window over the same left-to-right gradient, in one column, so the scene of the ending stays in view (an abandoned night has no scene, and its sheet centres as usual). Tabbed sheets hold a fixed height of min(600px, 100vh - 64px). The ask window (min(520px, 100%)) centres over a 60% dim, above any sheet. The title sets the mark, a subtitle and the menu panel (min(460px, 100%)) in a left column inset clamp(32px, 7vw, 120px), with the train behind it shaded from the left (84% at the edge to clear at 70%) and the credit at the bottom left. The spacing rhythm is 4/8/16/24/32, with 6, 10, 12, 14 and 22 inside dense panels.

Desktop only: below 760 by 480 a note replaces the game. The status bar folds by the width it has once the HUD has grown, not the window's (classes `hud-w1300`, `hud-w1160` and `hud-w1100` on the page, set in `fit()`): under 1300 it drops its damage labels, at 1160 and under the view tabs shrink to their keycaps, and at 1100 and under the dawn countdown and the line ahead's labels go. At a window 1100px wide and under, the new-game cards, the station report and the end of the night collapse to one column.

### Named Rules
**The Clear Window Rule.** Chrome holds the top edge and the foot. Nothing opaque covers the cab's window or its backhead during play, and windows over the scene stand to one side or over a dim, never over a blank page.

**The Whole Pixel Rule.** Every picture is drawn on whole pixels at the canvas's own size (`K.rect`, `K.px` and the rest round every coordinate, and image smoothing is off) and upscaled with `image-rendering: pixelated`, by a whole number whenever the window is 540 pixels high or more. Never smooth or mix resolutions. The two exceptions are radial-gradient glows: a lit station window, and the firebox's glow on the ballast under the title's train.

## Elevation & Depth

The picture has night light, not a sun. The land is lit by a cold ambient (0.34, 0.40, 0.56 at full dark) that warms toward day; the engine's lamp throws a warm beam up the line that falls off over 240 metres; distance fades into a haze that is the sky's own lowest colour; and `K.dim` pulls the ground toward stage black as the light goes. The cab and the station are relit pixel by pixel (`K.relight`): the cab by the gauge lamp, the driver's oil lamp and the fire, the station by three gas lanterns under the canopy. The cab is painted twice, by moon and lamp and by the open fire, and the fire-lit copy is laid over at 85% with a flicker when the firebox door is open, and at 6 to 14% by the grate when it is shut. The traced train takes a moonlit key light from the side (`Mo.LIGHT_NIGHT`), and its lamp and firebox are drawn as glowing, unshaded. The chrome is flat panels lifted by soft ambient shadows. They read as glass over the night, not as cards.

### Shadow Vocabulary
- **Sheet lift** (`box-shadow: 0 24px 70px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.04)`): sheets, the pause window and the ask window.
- **Title menu lift** (`box-shadow: 0 18px 50px rgba(0,0,0,.45)`): the title menu panel.
- **HUD lift** (`box-shadow: inset 0 1px 0 rgba(255,255,255,.035), 0 8px 22px rgba(0,0,0,.28)`): HUD panels and toasts.
- **Status bar drop** (`box-shadow: 0 4px 14px rgba(0,0,0,.35)`): the top status bar.
- **Focus ring** (`box-shadow: 0 0 0 1px #ece7dc`; primary and choice cards: `0 0 0 2px #0b1018, 0 0 0 4px #ece7dc`): the focused control.
- **Mark shadow** (`text-shadow: 0 4px 28px rgba(0,0,0,.45)`): the title mark; the subtitle takes `0 1px 10px rgba(6,10,16,.9)`.

### Named Rules
**The Night Light Rule.** Nothing in the picture casts a shadow. Depth comes from light falling off: moonlit ambient, a lamp's radius, the haze toward the horizon, and the dark outline round what stands in front. Never use a CSS drop shadow or a cast shadow on picture art.

## Shapes

Corners are small and consistent. The HUD's bar segments and gauges use 1px. The pill's square and a link's focus outline use a 2px pixel radius. Keycaps use 3px, with a heavier 2px bottom edge so they read as keys, and so does the Konami code's brass tag. Controls, inputs and Duc's face in a toast use 4px. HUD panels, choice cards, telegraph messages, Duc's face in the report and the corner buttons use 6px, and sheets, windows and the title menu use 8px. The status bar is square. Borders are 1px hairlines; the pill's square is 1.5px. In the picture, sprites carry a one-pixel dark outline and are built from pixels: letter maps (`K.map`), discs and strokes (`people.js`), shading a pixel at a time (`people2.js`), and the ray-traced model (`model.js`), never vector paths left smooth. Small indicators are drawn as pixel grids (the map legend's marks, drawn at 16 pixels and shown at 32) or as tiny inline SVG (back, close, pause, sound). There are no glyph-font icons.

## Components

### Buttons
Matte and quiet, lit only when focused.
- **Shape:** gently squared (control radius).
- **Default:** control-rest fill, edge-line border, off-white words at weight 600. Focus switches to control-lit with an off-white border and a 1px off-white ring. In sheets and on the title the pointer moves focus, so hover and focus are the same state.
- **Primary:** a lamp-brass fill with panel-ink words. Focus brightens it to brass lit with a double ring (page, then off-white).
- **Danger:** transparent, with a red-orange border at 70% and danger-text words. Focus fills it red-orange with panel-ink words and no ring.
- **Head:** the sheet's Back and Close: transparent, muted, 15px, with an inline SVG chevron or cross. Focus gives them the default button's face without the ring.
- **Disabled:** 45% opacity.

### Toggle Pills and Switches
- **Style:** transparent buttons led by a 10px square (pixel radius), outlined when off and filled brass when on. The "on" pill takes a 10% brass wash and a 60% brass border. Focus is the off-white ring on control-lit; an "on" pill keeps a 16% brass wash under it. Switches are pills at least 84px wide that read "On" or "Off".

### Menu Rows (title menu, pause window)
The signature selection device. Rows run edge to edge with no border: 50px on the title (a keycap on the left, muted metadata on the right) and 46px in the pause window. The focused row gets a brass wash fading left to right (`linear-gradient(90deg, rgba(242,193,78,.22), rgba(242,193,78,.05) 75%, rgba(242,193,78,0))`), lifts to #fffaf0 at weight 600, and shows a solid brass triangle: 7px at the left edge on the title, 9px at the right end in the pause window. On the title the focused row's keycap border turns brass, and Settings, Help and About sit in a 44px row of their own below a hairline. Title rows arrive one at a time (0.32s, 45ms stagger, slide in 8px from the left), which is skipped under reduced motion.

### Choice Cards (new game, practice, the telegraph)
Three difficulty or practice cards in a row, or the telegraph's four messages in a column. Each is a default button at panel radius with a keycap and a bold name over muted notes. The focused card fills brass with panel-ink words and the double ring, because it is the one Enter takes. The last difficulty played is only tagged ("last run", 12px uppercase), never lit.

### Keycaps
- **Style:** pixel face, off-white, 6% off-white fill, 28% off-white border with a 2px bottom edge, key radius. On the title, a menu row's keycap is muted until the row is focused. On a focused card the keycap goes transparent with a 35% ink border.

### Sheets / Containers
- **Corner Style:** sheet radius. **Background:** night-panel. **Border:** edge-line. **Shadow:** sheet lift.
- **Structure:** a head (title, plus Back or Close), optional tabs (muted, a 2px brass underline when selected, brass lit when focused, 22px apart), and a scrolling body padded 22px 24px 26px. Tables rule their rows with hairlines.
- **Pause window:** a 40px title, the time, difficulty, score, paintings and miles, the menu rows, and a key legend at the foot on 18% black.
- **Station report:** Duc's words with his face, and under them the line ahead: a crop of the map itself, drawn at the map's own size and shown at the play screen's scale, round the train, the next station and the bridge before it, so the telegraph's message is chosen with the map in view. The four messages stand beside them.
- **End of the night:** beside its scene (see Layout). The score, why it ended, and three of the paintings themselves at 64 by 48 shown at twice that, their titles in italic muted words under them: "Home tonight, among them" or "Still aboard". Then the rating, the tally, and the name for the table or the table.
- **Ask window:** a question before something that cannot be undone. Cancel is primary and holds the focus, so here the pointer lights what it is over by hover instead of taking the focus.

### HUD
- **Status bar:** the near-black gradient, a hairline at its foot, the status bar drop. Damage bars are ten segments (6 by 8, 2px gaps) at 13% off-white, lit solid off-white, amber at five and red-orange at eight. Coal and water are 54 by 8 gauges, amber at 40% and red-orange at 20%.
- **View tabs:** "1 Front gun", "2 Rear gun", "3 Cab", "4 Map". The view showing takes a 14% brass wash, a 45% brass border and a brass keycap border. A gun that is needed blinks red-orange (0.8s, two steps), steady at 30% under reduced motion. They hide during a station or bridge fight.
- **Panels:** hud-panel fill, an 8% border, panel radius, HUD lift. The line ahead's rows are inline, divided by hairlines, with the status word in brass, green or danger text. The control in hand names the control in brass, then its keys. The key hint is 75% off-white with hairline separators.
- **Toasts:** small panels stacked in the bottom centre, tinted by signal. Duc's carry his 40px face. Red toasts take the deep red fill.
- **Hurt and hit:** at 80% wear a red-orange vignette (rgba(160,30,10,.34)) pulses over the scene every 1.1s; a hit flashes rgba(255,70,30,.32) at the edges for 0.35s. Under reduced motion the vignette holds still and the flash is skipped.

### Inputs / Fields
- **Style:** night-page fill, edge-line border, control radius, 18px words. **Focus:** the border turns brass and there is no glow. Placeholder text is faint.

### The Cab Gauges (picture)
Four dials on the driver's board, each a brass bezel round a gauge-cream face that shades to #cfc3a2 at the rim, swept through 270 degrees: pressure to 300 psi with a red line from 240 (figured 0 to 3, in hundreds), speed to 80 mph (figured 0, 40, 80), the boiler's temperature to 500 with a red line from 450, and the vacuum brake. Ticks are #2a241c, turning #a52a18 past the red line, with figures in the 3 by 5 face; the needles are #151110. Every control and dial a newcomer is asked to read carries its name on a brass plate in the 5 by 7 face: STEAM, SPEED and HEAT under the three dials on the board, WATER, FIREBOX, COAL, THROTTLE, REVERSER and BRAKE by theirs, and the whistle's and the safety valve's pulls a tag hanging from the handle (WHISTLE, VALVE), lit where it hangs. The vacuum gauge stands over the brake and goes without. The cab's ambient rises with the light after first light, the cab painted again in four steps, so by day it is lit as the country through its window is. Beside them the water glass, and the points repeater: a brass box with a dark glass that shows the next junction's setting as a lamp-glow arrow when it is within 25 miles, and three lamps over it for the whistle blasts counted. The cursor lights the chosen control's four corners in lamp glow, with a paw on it, set beside the throttle and the brake rather than over their plates. Damage shows as steam weeping from the boiler's joints.

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
- **Do** keep chrome as flat dark translucent panels with 1px hairlines: HUD at 84%, sheets and menus at 94%.
- **Do** reserve brass for ready and chosen, amber for warning, red-orange for danger and green for good news, and pair each with a word, count, length or shape.
- **Do** set words in Barlow Semi Condensed and numbers and keys in Pixelify Sans.
- **Do** light only the focused control: brass where focus is the choice, an off-white ring everywhere else.

### Don't:
- **Don't** make green the "ready" colour. Ready and chosen are brass; green is only good news.
- **Don't** light a pill or switch in brass for being focused. Its focus is the off-white ring; brass means it is on.
- **Don't** cover the cab's window or backhead with chrome during play.
- **Don't** use glossy, bevelled or gradient-filled buttons, or cartoon gloss (PRODUCT.md: never a mobile game). The focused row's fading brass wash is the only gradient on a control; elsewhere gradients are only the dims and shades behind windows and the title, and the status bar.
- **Don't** cast shadows in the picture, or put a CSS drop shadow on picture art.
- **Don't** turn the scanlines on by default. They are a player's choice in Settings.
- **Don't** set prose in the pixel face or use a system display face for the title mark.
- **Don't** use glyph or emoji icons. Draw icons as pixel grids or small inline SVG.
