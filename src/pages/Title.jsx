import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Play, RotateCcw } from 'lucide-react';
import { useGame } from '@/game/store';
import { MISSIONS } from '@/game/constants';
import { startMusic, sfx, ensureAudio } from '@/game/audio';

function LogoMark() {
  const core = useRef();
  const inner = useRef();
  const ring1 = useRef();
  const ring2 = useRef();

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    if (core.current) {
      core.current.rotation.y += dt * 0.5;
      core.current.rotation.x = Math.sin(t * 0.4) * 0.22;
    }
    if (inner.current) inner.current.scale.setScalar(1 + Math.sin(t * 1.6) * 0.05);
    if (ring1.current) ring1.current.rotation.z += dt * 0.7;
    if (ring2.current) {
      ring2.current.rotation.x = Math.PI / 2.4;
      ring2.current.rotation.y -= dt * 0.45;
    }
  });

  return (
    <group>
      <mesh ref={core}>
        <icosahedronGeometry args={[1.55, 1]} />
        <meshBasicMaterial color="#00ff9d" wireframe toneMapped={false} />
      </mesh>
      <mesh ref={inner}>
        <icosahedronGeometry args={[1.1, 0]} />
        <meshStandardMaterial color="#04140f" emissive="#00ff9d" emissiveIntensity={0.6} metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh ref={ring1} rotation={[Math.PI / 2.6, 0, 0]}>
        <torusGeometry args={[2.35, 0.018, 8, 90]} />
        <meshBasicMaterial color="#c084fc" toneMapped={false} />
      </mesh>
      <mesh ref={ring2}>
        <torusGeometry args={[2.95, 0.014, 8, 90]} />
        <meshBasicMaterial color="#38bdf8" toneMapped={false} />
      </mesh>
      <pointLight position={[0, 0, 3]} color="#00ff9d" intensity={10} distance={16} decay={2} />
      <pointLight position={[0, 0, -3]} color="#c084fc" intensity={7} distance={16} decay={2} />
    </group>
  );
}

export default function Title() {
  const navigate = useNavigate();
  const game = useGame();
  const hasProgress = (game.xp || 0) > 0 || (game.completed_missions || []).length > 0;

  useEffect(() => {
    startMusic('hub');
  }, []);

  const go = (path) => {
    ensureAudio();
    sfx('select');
    navigate(path);
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#04060b]">
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 6.6], fov: 45 }} dpr={[1, 2]}>
          <ambientLight intensity={0.5} />
          <LogoMark />
        </Canvas>
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,transparent_10%,rgba(4,6,11,0.85)_70%)]" />

      <div className="relative flex h-full flex-col items-center justify-between px-6 py-10 sm:py-14">
        <div className="text-center">
          <p className="font-display text-[10px] uppercase tracking-[0.55em] text-emerald-400/70">
            Neon Chicago · Security District
          </p>
        </div>

        <div className="text-center">
          <h1 className="cb-glitch font-display text-[13vw] leading-none tracking-tighter text-white sm:text-7xl md:text-8xl">
            CYBER<span className="text-emerald-400">//</span>BREACH
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/45">
            A cybersecurity action adventure. Sort the flood, spot the fake, and break the breach one
            decision at a time.
          </p>
        </div>

        <div className="w-full max-w-xs space-y-2.5">
          <button
            onClick={() => go('/select')}
            className="group flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-400/50 bg-emerald-400/10 py-3.5 font-display text-xs uppercase tracking-[0.3em] text-emerald-200 transition hover:bg-emerald-400/20"
          >
            <Play className="h-4 w-4" />
            {hasProgress ? 'New operative' : 'Start'}
          </button>

          {hasProgress && (
            <button
              onClick={() => go('/hub')}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 py-3 font-display text-xs uppercase tracking-[0.3em] text-white/70 transition hover:border-white/40 hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Continue · {game.rank}
            </button>
          )}

          <button
            onClick={() => go('/credits')}
            className="flex w-full items-center justify-center gap-1 rounded-lg py-2 font-display text-[10px] uppercase tracking-[0.35em] text-white/30 transition hover:text-white/70"
          >
            Credits <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-4 left-0 right-0 text-center font-display text-[9px] uppercase tracking-[0.4em] text-white/15">
        {MISSIONS.length} mission gates · 1 showcase level live · created by Andrew Thomas, i.c.stars Cycle 60
      </div>
    </div>
  );
}