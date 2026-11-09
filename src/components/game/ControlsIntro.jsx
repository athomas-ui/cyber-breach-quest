import React, { useEffect } from 'react';
import { CONTROL_GROUPS } from '@/game/controls';

export const INTRO_SEEN_KEY = 'cb_controls_seen';

export function controlsIntroSeen() {
  try {
    return window.localStorage.getItem(INTRO_SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

// First-visit controls card. Shows once, after the guide choice, then lives in the HUD legend.
export default function ControlsIntro({ color, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Enter' || e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <section className="cb-rise max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-cyan-300/30 bg-[#060b12]/95 p-5 sm:p-7">
        <p className="font-display text-[9px] uppercase tracking-[0.38em] text-cyan-300">Field briefing</p>
        <h1 className="mt-2 font-display text-xl tracking-[0.12em] text-white sm:text-2xl">Your controls</h1>
        <p className="mt-2 text-sm leading-relaxed text-white/55">
          You are a Junior SOC Analyst on patrol. Move with WASD, press E on anything that glows, and use your analyst tools to find intel.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {CONTROL_GROUPS.map((group) => (
            <div key={group.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <p className="font-display text-[9px] uppercase tracking-[0.3em]" style={{ color }}>
                {group.title}
              </p>
              {group.items.map((item) => (
                <div key={item.keys} className="mt-2.5">
                  <p className="flex items-center gap-2">
                    <span className="rounded border border-white/25 px-1.5 py-0.5 font-display text-[9px] text-white/90">{item.keys}</span>
                    <span className="font-display text-[10px] uppercase tracking-[0.18em] text-white/85">{item.label}</span>
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-white/45">{item.detail}</p>
                </div>
              ))}
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-md border py-2.5 font-display text-[10px] uppercase tracking-[0.25em] text-white transition hover:bg-white/5"
          style={{ borderColor: `${color}99` }}
        >
          Start patrol · Enter
        </button>
        <p className="mt-2 text-center font-display text-[9px] tracking-[0.2em] text-white/35">
          Press H in the district to hide or show the controls legend
        </p>
      </section>
    </div>
  );
}
