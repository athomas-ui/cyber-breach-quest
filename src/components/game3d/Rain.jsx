import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Rain({ count = 900, area = 60, height = 26, color = '#9fd8ff', speed = 22 }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * area;
      arr[i * 3 + 1] = Math.random() * height;
      arr[i * 3 + 2] = (Math.random() - 0.5) * area;
    }
    return arr;
  }, [count, area, height]);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const geo = ref.current && ref.current.geometry;
    if (!geo) return;
    const pos = geo.attributes.position.array;
    for (let i = 0; i < count; i++) {
      const y = i * 3 + 1;
      pos[y] -= speed * dt;
      if (pos[y] < 0) {
        pos[y] = height;
        pos[i * 3] = (Math.random() - 0.5) * area;
        pos[i * 3 + 2] = (Math.random() - 0.5) * area;
      }
    }
    geo.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.085} transparent opacity={0.5} depthWrite={false} />
    </points>
  );
}