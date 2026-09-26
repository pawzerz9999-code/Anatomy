import type { DroneDef } from '../../types';

/**
 * Content is kept at encyclopedia / museum-exhibit level: what each part is and does,
 * with approximate figures that have been publicly reported. No internals of the
 * warhead, no construction or modification details.
 */
export const shahed136: DroneDef = {
  id: 'shahed-136',
  name: 'Shahed-136',
  aka: 'Geran-2 (Russian designation)',
  category: 'kamikaze',
  tagline: 'Long-range one-way attack drone ("kamikaze" drone)',
  overview:
    'The Shahed-136 is a one-way attack drone, often called a "kamikaze drone", designed in Iran by HESA. ' +
    'Instead of dropping bombs and flying home, the whole aircraft is the weapon: it flies a pre-planned route ' +
    'and crashes into its target. It became widely known after Russia began using it in Ukraine in 2022 under ' +
    'the name Geran-2. It is slow and loud (people compare its engine to a moped), but it is cheap compared with ' +
    'a cruise missile, so it can be launched in large numbers.',
  specs: [
    { label: 'Length', value: '≈ 3.5 m' },
    { label: 'Wingspan', value: '≈ 2.5 m' },
    { label: 'Launch weight', value: '≈ 200 kg' },
    { label: 'Top speed', value: '≈ 185 km/h' },
    { label: 'Engine', value: 'MD-550 piston engine, ≈ 50 hp' },
    { label: 'Range', value: 'Reported 1,000 – 2,500 km' },
    { label: 'Navigation', value: 'Satellite + inertial' },
    { label: 'Launch', value: 'Rocket booster from a ground rack' },
  ],
  sections: [
    {
      title: 'How it is launched',
      body:
        'Several drones sit on a rack mounted on a truck or trailer. A small rocket booster under the tail fires ' +
        'for a few seconds to throw the drone into the air, then falls away. From then on the piston engine and ' +
        'propeller keep it flying.',
    },
    {
      title: 'How it finds its way',
      body:
        'Before launch it is given a route and a target location. In flight, satellite navigation tells it where it ' +
        'is, and an inertial unit (motion sensors) keeps track of its movement between satellite fixes. The autopilot ' +
        'uses this to steer with the elevons.',
    },
    {
      title: 'How it is stopped',
      body:
        'Because it is slow and loud, defenders can hear and see it coming. It is shot down with anti-aircraft guns, ' +
        'mobile teams with heavy machine guns, surface-to-air missiles, electronic jamming, and more and more with ' +
        'interceptor drones: small fast drones that chase it down. Interceptors are coming next in this app.',
    },
    {
      title: 'Why it matters',
      body:
        'A Shahed costs far less than most missiles used to shoot it down. This "cost-exchange" problem is why so ' +
        'many countries are now building cheap interceptor drones.',
    },
  ],
  parts: [
    // ── Airframe ───────────────────────────────────────────────
    {
      id: 'nose-cone',
      name: 'Nose cone',
      system: 'airframe',
      skin: true,
      summary: 'The rounded tip at the very front.',
      details:
        'A smooth, rounded nose lets air slide around the body with little drag. Like the rest of the shell it is ' +
        'made of composite material: layers of glass fibre and resin that are light and easy to mould.',
      funFact: 'Composite shells are also used on gliders and boats because they do not rust and are easy to repair.',
      explode: [0.75, 0, 0],
    },
    {
      id: 'forward-fuselage',
      name: 'Forward fuselage',
      system: 'airframe',
      skin: true,
      summary: 'The front body section. It wraps around the warhead.',
      details:
        '"Fuselage" is the name for an aircraft\'s main body. The front section is a simple tube that carries the ' +
        'payload ahead of the wing, which helps keep the drone balanced.',
      explode: [0.3, 0.55, 0],
    },
    {
      id: 'center-fuselage',
      name: 'Center fuselage',
      system: 'airframe',
      skin: true,
      summary: 'The middle of the body, where the wing joins. Holds the fuel tank and electronics.',
      details:
        'This is the strongest part of the body: the wing attaches here, so it carries the lift forces. Inside are ' +
        'the fuel tank, the flight computer and the navigation equipment.',
      explode: [0, 0.75, 0],
    },
    {
      id: 'rear-fuselage',
      name: 'Rear fuselage (engine cowling)',
      system: 'airframe',
      skin: true,
      summary: 'The tapered tail section that covers the engine.',
      details:
        'The body narrows towards the back so air flows smoothly into the propeller. The cover over an engine is ' +
        'called a cowling; it also guides cooling air over the engine.',
      explode: [-0.3, 0.6, 0],
    },
    {
      id: 'wing',
      name: 'Delta wing',
      system: 'airframe',
      skin: true,
      summary: 'A triangle-shaped ("cropped delta") wing that creates lift.',
      details:
        'Delta wings are named after the Greek letter Δ. They are strong, simple to build and have a large area, ' +
        'which gives plenty of lift at low speed. Because the wing is so long from front to back, the drone does ' +
        'not need a separate tail: the elevons and wingtip fins do that job.',
      funFact: 'Famous delta-wing aircraft include Concorde and the Eurofighter Typhoon.',
      specs: [{ label: 'Span', value: '≈ 2.5 m' }],
      explode: [0, -0.55, 0],
    },
    {
      id: 'wingtip-fins',
      name: 'Wingtip fins',
      system: 'airframe',
      skin: true,
      summary: 'Vertical fins on both wingtips that keep it flying straight.',
      details:
        'They work like the feathers on an arrow: if the nose swings left or right, air pushes on the fins and ' +
        'straightens it out again. This is called directional (yaw) stability.',
      explode: [0, -0.55, 0],
    },

    // ── Propulsion ─────────────────────────────────────────────
    {
      id: 'engine',
      name: 'Piston engine',
      system: 'propulsion',
      inside: true,
      summary: 'A small four-cylinder petrol engine that turns the propeller.',
      details:
        'It is reported to be the MD-550, an Iranian copy of the German Limbach L550E, an engine made for light ' +
        'aircraft and target drones. It makes about 50 horsepower, similar to a small motorbike, and it is the ' +
        'reason the drone makes its loud buzzing sound.',
      funFact: 'Its four cylinders lie flat, two on each side. This "boxer" layout is also used in Porsche and Subaru cars.',
      specs: [
        { label: 'Type', value: '4-cylinder, 2-stroke boxer (reported)' },
        { label: 'Power', value: '≈ 37 kW (≈ 50 hp)' },
      ],
      explode: [-0.3, 0, 0],
    },
    {
      id: 'propeller',
      name: 'Pusher propeller',
      system: 'propulsion',
      summary: 'A two-blade propeller at the back that pushes the drone forward.',
      details:
        'A propeller is a spinning wing: each blade is shaped like a small wing that "lifts" forwards. Putting it ' +
        'at the back (a "pusher") keeps the front of the body free for the payload and gives the air a clean path ' +
        'over the wing.',
      explode: [-0.8, 0, 0],
    },
    {
      id: 'exhaust',
      name: 'Exhaust pipe',
      system: 'propulsion',
      summary: 'Carries hot gases from the engine out of the body.',
      details:
        'Burning petrol makes hot gases that have to leave the engine. The exhaust pipe leads them out under the ' +
        'body, away from the propeller.',
      explode: [-0.35, -0.2, -0.2],
    },
    {
      id: 'booster',
      name: 'Rocket launch booster',
      system: 'propulsion',
      summary: 'A small rocket that throws the drone into the air at launch, then drops off.',
      details:
        'The drone cannot take off from a runway on its own. For launch, a solid-fuel rocket is attached under ' +
        'the tail. It burns for only a few seconds, long enough to reach flying speed, then falls away. Engineers ' +
        'call this RATO: Rocket-Assisted Take-Off.',
      explode: [0.1, -0.75, 0],
    },

    // ── Fuel system ────────────────────────────────────────────
    {
      id: 'fuel-tank',
      name: 'Fuel tank',
      system: 'fuel',
      inside: true,
      summary: 'The main tank in the middle of the body. It holds petrol for the engine.',
      details:
        'The tank sits close to the drone\'s centre of gravity (its balance point). Fuel is the heaviest thing ' +
        'that changes during a flight; with the tank in the middle, the drone stays balanced as the fuel burns off.',
      funFact: 'Airliners do the same thing: they pump fuel between tanks to keep the plane balanced.',
      explode: [0, 0, 0],
    },
    {
      id: 'filler-cap',
      name: 'Filler cap',
      system: 'fuel',
      summary: 'Where the tank is filled up before launch.',
      details: 'A sealed cap on top of the body over the tank. The ground crew fill the tank through it and close it before launch.',
      explode: [0, 0.35, 0],
    },
    {
      id: 'fuel-filter',
      name: 'Fuel filter',
      system: 'fuel',
      inside: true,
      summary: 'Catches dirt so it cannot block the engine.',
      details:
        'Even tiny specks of dirt can block the narrow passages in an engine. The filter traps them before the ' +
        'fuel reaches the pump.',
      explode: [-0.1, -0.12, 0.2],
    },
    {
      id: 'fuel-pump',
      name: 'Fuel pump',
      system: 'fuel',
      inside: true,
      summary: 'Pushes fuel from the tank to the engine at a steady pressure.',
      details:
        'The engine needs a steady flow of fuel whether the drone is climbing, diving or turning. The pump ' +
        'provides that, so the engine does not stutter.',
      explode: [-0.18, -0.14, 0.25],
    },
    {
      id: 'fuel-lines',
      name: 'Fuel lines',
      system: 'fuel',
      inside: true,
      summary: 'Thin tubes that carry fuel from the tank, through the filter and pump, to the engine.',
      details:
        'Follow the glowing flow in X-ray mode: fuel leaves the tank, is cleaned by the filter, pressurised by ' +
        'the pump and then delivered to the engine, where it is burned to turn the propeller.',
      explode: [-0.1, -0.12, 0.2],
    },

    // ── Flight control ─────────────────────────────────────────
    {
      id: 'elevons',
      name: 'Elevons',
      system: 'flight-control',
      summary: 'Hinged flaps on the back edge of the wing that steer the drone.',
      details:
        'Elevon = ELEVator + ailerON. When both flaps tilt up together, the nose goes up (climb). When they tilt ' +
        'in opposite directions, the drone rolls to turn. Two moving parts do the job of a whole tail.',
      explode: [-0.2, -0.55, 0],
    },
    {
      id: 'servos',
      name: 'Servo actuators',
      system: 'flight-control',
      inside: true,
      summary: 'Small electric motors inside the wing that move the elevons.',
      details:
        'A servo is a motor that turns to an exact angle when told to. The flight computer sends a command, and ' +
        'the servos push the elevons to the right position many times per second.',
      explode: [0, -0.32, 0],
    },
    {
      id: 'flight-computer',
      name: 'Flight computer (autopilot)',
      system: 'flight-control',
      inside: true,
      summary: 'The drone\'s "brain". It flies the planned route by itself.',
      details:
        'It constantly compares where the drone is with where it should be, then moves the elevons and adjusts ' +
        'the engine to correct the difference. Nobody steers it with a joystick during the flight.',
      explode: [0.15, 0.22, 0.25],
    },

    // ── Navigation ─────────────────────────────────────────────
    {
      id: 'gnss-antenna',
      name: 'Satellite navigation antenna',
      system: 'navigation',
      summary: 'Receives signals from navigation satellites (like GPS) to find its position.',
      details:
        'Satellite navigation works like the maps app on your phone: the receiver measures signals from several ' +
        'satellites and works out its position from them. Later versions were reported to carry antennas that ' +
        'are harder to jam.',
      funFact: 'GPS (USA), GLONASS (Russia), Galileo (Europe) and BeiDou (China) are all satellite navigation systems.',
      explode: [0, 1.1, 0],
    },
    {
      id: 'ins',
      name: 'Inertial navigation unit',
      system: 'navigation',
      inside: true,
      summary: 'Motion sensors that track movement without any outside signal.',
      details:
        'Gyroscopes sense turning and accelerometers sense speeding up or slowing down. By adding up every ' +
        'movement, the unit estimates where the drone has gone. Small errors build up over time, so it is ' +
        'combined with satellite navigation.',
      funFact: 'Your phone has tiny versions of these sensors. They are what rotate the screen when you turn it.',
      explode: [0.22, -0.1, 0.35],
    },

    // ── Power ──────────────────────────────────────────────────
    {
      id: 'generator',
      name: 'Generator',
      system: 'power',
      inside: true,
      summary: 'Turned by the engine, it makes electricity for the electronics in flight.',
      details:
        'Just like the alternator in a car, the generator turns some of the engine\'s spinning motion into ' +
        'electricity for the flight computer, servos and navigation equipment.',
      explode: [-0.12, 0.18, 0],
    },
    {
      id: 'battery',
      name: 'Battery',
      system: 'power',
      inside: true,
      summary: 'Powers the electronics before the engine starts and backs up the generator.',
      details:
        'Before launch the engine is not yet running, so a battery keeps the computer and navigation alive. ' +
        'In flight it acts as a buffer if the generator\'s output dips.',
      explode: [0.1, -0.15, -0.3],
    },

    // ── Payload ────────────────────────────────────────────────
    {
      id: 'warhead',
      name: 'Warhead section',
      system: 'payload',
      inside: true,
      summary: 'The explosive payload in the front of the body. It is what makes this a "kamikaze" drone.',
      details:
        'Unlike drones that drop bombs and fly home, a one-way attack drone carries its explosive inside and is ' +
        'destroyed together with its target. The warhead is reported to weigh roughly 40–50 kg. This app shows ' +
        'it only as a simple block and does not show what is inside.',
      specs: [{ label: 'Reported mass', value: '≈ 40–50 kg' }],
      explode: [0.4, 0, 0],
    },
  ],
  model: { kind: 'procedural' },
  sketchfab: {
    modelId: 'e09fba235055433ba7bb7fb5a0d4da87',
    title: 'HESA Shahed 136 3D CAD Model',
    author: 'nitroexpress',
    authorUrl: 'https://sketchfab.com/Bullet3D',
    url: 'https://sketchfab.com/3d-models/hesa-shahed-136-3d-cad-model-e09fba235055433ba7bb7fb5a0d4da87',
  },
};
