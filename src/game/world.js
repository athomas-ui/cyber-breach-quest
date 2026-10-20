import * as THREE from 'three';

export const playerPos = new THREE.Vector3(0, 0, 10);

export const world = {
  platforms: [],
  colliders: [],
  interactables: []
};

export const gameClock = { speed: 1 };

export function setTimeScale(v) {
  gameClock.speed = v;
}

export function clearWorld() {
  world.platforms.length = 0;
  world.colliders.length = 0;
  world.interactables.length = 0;
  gameClock.speed = 1;
}

export function registerPlatform(p) {
  world.platforms.push(p);
  return () => {
    const i = world.platforms.indexOf(p);
    if (i >= 0) world.platforms.splice(i, 1);
  };
}

export function registerCollider(obj) {
  world.colliders.push(obj);
  return () => {
    const i = world.colliders.indexOf(obj);
    if (i >= 0) world.colliders.splice(i, 1);
  };
}

export function registerInteractable(obj) {
  world.interactables.push(obj);
  return () => {
    const i = world.interactables.indexOf(obj);
    if (i >= 0) world.interactables.splice(i, 1);
  };
}

export function groundHeightAt(x, z, y) {
  let h = 0;
  for (let i = 0; i < world.platforms.length; i++) {
    const p = world.platforms[i];
    if (
      Math.abs(x - p.x) <= p.w / 2 &&
      Math.abs(z - p.z) <= p.d / 2 &&
      p.h <= y + 0.55
    ) {
      if (p.h > h) h = p.h;
    }
  }
  return h;
}