import { useSyncExternalStore } from 'react';
import { base44 } from '@/api/base44Client';
import { rankFor } from '@/game/constants';

const KEY = 'cyberbreach.progress.v1';
const FIELDS = ['hero', 'xp', 'rank', 'completed_missions', 'badges', 'quest_log', 'shards', 'intel', 'met_npcs'];
const DEFAULT_SETTINGS = { volume: 0.6, muted: false, quality: 'high' };

export const DEFAULT_PROGRESS = {
  hero: 'andrew',
  xp: 0,
  rank: 'Rookie',
  completed_missions: [],
  badges: [],
  quest_log: [],
  shards: [],
  intel: [],
  met_npcs: [],
  settings: { ...DEFAULT_SETTINGS }
};

let state = { ...DEFAULT_PROGRESS, settings: { ...DEFAULT_SETTINGS } };
let recordId = null;
let signedIn = false;
let saveTimer = null;
const listeners = new Set();

function normalize(raw) {
  const out = { ...DEFAULT_PROGRESS, settings: { ...DEFAULT_SETTINGS } };
  if (raw) {
    FIELDS.forEach((f) => {
      if (raw[f] !== undefined && raw[f] !== null) out[f] = raw[f];
    });
    if (raw.settings) out.settings = { ...DEFAULT_SETTINGS, ...raw.settings };
  }
  out.rank = rankFor(out.xp || 0).name;
  return out;
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getState() {
  return state;
}

export function useGame() {
  return useSyncExternalStore(subscribe, getState, getState);
}

function emit() {
  listeners.forEach((fn) => fn(state));
}

function persist() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    /* storage may be blocked */
  }
  if (!signedIn || !recordId) return;
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    base44.entities.PlayerProgress.update(recordId, state).catch(() => {});
  }, 700);
}

export function patch(next) {
  state = { ...state, ...next };
  emit();
  persist();
}

export const actions = {
  setHero(hero) {
    patch({ hero });
  },
  setSettings(part) {
    patch({ settings: { ...state.settings, ...part } });
  },
  addXp(amount) {
    const xp = Math.max(0, (state.xp || 0) + amount);
    patch({ xp, rank: rankFor(xp).name });
  },
  completeMission(id) {
    if (!state.completed_missions.includes(id)) {
      patch({ completed_missions: [...state.completed_missions, id] });
    }
  },
  awardBadge(id) {
    if (!state.badges.includes(id)) patch({ badges: [...state.badges, id] });
  },
  unlockIntel(id) {
    if (!state.intel.includes(id)) patch({ intel: [...state.intel, id] });
  },
  collectShard(id) {
    if (!state.shards.includes(id)) patch({ shards: [...state.shards, id] });
  },
  metNpc(id) {
    if (!state.met_npcs.includes(id)) patch({ met_npcs: [...state.met_npcs, id] });
  },
  addQuest(quest) {
    if (!state.quest_log.some((q) => q.id === quest.id)) {
      patch({ quest_log: [...state.quest_log, { ...quest, status: quest.status || 'active' }] });
    }
  },
  completeQuest(id) {
    patch({
      quest_log: state.quest_log.map((q) => (q.id === id ? { ...q, status: 'completed' } : q))
    });
  },
  reset() {
    patch({ ...DEFAULT_PROGRESS, settings: state.settings });
  }
};

export async function loadProgress() {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      state = normalize(JSON.parse(raw));
      emit();
    }
  } catch (e) {
    /* ignore corrupt local save */
  }

  try {
    const me = await base44.auth.me();
    if (!me || !me.id) return;
    const page = await base44.entities.PlayerProgress.filter(
      { created_by_id: me.id },
      { limit: 1, sort: '-updated_date' }
    );
    const rows = (page && page.items) || [];
    if (rows.length) {
      recordId = rows[0].id;
      state = normalize(rows[0]);
      emit();
    } else {
      const created = await base44.entities.PlayerProgress.create(state);
      recordId = created && created.id ? created.id : null;
    }
    signedIn = true;
    persist();
  } catch (e) {
    signedIn = false;
  }
}