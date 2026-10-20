import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function NpcActor({ npc, register, met }) {
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
      marker.current.position.y = 2.35 + Math.sin(performance.now() * 0.0025) * 0.1;
    }
  });

  return (
    <group ref={group}>
      <group ref={body} position={[0, 0.9, 0]}>
        <mesh position={[0, 0.32, 0]}>
          <capsuleGeometry args={[0.24, 0.34, 6, 12]} />
          <meshStandardMaterial color="#0d1522" roughness={0.65} metalness={0.3} />
        </mesh>
        <mesh position={[0, 0.34, 0.22]}>
          <boxGeometry args={[0.07, 0.3, 0.03]} />
          <meshBasicMaterial color={npc.color} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.86, 0]}>
          <sphereGeometry args={[0.175, 16, 16]} />
          <meshStandardMaterial color="#e8b48c" roughness={0.85} />
        </mesh>
        <mesh position={[-0.28, 0.52, 0]} rotation={[0, 0, 0.1]}>
          <capsuleGeometry args={[0.07, 0.3, 4, 8]} />
          <meshStandardMaterial color="#0d1522" roughness={0.65} metalness={0.3} />
        </mesh>
        <mesh position={[0.28, 0.52, 0]} rotation={[0, 0, -0.1]}>
          <capsuleGeometry args={[0.07, 0.3, 4, 8]} />
          <meshStandardMaterial color="#0d1522" roughness={0.65} metalness={0.3} />
        </mesh>
      </group>
      <group ref={legL} position={[-0.11, 0.86, 0]}>
        <mesh position={[0, -0.34, 0]}>
          <capsuleGeometry args={[0.095, 0.34, 4, 8]} />
          <meshStandardMaterial color="#101827" roughness={0.7} />
        </mesh>
      </group>
      <group ref={legR} position={[0.11, 0.86, 0]}>
        <mesh position={[0, -0.34, 0]}>
          <capsuleGeometry args={[0.095, 0.34, 4, 8]} />
          <meshStandardMaterial color="#101827" roughness={0.7} />
        </mesh>
      </group>
      <mesh ref={marker} position={[0, 2.35, 0]}>
        <octahedronGeometry args={[0.13, 0]} />
        <meshBasicMaterial color={met ? '#4a5568' : npc.color} toneMapped={false} />
      </mesh>
    </group>
  );
}