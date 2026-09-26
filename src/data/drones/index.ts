import type { CatalogEntry, DroneCategory, DroneDef } from '../../types';
import { shahed136 } from './shahed136';

/** Drones with a full 3D anatomy model. */
export const DRONES: Record<string, DroneDef> = {
  [shahed136.id]: shahed136,
};

export const CATEGORIES: { id: DroneCategory; name: string; description: string }[] = [
  { id: 'kamikaze', name: 'Kamikaze / loitering', description: 'One-way attack drones that carry their payload into the target.' },
  { id: 'interceptor', name: 'Interceptors', description: 'Fast drones built to hunt down and destroy other drones.' },
  { id: 'multirotor', name: 'Multirotor', description: 'Quadcopters and other drones lifted by several rotors.' },
  { id: 'fixed-wing', name: 'Fixed-wing', description: 'Drones that fly on wings like an aeroplane.' },
  { id: 'vtol', name: 'VTOL hybrid', description: 'Take off like a helicopter, cruise like a plane.' },
  { id: 'helicopter', name: 'Helicopter', description: 'Single main rotor, like a small unmanned helicopter.' },
  { id: 'nano', name: 'Nano', description: 'Palm-sized drones that fit in a pocket.' },
  { id: 'utility', name: 'Delivery & utility', description: 'Drones that carry parcels, spray crops or inspect things.' },
];

/** The library: live drones plus the ones on the roadmap. */
export const CATALOG: CatalogEntry[] = [
  { id: 'shahed-136', name: 'Shahed-136', category: 'kamikaze', status: 'live', blurb: 'Long-range delta-wing one-way attack drone.' },
  { id: 'fpv-kamikaze', name: 'FPV kamikaze quad', category: 'kamikaze', status: 'soon', blurb: 'Small racing-style quadcopter flown by video goggles.' },
  { id: 'lancet', name: 'Lancet', category: 'kamikaze', status: 'soon', blurb: 'Loitering munition with two sets of X-shaped wings.' },
  { id: 'switchblade', name: 'Switchblade', category: 'kamikaze', status: 'soon', blurb: 'Tube-launched; its wings flip open after launch.' },
  { id: 'coyote', name: 'Coyote-style jet interceptor', category: 'interceptor', status: 'soon', blurb: 'Tube-launched, jet-powered drone hunter.' },
  { id: 'fpv-interceptor', name: 'FPV interceptor quad', category: 'interceptor', status: 'soon', blurb: 'Very fast quadcopter that rams or bursts near its target.' },
  { id: 'net-interceptor', name: 'Net-capture interceptor', category: 'interceptor', status: 'soon', blurb: 'Catches other drones with a launched net.' },
  { id: 'camera-quad', name: 'Camera quadcopter', category: 'multirotor', status: 'soon', blurb: 'Folding consumer drone with a stabilised camera.' },
  { id: 'heavy-lift', name: 'Heavy-lift octocopter', category: 'multirotor', status: 'soon', blurb: 'Eight rotors for carrying cinema cameras or cargo.' },
  { id: 'tb2-style', name: 'Medium-altitude drone (TB2-style)', category: 'fixed-wing', status: 'soon', blurb: 'Twin-boom tail, flies for a whole day.' },
  { id: 'reaper-style', name: 'MALE drone (Reaper-style)', category: 'fixed-wing', status: 'soon', blurb: 'Medium-Altitude Long-Endurance, V-tail and turboprop.' },
  { id: 'hale', name: 'HALE drone (Global Hawk-style)', category: 'fixed-wing', status: 'soon', blurb: 'Jet drone flying above airliners for 30+ hours.' },
  { id: 'quadplane', name: 'VTOL quadplane', category: 'vtol', status: 'soon', blurb: 'Four lift rotors plus a cruise propeller.' },
  { id: 'heli-drone', name: 'Helicopter drone', category: 'helicopter', status: 'soon', blurb: 'Single-rotor unmanned helicopter.' },
  { id: 'black-hornet', name: 'Nano drone (Black Hornet-style)', category: 'nano', status: 'soon', blurb: 'Weighs about as much as a sheet of paper.' },
  { id: 'delivery', name: 'Delivery drone', category: 'utility', status: 'soon', blurb: 'Carries parcels and lowers them on a winch.' },
  { id: 'agri', name: 'Agricultural sprayer', category: 'utility', status: 'soon', blurb: 'Big multirotor with tanks and spray nozzles.' },
];
