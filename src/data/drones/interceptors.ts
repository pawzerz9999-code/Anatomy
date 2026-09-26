import type { DroneDef, PartDef, SketchfabEmbed, Spec } from '../../types';

/*
 * Ukrainian interceptor drones built to hunt Shahed-type attack drones.
 * Makers publish little about their insides, so parts whose exact design is not public
 * are marked `typical`, and specs that sources disagree on are given as ranges.
 * Content stays at encyclopedia level: the payload is a plain block with no detail.
 */

const INTERCEPTOR_VIEW: DroneDef['view'] = {
  camera: [0.62, 0.34, 0.72],
  target: [0, 0, 0],
  floorY: -0.32,
  minFocusRadius: 0.09,
};

type PartText = Partial<Omit<PartDef, 'id' | 'explode'>>;

/** The parts every interceptor in this app shares, with per-drone text overrides. */
function interceptorParts(o: Record<string, PartText> = {}): PartDef[] {
  const base: PartDef[] = [
    {
      id: 'body',
      name: 'Body',
      system: 'airframe',
      skin: true,
      evidence: 'reported',
      guide: 'materials',
      summary: 'The streamlined, bullet-shaped body.',
      details:
        'A smooth, pointed body cuts air drag, which is what lets these drones fly several times faster than a ' +
        'Shahed. It also protects the electronics inside.',
      explode: [0, 0.16, 0],
    },
    {
      id: 'arms',
      name: 'Motor arms',
      system: 'airframe',
      evidence: 'typical',
      summary: 'Four arms that hold the motors out around the body.',
      details:
        'The arms spread the motors out so the drone can tilt and steer by speeding some motors up and slowing ' +
        'others down. The exact arm shape has not been published; the model shows a typical layout.',
      explode: [-0.05, 0, 0],
    },
    {
      id: 'motors',
      name: 'Electric motors (×4)',
      system: 'propulsion',
      evidence: 'reported',
      guide: 'engines',
      summary: 'Four brushless electric motors, one for each propeller.',
      details:
        'Brushless motors are small, powerful and reliable because they have no brushes to wear out. The drone ' +
        'steers by changing the speed of each motor hundreds of times a second. Unlike the Shahed\'s petrol engine, ' +
        'they are quiet and need no fuel.',
      madeOf: 'Metal: copper windings, strong magnets and an aluminium case (typical for brushless motors)',
      explode: [-0.08, 0, 0],
    },
    {
      id: 'propellers',
      name: 'Propellers (×4)',
      system: 'propulsion',
      evidence: 'reported',
      summary: 'Four propellers that pull the drone forward at high speed.',
      details:
        'Interceptors use propellers set up for speed rather than hovering, a bit like a high gear on a bike. ' +
        'Two spin clockwise and two anticlockwise, so the drone does not twist around.',
      explode: [0.1, 0, 0],
    },
    {
      id: 'esc',
      name: 'Speed controller (ESC)',
      system: 'propulsion',
      inside: true,
      evidence: 'typical',
      summary: 'Turns battery power into precisely timed pulses for each motor.',
      details:
        'ESC stands for Electronic Speed Controller. Following the flight controller\'s commands, it switches power ' +
        'to each motor\'s coils thousands of times a second to set its speed. The exact part used has not been ' +
        'published; this is a typical example.',
      explode: [-0.04, -0.1, 0.08],
    },
    {
      id: 'battery',
      name: 'Battery',
      system: 'power',
      inside: true,
      evidence: 'typical',
      guide: 'engines',
      summary: 'A rechargeable lithium battery that powers the motors and electronics.',
      details:
        'Everything on board runs on electricity, and the battery is the heaviest single part. Flying flat out ' +
        'drains it in minutes, which is why these drones fly for only about 10–15 minutes. The exact pack has not ' +
        'been published; this is a typical example.',
      madeOf: 'Lithium cells in a protective wrap (typical)',
      explode: [0, -0.12, -0.06],
    },
    {
      id: 'flight-controller',
      name: 'Flight controller',
      system: 'flight-control',
      inside: true,
      evidence: 'typical',
      summary: 'The small computer that keeps the drone stable and follows the pilot\'s commands.',
      details:
        'It reads motion sensors hundreds of times a second and adjusts the motors so the drone flies where the ' +
        'pilot points it. The exact board used has not been published; this is a typical example.',
      explode: [-0.04, 0.1, 0.08],
    },
    {
      id: 'camera',
      name: 'Camera',
      system: 'sensors',
      evidence: 'reported',
      summary: 'The camera in the nose that the pilot sees through.',
      details:
        'The pilot wears video goggles or watches a screen showing this camera\'s view, as if sitting in the ' +
        'nose. A thermal camera sees heat, so a warm engine stands out against the cold night sky.',
      explode: [0.12, 0.04, 0],
    },
    {
      id: 'vtx',
      name: 'Video transmitter & antenna',
      system: 'sensors',
      inside: true,
      evidence: 'typical',
      summary: 'Sends the live camera picture down to the pilot.',
      details:
        'The video transmitter (VTX) broadcasts the camera picture by radio to the pilot\'s goggles or ground ' +
        'station. The exact unit has not been published; this is a typical example.',
      explode: [0, 0.12, -0.08],
    },
    {
      id: 'receiver',
      name: 'Radio receiver & antennas',
      system: 'sensors',
      evidence: 'typical',
      summary: 'Picks up the pilot\'s control commands.',
      details:
        'A separate radio link carries the pilot\'s stick movements to the drone. Its antennas stick out at the ' +
        'back, clear of the body. The exact unit has not been published; this is a typical example.',
      explode: [-0.1, 0.05, 0.05],
    },
    {
      id: 'payload',
      name: 'Payload (small charge)',
      system: 'payload',
      inside: true,
      evidence: 'reported',
      summary: 'A small explosive charge that destroys the target drone at close range.',
      details:
        'The interceptor flies into or right next to the attacking drone and its small charge destroys it. This ' +
        'app shows it only as a simple block and does not show what is inside.',
      explode: [0.08, -0.08, 0],
    },
  ];
  return base.map((p) => ({ ...p, ...o[p.id] }));
}

