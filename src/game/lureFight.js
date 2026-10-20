import { useSyncExternalStore } from 'react';

const listeners = new Set();
let noteId = 0;
let hookId = 0;

let state = {
  status: 'idle',
  hp: 100,
  maxHp: 100,
  shield: 100,
  maxShield: 100,
  phase: 1,
  hook: null,
  hits: 0,
  flawless: true,
  note: null
};

function emit() {
  listeners.forEach((fn) => fn(state));
}

function set(patch) {
  state = { ...state, ...patch };
  emit();
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getFight() {
  return state;
}

export function useFight() {
  return useSyncExternalStore(subscribe, getFight, getFight);
}

export function resetFight() {
  state = {
    status: 'idle',
    hp: 100,
    maxHp: 100,
    shield: 100,
    maxShield: 100,
    phase: 1,
    hook: null,
    hits: 0,
    flawless: true,
    note: null
  };
  emit();
}

export function beginIntro() {
  set({ status: 'intro' });
}

export function startFight() {
  set({ status: 'fight' });
}

export function spawnHook(def) {
  if (state.status !== 'fight') return;
  set({ hook: { ...def, bornAt: performance.now(), key: ++hookId } });
}

export function clearNote() {
  if (state.note) set({ note: null });
}

export function reportHook() {
  const h = state.hook;
  if (!h || state.status !== 'fight') return null;

  if (h.phish) {
    const hp = Math.max(0, state.hp - 20);
    const next = {
      ...state,
      hp,
      hook: null,
      hits: state.hits + 1,
      note: { id: ++noteId, correct: true, text: h.explain }
    };
    if (hp <= 0) next.status = 'win';
    else next.phase = hp <= 34 ? 3 : hp <= 67 ? 2 : 1;
    state = next;
    emit();
    return { correct: true, explain: h.explain, won: hp <= 0 };
  }

  const shield = Math.max(0, state.shield - 15);
  const next = {
    ...state,
    shield,
    hook: null,
    flawless: false,
    note: { id: ++noteId, correct: false, text: `That one was legitimate. ${h.explain}` }
  };
  if (shield <= 0) next.status = 'lose';
  state = next;
  emit();
  return { correct: false, explain: `That one was legitimate. ${h.explain}`, lost: shield <= 0 };
}

export function hurtShield(amount, text) {
  if (state.status !== 'fight') return;
  const shield = Math.max(0, state.shield - amount);
  const next = { ...state, shield, flawless: false };
  if (text) next.note = { id: ++noteId, correct: false, text };
  if (shield <= 0) next.status = 'lose';
  state = next;
  emit();
}

export function expireHook() {
  const h = state.hook;
  if (!h || state.status !== 'fight') return;
  if (!h.phish) {
    set({ hook: null });
    return;
  }
  const shield = Math.max(0, state.shield - 10);
  const next = {
    ...state,
    hook: null,
    shield,
    flawless: false,
    note: { id: ++noteId, correct: false, text: `You let a phish get through. ${h.explain}` }
  };
  if (shield <= 0) next.status = 'lose';
  state = next;
  emit();
}