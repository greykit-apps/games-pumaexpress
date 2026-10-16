/* The Puma Express -- every number the game runs on, in one place.
 *
 * Where the 1987 game's own number is known (C64-Wiki, the disk's strings)
 * it is used and said so. Everything else is ours, marked UNCERTAIN until
 * real play has tuned it. The engine steps fifty times a real second; one
 * step is C.MIN_PER_STEP of the night's clock. */
"use strict";
(() => {
  const C = PX.C = {};
  C.HZ = 50;                       /* steps a real second */
  C.DT = 1 / C.HZ;                 /* a step, in real seconds */
  C.MIN_PER_STEP = 0.01;           /* UNCERTAIN: half a minute of the night every real second */
  C.HOURS_PER_STEP = C.MIN_PER_STEP / 60;

  /* the night: the train is taken late in the evening (later, the harder); the 1987 game ended at dawn, 08:00 */
  C.START = 21 * 60;
  C.DAWN = 32 * 60;                /* 08:00 the next morning, counted on from midnight before */
  C.FIRST_LIGHT = 29 * 60 + 30;    /* the sky begins to pale */

  /* ---- the engine: a steam locomotive and its fire ---- */
  C.LOCO = {
    grateMax: 12,          /* shovelfuls the grate holds */
    burn: 0.11,            /* shovelfuls a second, burnt on a good draught */
    shovelGap: 0.55,       /* seconds between shovelfuls */
    heat: 7.0,             /* degrees F a second from a full, closed fire */
    doorLoss: 0.45,        /* an open door lets cold air over the fire */
    cool: 0.0042,          /* the boiler's loss to the night air */
    useHeat: 2.6,          /* degrees a second the cylinders take at full throttle and speed */
    valve: 14,             /* degrees a second the safety valve blows off */
    whistle: 0.9,          /* degrees one blast of the whistle costs */
    tempMin: 60, tempMax: 480,
    /* pressure from the water's temperature, near enough: none at boiling */
    psi: T => Math.max(0, (T - 212) * 1.32),
    work: 200,             /* working pressure */
    red: 240,              /* the gauge's red line */
    hurt: 262,             /* past this the boiler is damaged */
    burst: 292,            /* and past this it goes */
    pull: 1.7,             /* mph a second at full throttle and working pressure, from rest */
    vmax: 66,              /* the pull falls off toward this */
    drag: 0.004, drag2: 0.00024,
    grade: 0.14,           /* mph a second per percent of grade */
    brake: 5.5,            /* mph a second, the brake hard on */
    water: 100, coal: 100,
    waterUse: 0.05,        /* units of water per degree of steam used */
    revDamage: 9,          /* the reverser thrown while she rolls: damage to the motion (1987: "never") */
  };
  /* the points: diverging over this is rough, over that it is off the rails (UNCERTAIN) */
  C.POINTS = { rough: 30, derail: 46, buffer: 7 };
  C.STATION_ZONE = 0.45;    /* miles either side of the station: the platform */
  C.SET_PIECE_AT = 1.4;     /* miles out, a held station or a guarded bridge stops the train */
  C.SERVICE_MIN = 15;       /* minutes to coal, water and read the report */
  C.REPAIR_MIN = 40;        /* minutes the Resistance's fitters take */
  C.TASK_SLACK = 50;        /* minutes beyond the run at 30 mph the Resistance can hold a place */

  /* ---- damage: four parts, 0 sound to 100 gone ---- */
  C.PARTS = [["boiler", "Boiler"], ["motion", "Running gear"], ["brakes", "Brakes"], ["cars", "Art wagons"]];
  C.WAGONS = 4;
  C.PAINTINGS = 12;          /* in each wagon */

  /* ---- the three set pieces ---- */
  C.STATION = {
    w: 480, h: 300,          /* the scene, in its own pixels */
    ducFrom: 92, lever: 404, ducSpeed: 46, throwT: 1.4,
    cover: 0.35,             /* seconds a burst of fire covers Duc for */
    rof: 0.11,               /* seconds between shots */
    upT: 0.28,
  };
  C.AIR = {
    rof: 0.075, spread: 0.012,
    planeR: 6.5,             /* a fighter's half-span, in metres */
    camY: 4.6,
    yawMax: 0.62, pitchMin: -0.12, pitchMax: 0.72,
    aimRate: 1.25,           /* radians a second, on the keys */
  };
  C.BRIDGE = {
    bearMax: 34, bearRate: 16,          /* degrees, degrees a second */
    rangeMin: 250, rangeMax: 1500, rangeRate: 330,
    shellV: 620, reload: 2.1,
    hitBear: 2.4, hitRange: 46,
  };

  /* ---- how hard (the 1987 names) ---- */
  C.DIFF = [
    { name: "Easy", note: "Fewer wolves at the stations, two gunboat crossings, the odd fighter. Plenty of night left.", held: 0.3, guarded: 2, cuts: 1, guards: 8, active: 2, aimT: [1.9, 2.6], wolfHit: 0.22, planes: [2, 3], raidGap: [150, 210], planeHit: 0.18, boats: 3, boatGap: [6.5, 9], boatHit: 0.2, dmg: 0.7, start: C.START + 30 },
    { name: "Intermediate", note: "Half the line in wolf hands, three bridges watched, fighters through the night.", held: 0.5, guarded: 3, cuts: 2, guards: 13, active: 3, aimT: [1.4, 2.1], wolfHit: 0.3, planes: [2, 4], raidGap: [110, 170], planeHit: 0.24, boats: 4, boatGap: [5, 7.5], boatHit: 0.26, dmg: 1, start: C.START + 90 },
    { name: "Expert", note: "Most stations held, four bridges watched, the line cut in three places. The night is short.", held: 0.68, guarded: 4, cuts: 3, guards: 19, active: 4, aimT: [1.05, 1.6], wolfHit: 0.36, planes: [3, 5], raidGap: [80, 130], planeHit: 0.3, boats: 4, boatGap: [3.8, 6], boatHit: 0.32, dmg: 1.25, start: C.START + 135 },
  ];

  /* ---- the score: 1987's numbers where known ---- */
  C.SCORE = { guard: 50, boat: 250, plane: 500, painting: 50, station: 0 };
  C.RANKS = [[0, "Stoker"], [3000, "Fireman"], [7000, "Driver"], [12000, "Engineer"], [18000, "Master of the line"], [25000, "Legend of the Resistance"]];
  C.rankFor = s => { let r = C.RANKS[0][1]; for (const [at, n] of C.RANKS) if (s >= at) r = n; return r; };
})();