const FLIGHTCLUB = { author: 'FLIGHTCLUB', authorUrl: 'https://sketchfab.com/flightclubua' };
const embed = (modelId: string, title: string, slug: string): SketchfabEmbed => ({
  modelId,
  title,
  ...FLIGHTCLUB,
  url: `https://sketchfab.com/3d-models/${slug}-${modelId}`,
});

const HOW_STOPPING_SHAHEDS_WORKS = {
  title: 'Why cheap interceptors matter',
  body:
    'A Shahed-type drone costs far less than most air-defence missiles. An interceptor drone that costs a few ' +
    'thousand dollars or less can destroy it for a fraction of a missile\'s price, so defenders can afford to use ' +
    'many of them. See the Shahed-136 in this app for the other side of the story.',
};

// ── Sting (Wild Hornets) ─────────────────────────────────────────────────
const stingSpecs: Spec[] = [
  { label: 'Maker', value: 'Wild Hornets (Ukraine)' },
  { label: 'Top speed', value: 'Reported 280–340 km/h (varies by version)' },
  { label: 'Cruise speed', value: '≈ 140–170 km/h' },
  { label: 'Range', value: 'Up to ≈ 37 km' },
  { label: 'Flight time', value: 'Up to ≈ 15 min' },
  { label: 'Size', value: '≈ 30–45 cm long' },
  { label: 'Takeoff', value: 'Vertical, from any flat surface' },
  { label: 'Cost', value: '≈ $2,000–2,500' },
];

