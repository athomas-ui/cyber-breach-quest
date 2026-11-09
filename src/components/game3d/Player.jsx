import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import HeroModel from '@/components/game3d/HeroModel';
import { getMove, isSprinting, controls, takeJump, takeMove } from '@/game/input';
import { playerPos, groundHeightAt, world, gameClock } from '@/game/world';
import { shakeState, burst, addShake } from '@/game/fx3d';
import { sfx } from '@/game/audio';
import { HEROES } from '@/game/constants';
import { emitAbility, SCAN_RANGE } from '@/game/abilities';

// Cyber-defender abilities (no fighting): scan the area, raise a firewall,
// dash, and send an uplink beam. Durations are in seconds.
// What each tool DOES in the world lives in the screen that listens to
// emitAbility() (see src/game/abilities.js). This file only animates it.
const MOVE_TIME = { scan: 0.6, firewall: 0.7, dash: 0.26, uplink: 0.9 };
const FX_LIFE = { scan: 1.1, firewall: 1.4, uplink: 1.2 };

export default function Player({
  heroId,
  bounds = 29,
  spawn = [0, 12],
  frozen = false,
  cinematic = false,
  tabletUp = false,
  focus = false
}) {
  const group = useRef();
  const motion = useRef({ t: 0, speed: 0, lean: 0, grounded: true, action: null, flip: -1 });
  const dashReadyAt = useRef(0);
  const airJumps = useRef(1);
  const scanRef = useRef();
  const firewallRef = useRef();
  const uplinkRef = useRef();
  // Remaining life (seconds) of each ability's visual effect.
  const fx = useRef({ scan: 0, firewall: 0, uplink: 0, scanPos: new THREE.Vector3(), uplinkPos: new THREE.Vector3() });
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
  // Smoothed camera state: these trail the "ideal" values so motion eases instead of snapping.
  const cam = useRef({ len: 6.6, look: new THREE.Vector3(), ready: false, fov: 55, baseFov: 55 });

  const spawnRef = useRef(spawn);

  useEffect(() => {
    const p = spawnRef.current;
    playerPos.set(p[0], 0, p[1]);
    vy.current = 0;
    camera.position.set(p[0], 3.6, p[1] + 7.5);
    cam.current.look.set(p[0], 1.45, p[1]);
    cam.current.fov = camera.fov;
    cam.current.baseFov = camera.fov;
    cam.current.ready = true;
  }, [camera]);

  useFrame((_, rawDt) => {
    const scale = gameClock.speed;
    const dt = Math.min(rawDt, 0.05) * scale;
    const m = motion.current;

    const mv = frozen ? { x: 0, y: 0 } : getMove();
    const cy = controls.orbitYaw;
    const camFwdX = -Math.sin(cy);
    const camFwdZ = -Math.cos(cy);
    const rx = Math.cos(cy);
    const rz = -Math.sin(cy);
    let dx = camFwdX * mv.y + rx * mv.x;
    let dz = camFwdZ * mv.y + rz * mv.x;
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
      if (wanted === 'dash') {
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
        sfx(wanted === 'uplink' ? 'charge' : 'select');
      }
    }

    const act = m.action;
    if (act) {
      act.t += dt;
      if (!act.fired) {
        const f = fx.current;
        if (act.name === 'scan' && act.t >= 0.15) {
          // radar ping: a ring sweeps out along the ground from the player
          act.fired = true;
          f.scan = FX_LIFE.scan;
          f.scanPos.set(playerPos.x, playerPos.y + 0.06, playerPos.z);
          sfx('scan');
          emitAbility('scan');
        } else if (act.name === 'firewall' && act.t >= 0.2) {
          // a protective hex dome pops up around the player
          act.fired = true;
          f.firewall = FX_LIFE.firewall;
          sfx('firewall');
          burst(fxAt(0, 1), hero.glow, 12, 3);
          emitAbility('firewall');
        } else if (act.name === 'uplink' && act.t >= 0.4) {
          // a signal beam shoots from the raised hand up into the sky
          act.fired = true;
          f.uplink = FX_LIFE.uplink;
          f.uplinkPos.set(playerPos.x, playerPos.y, playerPos.z);
          sfx('uplink');
          addShake(0.08);
          emitAbility('uplink');
          burst(fxAt(0.2, 2.2), hero.glow, 16, 5);
        }
      }
      if (act.name === 'dash') burst(fxAt(-0.3, 0.6 + Math.random() * 0.9), hero.color, 1, 1);
      if (act.t >= act.dur) {
        m.action = null;
      }
    }

    const dashing = m.action && m.action.name === 'dash';
    const rooted = m.action && !dashing;
    const moving = mag > 0.05;
    const targetSpeed = moving ? (isSprinting() ? 6.5 : 3.4) * (rooted ? 0.25 : 1) : 0;
    const k = 1 - Math.exp(-(dashing ? 2 : moving ? 10 : 8) * dt);
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
      yaw.current += d * (1 - Math.exp(-12 * dt));
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

    // ---- Ability effects ----
    const f = fx.current;
    if (scanRef.current) {
      f.scan = Math.max(0, f.scan - dt);
      const p = 1 - f.scan / FX_LIFE.scan; // 0 → 1 as the ring grows
      scanRef.current.visible = f.scan > 0;
      scanRef.current.position.copy(f.scanPos);
      scanRef.current.scale.setScalar(0.3 + p * SCAN_RANGE);
      scanRef.current.children.forEach((c) => (c.material.opacity = (1 - p) * 0.8));
    }
    if (firewallRef.current) {
      f.firewall = Math.max(0, f.firewall - dt);
      const p = 1 - f.firewall / FX_LIFE.firewall;
      firewallRef.current.visible = f.firewall > 0;
      firewallRef.current.position.set(playerPos.x, playerPos.y + 0.9, playerPos.z);
      firewallRef.current.rotation.y += dt * 1.2;
      // pop in quickly, then hold and fade out
      firewallRef.current.scale.setScalar(Math.min(1, p * 6) * 1.15);
      const fade = Math.min(1, (1 - p) * 2.5);
      // children[0] is the hex wireframe, children[1] the faint fill
      firewallRef.current.children.forEach((c, i) => (c.material.opacity = fade * (i === 0 ? 0.7 : 0.12)));
    }
    if (uplinkRef.current) {
      f.uplink = Math.max(0, f.uplink - dt);
      const p = 1 - f.uplink / FX_LIFE.uplink;
      uplinkRef.current.visible = f.uplink > 0;
      uplinkRef.current.position.copy(f.uplinkPos);
      uplinkRef.current.scale.set(1 - p * 0.7, Math.min(1, p * 5), 1 - p * 0.7);
      uplinkRef.current.children.forEach((c) => (c.material.opacity = (1 - p) * 0.7));
    }

    if (cinematic) return;

    // ---- Third-person camera (eased) ----
    // 1. Work out where the camera *wants* to be (orbit angle, pitch, distance).
    // 2. Pull it in if a wall is in the way.
    // 3. Ease the real camera toward that spot, and ease what it looks at, so
    //    jumps, dashes and wall bumps feel smooth instead of jittery.
    const c = cam.current;
    const pitch = THREE.MathUtils.clamp(controls.orbitPitch, -0.12, 1.05);
    const camDist = focus ? 4.6 : 6.6; // dolly in during conversations
    tmp.target.set(playerPos.x, playerPos.y + (focus ? 1.6 : 1.45), playerPos.z);

    // Look target: follows sideways quickly, vertically slowly (no bobbing on jumps).
    if (!c.ready) {
      c.look.copy(tmp.target);
      c.ready = true;
    }
    c.look.x += (tmp.target.x - c.look.x) * (1 - Math.exp(-12 * dt));
    c.look.z += (tmp.target.z - c.look.z) * (1 - Math.exp(-12 * dt));
    c.look.y += (tmp.target.y - c.look.y) * (1 - Math.exp(-5 * dt));

    tmp.dir.set(
      Math.sin(cy) * Math.cos(pitch),
      Math.sin(pitch) + 0.55 / camDist,
      Math.cos(cy) * Math.cos(pitch)
    ).normalize();
    raycaster.set(c.look, tmp.dir);
    raycaster.far = camDist;
    const hits = raycaster.intersectObjects(world.colliders, false);
    const wantLen = hits.length ? Math.max(1.8, hits[0].distance - 0.4) : camDist;
    // Pull in fast when a wall blocks the view, drift back out slowly when it clears.
    const lenRate = wantLen < c.len ? 18 : 3.5;
    c.len += (wantLen - c.len) * (1 - Math.exp(-lenRate * dt));

    tmp.desired.copy(c.look).addScaledVector(tmp.dir, c.len);
    if (tmp.desired.y < 0.9) tmp.desired.y = 0.9;
    camera.position.lerp(tmp.desired, 1 - Math.exp(-7 * dt));

    // Field of view widens a little while sprinting or dashing for a sense of speed.
    const wantFov = c.baseFov + (dashing ? 7 : 0) + (isSprinting() && moving && !frozen ? 4 : 0) - (focus ? 4 : 0);
    c.fov += (wantFov - c.fov) * (1 - Math.exp(-5 * dt));
    if (Math.abs(camera.fov - c.fov) > 0.01) {
      camera.fov = c.fov;
      camera.updateProjectionMatrix();
    }

    if (shakeState.value > 0.001) {
      camera.position.x += (Math.random() - 0.5) * shakeState.value;
      camera.position.y += (Math.random() - 0.5) * shakeState.value;
      camera.position.z += (Math.random() - 0.5) * shakeState.value;
      shakeState.value *= Math.exp(-6 * dt);
    }

    camera.lookAt(c.look);
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

      {/* Scan: radar ring along the ground */}
      <group ref={scanRef} visible={false}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.9, 1, 48]} />
          <meshBasicMaterial color={hero.glow} toneMapped={false} transparent depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.6, 0.63, 48]} />
          <meshBasicMaterial color={hero.color} toneMapped={false} transparent depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Firewall: wireframe shield dome around the player */}
      <group ref={firewallRef} visible={false}>
        <mesh>
          <icosahedronGeometry args={[1.1, 1]} />
          <meshBasicMaterial color={hero.glow} toneMapped={false} wireframe transparent depthWrite={false} />
        </mesh>
        <mesh>
          <sphereGeometry args={[1.08, 20, 14]} />
          <meshBasicMaterial color={hero.color} toneMapped={false} transparent depthWrite={false} />
        </mesh>
      </group>

      {/* Uplink: signal beam into the sky */}
      <group ref={uplinkRef} visible={false}>
        <mesh position={[0, 12, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 24, 10, 1, true]} />
          <meshBasicMaterial color="#ffffff" toneMapped={false} transparent depthWrite={false} />
        </mesh>
        <mesh position={[0, 12, 0]}>
          <cylinderGeometry args={[0.35, 0.35, 24, 14, 1, true]} />
          <meshBasicMaterial color={hero.color} toneMapped={false} transparent depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </>
  );
}