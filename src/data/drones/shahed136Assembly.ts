import type { AssemblyDef } from '../../types';

/**
 * The Shahed-136 factory view. The station order is simplified for teaching: inner
 * parts first so you can watch them go in, then the shell closes over them. It is not
 * a real factory's process, and (like the rest of the app) has no construction detail.
 * Production figures are publicly reported estimates, marked as such.
 */
export const shahed136Assembly: AssemblyDef = {
  stations: [
    {
      title: 'Wing',
      body: 'The one-piece delta wing is the drone\'s backbone. Each half holds a fuel tank and the small servos that will move the control surfaces.',
      parts: ['servos', 'wing-tanks', 'wing'],
    },
    {
      title: 'Fuel system',
      body: 'The body tank sits in the middle, where the weight of the fuel keeps the drone balanced. Lines link it to the wing tanks and, through the filter and pump, to the engine.',
      parts: ['fuel-tank', 'fuel-lines', 'fuel-filter', 'fuel-pump'],
    },
    {
      title: 'Engine',
      body: 'The small piston engine goes in at the back, with its built-in generator and the electronics that run it.',
      parts: ['engine', 'generator', 'engine-electronics'],
    },
    {
      title: 'Electronics',
      body: 'The flight computer, battery and power distribution unit fill the bay behind the nose. The inertial unit sits mid-body on its shock mounts.',
      parts: ['ins', 'flight-computer', 'battery', 'pdu'],
    },
    {
      title: 'Payload',
      body: 'The payload section goes in the nose. As everywhere in this app, it is shown only as a plain block.',
      parts: ['warhead'],
    },
    {
      title: 'Body shell',
      body: 'The composite body sections slide on and close around everything inside, and the rounded cap goes on the nose.',
      parts: ['rear-fuselage', 'center-fuselage', 'forward-fuselage', 'nose-cone'],
    },
    {
      title: 'Fins and controls',
      body: 'The wingtip fins, rudders and elevons go on, plus the satellite antenna on the wing, the filler cap and the exhaust.',
      parts: ['wingtip-fins', 'rudders', 'elevons', 'gnss-antenna', 'filler-cap', 'exhaust'],
    },
    {
      title: 'Propeller',
      body: 'Last of all, the two-blade pusher propeller goes on the back of the engine.',
      parts: ['propeller'],
    },
  ],
  // The body sections are tubes: they slide on along the body, over the parts inside.
  approach: {
    warhead: [1.4, 0, 0],
    'rear-fuselage': [-2, 0, 0],
    'center-fuselage': [2.4, 0, 0],
    'forward-fuselage': [1.7, 0, 0],
    'nose-cone': [1.2, 0, 0],
    rudders: [-0.6, 0, 0],
    elevons: [-0.7, 0, 0],
    exhaust: [-0.8, 0, 0],
    propeller: [-1.1, 0, 0],
  },
  check: 'A scan passes over the finished drone, lighting up each system in its colour, and the propeller is run up.',
  rollout: 'The finished drone moves down the line to join the others, and the next one starts straight away.',
  notFitted: [
    { id: 'booster', note: 'It is only fitted for launch, so it is not part of this build.' },
  ],
  stats: [
    { label: 'Made each month', value: '≈ 2,700', note: 'Shahed-type attack drones made in Russia: Ukrainian military intelligence estimate, 2025' },
    { label: 'Made each day', value: '≈ 90', note: '2,700 spread evenly over a 30-day month' },
    { label: 'One finished every', value: '≈ 16 min', note: 'Russia-wide, day and night. Many lines work at once, so each one takes far longer to build' },
  ],
  facts: [
    {
      title: 'Where it is made',
      body:
        'It was designed in Iran by Shahed Aviation Industries and is built there together with the state aircraft ' +
        'maker HESA. Russia first used drones supplied by Iran, then bought what amounted to a franchise to build its ' +
        'own copy, the Geran-2, at a plant in the Alabuga special economic zone in Tatarstan. Leaked documents reported ' +
        'by the Washington Post in 2023 described a plan to make 6,000 there by the summer of 2025. Russia now builds ' +
        'them largely by itself.',
    },
    {
      title: 'How it can be made so fast',
      body:
        'Like cars, the drones are built on assembly lines: many are built at once, and each station fits the same few ' +
        'parts again and again. The design is also simple and uses cheap materials. In 2025 ' +
        'Ukrainian military intelligence estimated that Russia was making about 2,700 Shahed-type attack drones a month, ' +
        'plus about 2,500 cheaper look-alike decoys used to overload air defences.',
    },
    {
      title: 'Inside the factory',
      body:
        'In July 2025 the Russian Defence Ministry\'s TV channel showed footage from inside the Alabuga plant: long ' +
        'assembly lines and hundreds of finished drones in rows. Reporters noted that many of the workers were teenagers ' +
        'from local technical colleges, recruited through a student programme.',
    },
  ],
  sources: [
    {
      title: 'Kyiv Independent: Russia can produce up to 2,700 Shahed-type drones per month, intelligence says',
      url: 'https://kyivindependent.com/russia-can-produce-up-to-2-700-shahed-type-drones-per-month-intelligence-says/',
    },
    {
      title: 'European Pravda: Washington Post received evidence of Iran-Russia collaboration in manufacturing Shahed drones',
      url: 'https://www.eurointegration.com.ua/eng/news/2023/08/17/7167755/',
    },
    {
      title: 'CNN: Russia built a massive drone factory to pump out Iranian-designed drones',
      url: 'https://www.cnn.com/2025/08/08/europe/russia-drone-factory-iran-intl',
    },
    {
      title: 'CBC News: Russia touts strike drones made in factory on TV, where teens appear to be working on them',
      url: 'https://www.cbc.ca/news/world/russia-army-tv-channel-drone-factory-1.7591284',
    },
  ],
};
