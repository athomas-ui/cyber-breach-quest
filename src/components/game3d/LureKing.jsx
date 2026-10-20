import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { getFight, spawnHook, expireHook, hurtShield, useFight } from '@/game/lureFight';
import { HOOKS, BOSS_HOOK_WINDOW } from '@/game/content';
import { registerInteractable, playerPos } from '@/game/world';
import { signTexture } from '@/game/textures';
import { burst, addShake } from '@/game/fx3d';
import { sfx } from '@/game/audio';

const BOSS_Z = -8;
const POOL = 16;

export default function LureKing({ quality }) {
  const fight = useFight();
  const { camera } = useThree();
  const group = useRef();
  const mouth = useRef();
  const lure = useRef();
  const lureBall = useRef();
  const finRefs = useRef([]);
  const eyeRefs = useRef([]);
  const baitRefs = useRef([]);
  const hookPanel = useRef();
  const baits = useRef(
    Array.from({ length: POOL }, () => ({ active: false, pos: new THREE.Vector3(), vel: new THREE.Vector3(), life: 0 }))
  );
  const hookPool = useRef([]);
  const spawnT = useRef(0);
  const cooldown = useRef(0);
  const introStart = useRef(0);
  const prevHook = useRef(null);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    hookPool.current = [...HOOKS].sort(() => Math.random() - 0.5);
    baits.current.forEach((b) => {
      b.active = false;
    });
  }, []);

  useEffect(() => {
    if (fight.status === 'intro') introStart.current = performance.now();
  }, [fight.status]);

  const hook = fight.hook;
  const hookSide = hook ? (hook.key % 2 === 0 ? 1 : -1) : 1;
  const hookPos = useMemo(
    () => (hook ? new THREE.Vector3(hookSide * 3.6, 2.35, BOSS_Z + 3.8) : null),
    [hook, hookSide]
  );

  const hookTex = useMemo(
    () => (hook ? signTexture([hook.from, hook.subject], hook.phish ? '#ff5fa2' : '#7dd3fc', { width: 512, height: 256 }) : null),
    [hook]
  );

  useEffect(() => {
    if (!hook || !hookPos) return undefined;
    const remove = registerInteractable({
      id: `hook-${hook.key}`,
      type: 'report',
      label: 'Report this email',
      position: hookPos.clone(),
      radius: 3.4,
      data: { hookKey: hook.key }
    });
    return remove;
  }, [hook, hookPos]);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const s = getFight();
    const now = performance.now();
    const t = now * 0.001;

    if (group.current) {
      const rise = s.status === 'intro' ? Math.max(0, 1 - (now - introStart.current) / 1400) : 1;
      group.current.position.y = -3.2 * (1 - rise) + Math.sin(t * 0.9) * 0.22;
      group.current.rotation.y = Math.sin(t * 0.35) * 0.16;
    }
    if (lure.current) lure.current.rotation.z = Math.sin(t * 1.4) * 0.28;
    if (lureBall.current) lureBall.current.scale.setScalar(1 + Math.sin(t * 4) * 0.14);
    if (mouth.current) mouth.current.scale.setScalar(1 + Math.sin(t * 2.2) * 0.06);

    finRefs.current.forEach((f, i) => {
      if (f) f.rotation.z = Math.sin(t * 2.4 + i) * 0.35;
    });
    const phaseColor = s.phase === 1 ? '#ff2d55' : s.phase === 2 ? '#ff7a1a' : '#ff1f6b';
    eyeRefs.current.forEach((e) => {
      if (e && e.material) e.material.color.set(phaseColor);
    });

    if (hookPanel.current && hookPos) {
      hookPanel.current.position.set(hookPos.x, hookPos.y + Math.sin(t * 1.8) * 0.16, hookPos.z);
      hookPanel.current.rotation.y = Math.atan2(playerPos.x - hookPos.x, playerPos.z - hookPos.z);
    }

    if (s.status === 'intro') {
      const k = Math.min(1, (now - introStart.current) / 3000);
      const ang = -1.1 + k * 1.9;
      camera.position.set(Math.sin(ang) * 13, 6.2 - k * 2.1, 2 + Math.cos(ang) * 9);
      camera.lookAt(0, 3.1, BOSS_Z);
    }

    if (s.status !== 'fight') {
      baits.current.forEach((b) => {
        b.active = false;
      });
      baits.current.forEach((b, i) => {
        if (baitRefs.current[i]) baitRefs.current[i].visible = false;
      });
      return;
    }

    if (prevHook.current && !s.hook) cooldown.current = now;
    prevHook.current = s.hook;

    // spawn a hook line
    if (!s.hook && now - cooldown.current > 2000) {
      const next = hookPool.current.pop();
      if (next) {
        spawnHook(next);
      } else {
        hookPool.current = [...HOOKS].sort(() => Math.random() - 0.5);
      }
    } else if (s.hook && now - s.hook.bornAt > BOSS_HOOK_WINDOW) {
      expireHook();
    }

    // spawn baits
    spawnT.current -= dt;
    const interval = s.phase === 1 ? 2.4 : s.phase === 2 ? 1.8 : 1.25;
    if (spawnT.current <= 0) {
      spawnT.current = interval;
      const free = baits.current.find((b) => !b.active);
      if (free) {
        free.active = true;
        free.life = 8;
        free.pos.set((Math.random() - 0.5) * 2, 3.2, BOSS_Z + 1.4);
        free.vel.set((Math.random() - 0.5) * 2, 0, 2);
      }
    }

    baits.current.forEach((b, i) => {
      const mesh = baitRefs.current[i];
      if (!b.active) {
        if (mesh) mesh.visible = false;
        return;
      }
      tmp.copy(playerPos).setY(playerPos.y + 1.05).sub(b.pos);
      const dist = tmp.length();
      if (dist > 0.001) {
        tmp.normalize().multiplyScalar(7.2 + s.phase * 0.9);
        b.vel.lerp(tmp, 1 - Math.exp(-1.4 * dt));
      }
      b.pos.addScaledVector(b.vel, dt);
      b.life -= dt;

      if (dist < 1.05 || b.life <= 0 || b.pos.y < 0.15) {
        b.active = false;
        if (mesh) mesh.visible = false;
        if (dist < 1.05) {
          hurtShield(12);
          addShake(0.2);
          sfx('hit');
          burst(b.pos, '#ff5fa2', 10, 5);
        }
        return;
      }

      if (mesh) {
        mesh.visible = true;
        mesh.position.copy(b.pos);
        mesh.rotation.x += dt * 3;
        mesh.rotation.y += dt * 2;
      }
    });
  });

  const bodyColor = fight.phase === 1 ? '#ffe3f0' : fight.phase === 2 ? '#ffd9c2' : '#ffd0e4';

  return (
    <>
    <group ref={group} position={[0, 0, BOSS_Z]}>
      {/* body: an angler fish built from envelopes */}
      <mesh position={[0, 3.1, 0]} scale={[1.5, 1.1, 1.25]}>
        <sphereGeometry args={[1.9, 24, 20]} />
        <meshStandardMaterial color={bodyColor} emissive="#ff2d55" emissiveIntensity={0.22} roughness={0.5} metalness={0.3} />
      </mesh>

      {/* envelope flap detail */}
      <mesh position={[0, 3.1, 1.9]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[2.1, 2.1, 0.07]} />
        <meshStandardMaterial color={bodyColor} roughness={0.6} metalness={0.2} />
      </mesh>

      {/* mouth */}
      <group ref={mouth} position={[0, 2.7, 2.2]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.72, 0.17, 10, 24]} />
          <meshStandardMaterial color="#2b0416" emissive="#ff2d55" emissiveIntensity={0.9} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, -0.2]}>
          <sphereGeometry args={[0.6, 16, 12]} />
          <meshBasicMaterial color="#12020a" />
        </mesh>
      </group>

      {/* teeth */}
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.62, 2.7 + Math.sin(a) * 0.62, 2.35]} rotation={[0, 0, -a]}>
            <coneGeometry args={[0.08, 0.26, 5]} />
            <meshStandardMaterial color="#fff7fb" emissive="#ff5fa2" emissiveIntensity={0.5} />
          </mesh>
        );
      })}

      {/* eyes */}
      {[-0.72, 0.72].map((x, i) => (
        <mesh key={x} ref={(el) => (eyeRefs.current[i] = el)} position={[x, 3.75, 1.62]}>
          <sphereGeometry args={[0.22, 14, 14]} />
          <meshBasicMaterial color="#ff2d55" toneMapped={false} />
        </mesh>
      ))}

      {/* fins */}
      {[
        [-1.9, 3.4, 0],
        [1.9, 3.4, 0],
        [0, 4.6, -0.6],
        [-1.4, 2.2, -0.9],
        [1.4, 2.2, -0.9]
      ].map((p, i) => (
        <mesh key={i} ref={(el) => (finRefs.current[i] = el)} position={p} rotation={[0, 0, i % 2 ? 0.6 : -0.6]}>
          <boxGeometry args={[1.5, 0.1, 1]} />
          <meshStandardMaterial color="#ffb3d4" emissive="#ff2d55" emissiveIntensity={0.4} roughness={0.5} transparent opacity={0.85} />
        </mesh>
      ))}

      {/* angler lure */}
      <group ref={lure} position={[0, 4.6, 0.8]}>
        <mesh position={[0, 0.8, 0.5]} rotation={[0.5, 0, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 2.4, 8]} />
          <meshStandardMaterial color="#1b0a14" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh ref={lureBall} position={[0, 1.85, 1.35]}>
          <sphereGeometry args={[0.42, 18, 18]} />
          <meshBasicMaterial color="#ff5fa2" toneMapped={false} />
        </mesh>
        <pointLight position={[0, 1.85, 1.35]} color="#ff5fa2" intensity={7} distance={16} decay={2} />
      </group>

      {/* bait pool */}
      {Array.from({ length: POOL }).map((_, i) => (
        <mesh key={i} ref={(el) => (baitRefs.current[i] = el)} visible={false}>
          <boxGeometry args={[0.62, 0.42, 0.08]} />
          <meshBasicMaterial color="#ff5fa2" toneMapped={false} />
        </mesh>
      ))}

      <pointLight position={[0, 3, 3]} color="#ff2d55" intensity={2.4} distance={14} decay={2} />
    </group>

      {/* dangling hook email (world space so the report zone matches) */}
      {hookPos && hookTex && (
        <group ref={hookPanel} position={hookPos}>
          <mesh>
            <planeGeometry args={[3.4, 1.7]} />
            <meshBasicMaterial map={hookTex} transparent toneMapped={false} side={2} />
          </mesh>
          <mesh position={[0, 0, -0.03]}>
            <planeGeometry args={[3.5, 1.8]} />
            <meshBasicMaterial color={hook.phish ? '#ff2d55' : '#38bdf8'} transparent opacity={0.2} toneMapped={false} side={2} depthWrite={false} />
          </mesh>
        </group>
      )}
    </>
  );
}