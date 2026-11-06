import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import NpcBody, { lookFor } from '@/components/game3d/NpcBody';

export default function NpcActor({ npc, register, met }) {
  const look = lookFor(npc.id);
  const group = useRef();
  const marker = useRef();
  const target = useRef(1);
  const pos = useRef(new THREE.Vector2(npc.patrol[0][0], npc.patrol[0][1]));
  const yaw = useRef(0);

  // The talk prompt follows the NPC as it walks its patrol route.
  const hotspot = useRef(new THREE.Vector3(pos.current.x, 1.1, pos.current.y));

  useEffect(() => {
    const remove = register({
      id: `npc-${npc.id}`,
      type: 'npc',
      label: `Talk to ${npc.name}`,
      position: hotspot.current,
      radius: 2.8,
      data: { npcId: npc.id }
    });
    return remove;
  }, [npc.id, npc.name, register]);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const goal = npc.patrol[target.current];
    const dx = goal[0] - pos.current.x;
    const dz = goal[1] - pos.current.y;
    const dist = Math.hypot(dx, dz);

    if (dist < 0.25) {
      target.current = (target.current + 1) % npc.patrol.length;
    } else {
      const speed = 1.15;
      pos.current.x += (dx / dist) * speed * dt;
      pos.current.y += (dz / dist) * speed * dt;
      const want = Math.atan2(dx, dz);
      let d = want - yaw.current;
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      yaw.current += d * (1 - Math.exp(-8 * dt));
    }

    hotspot.current.set(pos.current.x, 1.1, pos.current.y);
    if (group.current) {
      group.current.position.set(pos.current.x, 0, pos.current.y);
      group.current.rotation.y = yaw.current;
    }
    if (marker.current) {
      marker.current.rotation.y += dt * 1.6;
      marker.current.position.y = 2.65 + Math.sin(performance.now() * 0.0025) * 0.1;
    }
  });

  return (
    <group ref={group}>
      <NpcBody look={look} accent={npc.color} />
      <mesh ref={marker} position={[0, 2.65, 0]}>
        <octahedronGeometry args={[0.13, 0]} />
        <meshBasicMaterial color={met ? '#4a5568' : npc.color} toneMapped={false} />
      </mesh>
    </group>
  );
}