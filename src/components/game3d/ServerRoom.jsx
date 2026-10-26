import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { registerInteractable } from '@/game/world';
import { signTexture, gridTexture } from '@/game/textures';
import { EMAILS, MISSION_GUIDE } from '@/game/content';
import NpcActor from '@/components/game3d/NpcActor';

export const BINS = {
  safe: new THREE.Vector3(-7.5, 0.4, -12.5),
  phish: new THREE.Vector3(7.5, 0.4, -12.5)
};

function EmailPanel({ email, index, total, sortedAs }) {
  const group = useRef();
  const fly = useRef(0);
  const base = useMemo(() => {
    const a = (index / total) * Math.PI * 2 + 0.4;
    return new THREE.Vector3(Math.sin(a) * 6.6, 1.6, Math.cos(a) * 6.6);
  }, [index, total]);

  const tex = useMemo(
    () => signTexture([email.from, email.subject], '#7dd3fc', { width: 512, height: 256 }),
    [email]
  );

  useEffect(() => {
    if (sortedAs) return undefined;
    const remove = registerInteractable({
      id: `mail-${email.id}`,
      type: 'email',
      label: 'Inspect email',
      position: new THREE.Vector3(base.x, base.y, base.z),
      radius: 2.6,
      data: { emailId: email.id }
    });
    return remove;
  }, [base, email.id, sortedAs]);

  useFrame((_, rawDt) => {
    if (!group.current) return;
    const dt = Math.min(rawDt, 0.05);
    if (sortedAs) {
      fly.current = Math.min(1, fly.current + dt * 1.6);
      const target = BINS[sortedAs];
      group.current.position.lerpVectors(base, target, fly.current);
      group.current.scale.setScalar(Math.max(0.01, 1 - fly.current * 0.9));
      group.current.visible = fly.current < 0.98;
    } else {
      group.current.position.set(base.x, base.y + Math.sin(performance.now() * 0.002 + index) * 0.09, base.z);
    }
  });

  return (
    <group ref={group} position={base} rotation={[0, Math.atan2(-base.x, -base.z), 0]}>
      <mesh>
        <planeGeometry args={[3.1, 1.55]} />
        <meshBasicMaterial map={tex} transparent opacity={0.92} toneMapped={false} side={2} />
      </mesh>
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[3.2, 1.65]} />
        <meshBasicMaterial color="#7dd3fc" transparent opacity={0.16} toneMapped={false} side={2} depthWrite={false} />
      </mesh>
      <pointLight position={[0, 0, 0.6]} color="#7dd3fc" intensity={0.9} distance={4} decay={2} />
    </group>
  );
}

function Bin({ position, label, color }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[3.2, 1.4, 3.2]} />
        <meshStandardMaterial color="#0a121c" metalness={0.7} roughness={0.35} emissive={color} emissiveIntensity={0.18} />
      </mesh>
      <mesh position={[0, 1.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.8, 2.8]} />
        <meshBasicMaterial color={color} transparent opacity={0.18} toneMapped={false} side={2} depthWrite={false} />
      </mesh>
      <mesh position={[0, 1.15, 1.62]}>
        <planeGeometry args={[2.4, 0.62]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 1.4, 0]} color={color} intensity={1.6} distance={8} decay={2} />
    </group>
  );
}

export default function ServerRoom({ sorted, quality, guideAnswered }) {
  const floorTex = useMemo(() => {
    const t = gridTexture({ color: '#1b4a6b', bg: '#050a11', cells: 10 });
    t.repeat.set(6, 6);
    return t;
  }, []);

  const racks = useMemo(() => {
    const list = [];
    for (let i = 0; i < 6; i++) {
      list.push([-13, 1.6, -9 + i * 3.4]);
      list.push([13, 1.6, -9 + i * 3.4]);
    }
    return list;
  }, []);

  const sortedMap = useMemo(() => {
    const map = {};
    sorted.forEach((s) => {
      map[s.id] = s.bin;
    });
    return map;
  }, [sorted]);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[36, 36]} />
        <meshStandardMaterial color="#060b12" metalness={0.8} roughness={0.25} emissive="#0b2a3f" emissiveMap={floorTex} emissiveIntensity={0.7} />
      </mesh>

      {/* ceiling light bars */}
      {[-8, 0, 8].map((z) => (
        <mesh key={z} position={[0, 5.4, z]}>
          <boxGeometry args={[16, 0.12, 0.4]} />
          <meshBasicMaterial color="#9fe8ff" toneMapped={false} />
        </mesh>
      ))}

      {racks.map((p, i) => (
        <group key={i} position={p}>
          <mesh>
            <boxGeometry args={[1.7, 3.2, 2.4]} />
            <meshStandardMaterial color="#080f18" metalness={0.75} roughness={0.35} />
          </mesh>
          {[0.9, 0.3, -0.3, -0.9].map((y, j) => (
            <mesh key={j} position={[p[0] > 0 ? -0.87 : 0.87, y, 0]}>
              <boxGeometry args={[0.04, 0.1, 1.6]} />
              <meshBasicMaterial color={j % 2 === 0 ? '#38bdf8' : '#00ff9d'} toneMapped={false} />
            </mesh>
          ))}
        </group>
      ))}

      <Bin position={[-7.5, 0, -12.5]} label="SAFE" color="#00ff9d" />
      <Bin position={[7.5, 0, -12.5]} label="PHISH" color="#ff2d55" />

      {EMAILS.map((email, i) => (
        <EmailPanel
          key={email.id}
          email={email}
          index={i}
          total={EMAILS.length}
          sortedAs={sortedMap[email.id] || null}
        />
      ))}

      <NpcActor npc={MISSION_GUIDE} register={registerInteractable} met={guideAnswered} />

      <pointLight position={[0, 5, 0]} color="#7dd3fc" intensity={2.2} distance={22} decay={2} />
      <pointLight position={[0, 2, 10]} color="#38bdf8" intensity={1.2} distance={16} decay={2} />

      {quality === 'high' && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[9.2, 9.5, 48]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.25} toneMapped={false} side={2} />
        </mesh>
      )}
    </group>
  );
}