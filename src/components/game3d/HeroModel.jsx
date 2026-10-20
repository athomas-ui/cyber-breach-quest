import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { HEROES } from '@/game/constants';

export default function HeroModel({ heroId = 'andrew', motion, tabletUp = false }) {
  const hero = HEROES[heroId] || HEROES.andrew;
  const accent = hero.color;
  const body = useRef();
  const armL = useRef();
  const armR = useRef();
  const legL = useRef();
  const legR = useRef();
  const head = useRef();
  const tablet = useRef();

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const m = motion.current;
    m.t += dt;
    const sp = m.speed || 0;
    const stride = 5 + sp * 7;
    const swing = Math.sin(m.t * stride) * (0.22 + sp * 0.8);

    if (legL.current) legL.current.rotation.x = -swing * 0.85;
    if (legR.current) legR.current.rotation.x = swing * 0.85;

    const armTarget = tabletUp ? -1.32 : swing * 0.7;
    if (armL.current) armL.current.rotation.x += (armTarget - armL.current.rotation.x) * (1 - Math.exp(-12 * dt));
    if (armR.current) armR.current.rotation.x = tabletUp ? -1.15 : -swing * 0.7;

    if (body.current) {
      body.current.position.y = 0.85 + Math.abs(Math.sin(m.t * stride)) * 0.03 * (0.3 + sp);
      body.current.rotation.z = -(m.lean || 0) * 0.18;
      body.current.rotation.x = sp * 0.12;
    }
    if (head.current) {
      head.current.rotation.x = Math.sin(m.t * 0.9) * 0.04 + sp * 0.1;
    }
    if (tablet.current) {
      tablet.current.rotation.x += ((tabletUp ? -1.1 : 0) - tablet.current.rotation.x) * (1 - Math.exp(-12 * dt));
    }
  });

  return (
    <group>
      <pointLight position={[0, 1.5, 0.4]} color={accent} intensity={2.2} distance={5} decay={2} />

      {/* legs */}
      <group ref={legL} position={[-0.125, 0.85, 0]}>
        <mesh position={[0, -0.36, 0]} castShadow>
          <capsuleGeometry args={[0.105, 0.36, 4, 10]} />
          <meshStandardMaterial color="#101827" roughness={0.7} metalness={0.25} />
        </mesh>
        <mesh position={[0, -0.66, 0.04]}>
          <boxGeometry args={[0.19, 0.11, 0.3]} />
          <meshStandardMaterial color="#05070d" roughness={0.5} metalness={0.4} />
        </mesh>
      </group>
      <group ref={legR} position={[0.125, 0.85, 0]}>
        <mesh position={[0, -0.36, 0]} castShadow>
          <capsuleGeometry args={[0.105, 0.36, 4, 10]} />
          <meshStandardMaterial color="#101827" roughness={0.7} metalness={0.25} />
        </mesh>
        <mesh position={[0, -0.66, 0.04]}>
          <boxGeometry args={[0.19, 0.11, 0.3]} />
          <meshStandardMaterial color="#05070d" roughness={0.5} metalness={0.4} />
        </mesh>
      </group>

      <group ref={body} position={[0, 0.85, 0]}>
        {/* torso */}
        <mesh position={[0, 0.34, 0]} castShadow>
          <capsuleGeometry args={[0.255, 0.3, 6, 14]} />
          <meshStandardMaterial color={hero.dark} roughness={0.55} metalness={0.35} />
        </mesh>

        {/* accent strip */}
        <mesh position={[0, 0.36, 0.235]}>
          <boxGeometry args={[0.09, 0.34, 0.03]} />
          <meshBasicMaterial color={accent} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.55, 0.2]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.34, 0.028, 0.026]} />
          <meshBasicMaterial color={accent} toneMapped={false} />
        </mesh>

        {/* backpack unit */}
        <mesh position={[0, 0.36, -0.26]}>
          <boxGeometry args={[0.3, 0.36, 0.14]} />
          <meshStandardMaterial color="#0a0f1a" roughness={0.4} metalness={0.6} />
        </mesh>
        <mesh position={[0, 0.36, -0.335]}>
          <boxGeometry args={[0.16, 0.05, 0.02]} />
          <meshBasicMaterial color={accent} toneMapped={false} />
        </mesh>

        {/* shoulders */}
        {hero.outfit === 'jacket' ? (
          <>
            <mesh position={[-0.29, 0.56, 0]}>
              <sphereGeometry args={[0.135, 12, 12]} />
              <meshStandardMaterial color="#1a1024" roughness={0.45} metalness={0.5} />
            </mesh>
            <mesh position={[0.29, 0.56, 0]}>
              <sphereGeometry args={[0.135, 12, 12]} />
              <meshStandardMaterial color="#1a1024" roughness={0.45} metalness={0.5} />
            </mesh>
            <mesh position={[0, 0.72, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.17, 0.028, 8, 18]} />
              <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.9} roughness={0.4} />
            </mesh>
          </>
        ) : (
          <mesh position={[0, 0.68, -0.06]} rotation={[0.25, 0, 0]}>
            <coneGeometry args={[0.3, 0.34, 12, 1, true]} />
            <meshStandardMaterial color="#0c1a18" roughness={0.85} metalness={0.1} side={2} />
          </mesh>
        )}

        {/* arms */}
        <group ref={armL} position={[-0.3, 0.56, 0]}>
          <mesh position={[0, -0.28, 0]} castShadow>
            <capsuleGeometry args={[0.082, 0.34, 4, 10]} />
            <meshStandardMaterial color={hero.dark} roughness={0.6} metalness={0.3} />
          </mesh>
          <mesh position={[0, -0.5, 0]}>
            <sphereGeometry args={[0.075, 10, 10]} />
            <meshStandardMaterial color="#e8b48c" roughness={0.8} />
          </mesh>
          <group ref={tablet} position={[0, -0.6, 0.12]}>
            <mesh rotation={[0.3, 0, 0]}>
              <boxGeometry args={[0.34, 0.22, 0.018]} />
              <meshStandardMaterial color="#050a12" metalness={0.8} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0, 0.013]} rotation={[0.3, 0, 0]}>
              <planeGeometry args={[0.3, 0.18]} />
              <meshBasicMaterial color={accent} toneMapped={false} opacity={0.85} transparent />
            </mesh>
          </group>
        </group>
        <group ref={armR} position={[0.3, 0.56, 0]}>
          <mesh position={[0, -0.28, 0]} castShadow>
            <capsuleGeometry args={[0.082, 0.34, 4, 10]} />
            <meshStandardMaterial color={hero.dark} roughness={0.6} metalness={0.3} />
          </mesh>
          <mesh position={[0, -0.5, 0]}>
            <sphereGeometry args={[0.075, 10, 10]} />
            <meshStandardMaterial color="#e8b48c" roughness={0.8} />
          </mesh>
        </group>

        {/* head */}
        <group ref={head} position={[0, 0.9, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.185, 18, 18]} />
            <meshStandardMaterial color="#e8b48c" roughness={0.85} />
          </mesh>
          {hero.visor ? (
            <mesh position={[0, 0.01, 0.12]} rotation={[0.05, 0, 0]}>
              <boxGeometry args={[0.3, 0.085, 0.1]} />
              <meshBasicMaterial color={accent} toneMapped={false} />
            </mesh>
          ) : (
            <mesh position={[0, 0.01, 0.16]}>
              <boxGeometry args={[0.05, 0.02, 0.02]} />
              <meshBasicMaterial color={accent} toneMapped={false} />
            </mesh>
          )}
          {hero.headset ? (
            <>
              <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0.02, -0.02]}>
                <torusGeometry args={[0.19, 0.018, 6, 20, Math.PI]} />
                <meshStandardMaterial color="#111826" metalness={0.7} roughness={0.3} />
              </mesh>
              <mesh position={[-0.19, 0.0, 0]}>
                <cylinderGeometry args={[0.06, 0.06, 0.05, 12]} />
                <meshStandardMaterial color="#0d1420" metalness={0.7} roughness={0.3} />
              </mesh>
              <mesh position={[-0.215, 0.0, 0]}>
                <cylinderGeometry args={[0.026, 0.026, 0.02, 10]} />
                <meshBasicMaterial color={accent} toneMapped={false} />
              </mesh>
              <mesh position={[-0.11, -0.03, 0.1]} rotation={[0, 0, 0.5]}>
                <cylinderGeometry args={[0.008, 0.008, 0.12, 6]} />
                <meshStandardMaterial color="#111826" metalness={0.7} roughness={0.3} />
              </mesh>
            </>
          ) : (
            <mesh position={[0, 0.14, -0.03]} rotation={[0.35, 0, 0]}>
              <coneGeometry args={[0.22, 0.2, 12]} />
              <meshStandardMaterial color={hero.dark} roughness={0.75} metalness={0.2} />
            </mesh>
          )}
        </group>
      </group>
    </group>
  );
}