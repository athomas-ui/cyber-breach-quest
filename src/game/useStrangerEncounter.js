import { useCallback, useEffect, useRef, useState } from 'react';
import { STRANGERS, STRANGER_TIMING } from '@/game/content';
import { getState } from '@/game/store';
import { playerPos, world } from '@/game/world';
import { controls } from '@/game/input';
import { sfx } from '@/game/audio';

// Decides WHEN a stranger shows up in the hub and WHICH trick they try.
// The hub screen renders the stranger and the dialogue; this hook only runs the schedule.
//
//   encounter = null                      nobody around
//   encounter = { phase: 'approach' }     stranger walking toward the player
//   encounter = { phase: 'talk' }         dialogue open
//   encounter = { phase: 'leave' }        stranger walking away, then cleared
//
// Press B in the hub (or use Tablet > Settings > Summon a stranger) to trigger one now.

const between = (min, max) => min + Math.random() * (max - min);

function blocked(x, z) {
  if (Math.hypot(x, z) > 27) return true;
  return world.platforms.some((p) => Math.abs(x - p.x) <= p.w / 2 + 0.8 && Math.abs(z - p.z) <= p.d / 2 + 0.8);
}

// Spawn roughly in front of the camera so the player sees them coming.
function pickSpawn() {
  const cy = controls.orbitYaw;
  const facing = Math.atan2(-Math.sin(cy), -Math.cos(cy));
  for (let i = 0; i < 16; i++) {
    const angle = facing + between(-0.9, 0.9) + (i > 8 ? Math.PI : 0);
    const dist = between(10, 13);
    const x = playerPos.x + Math.sin(angle) * dist;
    const z = playerPos.z + Math.cos(angle) * dist;
    if (!blocked(x, z)) return [x, z];
  }
  return [playerPos.x * -0.5, playerPos.z * -0.5];
}

// Prefer tricks the player has not beaten yet, and never repeat the same one twice in a row.
function pickScenario(lastId) {
  const beaten = getState().strangers_beaten || [];
  let pool = STRANGERS.filter((s) => !beaten.includes(s.id) && s.id !== lastId);
  if (!pool.length) pool = STRANGERS.filter((s) => s.id !== lastId);
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function useStrangerEncounter(eligible) {
  const [encounter, setEncounter] = useState(null);
  const nextAt = useRef(performance.now() + between(STRANGER_TIMING.firstMin, STRANGER_TIMING.firstMax));
  const lastId = useRef(null);
  const live = useRef({ eligible, encounter });
  live.current = { eligible, encounter };

  const spawn = useCallback(() => {
    const scenario = pickScenario(lastId.current);
    lastId.current = scenario.id;
    setEncounter({ key: `${scenario.id}-${Date.now()}`, scenario, spawn: pickSpawn(), phase: 'approach' });
    sfx('alert');
  }, []);

  useEffect(() => {
    const tick = window.setInterval(() => {
      const { eligible: ok, encounter: current } = live.current;
      if (current || !ok) return;
      if (performance.now() >= nextAt.current) spawn();
    }, 400);
    const summon = () => {
      nextAt.current = 0;
    };
    const onKey = (e) => {
      if (e.code === 'KeyB' && !e.repeat) summon();
    };
    window.addEventListener('cb:summon-stranger', summon);
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearInterval(tick);
      window.removeEventListener('cb:summon-stranger', summon);
      window.removeEventListener('keydown', onKey);
    };
  }, [spawn]);

  const setPhase = useCallback((phase) => {
    setEncounter((e) => (e ? { ...e, phase } : e));
  }, []);

  const finish = useCallback(() => {
    setEncounter(null);
    nextAt.current = performance.now() + between(STRANGER_TIMING.nextMin, STRANGER_TIMING.nextMax);
  }, []);

  return { encounter, setPhase, finish };
}
