import React, { useEffect, useRef, useState } from 'react';
import { ArrowUp, Zap } from 'lucide-react';
import { touchInput, queueJump, queueInteract, queueMove } from '@/game/input';

const MOVE_BUTTONS = [
  { move: 'punch', label: 'PUNCH' },
  { move: 'kick', label: 'KICK' },
  { move: 'dash', label: 'DASH' },
  { move: 'special', label: 'BLAST' }
];

export default function TouchControls() {
  const pad = useRef(null);
  const [knob, setKnob] = useState({ x: 0, y: 0, active: false });

  useEffect(() => {
    const el = pad.current;
    if (!el) return undefined;
    let id = null;

    const setFrom = (e) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      let dx = (e.clientX - cx) / (rect.width / 2);
      let dy = (e.clientY - cy) / (rect.height / 2);
      const m = Math.hypot(dx, dy);
      if (m > 1) {
        dx /= m;
        dy /= m;
      }
      touchInput.x = dx;
      touchInput.y = -dy;
      setKnob({ x: dx * 34, y: dy * 34, active: true });
    };

    const down = (e) => {
      id = e.pointerId;
      el.setPointerCapture(id);
      setFrom(e);
    };
    const move = (e) => {
      if (id === null || e.pointerId !== id) return;
      setFrom(e);
    };
    const up = () => {
      id = null;
      touchInput.x = 0;
      touchInput.y = 0;
      setKnob({ x: 0, y: 0, active: false });
    };

    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      touchInput.x = 0;
      touchInput.y = 0;
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex items-end justify-between px-5 pb-6 select-none">
      <div
        ref={pad}
        className="pointer-events-auto relative h-32 w-32 touch-none rounded-full border border-white/20 bg-white/5 backdrop-blur-sm"
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-14 w-14 rounded-full border border-white/25 bg-white/10" />
        </div>
        <div
          className="absolute left-1/2 top-1/2 h-12 w-12 rounded-full border border-cyan-300/60 bg-cyan-300/20"
          style={{ transform: `translate(-50%,-50%) translate(${knob.x}px, ${knob.y}px)`, transition: knob.active ? 'none' : 'transform 0.15s ease-out' }}
        />
      </div>

      <div className="pointer-events-auto flex items-end gap-3">
        <div className="grid grid-cols-2 gap-2">
          {MOVE_BUTTONS.map((b) => (
            <button
              key={b.move}
              onPointerDown={() => queueMove(b.move)}
              className="flex h-12 w-12 touch-none items-center justify-center rounded-full border border-fuchsia-300/50 bg-fuchsia-400/15 font-display text-[8px] tracking-wider text-fuchsia-100 active:scale-95"
            >
              {b.label}
            </button>
          ))}
        </div>
        <button
          onPointerDown={() => queueInteract()}
          className="flex h-16 w-16 touch-none items-center justify-center rounded-full border border-emerald-300/50 bg-emerald-400/15 font-display text-[10px] tracking-widest text-emerald-200 active:scale-95"
        >
          <Zap className="h-5 w-5" />
        </button>
        <button
          onPointerDown={() => queueJump()}
          className="flex h-20 w-20 touch-none items-center justify-center rounded-full border border-white/30 bg-white/10 active:scale-95"
        >
          <ArrowUp className="h-7 w-7 text-white/80" />
        </button>
      </div>
    </div>
  );
}