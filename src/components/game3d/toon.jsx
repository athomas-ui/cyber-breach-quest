import React from 'react';
import * as THREE from 'three';

let gradient = null;

// Three hard light bands give the flat cel-shaded anime look.
export function toonGradient() {
  if (!gradient) {
    gradient = new THREE.DataTexture(new Uint8Array([90, 170, 255]), 3, 1, THREE.RedFormat);
    gradient.minFilter = THREE.NearestFilter;
    gradient.magFilter = THREE.NearestFilter;
    gradient.generateMipmaps = false;
    gradient.needsUpdate = true;
  }
  return gradient;
}

const outlines = new Map();

// Inverted-hull ink line: the back faces, pushed out along their normals, drawn flat dark.
export function outlineMaterial(thickness = 0.016, color = '#07040d') {
  const key = `${thickness}|${color}`;
  if (!outlines.has(key)) {
    outlines.set(
      key,
      new THREE.ShaderMaterial({
        uniforms: { uColor: { value: new THREE.Color(color) } },
        vertexShader: `void main() {
          vec3 p = position + normal * ${thickness.toFixed(4)};
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }`,
        fragmentShader: `uniform vec3 uColor;
        void main() { gl_FragColor = vec4(uColor, 1.0); }`,
        side: THREE.BackSide
      })
    );
  }
  return outlines.get(key);
}

export function ToonMat({ color, glow = 0.22, ...rest }) {
  return <meshToonMaterial color={color} emissive={color} emissiveIntensity={glow} gradientMap={toonGradient()} {...rest} />;
}

// A cel-shaded mesh with an ink outline. Pass the geometry as the only child.
export function Toon({ children, color, glow, outline = 0.016, castShadow = false, ...groupProps }) {
  return (
    <group {...groupProps}>
      <mesh castShadow={castShadow}>
        {children}
        <ToonMat color={color} glow={glow} />
      </mesh>
      {outline > 0 && <mesh material={outlineMaterial(outline)}>{children}</mesh>}
    </group>
  );
}
