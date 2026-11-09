import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useScreenNav } from '@/components/game/ScreenTransition';
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
  const navigate = useScreenNav();
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

      <div className="relative flex h-full flex-col px-5 py-5 sm:px-8 sm:py-7">
        <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4">
          <p className="font-display text-[10px] uppercase tracking-[0.22em] text-white/75 sm:text-xs sm:tracking-[0.3em]">
            Neon Chicago <span className="text-emerald-300">/</span> Security District
          </p>
          <p className="flex shrink-0 items-center gap-2 font-mono text-[9px] uppercase tracking-[0.16em] text-emerald-200 sm:text-[10px]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.9)]" />
            System online
          </p>
        </header>

        <main className="flex flex-1 items-center justify-center py-5">
          <section className="w-full max-w-3xl rounded-2xl border border-emerald-300/20 bg-[#050b10]/85 px-5 py-7 text-center shadow-[0_0_70px_rgba(0,255,157,0.08)] backdrop-blur-md sm:px-10 sm:py-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-200 sm:text-xs sm:tracking-[0.3em]">
              Cybersecurity training simulation <span className="text-white/40">// 01</span>
            </p>
            <h1 className="cb-glitch mt-4 whitespace-nowrap font-display text-[clamp(2rem,8vw,5.25rem)] leading-none tracking-[-0.08em] text-white">
              CYBER<span className="text-emerald-300">//</span>BREACH
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
              Train your threat-detection instincts. Triage suspicious messages, verify identities, and
              stop social engineering before it becomes a breach.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-2 font-mono text-[9px] uppercase tracking-[0.12em] text-white/75 sm:gap-3 sm:text-[10px]">
              <span className="rounded border border-white/15 bg-white/[0.04] px-2.5 py-1.5">Threat triage</span>
              <span className="rounded border border-white/15 bg-white/[0.04] px-2.5 py-1.5">Identity checks</span>
              <span className="rounded border border-white/15 bg-white/[0.04] px-2.5 py-1.5">Breach response</span>
            </div>

            <div className="mx-auto mt-7 w-full max-w-xs space-y-2.5">
              <button
                onClick={() => go('/select')}
                className="group flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-300 py-3.5 font-display text-xs font-bold uppercase tracking-[0.2em] text-[#04100b] shadow-[0_0_24px_rgba(52,211,153,0.2)] transition hover:bg-emerald-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200"
              >
                <Play className="h-4 w-4" />
                {hasProgress ? 'New operative' : 'Begin training'}
              </button>

              {hasProgress && (
                <button
                  onClick={() => go('/hub')}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/25 bg-white/[0.04] py-3 font-display text-xs uppercase tracking-[0.2em] text-white/90 transition hover:border-white/50 hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Continue · {game.rank}
                </button>
              )}

              <button
                onClick={() => go('/credits')}
                className="mx-auto flex items-center justify-center gap-1 rounded-lg px-4 py-2 font-display text-[10px] uppercase tracking-[0.25em] text-white/65 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Credits <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </section>
        </main>

        <footer className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-center gap-x-3 gap-y-1 border-t border-white/10 pt-3 text-center font-mono text-[9px] uppercase tracking-[0.12em] text-white/60 sm:justify-between sm:text-[10px]">
          <span>{MISSIONS.length} mission gates · 1 showcase level live</span>
          <span>Created by Andrew Thomas · i.c.stars Cycle 60</span>
        </footer>
      </div>
    </div>
  );
}