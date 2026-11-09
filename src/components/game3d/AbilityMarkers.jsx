import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useMarkers } from '@/game/abilities';

// A pulsing pillar of light: where Scan found a shard, or where Uplink wants you to go.
function Beacon({ x, y, z, color, height }) {
  const beam = useRef(null);
  const ring = useRef(null);

  useFrame(() => {
    const pulse = 0.5 + Math.sin(performance.now() * 0.006) * 0.5;
    if (beam.current) beam.current.material.opacity = 0.22 + pulse * 0.25;
    if (ring.current) {
      ring.current.scale.setScalar(1 + pulse * 0.35);
      ring.current.material.opacity = 0.9 - pulse * 0.5;
    }
  });

  return (
    <group position={[x, y, z]}>
      <mesh ref={beam} position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.32, 0.32, height, 16, 1, true]} />
        <meshBasicMaterial color={color} transparent opacity={0.35} depthWrite={false} toneMapped={false} side={2} />
      </mesh>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[0.7, 0.95, 40]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} depthWrite={false} toneMapped={false} side={2} />
      </mesh>
    </group>
  );
}

export default function AbilityMarkers() {
  const markers = useMarkers();
  return (
    <group>
      {markers.map((m) => (
        <Beacon key={m.id} x={m.x} y={m.y} z={m.z} color={m.color} height={m.height} />
      ))}
    </group>
  );
}