export const sting: DroneDef = {
  id: 'sting',
  name: 'Sting',
  maker: 'Wild Hornets (Ukraine)',
  category: 'interceptor',
  tagline: 'High-speed interceptor drone that hunts Shahed-type drones',
  overview:
    'Sting is an interceptor drone made by Wild Hornets, a Ukrainian volunteer group that grew into a drone maker. ' +
    'It was first shown in autumn 2024 and has been in regular service since mid-2025. Its job is to chase down ' +
    'attack drones like the Shahed-136 for far less than the cost of a missile. It takes off vertically, then a ' +
    'pilot wearing video goggles flies it at high speed into the target, using a thermal camera to see at night.',
  specs: stingSpecs,
  sections: [
    {
      title: 'How it works',
      body:
        'Sting sits upright and takes off straight up from any flat surface, with no launcher needed. Once in the ' +
        'air it tips forward and flies nose-first like a bullet. The pilot watches a live thermal video feed sent ' +
        'over a digital radio link and steers it onto the target. Wild Hornets have also shown pilots flying it ' +
        'remotely from very far away over the internet.',
    },
    {
      title: 'Records',
      body:
        'It has been reported to intercept drones above 7 km altitude, and in December 2025 it was reported as the ' +
        'first interceptor drone to shoot down a jet-powered Geran-3.',
    },
    HOW_STOPPING_SHAHEDS_WORKS,
  ],
  sources: [
    { title: 'Wikipedia: Sting (drone)', url: 'https://en.wikipedia.org/wiki/Sting_(drone)' },
    { title: 'Covert Shores: Ukrainian interceptor drones', url: 'https://www.hisutton.com/Ukrainian-Interceptor-Drones.html' },
    { title: 'NV: Inside the Sting FPV interceptor', url: 'https://english.nv.ua/nation/the-drone-killer-inside-the-sting-fpv-interceptor-50591418.html' },
    { title: 'Militarnyi: Sting gets Kurbas thermal cameras', url: 'https://militarnyi.com/en/news/ukrainian-sting-interceptor-drones-now-equipped-with-kurbas-thermal-imaging-cameras/' },
    { title: 'The Defender: Hornet Vision video link', url: 'https://thedefender.media/en/2026/01/hornet-vision-for-interceptors/' },
  ],
  parts: interceptorParts({
    body: {
      summary: 'The bullet-shaped, 3D-printed body.',
      madeOf: '3D-printed plastic (reported)',
    },
    camera: {
      name: 'Thermal camera',
      details:
        'Sting is reported to use a Kurbas-640 thermal camera (640 × 512 pixels) made in Ukraine. It sees heat, so ' +
        'a Shahed\'s hot engine stands out against the night sky. The pilot sees this picture in their goggles.',
    },
    vtx: {
      evidence: 'reported',
      details:
        'Sting is reported to use a digital video link (Hornet Vision) with a transmitter of up to 4 W, sending the ' +
        'thermal picture to a ground station with a 360° antenna.',
    },
    payload: { specs: [{ label: 'Reported mass', value: '≈ 400–500 g (sources differ)' }] },
  }),
  model: { kind: 'procedural' },
  view: INTERCEPTOR_VIEW,
  sketchfab: [
    embed('0fd4562c6abd460ba0046bb2308845a9', 'Sting: drone-intercepting loitering munition FPV', 'sting-drone-intercepting-loitering-munition-fpv'),
  ],
};

