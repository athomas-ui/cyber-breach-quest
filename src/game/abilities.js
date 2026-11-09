import { useSyncExternalStore } from 'react';

// Analyst tools: J Scan, K Firewall, F Uplink.
//
// Player.jsx plays the animation and calls emitAbility() the moment the move
// lands. The screen that owns the world (Hub.jsx) listens with onAbility() and
// decides what the tool actually does: find shards, block a stranger, mark an
// objective. Keeping the "what happens" out of Player means the same moves can
// mean something different inside a mission later.

export const SCAN_RANGE = 12; // meters. The scan ring grows to exactly this size.

const abilityListeners = new Set();

export function emitAbility(name) {
  abilityListeners.forEach((fn) => fn(name));
}

export function onAbility(fn) {
  abilityListeners.add(fn);
  return () => abilityListeners.delete(fn);
}

// Markers: short-lived light pillars that show the player what a tool found.
let markers = [];
let markerId = 0;
const markerListeners = new Set();

function emitMarkers() {
  markerListeners.forEach((fn) => fn());
}

export function addMarker({ x, y = 0, z, color, height = 8, life = 6 }) {
  const marker = { id: ++markerId, x, y, z, color, height };
  markers = [...markers, marker];
  emitMarkers();
  window.setTimeout(() => {
    markers = markers.filter((m) => m.id !== marker.id);
    emitMarkers();
  }, life * 1000);
}

export function clearMarkers() {
  markers = [];
  emitMarkers();
}

function subscribe(fn) {
  markerListeners.add(fn);
  return () => markerListeners.delete(fn);
}

function getMarkers() {
  return markers;
}

export function useMarkers() {
  return useSyncExternalStore(subscribe, getMarkers, getMarkers);
}
