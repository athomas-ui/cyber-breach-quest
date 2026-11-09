import React, { useEffect, useState } from 'react';
import { CONTROL_GROUPS, LEGEND_TOGGLE_KEY } from '@/game/controls';

const STORE_KEY = 'cb_legend_hidden';

function readHidden() {
  try {
    return window.localStorage.getItem(STORE_KEY) === '1';
  } catch {
    return false;
  }
}

// Always-on legend in the bottom-left of the hub. H hides it and shows it again.
export default function ControlsLegend({ color }) {
  const [hidden, setHidden] = useState(readHidden);

  useEffect(() => {
    const onKey = (e) => {
      if (e.code !== `Key${LEGEND_TOGGLE_KEY}` || e.repeat) return;
      setHidden((v) => {
        try {
          window.localStorage.setItem(STORE_KEY, v ? '0' : '1');
        } catch {
          /* storage blocked: the toggle still works for this visit */
        }
        return !v;
      });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (hidden) {
    return (
      <div className="pointer-events-none fixed bottom-5 left-5 z-20 hidden rounded-md border border-white/10 bg-black/50 px-2.5 py-1.5 backdrop-blur-md sm:block">
        <p className="font-display text-[9px] tracking-[0.2em] text-white/60">
          <span className="text-white/90">{LEGEND_TOGGLE_KEY}</span> · Show controls
        </p>
      </div>
    );
  }

  return (
    <div className="pointer-events-none fixed bottom-5 left-5 z-20 hidden w-44 rounded-lg border border-white/10 bg-black/55 px-3 py-2.5 backdrop-blur-md sm:block">
      {CONTROL_GROUPS.map((group, i) => (
        <div key={group.id} className={i ? 'mt-2.5' : ''}>
          <p className="font-display text-[9px] uppercase tracking-[0.25em]" style={{ color }}>
            {group.title}
          </p>
          {group.items.map((item) => (
            <p key={item.keys} className="mt-1 flex justify-between font-display text-[9px] tracking-[0.12em] text-white/60">
              <span className="text-white/90">{item.keys}</span>
              <span>{item.label}</span>
            </p>
          ))}
        </div>
      ))}
      <p className="mt-2.5 border-t border-white/10 pt-1.5 font-display text-[8px] tracking-[0.2em] text-white/35">
        {LEGEND_TOGGLE_KEY} · HIDE
      </p>
    </div>
  );
}
