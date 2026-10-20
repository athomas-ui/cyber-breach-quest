import * as THREE from 'three';

/**
 * The live preview tags every JSX element with `data-*` attributes (for the visual editor).
 * react-three-fiber splits dashed prop names into nested paths, so it walks `data.source.location`
 * on a mesh, geometry or material and crashes with "Cannot read properties of undefined".
 * Those markers mean nothing to the scene graph, so the affected classes get a harmless deep
 * object that silently absorbs whatever path the renderer walks.
 */
const ABSORBED = new Proxy(
  {},
  {
    get: (_, key) => (key === 'set' || key === 'copy' || key === 'apply' ? undefined : ABSORBED),
    set: () => true,
  },
);

const TARGETS = [
  THREE.Object3D,
  THREE.Material,
  THREE.BufferGeometry,
  THREE.Texture,
  THREE.Fog,
  THREE.FogExp2,
];

TARGETS.forEach((Ctor) => {
  if (!Ctor) return;
  const proto = Ctor.prototype;
  if (!Object.prototype.hasOwnProperty.call(proto, 'data')) {
    Object.defineProperty(proto, 'data', {
      value: ABSORBED,
      writable: true,
      configurable: true,
    });
  }
});

export default ABSORBED;