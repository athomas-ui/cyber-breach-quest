import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { registerPlatform } from '@/game/world';
import { signTexture } from '@/game/textures';

function PlatformBox({ position, size, color = '#0b121c', glow = '#1de6c0' }) {
  const top = position[1] + size[1] / 2;

  useEffect(() => {
    const remove = registerPlatform({ x: position[0], z: position[2], w: size[0], d: size[2], h: top });
    return remove;
  }, [position, size, top]);

  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.5} />
      </mesh>
      <mesh position={[0, size[1] / 2 + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[size[0] * 0.9, size[2] * 0.9]} />
        <meshBasicMaterial color={glow} transparent opacity={0.18} toneMapped={false} />
      </mesh>
      <mesh position={[0, size[1] / 2 + 0.02, size[2] / 2]}>
        <boxGeometry args={[size[0] * 0.7, 0.04, 0.03]} />
        <meshBasicMaterial color={glow} toneMapped={false} />
      </mesh>
    </group>
  );
}

function HoloSign({ position, rotation, lines, color, width = 6, height = 2.2 }) {
  const mesh = useRef();
  const tex = useMemo(() => signTexture(lines, color, { width: 512, height: 192 }), [lines, color]);

  useFrame((_, dt) => {
    if (!mesh.current) return;
    mesh.current.position.y = position[1] + Math.sin(performance.now() * 0.0011 + position[0]) * 0.09;
    mesh.current.material.opacity = 0.78 + Math.sin(performance.now() * 0.008 + position[2]) * 0.12;
  });

  return (
    <mesh ref={mesh} position={position} rotation={rotation}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={tex} transparent opacity={0.85} toneMapped={false} side={2} depthWrite={false} />
    </mesh>
  );
}

function Train() {
  const ref = useRef();
  useFrame((_, rawDt) => {
    if (!ref.current) return;
    const t = performance.now() * 0.00006;
    const x = ((t % 1) * 2 - 1) * 70;
    ref.current.position.x = x;
  });

  return (
    <group ref={ref} position={[0, 10.2, -34]}>
      <mesh>
        <boxGeometry args={[16, 2.3, 2.6]} />
        <meshStandardMaterial color="#141c28" metalness={0.8} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.25, 1.32]}>
        <boxGeometry args={[13.5, 0.55, 0.05]} />
        <meshBasicMaterial color="#9fe8ff" toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.55, 1.32]}>
        <boxGeometry args={[13.5, 0.28, 0.05]} />
        <meshBasicMaterial color="#c084fc" toneMapped={false} />
      </mesh>
    </group>
  );
}

export default function DistrictStructures() {
  const hqTex = useMemo(() => signTexture(['HQ', 'SECURITY DIVISION'], '#00ff9d', { width: 512, height: 220 }), []);

  return (
    <group>
      {/* HQ */}
      <group position={[0, 0, 26]}>
        <mesh position={[0, 7, 0]}>
          <boxGeometry args={[17, 14, 11]} />
          <meshStandardMaterial color="#070c14" metalness={0.7} roughness={0.35} />
        </mesh>
        <mesh position={[0, 4.2, 5.55]}>
          <planeGeometry args={[13, 8]} />
          <meshStandardMaterial color="#06202a" emissive="#0a5f63" emissiveIntensity={0.6} metalness={0.9} roughness={0.15} />
        </mesh>
        <mesh position={[0, 2.1, 5.62]}>
          <planeGeometry args={[3.6, 4.2]} />
          <meshBasicMaterial color="#00ff9d" transparent opacity={0.16} toneMapped={false} />
        </mesh>
        <mesh position={[0, 9.2, 5.62]}>
          <planeGeometry args={[9, 3.6]} />
          <meshBasicMaterial map={hqTex} transparent toneMapped={false} />
        </mesh>
        {[-6, -3, 0, 3, 6].map((x) => (
          <mesh key={x} position={[x, 4.2, 5.58]}>
            <boxGeometry args={[0.06, 7.6, 0.04]} />
            <meshBasicMaterial color="#12b7a3" transparent opacity={0.5} toneMapped={false} />
          </mesh>
        ))}
        <pointLight position={[0, 4, 7]} color="#00ff9d" intensity={4} distance={18} decay={2} />
      </group>

      {/* elevated track */}
      <group position={[0, 0, -34]}>
        <mesh position={[0, 9, 0]}>
          <boxGeometry args={[120, 1.1, 3.6]} />
          <meshStandardMaterial color="#0a111b" metalness={0.8} roughness={0.4} />
        </mesh>
        {[-42, -21, 0, 21, 42].map((x) => (
          <mesh key={x} position={[x, 4.5, 0]}>
            <boxGeometry args={[1.5, 9, 1.5]} />
            <meshStandardMaterial color="#080e16" metalness={0.7} roughness={0.45} />
          </mesh>
        ))}
        <mesh position={[0, 9.6, 1.85]}>
          <boxGeometry args={[120, 0.1, 0.1]} />
          <meshBasicMaterial color="#c084fc" toneMapped={false} />
        </mesh>
        <Train />
      </group>

      {/* platforms for rooftop shards */}
      <PlatformBox position={[-12, 0.9, -12]} size={[2.2, 1.8, 2.2]} />
      <PlatformBox position={[13, 1.2, -13]} size={[2.6, 2.4, 2.6]} glow="#c084fc" />
      <PlatformBox position={[6, 0.8, -21]} size={[3, 1.6, 2]} glow="#ff9f1c" />
      <PlatformBox position={[-18, 1.1, -14]} size={[3.4, 2.2, 2.6]} glow="#38bdf8" />
      <PlatformBox position={[16, 0.7, 4]} size={[2, 1.4, 2]} glow="#c084fc" />
      <PlatformBox position={[0, 1.8, 18]} size={[7, 0.4, 2]} color="#0a1420" glow="#00ff9d" />

      {/* alleys */}
      <mesh position={[-25, 5, 2]}>
        <boxGeometry args={[9, 10, 26]} />
        <meshStandardMaterial color="#05090f" metalness={0.6} roughness={0.5} />
      </mesh>
      <mesh position={[25, 5, -2]}>
        <boxGeometry args={[9, 10, 26]} />
        <meshStandardMaterial color="#05090f" metalness={0.6} roughness={0.5} />
      </mesh>
      <mesh position={[-25, 10.05, 2]}>
        <boxGeometry args={[9.1, 0.12, 26.1]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} toneMapped={false} />
      </mesh>
      <mesh position={[25, 10.05, -2]}>
        <boxGeometry args={[9.1, 0.12, 26.1]} />
        <meshBasicMaterial color="#ff9f1c" transparent opacity={0.4} toneMapped={false} />
      </mesh>

      <HoloSign position={[-11, 6.4, -6]} rotation={[0, 0.7, 0]} lines={['NEON CHICAGO', 'SECURITY DISTRICT']} color="#1de6c0" width={7} height={2.6} />
      <HoloSign position={[12, 7.2, 3]} rotation={[0, -0.8, 0]} lines={['LEAST PRIVILEGE', 'ALWAYS']} color="#c084fc" width={6} height={2.2} />
      <HoloSign position={[-9, 5.6, -22]} rotation={[0, 0.15, 0]} lines={['PATCH TUESDAY', 'IS EVERY DAY']} color="#38bdf8" width={6} height={2.2} />
      <HoloSign position={[10, 6.8, 20]} rotation={[0, -3.0, 0]} lines={['TRUST', 'NOTHING']} color="#ff9f1c" width={5} height={2} />
    </group>
  );
}