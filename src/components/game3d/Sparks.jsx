import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { sparks, MAX_SPARKS } from '@/game/fx3d';

const BLACK = new THREE.Color(0, 0, 0);

export default function Sparks() {
  const ref = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const mesh = ref.current;
    if (!mesh) return;

    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.p.addScaledVector(s.v, dt);
      s.v.y -= 13 * dt;
      s.life -= dt * 0.85;
      if (s.life <= 0) sparks.splice(i, 1);
    }

    for (let i = 0; i < MAX_SPARKS; i++) {
      const s = sparks[i];
      if (s) {
        dummy.position.copy(s.p);
        dummy.scale.setScalar(0.11 * Math.max(0.15, s.life));
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        mesh.setColorAt(i, s.color);
      } else {
        dummy.position.set(0, -50, 0);
        dummy.scale.setScalar(0.001);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        mesh.setColorAt(i, BLACK);
      }
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, MAX_SPARKS]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}