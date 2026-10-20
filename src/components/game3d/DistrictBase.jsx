import React, { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import Rain from '@/components/game3d/Rain';
import { gridTexture, windowsTexture } from '@/game/textures';

function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Skyline({ count = 54 }) {
  const ref = useRef();
  const items = useMemo(() => {
    const rand = mulberry32(11);
    return Array.from({ length: count }, () => {
      const angle = rand() * Math.PI * 2;
      const radius = 46 + rand() * 55;
      return {
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        w: 6 + rand() * 9,
        d: 6 + rand() * 9,
        h: 14 + rand() * 58
      };
    });
  }, [count]);
  const tex = useMemo(() => windowsTexture(5), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    if (!ref.current) return;
    items.forEach((it, i) => {
      dummy.position.set(it.x, it.h / 2, it.z);
      dummy.scale.set(it.w, it.h, it.d);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  }, [items, dummy]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color="#070b14"
        roughness={0.9}
        metalness={0.2}
        emissive="#7fb6ff"
        emissiveMap={tex}
        emissiveIntensity={0.55}
      />
    </instancedMesh>
  );
}

function HorizonGlow() {
  const tex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 256;
    const g = c.getContext('2d');
    const grad = g.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, 'rgba(4,8,16,0)');
    grad.addColorStop(0.62, 'rgba(20,110,140,0.20)');
    grad.addColorStop(0.86, 'rgba(60,190,210,0.34)');
    grad.addColorStop(1, 'rgba(120,240,255,0.05)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 256);
    return new THREE.CanvasTexture(c);
  }, []);

  return (
    <mesh position={[0, 26, -132]}>
      <planeGeometry args={[520, 120]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

export default function DistrictBase({ quality }) {
  const groundTex = useMemo(() => {
    const t = gridTexture({ color: '#0f7f6a', bg: '#04070d', cells: 12 });
    t.repeat.set(9, 9);
    return t;
  }, []);

  const puddles = [
    [-6, -6, 3.4],
    [8, 2, 2.6],
    [-11, 6, 2.2],
    [3, -12, 3],
    [12, -13, 2.4],
    [-2, 16, 2.8]
  ];

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[190, 190]} />
        <meshStandardMaterial
          color="#050810"
          roughness={0.22}
          metalness={0.85}
          emissive="#0a3a33"
          emissiveMap={groundTex}
          emissiveIntensity={0.5}
        />
      </mesh>

      {puddles.map(([x, z, r], i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.015, z]}>
          <circleGeometry args={[r, 26]} />
          <meshStandardMaterial color="#0b1a26" roughness={0.06} metalness={1} transparent opacity={0.85} />
        </mesh>
      ))}

      {/* plaza inlay ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[12.4, 12.9, 64]} />
        <meshBasicMaterial color="#1de6c0" transparent opacity={0.35} toneMapped={false} side={2} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[22.4, 22.8, 64]} />
        <meshBasicMaterial color="#7a5cff" transparent opacity={0.22} toneMapped={false} side={2} />
      </mesh>

      <Skyline count={quality === 'high' ? 54 : 30} />
      <HorizonGlow />
      <Rain count={quality === 'high' ? 900 : 380} area={70} />
    </group>
  );
}