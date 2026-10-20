import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function DataShard({ id, position, register, collected }) {
  const mesh = useRef();

  useEffect(() => {
    if (collected) return undefined;
    const remove = register({
      id: `shard-${id}`,
      type: 'shard',
      label: 'Collect Data Shard',
      position: new THREE.Vector3(position[0], position[1] + 0.6, position[2]),
      radius: 2.1,
      data: { shardId: id }
    });
    return remove;
  }, [id, position, register, collected]);

  useFrame((_, rawDt) => {
    if (!mesh.current) return;
    const dt = Math.min(rawDt, 0.05);
    mesh.current.rotation.y += dt * 1.4;
    mesh.current.rotation.x += dt * 0.5;
    mesh.current.position.y = position[1] + 0.75 + Math.sin(performance.now() * 0.002 + id.length) * 0.14;
  });

  if (collected) return null;

  return (
    <group position={[position[0], position[1], position[2]]}>
      <mesh ref={mesh} position={[0, 0.75, 0]}>
        <octahedronGeometry args={[0.28, 0]} />
        <meshBasicMaterial color="#7ffff0" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.75, 0]}>
        <octahedronGeometry args={[0.46, 0]} />
        <meshBasicMaterial color="#7ffff0" transparent opacity={0.14} toneMapped={false} depthWrite={false} />
      </mesh>
      <pointLight position={[0, 0.8, 0]} color="#7ffff0" intensity={1.4} distance={4} decay={2} />
    </group>
  );
}