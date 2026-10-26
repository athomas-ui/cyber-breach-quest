import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import AnimeHead, { HEAD_R } from '@/components/game3d/AnimeHead';
import { Toon } from '@/components/game3d/toon';

const LOOKS = [
  { hair: '#f2b84b', style: 'short', suit: '#24324f' },
  { hair: '#e0475f', style: 'long', suit: '#2b2140' },
  { hair: '#3b2a24', style: 'spiky', suit: '#1e3b3a' },
  { hair: '#7dd3fc', style: 'long', suit: '#25283f' },
  { hair: '#2a1d3d', style: 'short', suit: '#3a2a1e' }
];

function lookFor(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return LOOKS[h % LOOKS.length];
}

export default function NpcActor({ npc, register, met }) {
  const look = lookFor(npc.id);
  const group = useRef();
  const body = useRef();
  const marker = useRef();
  const legL = useRef();
  const legR = useRef();
  const target = useRef(1);
  const pos = useRef(new THREE.Vector2(npc.patrol[0][0], npc.patrol[0][1]));
  const yaw = useRef(0);

  useEffect(() => {
    const remove = register({
      id: `npc-${npc.id}`,
      type: 'npc',
      label: `Talk to ${npc.name}`,
      position: new THREE.Vector3(pos.current.x, 1.1, pos.current.y),
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

    if (group.current) {
      group.current.position.set(pos.current.x, 0, pos.current.y);
      group.current.rotation.y = yaw.current;
    }
    if (body.current) {
      body.current.position.y = 0.9 + Math.abs(Math.sin(performance.now() * 0.006)) * 0.03;
    }
    const swing = Math.sin(performance.now() * 0.006) * 0.4;
    if (legL.current) legL.current.rotation.x = swing;
    if (legR.current) legR.current.rotation.x = -swing;
    if (marker.current) {
      marker.current.rotation.y += dt * 1.6;
      marker.current.position.y = 2.65 +Math.sin(performance.now() * 0.0025) * 0.1;
    }
  });

  return (
    <group ref={group}>
      <group ref={body} position={[0, 0.9, 0]}>
        <Toon position={[0, 0.3, 0]} color={look.suit}>
          <capsuleGeometry args={[0.21, 0.3, 6, 12]} />
        </Toon>
        <mesh position={[0, 0.32, 0.205]}>
          <boxGeometry args={[0.06, 0.28, 0.02]} />
          <meshBasicMaterial color={npc.color} toneMapped={false} />
        </mesh>
        {[-1, 1].map((side) => (
          <group key={side} position={[side * 0.27, 0.52, 0]} rotation={[0, 0, side * -0.1]}>
            <Toon position={[0, -0.2, 0]} color={look.suit}>
              <capsuleGeometry args={[0.066, 0.3, 4, 8]} />
            </Toon>
            <Toon position={[0, -0.42, 0]} color="#ffdcc2">
              <sphereGeometry args={[0.066, 10, 8]} />
            </Toon>
          </group>
        ))}
        <group position={[0, 0.66 + HEAD_R * 0.95, 0]}>
          <AnimeHead hair={look.hair} hairStyle={look.style} eyes={npc.color} eyesDeep="#0b1a33" />
        </group>
      </group>
      <group ref={legL} position={[-0.11, 0.86, 0]}>
        <Toon position={[0, -0.36, 0]} color="#141b2e">
          <capsuleGeometry args={[0.09, 0.38, 4, 8]} />
        </Toon>
      </group>
      <group ref={legR} position={[0.11, 0.86, 0]}>
        <Toon position={[0, -0.36, 0]} color="#141b2e">
          <capsuleGeometry args={[0.09, 0.38, 4, 8]} />
        </Toon>
      </group>
      <mesh ref={marker} position={[0, 2.65, 0]}>
        <octahedronGeometry args={[0.13, 0]} />
        <meshBasicMaterial color={met ? '#4a5568' : npc.color} toneMapped={false} />
      </mesh>
    </group>
  );
}