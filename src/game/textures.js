import * as THREE from 'three';

export function gridTexture({ color = '#00ff9d', bg = '#04060c', size = 512, cells = 16 } = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const g = canvas.getContext('2d');
  g.fillStyle = bg;
  g.fillRect(0, 0, size, size);
  const step = size / cells;
  g.strokeStyle = color;
  g.lineWidth = 2;
  g.shadowColor = color;
  g.shadowBlur = 10;
  for (let i = 0; i <= cells; i++) {
    g.beginPath();
    g.moveTo(i * step, 0);
    g.lineTo(i * step, size);
    g.stroke();
    g.beginPath();
    g.moveTo(0, i * step);
    g.lineTo(size, i * step);
    g.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}

export function signTexture(lines, color = '#00ff9d', opts = {}) {
  const w = opts.width || 512;
  const h = opts.height || 256;
  const arr = Array.isArray(lines) ? lines : [lines];
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const g = canvas.getContext('2d');
  g.fillStyle = opts.background || 'rgba(4,8,16,0.92)';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = color;
  g.lineWidth = 5;
  g.shadowColor = color;
  g.shadowBlur = 22;
  g.strokeRect(10, 10, w - 20, h - 20);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  const longest = arr.reduce((m, line) => Math.max(m, line.length), 1);
  const byWidth = Math.floor(((w - 70) / longest) * 1.55);
  const byHeight = Math.floor((h - 60) / arr.length) - 8;
  const size = Math.max(16, Math.min(72, byWidth, byHeight));
  g.font = `bold ${size}px "Courier New", monospace`;
  g.shadowColor = color;
  g.shadowBlur = 18;
  arr.forEach((line, i) => {
    g.fillStyle = i === 0 ? '#eafcff' : color;
    g.fillText(line, w / 2, h / 2 + (i - (arr.length - 1) / 2) * (size + 10));
  });
  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  return tex;
}

function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export function windowsTexture(seed = 7) {
  const w = 128;
  const h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const g = canvas.getContext('2d');
  g.fillStyle = '#05070d';
  g.fillRect(0, 0, w, h);
  const rand = seeded(seed);
  const palette = ['#38bdf8', '#00ff9d', '#c084fc', '#ff9f1c', '#f8fafc'];
  for (let y = 10; y < h - 10; y += 16) {
    for (let x = 8; x < w - 8; x += 14) {
      if (rand() > 0.42) {
        g.fillStyle = palette[Math.floor(rand() * palette.length)];
        g.globalAlpha = 0.35 + rand() * 0.6;
        g.fillRect(x, y, 8, 9);
      }
    }
  }
  g.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}