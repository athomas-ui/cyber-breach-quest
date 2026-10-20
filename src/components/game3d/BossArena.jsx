import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { gridTexture } from '@/game/textures';
import LureKing from '@/components/game3d/LureKing';

export default function BossArena({ quality }) {
  const ring = useRef();
  const debris = useRef();

  const floorTex = useMemo(() => {
    const t = gridTexture({ color: '#5c1030', bg: '#0a0510', cells: 8 });
    t.repeat.set(7, 7);
    return t;
  }, []);

  const shards = useMemo(
    () =>
      Array.from({ length: quality === 'high' ? 22 : 10 }, (_, i) => ({
        x: (Math.random() - 0.5) * 34,
        y: 1 + Math.random() * 8,
        z: (Math.random() - 0.5) * 34,
        s: 0.15 + Math.random() * 0.35,
        sp: 0.3 + Math.random() * 0.8,
        ph: i
      })),
    [quality]
  );
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    if (ring.current) ring.current.rotation.z += dt * 0.25;
    if (debris.current) {
      shards.forEach((s, i) => {
        dummy.position.set(s.x, s.y + Math.sin(performance.now() * 0.0006 * s.sp + s.ph) * 0.6, s.z);
        dummy.rotation.set(performance.now() * 0.0004 + s.ph, performance.now() * 0.0006, 0);
        dummy.scale.setScalar(s.s);
        dummy.updateMatrix();
        debris.current.setMatrixAt(i, dummy.matrix);
      });
      debris.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <circleGeometry args={[17, 64]} />
        <meshStandardMaterial color="#0a0510" metalness={0.85} roughness={0.22} emissive="#4a0d28" emissiveMap={floorTex} emissiveIntensity={0.8} />
      </mesh>

      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[13.4, 14, 64, 1, 0, Math.PI * 1.6]} />
        <meshBasicMaterial color="#ff2d55" transparent opacity={0.4} toneMapped={false} side={2} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[16.4, 16.9, 64]} />
        <meshBasicMaterial color="#c084fc" transparent opacity={0.35} toneMapped={false} side={2} />
      </mesh>

      {Array.from({ length: 10 }).map((_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.sin(a) * 15.6, 3.4, Math.cos(a) * 15.6]}>
            <boxGeometry args={[1.1, 6.8, 1.1]} />
            <meshStandardMaterial color="#0a0812" metalness={0.8} roughness={0.4} emissive="#ff2d55" emissiveIntensity={0.35} />
          </mesh>
        );
      })}

      <instancedMesh ref={debris} args={[undefined, undefined, shards.length]} frustumCulled={false}>
        <tetrahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#ff5fa2" emissive="#ff2d55" emissiveIntensity={0.8} metalness={0.6} roughness={0.3} />
      </instancedMesh>

      <pointLight position={[0, 8, 4]} color="#ff2d55" intensity={3} distance={34} decay={2} />
      <pointLight position={[0, 3, -14]} color="#c084fc" intensity={2} distance={28} decay={2} />

      <LureKing quality={quality} />
    </group>
  );
}