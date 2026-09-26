import type { SystemDef, SystemId } from '../types';

export const SYSTEMS: SystemDef[] = [
  {
    id: 'airframe',
    name: 'Airframe',
    color: '#a3b4c8',
    description: 'The body, wings and fins: the "skeleton and skin" that holds everything together and shapes the airflow.',
  },
  {
    id: 'propulsion',
    name: 'Propulsion',
    color: '#fb923c',
    description: 'Everything that makes thrust: the engine, the propeller and the rocket that gets it off the ground.',
  },
  {
    id: 'fuel',
    name: 'Fuel system',
    color: '#facc15',
    description: 'Stores the petrol and delivers it to the engine: tank, filter, pump and fuel lines.',
  },
  {
    id: 'flight-control',
    name: 'Flight control',
    color: '#2dd4bf',
    description: 'The "brain and muscles" of flight: the autopilot computer, and the servos that move the control surfaces.',
  },
  {
    id: 'navigation',
    name: 'Navigation',
    color: '#60a5fa',
    description: 'Works out where the drone is: satellite navigation plus motion sensors.',
  },
  {
    id: 'power',
    name: 'Electrical power',
    color: '#a78bfa',
    description: 'Makes and stores electricity for the electronics.',
  },
  {
    id: 'payload',
    name: 'Payload',
    color: '#f87171',
    description: 'What the drone carries to do its job. For a one-way attack drone, that is the warhead.',
  },
];

export const SYSTEM_BY_ID = Object.fromEntries(SYSTEMS.map((s) => [s.id, s])) as Record<SystemId, SystemDef>;
