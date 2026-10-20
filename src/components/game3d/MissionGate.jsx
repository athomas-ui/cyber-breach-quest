import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { playerPos } from '@/game/world';
import { signTexture } from '@/game/textures';

const STATE_COLOR = {
  locked: '#ff2d55',
  unlocked: '#00ff9d',
  completed: '#ffcf4d'
};

export default function MissionGate({ mission, state, slot, register }) {
  const door = useRef();
  const field = useRef();
  const badge = useRef();
  const open = useRef(0);

  const color = STATE_COLOR[state] || STATE_COLOR.locked;
  const sign = useMemo(() => signTexture([mission.name, mission.topic.toUpperCase()], color, { width: 512, height: 192 }), [mission.name, mission.topic, color]);

  useEffect(() => {
    const remove = register({
      id: `gate-${mission.id}`,
      type: 'gate',
      label: state === 'locked' ? `${mission.name} \u00b7 locked` : `Enter ${mission.name}`,
      position: new THREE.Vector3(slot.x, 1.2, slot.z),
      radius: 4.4,
      data: { missionId: mission.id }
    });
    return remove;
  }, [mission.id, mission.name, state, slot.x, slot.z, register]);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    if (!door.current || !field.current) return;

    const near = Math.hypot(playerPos.x - slot.x, playerPos.z - slot.z) < 7;
    const target = state !== 'locked' && near ? 1 : 0;
    open.current += (target - open.current) * (1 - Math.exp(-5 * dt));
    door.current.position.y = -open.current * 4.4;
    door.current.material.opacity = 0.9 - open.current * 0.5;

    field.current.visible = state === 'locked';
    if (state === 'locked') {
      field.current.material.opacity = 0.16 + Math.sin(performance.now() * 0.003) * 0.08;
    }

    if (badge.current) {
      badge.current.rotation.y += dt * 0.9;
      badge.current.position.y = 5.1 + Math.sin(performance.now() * 0.0018) * 0.12;
    }
  });

  return (
    <group position={[slot.x, 0, slot.z]} rotation={[0, slot.ry, 0]}>
      {/* frame */}
      <mesh position={[-2.15, 2.5, 0]}>
        <boxGeometry args={[0.5, 5, 0.8]} />
        <meshStandardMaterial color="#0a0f18" metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[2.15, 2.5, 0]}>
        <boxGeometry args={[0.5, 5, 0.8]} />
        <meshStandardMaterial color="#0a0f18" metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[0, 5.05, 0]}>
        <boxGeometry args={[4.8, 0.55, 0.9]} />
        <meshStandardMaterial color="#0a0f18" metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[-2.15, 2.5, 0.42]}>
        <boxGeometry args={[0.07, 4.6, 0.05]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <mesh position={[2.15, 2.5, 0.42]}>
        <boxGeometry args={[0.07, 4.6, 0.05]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>

      {/* door */}
      <mesh ref={door} position={[0, 2.1, 0]}>
        <boxGeometry args={[3.85, 4.3, 0.18]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.55} transparent opacity={0.9} metalness={0.4} roughness={0.3} />
      </mesh>

      {/* force field */}
      <mesh ref={field} position={[0, 2.1, 0.22]}>
        <planeGeometry args={[3.7, 4.1, 1, 1]} />
        <meshBasicMaterial color="#ff2d55" transparent opacity={0.2} side={2} depthWrite={false} toneMapped={false} />
      </mesh>

      {/* padlock hologram */}
      {state === 'locked' && (
        <group position={[0, 2.5, 0.4]}>
          <mesh position={[0, -0.16, 0]}>
            <boxGeometry args={[0.62, 0.5, 0.16]} />
            <meshBasicMaterial color="#ff2d55" toneMapped={false} transparent opacity={0.75} />
          </mesh>
          <mesh position={[0, 0.22, 0]}>
            <torusGeometry args={[0.2, 0.055, 8, 18, Math.PI]} />
            <meshBasicMaterial color="#ff2d55" toneMapped={false} transparent opacity={0.75} />
          </mesh>
        </group>
      )}

      {/* completion badge */}
      {state === 'completed' && (
        <mesh ref={badge} position={[0, 5.1, 0]}>
          <octahedronGeometry args={[0.42, 0]} />
          <meshBasicMaterial color="#ffcf4d" toneMapped={false} />
        </mesh>
      )}

      {/* sign */}
      <mesh position={[0, 6.35, 0.05]}>
        <planeGeometry args={[4.6, 1.7]} />
        <meshBasicMaterial map={sign} transparent toneMapped={false} />
      </mesh>

      <pointLight position={[0, 2.4, 1]} color={color} intensity={state === 'locked' ? 1.6 : 3} distance={11} decay={2} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0.4]}>
        <planeGeometry args={[5, 3.2]} />
        <meshBasicMaterial color={color} transparent opacity={0.1} toneMapped={false} depthWrite={false} />
      </mesh>
    </group>
  );
}