# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Desktop players of all kinds, new players first: people who never played *The Train: Escape to Normandy* should find The Puma Express inviting, and fans of the 1987 original should still recognise it. They play with a keyboard (or a gamepad) on a computer, in sessions of a night or a practice fight or two; phone play is out of scope.

## Product Purpose

A remake of Accolade's *The Train: Escape to Normandy* (C64, 1987) where the Resistance are pumas and the occupiers the Wolf Empire: take a train of looted paintings in the yards at Velmont and run it west to Port Clair on the free coast before dawn. The engine is driven by hand from the cab (fire, pressure, water, throttle, reverser, brake, the whistle that sets the points), and the night is fought in 1987's three set pieces: a held station, where you cover Duc to the points lever and back; a guarded bridge, where you lay a cannon on gunboats by bearing and range; and air raids, met by the front and rear guns. Stations of ours give coal, water, Duc's report and one telegraph message. Three difficulties, practice fights and the best ten scores. Success is a player who brings the train in, or loses it at dawn a few miles short, and wants another night.

## Positioning

The 1987 game's whole design (the steam engine run by hand, the whistled points, the three fights, the telegraph's four messages, dawn at 08:00), rebuilt faithfully as its own game rather than an emulation, on a line and towns of its own. Classic plays as 1987 did; Field adds modern aids.

## Operating Context

Part of the greykit.games portfolio, served at greykit.com/games/pumaexpress. It opens on the shared greykit boot screen; everything after the boot is the game's own. Saves live in this browser only.

## Capabilities and Constraints

- Gameplay, rules, the line, balance and the engine (`js/engine/`) stay as they are; a visual rethink changes rendering, art, HUD and screens only.
- Everything visual is open to change: menus, HUD, the cab, the scenes, effects and resolution.
- Plain scripts, no build step, nothing fetched at play time: every picture is drawn and every sound synthesised in the page.
- The engine is DOM-free and deterministic from a seed, so `tools/sim-check.js` can drive it headless and replay a night step for step.
- Desktop only; small screens get a note instead of the game.
- Keyboard first, gamepad supported; the mouse is a Field aid.
- The greykit boot screen (canon) stays; games-meta STANDARD.md rules still apply (credit, Forget everything, menu keys, Settings order, sound).

## Brand Commitments

- The name The Puma Express. The Resistance are pumas, Duc the old driver among them; the occupiers are the Wolf Empire, wolves in peaked caps with a red band.
- It is a night game: the whole run is in the dark, lit by the moon, the lamp, lit windows and the firebox, and daylight is how it is lost.
- It must not look like a mobile game (no glossy buttons, cartoon gloss, free-to-play energy).
- It must not be too serious or grim: the drivers are pumas, and the game keeps some wit.
- Retro is welcome, but not "too retro for modern audiences", and it must not look like it is running in an emulator.

## Evidence on Hand

Every number the game runs on, and which are 1987's, is in `js/engine/const.js`; the line, its towns, rivers and junctions in `js/engine/route.js`; the help, the station report, the telegraph and the end-of-night words in `js/screens.js`; the aids and their notes in `js/store.js`; what Duc says in `js/main.js`. No Accolade code, art, sound or text may be used; the reference disks are gitignored.

## Product Principles

1. The game first: graphics serve reading the gauges, the line and the fight.
2. Faithful in play, free in look.
3. Inviting to newcomers without hiding the original's depth: Classic is there, one switch away.
4. Wit over grimness: pumas running a steam train past the wolves is a little funny, and that is fine.

## Accessibility & Inclusion

Keyboard-complete play and menus; text contrast at WCAG AA; nothing essential conveyed by colour alone; respects reduced motion (screen shake starts off, nothing on the HUD blinks).
