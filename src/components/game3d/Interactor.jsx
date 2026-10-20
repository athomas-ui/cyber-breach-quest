import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { world, playerPos } from '@/game/world';
import { takeInteract } from '@/game/input';

export default function Interactor({ onNear, onInteract, enabled = true }) {
  const current = useRef(null);

  useFrame(() => {
    if (!enabled) {
      if (current.current) {
        current.current = null;
        onNear(null);
      }
      return;
    }

    let best = null;
    let bestDist = Infinity;
    for (let i = 0; i < world.interactables.length; i++) {
      const item = world.interactables[i];
      if (item.enabled === false) continue;
      const d = item.position.distanceTo(playerPos);
      if (d < item.radius && d < bestDist) {
        bestDist = d;
        best = item;
      }
    }

    const bestId = best ? best.id : null;
    const curId = current.current ? current.current.id : null;
    if (bestId !== curId) {
      current.current = best;
      onNear(best);
    } else if (best) {
      current.current = best;
    }

    if (takeInteract() && current.current) {
      onInteract(current.current);
    }
  });

  return null;
}