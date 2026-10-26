import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Toon } from '@/components/game3d/toon';

export const HEAD_R = 0.27;

// [tilt down from crown, sideways spread, length, radius, lean along the scalp]
const HAIR = {
  spiky: [
    [0.95, -0.5, 0.26, 0.075, 1.1],
    [0.88, -0.16, 0.3, 0.08, 1.15],
    [0.9, 0.2, 0.28, 0.08, 1.1],
    [0.98, 0.52, 0.24, 0.07, 1.05],
    [-0.15, 0, 0.44, 0.11, -0.55],
    [-0.55, -0.45, 0.42, 0.1, -0.6],
    [-0.55, 0.45, 0.42, 0.1, -0.6],
    [-1.1, 0, 0.4, 0.1, -0.55],
    [-1.5, -0.55, 0.32, 0.09, -0.5],
    [-1.5, 0.55, 0.32, 0.09, -0.5],
    [0.45, -1.25, 0.22, 0.07, 0.9],
    [0.45, 1.25, 0.22, 0.07, 0.9]
  ],
  long: [
    [0.9, -0.42, 0.26, 0.08, 1.2],
    [0.85, -0.1, 0.3, 0.085, 1.25],
    [0.88, 0.25, 0.28, 0.08, 1.2],
    [0.95, 0.55, 0.22, 0.07, 1.15],
    [0.3, -1.2, 0.3, 0.08, 1.35],
    [0.3, 1.2, 0.3, 0.08, 1.35]
  ],
  short: [
    [0.9, -0.35, 0.22, 0.08, 1.15],
    [0.88, 0.05, 0.24, 0.085, 1.2],
    [0.92, 0.42, 0.2, 0.075, 1.1],
    [-0.4, 0, 0.26, 0.1, -0.7],
    [-0.9, -0.4, 0.24, 0.09, -0.7],
    [-0.9, 0.4, 0.24, 0.09, -0.7]
  ]
};

function Eye({ side, color, deep }) {
  return (
    <group rotation={[0.07, side * 0.36, 0]}>
      <group position={[0, 0, HEAD_R + 0.012]} scale={1.2}>
        <mesh scale={[0.85, 1.15, 1]}>
          <circleGeometry args={[0.062, 24]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0, -0.008, 0.002]} scale={[0.8, 1.15, 1]}>
          <circleGeometry args={[0.048, 24]} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
        <mesh position={[0, -0.016, 0.003]} scale={[0.8, 1, 1]}>
          <circleGeometry args={[0.03, 20]} />
          <meshBasicMaterial color={deep} />
        </mesh>
        <mesh position={[0, -0.01, 0.004]}>
          <circleGeometry args={[0.017, 16]} />
          <meshBasicMaterial color="#07040d" />
        </mesh>
        <mesh position={[side * 0.014, 0.024, 0.005]}>
          <circleGeometry args={[0.015, 14]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[-side * 0.012, -0.034, 0.005]}>
          <circleGeometry args={[0.007, 10]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        {/* upper lash line */}
        <mesh position={[0, 0.002, 0.006]} rotation={[0, 0, Math.PI * 0.1]} scale={[0.92, 1.18, 0.4]}>
          <torusGeometry args={[0.058, 0.01, 6, 20, Math.PI * 0.8]} />
          <meshBasicMaterial color="#07040d" />
        </mesh>
        <mesh position={[side * 0.056, 0.03, 0.006]} rotation={[0, 0, side * -0.5]}>
          <boxGeometry args={[0.03, 0.01, 0.004]} />
          <meshBasicMaterial color="#07040d" />
        </mesh>
      </group>
    </group>
  );
}

function Spike({ spec, color }) {
  const [down, spread, len, rad, lean] = spec;
  return (
    <group rotation={[down, 0, spread]}>
      <group position={[0, HEAD_R * 0.86, 0]} rotation={[lean, 0, 0]}>
        <Toon position={[0, len / 2, 0]} color={color} outline={0.012}>
          <coneGeometry args={[rad, len, 6]} />
        </Toon>
      </group>
    </group>
  );
}