// ── Strila (WIY Drones) ──────────────────────────────────────────────────
export const strila: DroneDef = {
  id: 'strila',
  name: 'Strila',
  maker: 'WIY Drones (Kyiv, Ukraine)',
  category: 'interceptor',
  tagline: 'Rocket-shaped high-speed interceptor drone',
  overview:
    'Strila ("arrow") is an interceptor drone from WIY Drones in Kyiv, unveiled in June 2025. It is built to ' +
    'catch Shahed drones and reconnaissance drones. Software guides it towards the target area and an operator ' +
    'flies the final approach through its cameras. Its radio link is designed to work without satellite navigation ' +
    'and to resist jamming. Less has been published about it than about Sting, and sources disagree on some details.',
  specs: [
    { label: 'Maker', value: 'WIY Drones (Kyiv, Ukraine)' },
    { label: 'Top speed', value: 'Reported ≈ 350 km/h' },
    { label: 'Range', value: '≈ 14 km typical, up to ≈ 28 km' },
    { label: 'Altitude', value: 'Up to ≈ 4 km' },
    { label: 'Flight time', value: 'Reported 10–20 min (sources differ)' },
    { label: 'Launch', value: 'Catapult or mobile platform (sources differ)' },
    { label: 'Cost', value: 'Reported ≈ $2,300 (2026)' },
  ],
  sections: [
    {
      title: 'How it works',
      body:
        'The maker calls it a "rocket-type" interceptor: a long, slim body with four electric motors. Software ' +
        'brings it close to the target, then the operator takes over for the final approach using its day and ' +
        'thermal cameras. A December 2025 upgrade added a new optical module.',
    },
    {
      title: 'What comes next',
      body: 'A planned Strila-2 is reported to add a solid rocket booster so it can climb to its target faster.',
    },
    HOW_STOPPING_SHAHEDS_WORKS,
  ],
  sources: [
    { title: 'WIY Drones: Strila', url: 'https://wiydrones.com/en/products/strila' },
    { title: 'Militarnyi: Strila and Burewiy interceptors', url: 'https://militarnyi.com/en/news/strila-and-burewiy-wiy-drones-introduces-shahed-drones-interceptors/' },
    { title: 'The Defender: Strila presented at DemoDay', url: 'https://thedefender.media/en/2025/06/strila-burewiy-presented-on-demoday/' },
    { title: 'Euromaidan Press: Strila hits 355 km/h', url: 'https://euromaidanpress.com/2026/03/23/germany-just-funded-15000-of-ukraines-fastest-drone-hunters-strila-hits-355-km-h-and-needs-no-gps-to-find-its-target/' },
    { title: 'Militarnyi: Strila-2 with rocket booster', url: 'https://militarnyi.com/en/news/strila-2-interceptor-drone-rocket-booster/' },
  ],
  parts: interceptorParts({
    body: {
      summary: 'A long, slim, "rocket-type" body.',
      details:
        'The maker describes Strila as a rocket-type interceptor. A long, slim, pointed body has very little drag, ' +
        'which helps it reach speeds reported at around 350 km/h. What it is made of has not been published.',
    },
    propellers: {
      details:
        'Interceptors use propellers set up for speed rather than hovering. WIY makes its own carbon-fibre ' +
        'propellers for Strila. Two spin clockwise and two anticlockwise, so the drone does not twist around.',
      madeOf: 'Carbon fibre (reported)',
    },
    camera: {
      name: 'Day & thermal cameras',
      details:
        'Strila is reported to carry both a daytime camera and a thermal camera, so the operator can find targets ' +
        'by day or by the heat of their engines at night.',
    },
    receiver: {
      evidence: 'reported',
      details:
        'Strila is reported to use a "SineLink" radio link that works without satellite navigation, resists ' +
        'jamming and lets the operator switch channels in flight. Its antennas stick out at the back, clear of ' +
        'the body.',
    },
    payload: {
      summary: 'What Strila carries is described differently by different sources.',
      details:
        'Some reports describe Strila as a kinetic interceptor that destroys targets by hitting them, without ' +
        'explosives; others mention a payload of up to 800 g. This app shows it only as a simple block.',
    },
  }),
  model: { kind: 'procedural' },
  view: INTERCEPTOR_VIEW,
  sketchfab: [embed('86f30d6afbe344eda6ea45bcf7ea765c', 'WIY Strila interceptor tailsitter fpv drone', 'wiy-strila-interceptor-tailsitter-fpv-drone')],
};

