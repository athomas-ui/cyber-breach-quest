import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import HeroModel from '@/components/game3d/HeroModel';
import { getMove, isSprinting, controls, takeJump } from '@/game/input';
import { playerPos, groundHeightAt, world, gameClock } from '@/game/world';
import { shakeState } from '@/game/fx3d';
import { sfx } from '@/game/audio';

export default function Player({ heroId, bounds = 29, spawn = [0, 12], frozen = false, cinematic = false, tabletUp = false }) {
  const group = useRef();
  const motion = useRef({ t: 0, speed: 0, lean: 0, grounded: true });
  const vel = useRef(new THREE.Vector3());
  const vy = useRef(0);
  const grounded = useRef(true);
  const yaw = useRef(0);
  const stepAcc = useRef(0);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const tmp = useMemo(
    () => ({
      f: new THREE.Vector3(),
      r: new THREE.Vector3(),
      dir: new THREE.Vector3(),
      target: new THREE.Vector3(),
      desired: new THREE.Vector3()
    }),
    []
  );
  const { camera } = useThree();

  const spawnRef = useRef(spawn);

  useEffect(() => {
    const p = spawnRef.current;
    playerPos.set(p[0], 0, p[1]);
    vy.current = 0;
    camera.position.set(p[0], 3.6, p[1] + 7.5);
  }, [camera]);

  useFrame((_, rawDt) => {
    const scale = gameClock.speed;
    const dt = Math.min(rawDt, 0.05) * scale;
    const m = motion.current;

    const mv = frozen ? { x: 0, y: 0 } : getMove();
    const cy = controls.orbitYaw;
    const fx = -Math.sin(cy);
    const fz = -Math.cos(cy);
    const rx = Math.cos(cy);
    const rz = -Math.sin(cy);
    let dx = fx * mv.y + rx * mv.x;
    let dz = fz * mv.y + rz * mv.x;
    let mag = Math.hypot(dx, dz);
    if (mag > 1) {
      dx /= mag;
      dz /= mag;
      mag = 1;
    }

    const moving = mag > 0.05;
    const targetSpeed = moving ? (isSprinting() ? 6.5 : 3.4) : 0;
    const k = 1 - Math.exp(-(moving ? 13 : 10) * dt);
    vel.current.x += (dx * targetSpeed - vel.current.x) * k;
    vel.current.z += (dz * targetSpeed - vel.current.z) * k;

    playerPos.x += vel.current.x * dt;
    playerPos.z += vel.current.z * dt;

    const dist = Math.hypot(playerPos.x, playerPos.z);
    if (dist > bounds) {
      playerPos.x *= bounds / dist;
      playerPos.z *= bounds / dist;
      vel.current.multiplyScalar(0.2);
    }

    if (!frozen && grounded.current && takeJump()) {
      vy.current = 8.6;
      grounded.current = false;
      sfx('jump');
    }

    const ground = groundHeightAt(playerPos.x, playerPos.z, playerPos.y);
    vy.current -= 26 * dt;
    playerPos.y += vy.current * dt;
    if (playerPos.y <= ground) {
      playerPos.y = ground;
      vy.current = 0;
      if (!grounded.current) sfx('step');
      grounded.current = true;
    } else if (playerPos.y > ground + 0.05) {
      grounded.current = false;
    }

    const speed = Math.hypot(vel.current.x, vel.current.z);
    if (speed > 0.35) {
      const targetYaw = Math.atan2(vel.current.x, vel.current.z);
      let d = targetYaw - yaw.current;
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      yaw.current += d * (1 - Math.exp(-16 * dt));
      m.lean += (THREE.MathUtils.clamp(d * 1.6, -1, 1) - m.lean) * (1 - Math.exp(-8 * dt));
    } else {
      m.lean += (0 - m.lean) * (1 - Math.exp(-8 * dt));
    }
    m.speed = Math.min(1, speed / 6.5);
    m.grounded = grounded.current;

    if (grounded.current && speed > 0.6) {
      stepAcc.current += speed * dt;
      if (stepAcc.current > 1.7) {
        stepAcc.current = 0;
        sfx('step');
      }
    }

    if (group.current) {
      group.current.position.copy(playerPos);
      group.current.rotation.y = yaw.current;
    }

    if (cinematic) return;

    const pitch = THREE.MathUtils.clamp(controls.orbitPitch, -0.12, 1.05);
    const camDist = 6.6;
    tmp.target.set(playerPos.x, playerPos.y + 1.45, playerPos.z);
    tmp.desired.set(
      tmp.target.x + Math.sin(cy) * camDist * Math.cos(pitch),
      tmp.target.y + Math.sin(pitch) * camDist + 0.55,
      tmp.target.z + Math.cos(cy) * camDist * Math.cos(pitch)
    );

    tmp.dir.copy(tmp.desired).sub(tmp.target);
    const len = tmp.dir.length();
    tmp.dir.normalize();
    raycaster.set(tmp.target, tmp.dir);
    raycaster.far = len;
    const hits = raycaster.intersectObjects(world.colliders, false);
    const finalLen = hits.length ? Math.max(1.8, hits[0].distance - 0.4) : len;
    tmp.desired.copy(tmp.target).addScaledVector(tmp.dir, finalLen);
    if (tmp.desired.y < 0.9) tmp.desired.y = 0.9;

    camera.position.lerp(tmp.desired, 1 - Math.exp(-9 * dt));

    if (shakeState.value > 0.001) {
      camera.position.x += (Math.random() - 0.5) * shakeState.value;
      camera.position.y += (Math.random() - 0.5) * shakeState.value;
      camera.position.z += (Math.random() - 0.5) * shakeState.value;
      shakeState.value *= Math.exp(-6 * dt);
    }

    camera.lookAt(tmp.target);
  });

  return (
    <group ref={group}>
      <HeroModel heroId={heroId} motion={motion} tabletUp={tabletUp} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <circleGeometry args={[0.62, 20]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.35} depthWrite={false} />
      </mesh>
    </group>
  );
}