export default function AnimeHead({ skin = '#ffdcc2', hair = '#1b2238', hairStyle = 'spiky', eyes = '#00ff9d', eyesDeep = '#06402e', mouthRef }) {
  const lids = useRef();
  const blink = useRef({ next: 2 + Math.random() * 3, t: 0 });

  useFrame((state) => {
    const b = blink.current;
    const now = state.clock.elapsedTime;
    if (now > b.next) {
      b.t = now;
      b.next = now + 2.2 + Math.random() * 3.5;
    }
    const k = (now - b.t) / 0.14;
    if (lids.current) lids.current.scale.y = k >= 0 && k < 1 ? Math.max(0.08, Math.abs(1 - 2 * k)) : 1;
  });

  return (
    <group>
      {/* skull + soft anime jaw */}
      <Toon color={skin} castShadow>
        <sphereGeometry args={[HEAD_R, 24, 20]} />
      </Toon>
      <Toon position={[0, -0.1, 0.05]} scale={[0.8, 0.62, 0.82]} color={skin} outline={0.02}>
        <sphereGeometry args={[HEAD_R * 0.9, 20, 14]} />
      </Toon>

      <group ref={lids}>
        <Eye side={-1} color={eyes} deep={eyesDeep} />
        <Eye side={1} color={eyes} deep={eyesDeep} />
      </group>

      {/* brows */}
      {[-1, 1].map((side) => (
        <group key={side} rotation={[-0.2, side * 0.36, 0]}>
          <mesh position={[0, 0, HEAD_R + 0.006]} rotation={[0, 0, side * -0.18]}>
            <boxGeometry args={[0.075, 0.013, 0.006]} />
            <meshBasicMaterial color="#120c18" />
          </mesh>
        </group>
      ))}

      {/* blush */}
      {[-1, 1].map((side) => (
        <group key={side} rotation={[0.24, side * 0.6, 0]}>
          <mesh position={[0, 0, HEAD_R + 0.004]} scale={[1.4, 0.55, 1]}>
            <circleGeometry args={[0.03, 16]} />
            <meshBasicMaterial color="#ff7aa8" transparent opacity={0.5} depthWrite={false} />
          </mesh>
        </group>
      ))}

      {/* mouth: parent scales it open when shouting a move */}
      <group rotation={[0.36, 0, 0]}>
        <group ref={mouthRef} position={[0, 0, HEAD_R - 0.004]} scale={[1, 0.25, 1]}>
          <mesh>
            <circleGeometry args={[0.026, 16]} />
            <meshBasicMaterial color="#5a0f24" />
          </mesh>
        </group>
      </group>

      {/* hair cap + locks */}
      <Toon rotation={[-0.45, 0, 0]} color={hair} outline={0.014}>
        <sphereGeometry args={[HEAD_R * 1.07, 22, 14, 0, Math.PI * 2, 0, Math.PI * 0.56]} />
      </Toon>
      {HAIR[hairStyle].map((spec, i) => (
        <Spike key={i} spec={spec} color={hair} />
      ))}
      {hairStyle === 'long' && (
        <>
          <Toon position={[0, -0.24, -0.12]} rotation={[0.15, 0, 0]} scale={[1, 1, 0.75]} color={hair} outline={0.014}>
            <cylinderGeometry args={[0.27, 0.2, 0.56, 16, 1]} />
          </Toon>
          {[-1, 1].map((side) => (
            <Toon key={side} position={[side * 0.25, -0.2, 0.06]} rotation={[0, 0, side * 0.08]} color={hair} outline={0.012}>
              <capsuleGeometry args={[0.055, 0.3, 4, 8]} />
            </Toon>
          ))}
        </>
      )}
    </group>
  );
}