// ── P1-SUN (SkyFall) ─────────────────────────────────────────────────────
export const p1Sun: DroneDef = {
  id: 'p1-sun',
  name: 'P1-SUN',
  maker: 'SkyFall (Ukraine)',
  category: 'interceptor',
  tagline: 'Low-cost, modular interceptor drone',
  overview:
    'The P1-SUN is an interceptor drone from SkyFall, the Ukrainian company that also makes the Vampire and ' +
    'Shrike drones. It was shown at the Dubai Airshow in November 2025 and has been used in combat since late 2025. ' +
    'It is bullet-shaped, 3D-printed and modular, takes off vertically and is flown by an FPV operator with a day ' +
    'or thermal camera. Later versions add an AI module that can lock onto a target, and a faster "JetKiller" ' +
    'version aimed at jet-powered drones.',
  specs: [
    { label: 'Maker', value: 'SkyFall (Ukraine)' },
    { label: 'Top speed', value: 'Reported ≈ 300 km/h (up to 450 km/h claimed)' },
    { label: 'Altitude', value: 'Up to ≈ 5 km' },
    { label: 'Takeoff', value: 'Vertical' },
    { label: 'Cost', value: '≈ $1,000' },
    { label: 'JetKiller version', value: '≈ 370 km/h, ≈ 30 km, ≈ 15 min' },
  ],
  sections: [
    {
      title: 'How it works',
      body:
        'The P1-SUN takes off vertically, then flies nose-first at high speed. An operator steers it using a day ' +
        'or thermal camera. Because it is modular, parts such as the camera can be swapped. An optional AI module ' +
        'is reported to lock onto a target within about 1 km and help guide it in.',
    },
    {
      title: 'Versions',
      body:
        'P1-SUN Long (June 2026) adds an AI module. JetKiller (July 2026) is tuned for jet-powered drones such as ' +
        'the Geran-3, with a reported top speed of about 370 km/h and a ceiling of about 9 km.',
    },
    HOW_STOPPING_SHAHEDS_WORKS,
  ],
  sources: [
    { title: 'Tech Ukraine: P1-SUN at Dubai Airshow', url: 'https://techukraine.org/2025/11/24/skyfall-unveils-p1-sun-modular-interceptor-at-dubai-airshow/' },
    { title: 'Breaking Defense: SkyFall at Dubai Airshow', url: 'https://breakingdefense.com/2025/11/ukrainian-drone-maker-skyfall-shows-off-tech-at-dubai-airshow-eyes-us-nato-market/' },
    { title: 'Quwa: P1-SUN JetKiller', url: 'https://quwa.org/ukraine/defence-news-ukr/skyfall-unveils-p1-sun-jetkiller-interceptor-to-counter-russias-jet-powered-shahed-drones/' },
    { title: 'United24: What is Ukraine\'s interceptor', url: 'https://united24media.com/war-in-ukraine/what-is-ukraines-interceptor-one-of-the-worlds-most-in-demand-drones-17055' },
    { title: 'Aeronaut: P1-SUN from SkyFall', url: 'https://aeronaut.media/articles-en/en-p1-sun-ukrainian-drone-from-skyfall/' },
  ],
  parts: [
    ...interceptorParts({
      body: {
        summary: 'A bullet-shaped, 3D-printed body built from modules that can be swapped.',
        details:
          'The body is 3D-printed in sections. Being modular means parts such as the camera can be swapped for ' +
          'different missions, and damaged sections replaced quickly. Its layout is reported to look very similar ' +
          'to Sting.',
        madeOf: '3D-printed plastic (reported)',
      },
      camera: {
        name: 'Day or thermal camera',
        details:
          'The P1-SUN can carry a daytime camera or a thermal camera, with analog or digital video, depending on ' +
          'the mission.',
      },
      payload: { specs: [{ label: 'JetKiller version', value: '≈ 500 g (reported)' }] },
    }),
    {
      id: 'ai-module',
      name: 'AI targeting module (optional)',
      system: 'flight-control',
      inside: true,
      evidence: 'reported',
      summary: 'An optional computer that can recognise a target and help steer onto it.',
      details:
        'Later versions offer an AI module that is reported to lock onto a target within about 1 km and help guide ' +
        'the drone in, which makes the last seconds of the chase easier for the operator.',
      explode: [0.02, 0.12, -0.08],
    },
  ],
  model: { kind: 'procedural' },
  view: INTERCEPTOR_VIEW,
  sketchfab: [
    embed('8fd6a2a2bd344d2c8e4045dd6fdd47ae', 'Skyfall P1-SUN tailsitter fpv interceptor quad', 'skyfall-p1-sun-tailsitter-fpv-interceptor-quad'),
  ],
};
