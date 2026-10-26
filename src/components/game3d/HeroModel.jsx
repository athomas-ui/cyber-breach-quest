import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { HEROES } from '@/game/constants';
import AnimeHead, { HEAD_R } from '@/components/game3d/AnimeHead';
import { Toon } from '@/components/game3d/toon';

const TAU = Math.PI * 2;
const easeOut = (x) => 1 - Math.pow(1 - x, 3);
const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const PANTS = '#141b2e';
const BOOTS = '#0b0f1a';
const SKIN = '#ffdcc2';

export default function HeroModel({ heroId = 'andrew', motion, tabletUp = false }) {
  const hero = HEROES[heroId] || HEROES.andrew;
  const accent = hero.color;
  const root = useRef();
  const body = useRef();
  const armL = useRef();
  const armR = useRef();
  const legL = useRef();
  const legR = useRef();
  const head = useRef();
  const tablet = useRef();
  const mouth = useRef();
  const orb = useRef();

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const m = motion.current;
    m.t += dt;
    const sp = m.speed || 0;
    const stride = 5 + sp * 7;
    const swing = Math.sin(m.t * stride) * (0.22 + sp * 0.8);
    const a = m.action;
    const p = a ? Math.min(1, a.t / a.dur) : 0;
    // snap out fast, ease back slow — reads as a hit
    const strike = a ? (p < 0.3 ? easeOut(p / 0.3) : 1 - easeInOut((p - 0.3) / 0.7)) : 0;

    let armLx = tabletUp ? -1.32 : swing * 0.7;
    let armRx = tabletUp ? -1.15 : -swing * 0.7;
    let armLz = 0;
    let armRz = 0;
    let legLx = -swing * 0.85;
    let legRx = swing * 0.85;
    let twist = 0;
    let pitch = sp * 0.12;
    let spin = 0;
    let shout = 0;
    let charge = 0;

    if (m.grounded === false && !a) {
      // airborne tuck
      legLx = -0.7;
      legRx = 0.25;
      armLz = -0.5;
      armRz = 0.5;
    }

    if (a) {
      if (a.name === 'punch') {
        shout = strike;
        if (a.step === 2) {
          armRx = -2.9 * strike;
          armLx = -0.7;
          twist = -0.3 * strike;
          pitch = -0.2 * strike;
        } else if (a.step === 1) {
          armLx = -1.65 * strike;
          armRx = -0.8;
          twist = 0.6 * strike;
        } else {
          armRx = -1.65 * strike;
          armLx = -0.8;
          twist = -0.6 * strike;
        }
      } else if (a.name === 'kick') {
        const k = Math.sin(p * Math.PI);
        spin = easeOut(p) * TAU;
        legRx = -1.55 * k;
        legLx = 0.2 * k;
        armLz = -1.2 * k;
        armRz = 1.2 * k;
        shout = k;
      } else if (a.name === 'dash') {
        pitch = 0.6;
        armLx = 1.1;
        armRx = 1.1;
        legLx = -0.7;
        legRx = 0.6;
      } else if (a.name === 'special') {
        shout = 1;
        if (p < 0.45) {
          charge = p / 0.45;
          armLx = 0.8 * charge;
          armRx = 0.8 * charge;
          armLz = -0.35 * charge;
          armRz = 0.35 * charge;
          twist = -0.4 * charge;
          pitch = -0.12 * charge;
          legLx = -0.4 * charge;
          legRx = 0.4 * charge;
        } else {
          const r = (p - 0.45) / 0.55;
          charge = 1 - r;
          armLx = -1.55;
          armRx = -1.55;
          armLz = 0.22;
          armRz = -0.22;
          pitch = 0.22 * (1 - r);
          legLx = -0.5;
          legRx = 0.5;
        }
      }
    }

    const snap = 1 - Math.exp(-(a ? 34 : 12) * dt);
    if (armL.current) {
      armL.current.rotation.x += (armLx - armL.current.rotation.x) * snap;
      armL.current.rotation.z += (armLz - armL.current.rotation.z) * snap;
    }
    if (armR.current) {
      armR.current.rotation.x += (armRx - armR.current.rotation.x) * snap;
      armR.current.rotation.z += (armRz - armR.current.rotation.z) * snap;
    }
    if (legL.current) legL.current.rotation.x += (legLx - legL.current.rotation.x) * snap;
    if (legR.current) legR.current.rotation.x += (legRx - legR.current.rotation.x) * snap;

    if (body.current) {
      body.current.position.y = 0.85 + Math.abs(Math.sin(m.t * stride)) * 0.03 * (0.3 + sp);
      body.current.rotation.z = -(m.lean || 0) * 0.18;
      body.current.rotation.x += (pitch - body.current.rotation.x) * snap;
      body.current.rotation.y += (twist - body.current.rotation.y) * snap;
    }
    if (root.current) {
      root.current.rotation.y = spin;
      root.current.rotation.x = m.flip >= 0 ? easeInOut(m.flip) * TAU : 0;
    }
    if (head.current) {
      head.current.rotation.x = Math.sin(m.t * 0.9) * 0.04 + sp * 0.1 - (charge > 0 ? 0.1 : 0);
    }
    if (mouth.current) {
      const want = 0.25 + shout * 0.85;
      mouth.current.scale.y += (want - mouth.current.scale.y) * (1 - Math.exp(-20 * dt));
    }
    if (orb.current) {
      const s = charge > 0.01 ? 0.05 + charge * 0.2 + Math.sin(m.t * 40) * 0.02 : 0.0001;
      orb.current.scale.setScalar(s);
    }
    if (tablet.current) {
      tablet.current.rotation.x += ((tabletUp ? -1.1 : 0) - tablet.current.rotation.x) * (1 - Math.exp(-12 * dt));
      tablet.current.visible = tabletUp || !a;
    }
  });

  const leg = (ref, x) => (
    <group ref={ref} position={[x, 0.85, 0]}>
      <Toon position={[0, -0.36, 0]} color={PANTS} castShadow>
        <capsuleGeometry args={[0.09, 0.4, 4, 10]} />
      </Toon>
      <Toon position={[0, -0.7, 0.05]} scale={[1, 0.7, 1.5]} color={BOOTS} outline={0.02}>
        <sphereGeometry args={[0.1, 12, 10]} />
      </Toon>
      <mesh position={[0, -0.7, 0.2]}>
        <boxGeometry args={[0.12, 0.025, 0.02]} />
        <meshBasicMaterial color={accent} toneMapped={false} />
      </mesh>
    </group>
  );

  const arm = (ref, x, children) => (
    <group ref={ref} position={[x, 0.52, 0]}>
      <Toon position={[0, -0.25, 0]} color={hero.suit} castShadow>
        <capsuleGeometry args={[0.068, 0.3, 4, 10]} />
      </Toon>
      <mesh position={[0, -0.36, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.072, 0.014, 6, 14]} />
        <meshBasicMaterial color={accent} toneMapped={false} />
      </mesh>
      <Toon position={[0, -0.46, 0]} color={SKIN}>
        <sphereGeometry args={[0.07, 12, 10]} />
      </Toon>
      {children}
    </group>
  );

  return (
    <group ref={root} position={[0, 1, 0]}>
      <group position={[0, -1, 0]}>
        <pointLight position={[0, 1.5, 0.6]} color={accent} intensity={1.6} distance={5} decay={2} />

        {leg(legL, -0.11)}
        {leg(legR, 0.11)}

        <group ref={body} position={[0, 0.85, 0]}>
          {/* torso */}
          <Toon position={[0, 0.3, 0]} color={hero.suit} castShadow>
            <capsuleGeometry args={[0.21, 0.28, 6, 14]} />
          </Toon>
          <Toon position={[0, 0.02, 0]} color={PANTS} outline={0.012}>
            <cylinderGeometry args={[0.2, 0.19, 0.1, 14]} />
          </Toon>

          {/* accent trims */}
          <mesh position={[0, 0.32, 0.205]}>
            <boxGeometry args={[0.06, 0.3, 0.02]} />
            <meshBasicMaterial color={accent} toneMapped={false} />
          </mesh>
          <mesh position={[0, 0.07, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.2, 0.014, 6, 24]} />
            <meshBasicMaterial color={accent} toneMapped={false} />
          </mesh>

          {/* backpack unit */}
          <Toon position={[0, 0.32, -0.22]} color="#0e1626" outline={0}>
            <boxGeometry args={[0.28, 0.32, 0.12]} />
          </Toon>
          <mesh position={[0, 0.32, -0.285]}>
            <boxGeometry args={[0.15, 0.045, 0.02]} />
            <meshBasicMaterial color={accent} toneMapped={false} />
          </mesh>

          {hero.outfit === 'jacket' ? (
            <>
              {[-1, 1].map((side) => (
                <Toon key={side} position={[side * 0.25, 0.52, 0]} color="#24123a" outline={0.012}>
                  <sphereGeometry args={[0.11, 12, 10]} />
                </Toon>
              ))}
              <mesh position={[0, 0.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.15, 0.03, 8, 18]} />
                <meshBasicMaterial color={accent} toneMapped={false} />
              </mesh>
            </>
          ) : (
            <Toon position={[0, 0.6, -0.1]} rotation={[0.35, 0, 0]} color={hero.suit} outline={0.012}>
              <coneGeometry args={[0.26, 0.3, 12, 1, true]} />
            </Toon>
          )}

          {arm(
            armL,
            -0.27,
            <group ref={tablet} position={[0, -0.56, 0.12]}>
              <mesh rotation={[0.3, 0, 0]}>
                <boxGeometry args={[0.34, 0.22, 0.018]} />
                <meshStandardMaterial color="#050a12" metalness={0.8} roughness={0.3} />
              </mesh>
              <mesh position={[0, 0, 0.013]} rotation={[0.3, 0, 0]}>
                <planeGeometry args={[0.3, 0.18]} />
                <meshBasicMaterial color={accent} toneMapped={false} opacity={0.85} transparent />
              </mesh>
            </group>
          )}
          {arm(armR, 0.27)}

          {/* energy charge between the hands for the special */}
          <mesh ref={orb} position={[0, 0.3, 0.55]} scale={0.0001}>
            <sphereGeometry args={[1, 16, 12]} />
            <meshBasicMaterial color={hero.glow} toneMapped={false} transparent opacity={0.9} />
          </mesh>

          {/* neck + head */}
          <Toon position={[0, 0.6, 0]} color={SKIN} outline={0}>
            <cylinderGeometry args={[0.06, 0.07, 0.14, 10]} />
          </Toon>
          <group ref={head} position={[0, 0.66 + HEAD_R * 0.95, 0]}>
            <AnimeHead
              hair={hero.hair}
              hairStyle={hero.hairStyle}
              eyes={hero.eyes}
              eyesDeep={hero.eyesDeep}
              mouthRef={mouth}
            />
            {hero.headset && (
              <>
                <mesh position={[0, 0.03, -0.03]}>
                  <torusGeometry args={[HEAD_R * 1.12, 0.02, 6, 20, Math.PI]} />
                  <meshStandardMaterial color="#111826" metalness={0.7} roughness={0.3} />
                </mesh>
                {[-1, 1].map((side) => (
                  <group key={side} position={[side * HEAD_R * 1.08, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <mesh>
                      <cylinderGeometry args={[0.075, 0.075, 0.06, 14]} />
                      <meshStandardMaterial color="#0d1420" metalness={0.7} roughness={0.3} />
                    </mesh>
                    <mesh position={[0, side * -0.035, 0]}>
                      <cylinderGeometry args={[0.035, 0.035, 0.02, 12]} />
                      <meshBasicMaterial color={accent} toneMapped={false} />
                    </mesh>
                  </group>
                ))}
                <mesh position={[-0.2, -0.12, 0.14]} rotation={[0.4, 0, 0.9]}>
                  <cylinderGeometry args={[0.008, 0.008, 0.16, 6]} />
                  <meshStandardMaterial color="#111826" metalness={0.7} roughness={0.3} />
                </mesh>
              </>
            )}
            {hero.visor && (
              // cyber headband pushed up into the hair
              <mesh position={[0, 0.02, 0]} rotation={[-0.3, 0, 0]}>
                <torusGeometry args={[HEAD_R * 1.1, 0.022, 6, 30, Math.PI]} />
                <meshBasicMaterial color={accent} toneMapped={false} />
              </mesh>
            )}
          </group>
        </group>
      </group>
    </group>
  );
}
