import type { GuideId, SourceLink } from '../types';

/*
 * Learn guides: general, textbook-level explanations that apply across drones.
 * Figures are publicly reported; where sources disagree, the text says so.
 */

export interface GuideTable {
  columns: string[];
  rows: string[][];
}

export interface GuideSection {
  title: string;
  body?: string;
  bullets?: string[];
  table?: GuideTable;
  note?: string;
}

export interface Guide {
  id: GuideId;
  title: string;
  intro: string;
  sections: GuideSection[];
  sources: SourceLink[];
}

export const GUIDES: Guide[] = [
  {
    id: 'materials',
    title: 'Airframe materials & radar',
    intro:
      'What a drone\'s frame is made of changes its weight, strength and cost, and also how it looks to radar. ' +
      'Here is how the common materials compare, and what really decides whether a drone is spotted.',
    sections: [
      {
        title: 'Common airframe materials',
        table: {
          columns: ['Material', 'Good at', 'Not so good at', 'How radar sees it', 'Examples'],
          rows: [
            [
              'Fibreglass (GFRP)',
              'Cheap, tough, easy to mould into smooth shapes',
              'Heavier and less stiff than carbon fibre',
              'Mostly see-through: radar domes (radomes) are made of it',
              'Shahed-136 shell: fibreglass with a honeycomb core',
            ],
            [
              'Carbon fibre (CFRP)',
              'Stiffest and lightest for its strength; does not rust',
              'Costs more; blocks radio, so antennas must sit outside the frame',
              'Conducts electricity, so it reflects radar: less than solid metal, and how much depends on fibre direction and radar frequency',
              'FPV quadcopter frames; Russian-built Geran-2 (fibreglass over woven carbon)',
            ],
            [
              'Aluminium',
              'Easy to machine; equally strong in every direction',
              'Denser than carbon fibre (2.7 vs ≈ 1.6 g/cm³); can fatigue with vibration',
              'Strong reflector, like all metals',
              'Load-bearing parts in some drones, e.g. the Shahed-107',
            ],
            [
              '3D-printed plastic (PLA, PETG, nylon)',
              'Quick to redesign; cheap to make in large numbers',
              'Weaker; PLA softens at ≈ 55–60 °C, PETG at ≈ 80 °C',
              'Mostly see-through',
              'Sting and P1-SUN interceptors',
            ],
            [
              'Foam (EPP, EPO, polystyrene)',
              'Very light; EPP survives crashes',
              'Weak and bulky; EPO can crease or crack',
              'Mostly see-through',
              'Gerbera decoy drones (foam skin)',
            ],
            [
              'Wood, plywood, cardboard',
              'Very cheap and easy to work',
              'Weak; affected by damp',
              'Weak reflector',
              'Gerbera plywood frame; SYPAQ Corvo cardboard drone',
            ],
          ],
        },
      },
      {
        title: 'Is a carbon-fibre drone invisible to radar?',
        body:
          'No. Carbon fibre conducts electricity, so radar waves bounce off it. It reflects less than solid metal ' +
          '(it is roughly a thousand times less conductive than copper), but tests have found that carbon-fibre ' +
          'drones show up on radar more than plastic or foam ones. The materials radar mostly "sees through" are ' +
          'fibreglass, Kevlar, plastics, foam and wood. That is why radar domes are made of fibreglass. Even ' +
          '"see-through" is only approximate: every boundary between materials reflects a little.',
        note:
          'A see-through frame does not hide what is inside. The engine or motors, the wiring and especially the ' +
          'battery still reflect radar.',
      },
      {
        title: 'Why small drones are hard to spot',
        bullets: [
          'They are small. A small quadcopter reflects about as much radar as a bird. One airport radar could not ' +
            'reliably track a DJI Phantom beyond about 500 m.',
          'They fly low, where hills, trees and buildings hide them and the ground creates radar "clutter".',
          'They are slow. Many radars are set to ignore slow, low targets so they are not swamped by birds and cars.',
          'On radar they can look like birds.',
        ],
      },
      {
        title: 'How drones are detected',
        bullets: [
          'Radar, including "micro-Doppler": spinning propellers leave a tell-tale pattern that helps tell drones from birds.',
          'Radio detectors, which listen for a drone\'s control and video signals.',
          'Cameras, both daytime and infrared. Engines, and especially jets, glow brightly on thermal cameras.',
          'Microphones. Ukraine\'s "Sky Fortress" network is reported to use thousands of acoustic sensors to hear drones like the Shahed.',
          'Most defence systems combine several of these, because each one has blind spots.',
        ],
      },
      {
        title: 'A trick in reverse: decoys',
        body:
          'Russia\'s Gerbera decoy drones are made of foam and plywood, which barely show up on radar. So they carry ' +
          'a special reflector (a Luneburg lens) that makes them look as big as a real Shahed. The aim is to waste ' +
          'the defenders\' missiles and interceptors.',
      },
    ],
    sources: [
      { title: 'Wikipedia: Radar cross section', url: 'https://en.wikipedia.org/wiki/Radar_cross_section' },
      { title: 'DragonPlate: Composite radar structures', url: 'https://dragonplate.com/composite-radar-structures' },
      { title: 'Semkin et al.: Analyzing radar cross section of drones (IEEE Access)', url: 'https://research.aalto.fi/files/42188619/Semkin_Analyzing_Radar_IEEEAccess.pdf' },
      { title: 'Airsight: Can radar detect drones?', url: 'https://www.airsight.com/blog/can-radar-detect-drones' },
      { title: 'Robin Radar: Counter-drone technologies', url: 'https://www.robinradar.com/resources/10-counter-drone-technologies-to-detect-and-stop-drones-today' },
      { title: 'United24: Sky Fortress acoustic detection', url: 'https://united24media.com/war-in-ukraine/sky-fortress-ukraines-acoustic-detection-system-that-tracks-drones-cheap-and-fast-9451' },
      { title: 'Wikipedia: Gerbera (drone)', url: 'https://en.wikipedia.org/wiki/Gerbera_(drone)' },
      { title: 'CSIS: From Shahed to Geran', url: 'https://www.csis.org/analysis/shahed-geran-how-russia-continues-reinvent-one-way-attack-drone' },
      { title: 'Oscar Liang: FPV drone frames', url: 'https://oscarliang.com/fpv-drone-frames/' },
    ],
  },
  {
    id: 'engines',
    title: 'Engines & propulsion',
    intro:
      'Drones use very different "engines" depending on how far and how fast they need to go: small petrol ' +
      'engines for long range, jets for speed, electric motors for agility, and rockets for a quick boost at launch.',
    sections: [
      {
        title: 'Piston engines: the "550 cc" and smaller classes',
        table: {
          columns: ['Engine', 'Used in', 'Type', 'Size', 'Power'],
          rows: [
            ['MD-550 (Iran)', 'Shahed-136 / Geran-2', '4-cylinder 2-stroke "boxer", air-cooled', '548 cc', '≈ 50 hp (37 kW)'],
            [
              'Limbach L550E (Germany)',
              'The design the MD-550 copies; Chinese-made L550Es reported in Russia\'s Garpiya drone',
              '4-cylinder 2-stroke boxer, air-cooled',
              '548 cc',
              '50 hp at 7,500 rpm; 16 kg dry',
            ],
            [
              'Russian MD-550 copies',
              'Geran-2',
              'Same basic design, reported without a starter or flywheel',
              '548 cc',
              'Reported to last 4–5 h, against ≈ 20 h for the Iranian engine',
            ],
            ['Serat-1 (Iran)', 'Shahed-131 / Geran-1', 'Wankel rotary', 'Not published', '≈ 38 hp'],
            ['DLE-111', 'Shahed-107', 'Twin-cylinder 2-stroke', '111 cc', '≈ 11 hp'],
            ['DLE-60', 'Gerbera decoys', 'Single-cylinder 2-stroke', '55.6 cc', '≈ 5.4 hp (4 kW)'],
          ],
        },
        note:
          '"cc" is cubic centimetres: the total volume the pistons sweep. The "550" in MD-550 comes from its ≈ 550 cc ' +
          'size. No other ≈ 500 cc engines for Shahed-type drones have been publicly documented. The Serat-1 is ' +
          'reported to descend from the British AR731, a 208 cc single-rotor engine.',
      },
      {
        title: 'Jet engines',
        body:
          'Jet-powered versions trade range and cost for speed. Iran\'s Shahed-238 is reported to use small ' +
          'turbojets (the Toloue-10/-13, described as copies of Czech PBS engines; a PBS TJ150 with 1,500 N of thrust ' +
          'was found in wreckage). Ukrainian intelligence says Russia\'s Geran-3 uses a Chinese Telefly JT80 turbojet ' +
          '(≈ 785 N thrust) and flies at 300–370 km/h, though some sources give 550–600 km/h. Jets are fast but burn ' +
          'fuel quickly, and their hot exhaust is easy to see on thermal cameras.',
      },
      {
        title: 'Electric motors',
        bullets: [
          'Interceptors and FPV drones use brushless motors: fixed coils, and a spinning bell of magnets. An ESC ' +
            '(speed controller) switches the current electronically, so there are no brushes to wear out; they are ' +
            'about 85–90% efficient.',
          'Size codes like "2207" describe the stator: 22 mm wide and 7 mm tall. The 2207 is the standard size for 5-inch quads.',
          '"KV" is how fast the motor spins per volt with no load: a 2,400 KV motor on 10 V spins at about 24,000 rpm. ' +
            'High KV suits small, fast propellers; low KV suits big ones.',
          'Batteries: LiPo packs can deliver very high currents, which suits racing and sprinting. Li-ion packs store ' +
            'about twice the energy for their weight but deliver less current, which suits long range.',
        ],
      },
      {
        title: 'Rocket boosters',
        body:
          'Some drones use a small solid-fuel rocket just for launch. The Shahed-136\'s booster is fitted under its ' +
          'body, fires for a few seconds (reported as about 2–3 s) and is then dropped. A planned Strila-2 ' +
          'interceptor is reported to add a booster for a faster climb. See the Launch tab on the Shahed-136.',
      },
      {
        title: 'Comparing the types',
        table: {
          columns: ['Type', 'Good at', 'Not so good at'],
          rows: [
            ['2-stroke piston', 'Lots of power for its weight; simple and cheap', 'Uses more fuel, loud (the Shahed\'s "moped" sound), vibrates, wears out sooner'],
            ['4-stroke piston', 'More fuel-efficient, smoother, lasts longer', 'Heavier for its power; more complex'],
            ['Wankel rotary', 'Very compact, smooth, powerful for its size', 'Uses more fuel; the rotor seals wear'],
            ['Turbojet', 'Very fast; lots of thrust for its weight', 'Burns fuel quickly (shorter range), expensive, hot exhaust shows on infrared'],
            ['Electric', 'Quiet, little heat, simple, responds instantly', 'Batteries hold far less energy than fuel (≈ 250–300 Wh/kg vs ≈ 12,000 Wh/kg for petrol), so short range'],
            ['Solid rocket', 'Huge thrust instantly', 'Burns for only seconds; used for launch boosts'],
          ],
        },
      },
    ],
    sources: [
      { title: 'Wikipedia: Limbach L550E', url: 'https://en.wikipedia.org/wiki/Limbach_L550E' },
      { title: 'Limbach L550E datasheet', url: 'https://pdf.aeroexpo.online/pdf/limbach-flugmotoren-gmbh-cokg/l-550e-datasheet/171388-2283.html' },
      { title: 'Iran Watch: The curious case of Limbach engines', url: 'https://www.iranwatch.org/our-publications/articles-reports/cats-out-bag-counterproliferation-lessons-curious-case-limbach-engines' },
      { title: 'Militarnyi: Russian Shahed engines worse', url: 'https://militarnyi.com/en/news/russian-shahed-engines-worse/' },
      { title: 'Wikipedia: Shahed 131', url: 'https://en.wikipedia.org/wiki/Shahed_131' },
      { title: 'CSIS Missile Threat: Shahed-238', url: 'https://missilethreat.csis.org/missile/shahed-238/' },
      { title: 'IISS: Russia\'s new jet-powered Gerans', url: 'https://www.iiss.org/online-analysis/missile-dialogue-initiative/2026/01/russias-new-jet-powered-gerans/' },
      { title: 'United24: Inside the Shahed-107', url: 'https://united24media.com/latest-news/inside-the-shahed-107-ukraine-unpacks-irans-newest-attack-drone-now-targeting-its-cities-13746' },
      { title: 'Oscar Liang: FPV motors explained', url: 'https://oscarliang.com/motors/' },
      { title: 'Oscar Liang: Li-ion batteries for long range', url: 'https://oscarliang.com/li-ion-battery-long-range/' },
    ],
  },
];

export const GUIDE_BY_ID = Object.fromEntries(GUIDES.map((g) => [g.id, g])) as Record<GuideId, Guide>;
