import type { DroneDef } from '../../types';

/**
 * Content is kept at encyclopedia / museum-exhibit level: what each part is and does,
 * with approximate figures that have been publicly reported. No internals of the
 * warhead, no construction or modification details.
 *
 * The model shows the original Iranian Shahed-136 layout. Russian Geran-2 changes are
 * described in `variants`. Parts whose exact design is not public are marked `typical`.
 */
export const shahed136: DroneDef = {
  id: 'shahed-136',
  name: 'Shahed-136',
  aka: 'Geran-2 (Russian-built version)',
  category: 'kamikaze',
  tagline: 'Long-range one-way attack drone ("kamikaze" drone)',
  overview:
    'The Shahed-136 is a one-way attack drone, often called a "kamikaze drone". It was designed in Iran by Shahed ' +
    'Aviation Industries and is produced together with the state aircraft maker HESA. Instead of dropping bombs and ' +
    'flying home, the whole aircraft is the weapon: it flies a pre-planned route and crashes into its target. It ' +
    'became widely known after Russia began using it in Ukraine in 2022 under the name Geran-2. It is slow and loud ' +
    '(people compare its engine to a moped), but it is cheap compared with a cruise missile, so it can be launched ' +
    'in large numbers. This model shows the original Iranian design.',
  specs: [
    { label: 'Length', value: '≈ 3.5 m' },
    { label: 'Wingspan', value: '≈ 2.5 m' },
    { label: 'Launch weight', value: '≈ 200 kg' },
    { label: 'Top speed', value: '≈ 185 km/h' },
    { label: 'Engine', value: 'MD-550 piston engine, ≈ 50 hp' },
    { label: 'Fuel', value: '3 tanks: one in each wing + one in the body' },
    { label: 'Range', value: 'Claimed up to 2,500 km' },
    { label: 'Warhead', value: '≈ 50 kg (later versions up to ≈ 90 kg)' },
    { label: 'Navigation', value: 'Satellite + inertial' },
    { label: 'Launch', value: 'Rocket booster from a truck rack (often 5 drones)' },
  ],
  sections: [
    {
      title: 'How it is launched',
      body:
        'The drones sit on a rack on the back of a truck, often five at a time. A small rocket booster under the ' +
        'body fires for a few seconds to throw the drone into the air, then falls away. From then on the piston ' +
        'engine and propeller keep it flying.',
    },
    {
      title: 'How it finds its way',
      body:
        'Before launch it is given a route and a target location. In flight, satellite navigation tells it where it ' +
        'is, and an inertial unit (motion sensors) keeps track of its movement between satellite fixes. The autopilot ' +
        'uses this to steer with the elevons and rudders.',
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
  variants: {
    title: 'How the Russian Geran-2 differs',
    body:
      'Russia builds its own version, the Geran-2, and keeps changing it. Reported differences include: a matte-black ' +
      'finish for night attacks; on some builds, the fuel moved out of the wings and into the body, so a hit on a ' +
      'wing is less likely to cause a leak; heavier warheads (up to about 90 kg) with a smaller fuel tank and shorter ' +
      'range; jam-resistant satellite antennas (such as "Kometa") on top of the nose; and, from 2025, the flight ' +
      'electronics moved from the nose bay to the tail. There is also a jet-powered version, the Geran-3.',
  },
  sources: [
    { title: 'Wikipedia: HESA Shahed 136', url: 'https://en.wikipedia.org/wiki/HESA_Shahed_136' },
    { title: 'Open Source Munitions Portal: Shahed-131 & -136 visual guide', url: 'https://osmp.ngo/collection/shahed-131-136-uavs-a-visual-guide/' },
    { title: 'CSIS: From Shahed to Geran', url: 'https://www.csis.org/analysis/shahed-geran-how-russia-continues-reinvent-one-way-attack-drone' },
    { title: 'Covert Shores: Guide to Russian Shahed / Geran drones', url: 'https://www.hisutton.com/Russian-Geran-Shahed-Drones.html' },
    { title: 'Geran-2 / Shahed-136 hardware analysis (S. Nikolaj)', url: 'https://snikolaj.com/2026/05/03/geran-2-shahed-136-drone-hardware-analysis/' },
    { title: 'GlobalSecurity: Shahed-136 / Geran-2', url: 'https://www.globalsecurity.org/military/world/iran/shahed-136.htm' },
    { title: 'Military Factory: HESA Shahed-136', url: 'https://www.militaryfactory.com/aircraft/detail.php?aircraft_id=2520' },
    { title: 'Army Technology: Shahed-136', url: 'https://www.army-technology.com/projects/shahed-136-kamikaze-uav-iran/' },
  ],
  parts: [
    // ── Airframe ───────────────────────────────────────────────
    {
      id: 'nose-cone',
      madeOf: 'Fibreglass composite with a lightweight honeycomb filler (Russian-built Geran-2s examined in 2023 used fibreglass over woven carbon fibre instead)',
      name: 'Nose cone',
      system: 'airframe',
      skin: true,
      evidence: 'reported',
      summary: 'The rounded cap at the very front, just ahead of the warhead.',
      details:
        'A smooth, rounded nose lets air slide around the body with little drag. Like the rest of the shell it is ' +
        'made of composite material: glass fibre with a lightweight honeycomb filler inside, which is light but stiff.',
      funFact: 'Honeycomb panels are also used in airliner floors and racing cars: very stiff for their weight.',
      explode: [0.75, 0, 0],
    },
    {
      id: 'forward-fuselage',
      madeOf: 'Fibreglass composite with a lightweight honeycomb filler (Russian-built Geran-2s examined in 2023 used fibreglass over woven carbon fibre instead)',
      name: 'Forward fuselage',
      system: 'airframe',
      skin: true,
      evidence: 'reported',
      summary: 'The front body section. It wraps around the warhead and the electronics bay behind it.',
      details:
        '"Fuselage" is the name for an aircraft\'s main body. The front section is a simple tube that carries the ' +
        'payload ahead of the wing, which helps keep the drone balanced.',
      explode: [0.3, 0.55, 0],
    },
    {
      id: 'center-fuselage',
      madeOf: 'Fibreglass composite with a lightweight honeycomb filler (Russian-built Geran-2s examined in 2023 used fibreglass over woven carbon fibre instead)',
      name: 'Center fuselage',
      system: 'airframe',
      skin: true,
      evidence: 'reported',
      summary: 'The middle of the body, where the wings join. Holds the body fuel tank and the navigation unit.',
      details:
        'This is the strongest part of the body: the wings attach here, so it carries the lift forces. Inside are ' +
        'the body fuel tank and the inertial navigation unit.',
      explode: [0, 0.75, 0],
    },
    {
      id: 'rear-fuselage',
      madeOf: 'Fibreglass composite with a lightweight honeycomb filler (Russian-built Geran-2s examined in 2023 used fibreglass over woven carbon fibre instead)',
      name: 'Rear fuselage (engine cowling)',
      system: 'airframe',
      skin: true,
      evidence: 'reported',
      summary: 'The tapered tail section that covers the engine.',
      details:
        'The body narrows towards the back so air flows smoothly into the propeller. The cover over an engine is ' +
        'called a cowling; it also guides cooling air over the engine.',
      explode: [-0.3, 0.6, 0],
    },
    {
      id: 'wing',
      madeOf: 'Fibreglass with honeycomb filler; Russian-built versions reported with woven carbon fibre under the fibreglass',
      name: 'Delta wing',
      system: 'airframe',
      skin: true,
      evidence: 'reported',
      summary: 'A triangle-shaped ("cropped delta") wing that creates lift and holds fuel.',
      details:
        'Delta wings are named after the Greek letter Δ. They are strong, simple to build and have a large area, ' +
        'which gives plenty of lift at low speed. The wing is thickest where it meets the body, leaving room for ' +
        'the wing fuel tanks. Because it is so long from front to back, the drone does not need a separate tail: ' +
        'the elevons and the wingtip fins with their rudders do that job.',
      funFact: 'Famous delta-wing aircraft include Concorde and the Eurofighter Typhoon.',
      specs: [{ label: 'Span', value: '≈ 2.5 m' }],
      explode: [0, -0.55, 0],
    },
    {
      id: 'wingtip-fins',
      madeOf: 'Fibreglass composite, like the wing',
      name: 'Wingtip fins',
      system: 'airframe',
      skin: true,
      evidence: 'reported',
      summary: 'Vertical fins on both wingtips, sticking up and down, that keep it flying straight.',
      details:
        'They work like the feathers on an arrow: if the nose swings left or right, air pushes on the fins and ' +
        'straightens it out again. This is called directional (yaw) stability. The back part of each fin is a ' +
        'movable rudder. Fins that reach both above and below the wing are one way to tell a Shahed-136 from the ' +
        'smaller Shahed-131.',
      explode: [0, -0.55, 0],
    },

    // ── Propulsion ─────────────────────────────────────────────
    {
      id: 'engine',
      name: 'Piston engine',
      system: 'propulsion',
      inside: true,
      evidence: 'reported',
      summary: 'A small four-cylinder petrol engine at the tail that turns the propeller.',
      details:
        'It is reported to be the MD-550, an Iranian copy of the German Limbach L550E, an engine made for light ' +
        'aircraft and target drones. It makes about 50 horsepower, similar to a small motorbike, and it is the ' +
        'reason the drone makes its loud buzzing sound. It is air-cooled, so it needs no radiator.',
      funFact: 'Its four cylinders lie flat, two on each side. This "boxer" layout is also used in Porsche and Subaru cars.',
      specs: [
        { label: 'Type', value: '4-cylinder, 2-stroke, air-cooled boxer' },
        { label: 'Power', value: '≈ 37 kW (≈ 50 hp)' },
        { label: 'Weight', value: '≈ 16 kg' },
      ],
      explode: [-0.3, 0, 0],
    },
    {
      id: 'engine-electronics',
      name: 'Engine electronics',
      system: 'propulsion',
      inside: true,
      evidence: 'reported',
      summary: 'A small electronics box next to the engine that looks after the ignition and engine running.',
      details:
        'A petrol engine needs a spark at exactly the right moment in every cylinder. This unit handles the ignition ' +
        'and passes the flight computer\'s throttle commands to the engine. Teardown reports describe an ' +
        'electronics block in the engine bay near the tail.',
      explode: [-0.2, 0.3, -0.25],
    },
    {
      id: 'propeller',
      name: 'Pusher propeller',
      system: 'propulsion',
      evidence: 'reported',
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
      evidence: 'typical',
      summary: 'Carries hot gases from the engine out of the body.',
      details:
        'Burning petrol makes hot gases that have to leave the engine. The exact exhaust routing on the Shahed has ' +
        'not been published; the model shows a typical pipe leading out under the body, away from the propeller.',
      explode: [-0.35, -0.2, -0.2],
    },
    {
      id: 'booster',
      name: 'Rocket launch booster',
      system: 'propulsion',
      evidence: 'reported',
      summary: 'A small rocket under the body that throws the drone into the air at launch, then drops off.',
      details:
        'The drone has no landing gear and cannot take off from a runway. For launch, a disposable solid-fuel rocket ' +
        'is fitted to its underside. It burns for only a few seconds, long enough to reach flying speed, then falls ' +
        'away. Engineers call this RATO: Rocket-Assisted Take-Off.',
      explode: [0.1, -0.75, 0],
    },

    // ── Fuel system ────────────────────────────────────────────
    {
      id: 'wing-tanks',
      name: 'Wing fuel tanks',
      system: 'fuel',
      inside: true,
      evidence: 'reported',
      summary: 'Two flat tanks inside the wings, one on each side, that hold much of the fuel.',
      details:
        'The Shahed-136 is reported to use three fuel tanks: one in each wing and one in the body. Keeping fuel in ' +
        'the wings uses space the drone already has and lets the body stay slim, which cuts drag and adds range. ' +
        'Fuel from the wing tanks flows into the body tank and from there to the engine. Some later Russian-built ' +
        'versions moved the fuel out of the wings and into the body.',
      funFact: 'Most airliners also carry the bulk of their fuel inside their wings.',
      explode: [0, -0.15, 0],
    },
    {
      id: 'fuel-tank',
      name: 'Body fuel tank',
      system: 'fuel',
      inside: true,
      evidence: 'reported',
      summary: 'The tank in the middle of the body. The wing tanks feed into it, and it feeds the engine.',
      details:
        'It sits close to the drone\'s centre of gravity (its balance point). Fuel is the heaviest thing that ' +
        'changes during a flight; with the tanks near the middle, the drone stays balanced as the fuel burns off.',
      funFact: 'Airliners do the same thing: they pump fuel between tanks to keep the plane balanced.',
      explode: [0, 0, 0],
    },
    {
      id: 'filler-cap',
      name: 'Filler cap',
      system: 'fuel',
      evidence: 'typical',
      summary: 'Where fuel goes in before launch.',
      details:
        'The ground crew fill the tanks before launch and seal the cap. Its exact position on the Shahed has not ' +
        'been published; the model shows a typical spot on top of the body tank.',
      explode: [0, 0.35, 0],
    },
    {
      id: 'fuel-filter',
      name: 'Fuel filter',
      system: 'fuel',
      inside: true,
      evidence: 'typical',
      summary: 'Catches dirt so it cannot block the engine.',
      details:
        'Even tiny specks of dirt can block the narrow passages in an engine, so petrol engines have a filter in ' +
        'the fuel line. The exact part used on the Shahed has not been published; this is a typical example.',
      explode: [-0.1, -0.12, 0.2],
    },
    {
      id: 'fuel-pump',
      name: 'Fuel pump',
      system: 'fuel',
      inside: true,
      evidence: 'typical',
      summary: 'Pushes fuel to the engine at a steady pressure.',
      details:
        'The engine needs a steady flow of fuel whether the drone is climbing, diving or turning. A pump provides ' +
        'that, so the engine does not stutter. The exact pump used on the Shahed has not been published; this is a ' +
        'typical example.',
      explode: [-0.18, -0.14, 0.25],
    },
    {
      id: 'fuel-lines',
      name: 'Fuel lines',
      system: 'fuel',
      inside: true,
      evidence: 'typical',
      summary: 'Thin tubes carrying fuel from the wing tanks to the body tank, then through the filter and pump to the engine.',
      details:
        'Follow the glowing flow in X-ray mode: fuel runs from each wing tank into the body tank, then is cleaned ' +
        'by the filter, pressurised by the pump and delivered to the engine. The exact routing has not been ' +
        'published; this shows a typical layout.',
      explode: [-0.1, -0.12, 0.2],
    },

    // ── Flight control ─────────────────────────────────────────
    {
      id: 'elevons',
      name: 'Elevons',
      system: 'flight-control',
      evidence: 'reported',
      summary: 'Hinged flaps on the back edge of the wings that pitch and roll the drone.',
      details:
        'Elevon = ELEVator + ailerON. When both flaps tilt up together, the nose goes up (climb). When they tilt ' +
        'in opposite directions, the drone rolls to turn.',
      explode: [-0.2, -0.55, 0],
    },
    {
      id: 'rudders',
      name: 'Rudders',
      system: 'flight-control',
      evidence: 'reported',
      summary: 'Hinged flaps on the back of the wingtip fins that swing the nose left or right.',
      details:
        'Turning both rudders the same way pushes the tail sideways, which turns (yaws) the nose, a bit like the ' +
        'rudder on a boat. With the two elevons, that makes four moving control surfaces in total.',
      explode: [-0.15, -0.55, 0],
    },
    {
      id: 'servos',
      name: 'Servo actuators',
      system: 'flight-control',
      inside: true,
      evidence: 'reported',
      summary: 'Four small electric motors that move the control surfaces: two for the elevons, two for the rudders.',
      details:
        'A servo is a motor that turns to an exact angle when told to. The flight computer sends a command, and ' +
        'the servos push the flaps to the right position many times per second. Using only four actuators keeps the ' +
        'drone cheap. Their exact mounting points have not been published; the model shows them next to the ' +
        'surfaces they move.',
      explode: [0, -0.32, 0],
    },
    {
      id: 'flight-computer',
      name: 'Flight computer (autopilot)',
      system: 'flight-control',
      inside: true,
      evidence: 'reported',
      summary: 'The drone\'s "brain". It flies the planned route by itself.',
      details:
        'It constantly compares where the drone is with where it should be, then moves the control surfaces and ' +
        'adjusts the engine to correct the difference. Nobody steers it with a joystick during the flight. In the ' +
        'original design it sits in a bay just behind the warhead, with the battery and power distribution unit. ' +
        'Newer Russian versions reportedly moved these electronics to the tail.',
      explode: [0.15, 0.22, 0.25],
    },

    // ── Navigation ─────────────────────────────────────────────
    {
      id: 'gnss-antenna',
      name: 'Satellite navigation antenna',
      system: 'navigation',
      evidence: 'reported',
      summary: 'A white antenna with four round "pucks" on top of the right wing. It picks up navigation satellites.',
      details:
        'Satellite navigation works like the maps app on your phone: the receiver measures signals from several ' +
        'satellites and works out its position from them. Having several antenna elements helps it keep a signal ' +
        'when someone tries to jam it. On Russian-built Geran-2 drones, jam-resistant antennas (such as "Kometa") ' +
        'were reported on top of the nose instead.',
      funFact: 'GPS (USA), GLONASS (Russia), Galileo (Europe) and BeiDou (China) are all satellite navigation systems.',
      explode: [0, 0.45, 0.15],
    },
    {
      id: 'ins',
      name: 'Inertial navigation unit',
      system: 'navigation',
      inside: true,
      evidence: 'reported',
      summary: 'Motion sensors in the middle of the body that track movement without any outside signal.',
      details:
        'Gyroscopes sense turning and accelerometers sense speeding up or slowing down. By adding up every ' +
        'movement, the unit estimates where the drone has gone. Small errors build up over time, so it is ' +
        'combined with satellite navigation. It sits on a shock-absorbing mount so engine vibration does not ' +
        'confuse its sensors.',
      funFact: 'Your phone has tiny versions of these sensors. They are what rotate the screen when you turn it.',
      explode: [0, -0.1, 0.3],
    },

    // ── Power ──────────────────────────────────────────────────
    {
      id: 'generator',
      name: 'Generator',
      system: 'power',
      inside: true,
      evidence: 'reported',
      summary: 'Built into the engine. It makes electricity for the electronics in flight.',
      details:
        'Versions of the engine made for these drones are reported to have a generator (alternator) built in. As ' +
        'the engine turns, it produces electricity for the flight computer, servos and navigation equipment, just ' +
        'like the alternator in a car.',
      explode: [-0.2, 0.2, 0.15],
    },
    {
      id: 'battery',
      name: 'Battery',
      system: 'power',
      inside: true,
      evidence: 'reported',
      summary: 'Powers the electronics before the engine starts and backs up the generator.',
      details:
        'Before launch the engine is not yet running, so a battery keeps the computer and navigation alive. ' +
        'In flight it acts as a buffer if the generator\'s output dips. It sits in the electronics bay behind the ' +
        'warhead.',
      explode: [0.1, -0.15, -0.3],
    },
    {
      id: 'pdu',
      name: 'Power distribution unit',
      system: 'power',
      inside: true,
      evidence: 'reported',
      summary: 'Shares out electricity from the generator and battery to every electronic part.',
      details:
        'Think of it as the drone\'s fuse box and power strip in one. It takes power from the generator and battery ' +
        'and sends the right voltage to the flight computer, navigation units and servos. It is reported to sit in ' +
        'the electronics bay with the flight computer.',
      explode: [0.1, -0.15, 0.3],
    },

    // ── Payload ────────────────────────────────────────────────
    {
      id: 'warhead',
      name: 'Warhead section',
      system: 'payload',
      inside: true,
      evidence: 'reported',
      summary: 'The explosive payload in the nose. It is what makes this a "kamikaze" drone.',
      details:
        'Unlike drones that drop bombs and fly home, a one-way attack drone carries its explosive inside and is ' +
        'destroyed together with its target. In the original it weighs about 50 kg; some later Russian-made ' +
        'versions carry up to about 90 kg, which leaves less room for fuel. This app shows it only as a simple ' +
        'block and does not show what is inside.',
      specs: [
        { label: 'Reported mass', value: '≈ 50 kg (original)' },
        { label: 'Later versions', value: 'up to ≈ 90 kg' },
      ],
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
