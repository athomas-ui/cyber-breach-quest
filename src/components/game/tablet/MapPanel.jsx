import React, { useEffect, useRef } from 'react';
import { MISSIONS, GATE_SLOTS, gateState } from '@/game/constants';
import { playerPos } from '@/game/world';

function LiveDot() {
  const ref = useRef(null);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      if (ref.current) {
        const x = ((playerPos.x + 30) / 60) * 100;
        const y = ((playerPos.z + 30) / 60) * 100;
        ref.current.style.left = `${Math.max(2, Math.min(98, x))}%`;
        ref.current.style.top = `${Math.max(2, Math.min(98, y))}%`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={ref}
      className="absolute h-2.5 w-2.5 rounded-full bg-white"
      style={{ transform: 'translate(-50%,-50%)', boxShadow: '0 0 12px #fff' }}
    />
  );
}

const COLORS = { locked: '#ff2d55', unlocked: '#00ff9d', completed: '#ffcf4d' };

export default function MapPanel({ game }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-lg tracking-[0.25em] text-white">DISTRICT MAP</h2>
        <p className="text-xs text-white/40">Neon Chicago Security District</p>
      </div>

      <div
        className="relative aspect-square w-full overflow-hidden rounded-xl border border-white/10"
        style={{ background: 'radial-gradient(circle at 50% 45%, rgba(20,60,80,0.55), rgba(4,8,14,0.95))' }}
      >
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)', backgroundSize: '12.5% 12.5%' }} />

        <div className="absolute left-1/2 top-[93%] -translate-x-1/2 -translate-y-1/2 rounded-sm border border-emerald-400/60 bg-emerald-400/20 px-2 py-1 font-display text-[9px] tracking-widest text-emerald-200">
          HQ
        </div>

        {MISSIONS.map((m, i) => {
          const slot = GATE_SLOTS[i];
          const state = gateState(m, game);
          return (
            <div
              key={m.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${((slot.x + 30) / 60) * 100}%`, top: `${((slot.z + 30) / 60) * 100}%` }}
            >
              <div
                className="h-3 w-3 rounded-sm"
                style={{ background: COLORS[state], boxShadow: `0 0 10px ${COLORS[state]}` }}
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap font-display text-[9px] tracking-wider text-white/70">
                {m.name}
              </span>
            </div>
          );
        })}

        <LiveDot />
      </div>

      <div className="flex flex-wrap gap-4 text-[10px] uppercase tracking-[0.2em] text-white/45">
        <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-sm" style={{ background: COLORS.locked }} />Locked</span>
        <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-sm" style={{ background: COLORS.unlocked }} />Unlocked</span>
        <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-sm" style={{ background: COLORS.completed }} />Completed</span>
      </div>
    </div>
  );
}