import { useEffect } from 'react';

const keys = new Set();
export const controls = { orbitYaw: 0, orbitPitch: 0.3 };
export const touchInput = { x: 0, y: 0 };

let jumpQueued = false;
let interactQueued = false;
let tabletQueued = false;
let sprintTouch = false;
let attached = false;
let moveQueued = null;

const MOVE_KEYS = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

// Combat moves: J punch combo, K spin kick, L dash, F charged Cyber Blast.
export const MOVE_BINDS = { KeyJ: 'punch', KeyK: 'kick', KeyL: 'dash', KeyF: 'special' };

function onKeyDown(e) {
  if (MOVE_KEYS.includes(e.code)) {
    keys.add(e.code);
    e.preventDefault();
    return;
  }
  if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
    keys.add(e.code);
    return;
  }
  if (e.repeat) return;
  if (e.code === 'Space') {
    jumpQueued = true;
    e.preventDefault();
  } else if (e.code === 'KeyE') {
    interactQueued = true;
  } else if (e.code === 'Tab') {
    tabletQueued = true;
    e.preventDefault();
  } else if (MOVE_BINDS[e.code]) {
    moveQueued = MOVE_BINDS[e.code];
  }
}

function onKeyUp(e) {
  keys.delete(e.code);
}

export function installKeyboard() {
  if (attached) return;
  attached = true;
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
}

export function getMove() {
  let x = 0;
  let y = 0;
  if (keys.has('KeyW') || keys.has('ArrowUp')) y += 1;
  if (keys.has('KeyS') || keys.has('ArrowDown')) y -= 1;
  if (keys.has('KeyD') || keys.has('ArrowRight')) x += 1;
  if (keys.has('KeyA') || keys.has('ArrowLeft')) x -= 1;
  x += touchInput.x;
  y += touchInput.y;
  const m = Math.hypot(x, y);
  if (m > 1) {
    x /= m;
    y /= m;
  }
  return { x, y };
}

export function isSprinting() {
  return keys.has('ShiftLeft') || keys.has('ShiftRight') || sprintTouch;
}

export function setSprintTouch(v) {
  sprintTouch = v;
}

export function queueJump() {
  jumpQueued = true;
}
export function queueInteract() {
  interactQueued = true;
}
export function queueTablet() {
  tabletQueued = true;
}

export function queueMove(name) {
  moveQueued = name;
}

export function takeMove() {
  const v = moveQueued;
  moveQueued = null;
  return v;
}

export function takeJump() {
  const v = jumpQueued;
  jumpQueued = false;
  return v;
}
export function takeInteract() {
  const v = interactQueued;
  interactQueued = false;
  return v;
}
export function takeTablet() {
  const v = tabletQueued;
  tabletQueued = false;
  return v;
}

export function useOrbitDrag(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    const down = (e) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const move = (e) => {
      if (!dragging) return;
      controls.orbitYaw -= (e.clientX - lastX) * 0.006;
      controls.orbitPitch = Math.max(
        -0.12,
        Math.min(1.05, controls.orbitPitch + (e.clientY - lastY) * 0.004)
      );
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const up = () => {
      dragging = false;
    };
    el.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      el.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, [ref]);
}