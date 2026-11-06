import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import NpcBody, { lookFor } from '@/components/game3d/NpcBody';
import { playerPos, world } from '@/game/world';
import { STRANGER_TIMING } from '@/game/content';

// A stranger who walks up to the player and attempts a social engineering trick.
// The parent (Hub) owns the encounter and tells this actor which phase it is in:
//   approach -> walk toward the player; call onReach() when close enough
//   talk     -> stand still and face the player while the dialogue is open
//   leave    -> walk away from the player; call onGone() once out of sight
// Movement lives here so the stranger animates every frame without re-rendering React.

const TALK_DIST = 1.8;
const LEAVE_DIST = 16;
const BOUNDS = 28;

function insidePlatform(x, z, margin = 0.5) {
  for (let i = 0; i < world.platforms.length; i++) {
    const p = world.platforms[i];
    if (Math.abs(x - p.x) <= p.w / 2 + margin && Math.abs(z - p.z) <= p.d / 2 + margin) return true;
  }
  return false;
}

// Steer around the low platform boxes instead of walking through them.
function steer(x, z, dirX, dirZ) {
  if (!insidePlatform(x + dirX * 0.9, z + dirZ * 0.9)) return [dirX, dirZ];
  for (const turn of [1.1, -1.1, 2, -2]) {
    const c = Math.cos(turn);
    const s = Math.sin(turn);
    const nx = dirX * c - dirZ * s;
    const nz = dirX * s + dirZ * c;
    if (!insidePlatform(x + nx * 0.9, z + nz * 0.9)) return [nx, nz];
  }
  return [dirX, dirZ];
}

function Prop({ kind, color }) {
  if (kind === 'boxes') {
    return (
      <group position={[0, 0.2, 0.42]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.52, 0.28, 0.36]} />
          <meshStandardMaterial color="#9a6a3c" roughness={0.9} />
        </mesh>
        <mesh position={[0.03, 0.25, -0.02]} rotation={[0, 0.2, 0]}>
          <boxGeometry args={[0.42, 0.22, 0.3]} />
          <meshStandardMaterial color="#b07a45" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.001, 0.181]}>
          <planeGeometry args={[0.08, 0.28]} />
          <meshBasicMaterial color="#d8c39a" />
        </mesh>
      </group>
    );
  }
  if (kind === 'clipboard') {
    return (
      <group position={[0, 0.22, 0.4]} rotation={[-0.5, 0, 0]}>
        <mesh>
          <boxGeometry args={[0.3, 0.4, 0.02]} />
          <meshStandardMaterial color="#6b4a2f" />
        </mesh>
        <mesh position={[0, -0.02, 0.012]}>
          <planeGeometry args={[0.25, 0.32]} />
          <meshBasicMaterial color="#e8e4d8" />
        </mesh>
        <mesh position={[0, 0.19, 0.02]}>
          <boxGeometry args={[0.1, 0.04, 0.03]} />
          <meshStandardMaterial color="#9aa4b2" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* lanyard badge with no photo: looks official from a distance */}
        <mesh position={[0, 0.02, -0.17]} rotation={[0.5, 0, 0]}>
          <planeGeometry args={[0.12, 0.16]} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
      </group>
    );
  }
  // phone
  return (
    <group position={[0.06, 0.2, 0.4]} rotation={[-0.9, 0, 0]}>
      <mesh>
        <boxGeometry args={[0.09, 0.17, 0.014]} />
        <meshStandardMaterial color="#111827" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.008]}>
        <planeGeometry args={[0.075, 0.15]} />
        <meshBasicMaterial color="#1f2937" />
      </mesh>
    </group>
  );
}

function AlertMarker({ color }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.position.y = 2.75 + Math.sin(t * 4) * 0.08;
    ref.current.scale.setScalar(1 + Math.sin(t * 8) * 0.08);
  });
  return (
    <group ref={ref} position={[0, 2.75, 0]}>
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[0.07, 0.26, 0.07]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.12, 0]}>
        <boxGeometry args={[0.07, 0.07, 0.07]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <pointLight color={color} intensity={1.4} distance={4} decay={2} />
    </group>
  );
}

