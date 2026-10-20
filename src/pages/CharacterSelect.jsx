import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import HeroModel from '@/components/game3d/HeroModel';
import { HEROES } from '@/game/constants';
import { useGame, actions } from '@/game/store';
import { sfx, startMusic, ensureAudio } from '@/game/audio';

const ORDER = ['andrew', 'werdna'];

function Stage({ heroId }) {
  const spin = useRef();
  const motion = useRef({ t: 0, speed: 0, lean: 0, grounded: true });
  const hero = HEROES[heroId];

  useFrame((_, dt) => {
    if (spin.current) spin.current.rotation.y += Math.min(dt, 0.05) * 0.32;
  });

  return (
    <group position={[0, -1.5, 0]}>
      <group ref={spin}>
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[2.25, 2.45, 0.34, 48]} />
          <meshStandardMaterial color="#080e16" metalness={0.9} roughness={0.25} emissive={hero.color} emissiveIntensity={0.22} />
        </mesh>
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.08, 2.22, 56]} />
          <meshBasicMaterial color={hero.color} toneMapped={false} side={2} />
        </mesh>
        <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.4, 1.48, 56]} />
          <meshBasicMaterial color={hero.color} transparent opacity={0.35} toneMapped={false} side={2} />
        </mesh>
        <group position={[0, 0.06, 0]}>
          <HeroModel heroId={heroId} motion={motion} />
        </group>
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]}>
        <circleGeometry args={[4.5, 48]} />
        <meshBasicMaterial color={hero.color} transparent opacity={0.05} toneMapped={false} />
      </mesh>
    </group>
  );
}

export default function CharacterSelect() {
  const navigate = useNavigate();
  const game = useGame();
  const [index, setIndex] = useState(() => Math.max(0, ORDER.indexOf(game.hero || 'andrew')));
  const hero = HEROES[ORDER[index]];

  const move = (dir) => {
    sfx('click');
    setIndex((i) => (i + dir + ORDER.length) % ORDER.length);
  };

  const deploy = () => {
    ensureAudio();
    sfx('select');
    actions.setHero(hero.id);
    startMusic('hub');
    navigate('/hub');
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#04060b]">
      <Canvas camera={{ position: [0, 1.4, 6.6], fov: 42 }} dpr={[1, 2]}>
        <ambientLight intensity={0.55} color="#7f9dc0" />
        <directionalLight position={[3, 8, 6]} intensity={0.5} color="#cfe6ff" />
        <Stage heroId={hero.id} />
      </Canvas>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,transparent_25%,rgba(4,6,11,0.9)_78%)]" />

      <button
        onClick={() => navigate('/')}
        className="absolute left-5 top-5 rounded-md border border-white/10 p-2 text-white/40 transition hover:text-white"
        aria-label="Back"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>

      <div className="absolute inset-x-0 top-8 text-center">
        <p className="font-display text-[10px] uppercase tracking-[0.5em] text-white/35">Select operative</p>
      </div>

      <div className="absolute inset-x-0 bottom-0 px-4 pb-8 sm:pb-10">
        <div className="mx-auto max-w-lg">
          <button
            onClick={() => move(-1)}
            className="absolute -left-1 top-1/2 hidden -translate-y-1/2 rounded-full border border-white/15 p-3 text-white/50 transition hover:text-white sm:block"
            aria-label="Previous operative"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => move(1)}
            className="absolute -right-1 top-1/2 hidden -translate-y-1/2 rounded-full border border-white/15 p-3 text-white/50 transition hover:text-white sm:block"
            aria-label="Next operative"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div
            className="cb-rise rounded-xl border bg-[#060b12]/92 p-5 backdrop-blur-md"
            style={{ borderColor: `${hero.color}44`, boxShadow: `0 0 46px ${hero.color}1f` }}
          >
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-3xl tracking-[0.16em]" style={{ color: hero.color }}>
                  {hero.name}
                </h2>
                <p className="mt-0.5 text-xs uppercase tracking-[0.22em] text-white/35">{hero.role}</p>
              </div>
              <div className="flex gap-1.5">
                {ORDER.map((id, i) => (
                  <span
                    key={id}
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: i === index ? 22 : 8,
                      background: i === index ? hero.color : 'rgba(255,255,255,0.18)'
                    }}
                  />
                ))}
              </div>
            </div>

            <p className="mt-3 text-sm italic leading-relaxed text-white/50">“{hero.line}”</p>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => move(-1)}
                className="flex flex-1 items-center justify-center rounded-md border border-white/12 py-2.5 text-white/50 sm:hidden"
                aria-label="Previous"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                onClick={deploy}
                className="flex flex-[3] items-center justify-center gap-2 rounded-md py-2.5 font-display text-[11px] uppercase tracking-[0.3em] transition"
                style={{ background: `${hero.color}1f`, border: `1px solid ${hero.color}66`, color: hero.color }}
              >
                <Sparkles className="h-3.5 w-3.5" /> Deploy
              </button>
              <button
                onClick={() => move(1)}
                className="flex flex-1 items-center justify-center rounded-md border border-white/12 py-2.5 text-white/50 sm:hidden"
                aria-label="Next"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}