/* eslint-disable react/no-unknown-property */
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { GATE_SLOTS } from '@/game/constants';
import { playerPos } from '@/game/world';

const GATE = GATE_SLOTS[0];
const FLOOR_MARKERS = Array.from({ length: 14 }, (_, index) => 11 - index * 2);

function OverheadArrow() {
  /** @type {import('react').RefObject<import('three').Group>} */
  const group = useRef(null);

  useFrame(() => {
    if (!group.current) return;
    const dx = GATE.x - playerPos.x;
    const dz = GATE.z - playerPos.z;
    group.current.position.set(playerPos.x, 5 + Math.sin(performance.now() * 0.003) * 0.16, playerPos.z);
    group.current.rotation.y = Math.atan2(dx, dz);
    group.current.visible = Math.hypot(dx, dz) > 4.5;
  });

  return (
    <group ref={group}>
      <mesh position={[0, 0, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.65, 8]} />
        <meshBasicMaterial color="#67e8f9" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 0.65]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.34, 0.55, 8]} />
        <meshBasicMaterial color="#a5f3fc" toneMapped={false} />
      </mesh>
      <pointLight position={[0, 0, 0.5]} color="#67e8f9" intensity={1.3} distance={5} />
    </group>
  );
}

function FloorPath() {
  /** @type {import('react').RefObject<import('three').Group>} */
  const group = useRef(null);

  useFrame(() => {
    if (!group.current) return;
    group.current.visible = Math.hypot(GATE.x - playerPos.x, GATE.z - playerPos.z) > 4.5;
  });

  return (
    <group ref={group}>
      {FLOOR_MARKERS.map((z, index) => (
        <group key={z} position={[0, 0.06, z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.8, 1.15]} />
            <meshBasicMaterial
              color={index % 2 === 0 ? '#67e8f9' : '#a5f3fc'}
              transparent
              opacity={0.78}
              toneMapped={false}
              depthWrite={false}
            />
          </mesh>
          <pointLight position={[0, 0.22, 0]} color="#67e8f9" intensity={0.28} distance={2.8} />
        </group>
      ))}
    </group>
  );
}

export default function MissionGuide({ style }) {
  if (style === 'arrow') return <OverheadArrow />;
  if (style === 'floor') return <FloorPath />;
  return null;
}