export default function StrangerActor({ scenario, phase, spawn, onReach, onGiveUp, onGone }) {
  const look = lookFor(`stranger-${scenario.id}`);
  const group = useRef();
  const pos = useRef(new THREE.Vector2(spawn[0], spawn[1]));
  const yaw = useRef(Math.atan2(playerPos.x - spawn[0], playerPos.z - spawn[1]));
  const speed = useRef(0);
  const stride = useRef(0);
  const age = useRef(0); // seconds of game time since spawning
  const leftFrom = useRef(null);
  const fired = useRef({ reach: false, giveUp: false, gone: false });
  const cb = useRef({ onReach, onGiveUp, onGone });
  cb.current = { onReach, onGiveUp, onGone };

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    age.current += dt;
    const p = pos.current;
    const toX = playerPos.x - p.x;
    const toZ = playerPos.z - p.y;
    const dist = Math.hypot(toX, toZ) || 0.0001;

    let wantSpeed = 0;
    let dirX = 0;
    let dirZ = 0;
    let faceYaw = Math.atan2(toX, toZ);

    if (phase === 'approach') {
      if (dist > TALK_DIST) {
        wantSpeed = dist > 6 ? 3.2 : 2.2; // slows down as they get close, like a real person
        [dirX, dirZ] = steer(p.x, p.y, toX / dist, toZ / dist);
        faceYaw = Math.atan2(dirX, dirZ);
      } else if (!fired.current.reach) {
        fired.current.reach = true;
        cb.current.onReach();
      }
      if (!fired.current.reach && !fired.current.giveUp && age.current * 1000 > STRANGER_TIMING.giveUpAfter) {
        fired.current.giveUp = true;
        cb.current.onGiveUp();
      }
    } else if (phase === 'leave') {
      if (!leftFrom.current) leftFrom.current = new THREE.Vector2(p.x, p.y);
      wantSpeed = 3;
      [dirX, dirZ] = steer(p.x, p.y, -toX / dist, -toZ / dist);
      faceYaw = Math.atan2(dirX, dirZ);
      if (!fired.current.gone && (p.distanceTo(leftFrom.current) > LEAVE_DIST || dist > 22)) {
        fired.current.gone = true;
        cb.current.onGone();
      }
    }

    // Ease speed and stride so starts and stops look natural.
    speed.current += (wantSpeed - speed.current) * (1 - Math.exp(-5 * dt));
    stride.current += ((wantSpeed > 0 ? 1 : 0) - stride.current) * (1 - Math.exp(-6 * dt));
    p.x += dirX * speed.current * dt;
    p.y += dirZ * speed.current * dt;
    const r = Math.hypot(p.x, p.y);
    if (r > BOUNDS && phase !== 'leave') {
      p.x *= BOUNDS / r;
      p.y *= BOUNDS / r;
    }

    let d = faceYaw - yaw.current;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    yaw.current += d * (1 - Math.exp(-7 * dt));

    if (group.current) {
      group.current.position.set(p.x, 0, p.y);
      group.current.rotation.y = yaw.current;
      // Grow in when they first appear...
      const alive = Math.min(1, age.current / 0.6);
      // ...and blink out over the last few steps of leaving.
      const away = leftFrom.current ? Math.min(1, Math.max(0, (LEAVE_DIST - p.distanceTo(leftFrom.current)) / 3)) : 1;
      group.current.scale.setScalar(Math.max(0.001, Math.min(alive, away)));
    }
  });

  return (
    <group ref={group}>
      <NpcBody look={look} accent={scenario.color} stride={stride} carry>
        <Prop kind={scenario.prop} color={scenario.color} />
      </NpcBody>
      {phase === 'approach' && <AlertMarker color={scenario.color} />}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <circleGeometry args={[0.55, 20]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.3} depthWrite={false} />
      </mesh>
    </group>
  );
}
