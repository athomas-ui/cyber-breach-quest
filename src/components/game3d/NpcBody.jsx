import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import AnimeHead, { HEAD_R } from '@/components/game3d/AnimeHead';
import { Toon } from '@/components/game3d/toon';

// Shared character body for every non-player character (district contacts and strangers).
// `stride` is a ref holding 0..1: how much the legs swing. 0 = standing still, 1 = walking.
// `carry` bends the arms forward so the character can hold a prop (passed as children).

const LOOKS = [
  { hair: '#f2b84b', style: 'short', suit: '#24324f' },
  { hair: '#e0475f', style: 'long', suit: '#2b2140' },
  { hair: '#3b2a24', style: 'spiky', suit: '#1e3b3a' },
  { hair: '#7dd3fc', style: 'long', suit: '#25283f' },
  { hair: '#2a1d3d', style: 'short', suit: '#3a2a1e' }
];

// Same id always gets the same look, so characters stay recognizable between visits.
export function lookFor(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return LOOKS[h % LOOKS.length];
}

const ALWAYS_WALKING = { current: 1 };

export default function NpcBody({ look, accent, stride = ALWAYS_WALKING, carry = false, children }) {
  const body = useRef();
  const legL = useRef();
  const legR = useRef();
  const cycle = useRef(Math.random() * 6);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const amp = stride.current;
    cycle.current += dt * 6 * (0.5 + amp * 0.5);
    const swing = Math.sin(cycle.current) * 0.4 * amp;
    if (body.current) body.current.position.y = 0.9 + Math.abs(Math.sin(cycle.current)) * 0.03 * amp;
    if (legL.current) legL.current.rotation.x = swing;
    if (legR.current) legR.current.rotation.x = -swing;
  });

  return (
    <>
      <group ref={body} position={[0, 0.9, 0]}>
        <Toon position={[0, 0.3, 0]} color={look.suit}>
          <capsuleGeometry args={[0.21, 0.3, 6, 12]} />
        </Toon>
        <mesh position={[0, 0.32, 0.205]}>
          <boxGeometry args={[0.06, 0.28, 0.02]} />
          <meshBasicMaterial color={accent} toneMapped={false} />
        </mesh>
        {[-1, 1].map((side) => (
          <group
            key={side}
            position={[side * 0.27, 0.52, 0]}
            rotation={carry ? [-1.15, side * 0.25, side * -0.2] : [0, 0, side * -0.1]}
          >
            <Toon position={[0, -0.2, 0]} color={look.suit}>
              <capsuleGeometry args={[0.066, 0.3, 4, 8]} />
            </Toon>
            <Toon position={[0, -0.42, 0]} color="#ffdcc2">
              <sphereGeometry args={[0.066, 10, 8]} />
            </Toon>
          </group>
        ))}
        <group position={[0, 0.66 + HEAD_R * 0.95, 0]}>
          <AnimeHead hair={look.hair} hairStyle={look.style} eyes={accent} eyesDeep="#0b1a33" />
        </group>
        {children}
      </group>
      <group ref={legL} position={[-0.11, 0.86, 0]}>
        <Toon position={[0, -0.36, 0]} color="#141b2e">
          <capsuleGeometry args={[0.09, 0.38, 4, 8]} />
        </Toon>
      </group>
      <group ref={legR} position={[0.11, 0.86, 0]}>
        <Toon position={[0, -0.36, 0]} color="#141b2e">
          <capsuleGeometry args={[0.09, 0.38, 4, 8]} />
        </Toon>
      </group>
    </>
  );
}
