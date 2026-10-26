import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import HeroModel from '@/components/game3d/HeroModel';
import { getMove, isSprinting, controls, takeJump, takeMove } from '@/game/input';
import { playerPos, groundHeightAt, world, gameClock } from '@/game/world';
import { shakeState, burst, addShake } from '@/game/fx3d';
import { sfx } from '@/game/audio';
import { HEROES } from '@/game/constants';

const MOVE_TIME = { punch: 0.3, kick: 0.55, dash: 0.26, special: 0.9 };
const BLAST_SPEED = 20;

export default function Player({ heroId, bounds = 29, spawn = [0, 12], frozen = false, cinematic = false, tabletUp = false }) {
  const group = useRef();
  const motion = useRef({ t: 0, speed: 0, lean: 0, grounded: true, action: null, flip: -1 });
  const combo = useRef({ step: 0, endedAt: -1 });
  const dashReadyAt = useRef(0);
  const airJumps = useRef(1);
  const blastRef = useRef();
  const blast = useRef({ life: 0, pos: new THREE.Vector3(), dir: new THREE.Vector3() });
  const hero = HEROES[heroId] || HEROES.andrew;
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
      desired: new THREE.Vector3(),
      fx: new THREE.Vector3()
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

    const fwdX = Math.sin(yaw.current);
    const fwdZ = Math.cos(yaw.current);
    const fxAt = (ahead, height) =>
      tmp.fx.set(playerPos.x + fwdX * ahead, playerPos.y + height, playerPos.z + fwdZ * ahead);

    const wanted = takeMove();
    if (wanted && !frozen && !cinematic) {
      const cur = m.action;
      if (wanted === 'punch') {
        if (!cur || (cur.name === 'punch' && cur.t > 0.12)) {
          const chained = cur || m.t - combo.current.endedAt < 0.35;
          combo.current.step = chained ? (combo.current.step + 1) % 3 : 0;
          const step = combo.current.step;
          m.action = { name: 'punch', t: 0, dur: step === 2 ? 0.42 : MOVE_TIME.punch, step };
          vel.current.x += fwdX * 3.5;
          vel.current.z += fwdZ * 3.5;
          if (step === 2 && grounded.current) {
            vy.current = 5.5;
            grounded.current = false;
          }
        }
      } else if (wanted === 'dash') {
        if (m.t >= dashReadyAt.current) {
          dashReadyAt.current = m.t + 0.45;
          m.action = { name: 'dash', t: 0, dur: MOVE_TIME.dash };
          const dirX = mag > 0.05 ? dx : fwdX;
          const dirZ = mag > 0.05 ? dz : fwdZ;
          vel.current.set(dirX * 17, 0, dirZ * 17);
          yaw.current = Math.atan2(dirX, dirZ);
          sfx('dash');
          burst(fxAt(0, 1), hero.glow, 10, 3);
        }
      } else if (!cur) {
        m.action = { name: wanted, t: 0, dur: MOVE_TIME[wanted] };
        sfx(wanted === 'special' ? 'charge' : 'whoosh');
      }
    }

    const act = m.action;
    if (act) {
      act.t += dt;
      if (!act.fired) {
        if (act.name === 'punch' && act.t >= 0.08) {
          act.fired = true;
          sfx('punch');
          burst(fxAt(0.8, act.step === 2 ? 1.7 : 1.25), hero.color, act.step === 2 ? 16 : 8, act.step === 2 ? 7 : 4);
          if (act.step === 2) addShake(0.12);
        } else if (act.name === 'kick' && act.t >= 0.22) {
          act.fired = true;
          burst(fxAt(0, 0.9), hero.color, 22, 9);
          addShake(0.1);
        } else if (act.name === 'special' && act.t >= 0.4) {
          act.fired = true;
          const b = blast.current;
          b.life = 0.9;
          b.pos.copy(fxAt(1, 1.2));
          b.dir.set(fwdX, 0, fwdZ);
          sfx('blast');
          addShake(0.3);
          burst(b.pos, hero.glow, 20, 6);
        }
      }
      if (act.name === 'dash') burst(fxAt(-0.3, 0.6 + Math.random() * 0.9), hero.color, 1, 1);
      if (act.t >= act.dur) {
        if (act.name === 'punch') combo.current.endedAt = m.t;
        m.action = null;
      }
    }

    const dashing = m.action && m.action.name === 'dash';
    const rooted = m.action && !dashing;
    const moving = mag > 0.05;
    const targetSpeed = moving ? (isSprinting() ? 6.5 : 3.4) * (rooted ? 0.25 : 1) : 0;
    const k = 1 - Math.exp(-(dashing ? 2 : moving ? 13 : 10) * dt);
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

    if (!frozen && (grounded.current || airJumps.current > 0) && takeJump()) {
      if (grounded.current) {
        vy.current = 8.6;
      } else {
        // double jump with an anime front flip
        airJumps.current -= 1;
        vy.current = 8.2;
        m.flip = 0;
        burst(fxAt(0, 0.2), hero.glow, 10, 4);
      }
      grounded.current = false;
      sfx('jump');
    }
    if (m.flip >= 0) {
      m.flip += dt / 0.5;
      if (m.flip >= 1) m.flip = -1;
    }

    const ground = groundHeightAt(playerPos.x, playerPos.z, playerPos.y);
    vy.current -= 26 * dt;
    playerPos.y += vy.current * dt;
    if (playerPos.y <= ground) {
      playerPos.y = ground;
      vy.current = 0;
      if (!grounded.current) sfx('step');
      grounded.current = true;
      airJumps.current = 1;
      m.flip = -1;
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

    const b = blast.current;
    if (b.life > 0) {
      b.life -= dt;
      b.pos.addScaledVector(b.dir, BLAST_SPEED * dt);
      if (b.life <= 0) {
        burst(b.pos, hero.color, 26, 9);
        burst(b.pos, '#ffffff', 10, 5);
      }
    }
    if (blastRef.current) {
      blastRef.current.visible = b.life > 0;
      blastRef.current.position.copy(b.pos);
      blastRef.current.rotation.z += dt * 14;
      blastRef.current.scale.setScalar(0.8 + Math.sin(m.t * 50) * 0.12);
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
    <>
      <group ref={group}>
        <HeroModel heroId={heroId} motion={motion} tabletUp={tabletUp} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
          <circleGeometry args={[0.62, 20]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.35} depthWrite={false} />
        </mesh>
      </group>

      {/* Cyber Blast projectile */}
      <group ref={blastRef} visible={false}>
        <mesh>
          <sphereGeometry args={[0.22, 16, 12]} />
          <meshBasicMaterial color="#ffffff" toneMapped={false} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.4, 16, 12]} />
          <meshBasicMaterial color={hero.color} toneMapped={false} transparent opacity={0.45} depthWrite={false} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.55, 0.04, 6, 24]} />
          <meshBasicMaterial color={hero.glow} toneMapped={false} />
        </mesh>
        <pointLight color={hero.color} intensity={4} distance={7} decay={2} />
      </group>
    </>
  );
}