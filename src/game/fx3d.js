import * as THREE from 'three';

export const MAX_SPARKS = 90;
export const sparks = [];
export const shakeState = { value: 0 };

export function burst(position, color = '#00ff9d', count = 22, speed = 7) {
  for (let i = 0; i < count; i++) {
    if (sparks.length >= MAX_SPARKS) break;
    sparks.push({
      p: position.clone(),
      v: new THREE.Vector3(
        (Math.random() - 0.5) * speed,
        Math.random() * speed * 0.7 + 1.4,
        (Math.random() - 0.5) * speed
      ),
      life: 1,
      color: new THREE.Color(color)
    });
  }
}

export function addShake(amount) {
  shakeState.value = Math.min(0.85, shakeState.value + amount);
}

export function clearSparks() {
  sparks.length = 0;
  shakeState.value = 0;
}