import React from 'react';
import { Shield, Heart } from 'lucide-react';

export default function BossHud({ fight, onRetry, onLeave }) {
  const hpPct = Math.max(0, (fight.hp / fight.maxHp) * 100);
  const shieldPct = Math.max(0, (fight.shield / fight.maxShield) * 100);

  if (fight.status === 'lose') {
    return (
      <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur">
        <div className="w-full max-w-md rounded-xl border border-rose-500/40 bg-[#12040a]/95 p-6 text-center">
          <p className="font-display text-xs uppercase tracking-[0.35em] text-rose-400">Shield depleted</p>
          <h2 className="mt-2 font-display text-2xl tracking-[0.2em] text-white">CONNECTION LOST</h2>
          <p className="mt-2 text-sm text-white/50">
            The Lure King reeled you in. Read the sender domain before you engage \u2014 then try again.
          </p>
          <div className="mt-5 flex gap-3">
            <button
              onClick={onRetry}
              className="flex-1 rounded-md border border-rose-400/40 bg-rose-500/15 py-2.5 font-display text-[10px] uppercase tracking-[0.25em] text-rose-200"
            >
              Re-engage
            </button>
            <button
              onClick={onLeave}
              className="flex-1 rounded-md border border-white/15 py-2.5 font-display text-[10px] uppercase tracking-[0.25em] text-white/60"
            >
              Return to HQ
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (fight.status !== 'fight') return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-30 px-3 pt-3 sm:px-6 sm:pt-5">
      <div className="mx-auto max-w-2xl">
        <div className="mb-2 flex items-end justify-between">
          <p className="font-display text-xs tracking-[0.35em] text-rose-300">THE LURE KING</p>
          <p className="font-display text-[10px] uppercase tracking-[0.25em] text-white/40">Phase {fight.phase} / 3</p>
        </div>
        <div className="h-3 overflow-hidden rounded-full border border-rose-500/30 bg-black/60">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${hpPct}%`, background: 'linear-gradient(90deg,#ff2d55,#ff5fa2)', boxShadow: '0 0 18px #ff2d55' }}
          />
        </div>

        <div className="mt-3 flex items-center gap-3">
          <Shield className="h-4 w-4 text-emerald-300" />
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/60">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${shieldPct}%`, background: '#00ff9d', boxShadow: '0 0 12px #00ff9d' }}
            />
          </div>
          <span className="font-display text-[10px] tracking-widest text-emerald-300">{Math.ceil(fight.shield)}</span>
        </div>

        {fight.hook && (
          <div className="mt-3 rounded-lg border border-white/10 bg-black/50 px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate font-mono text-[11px] text-white/60">
                dangling: <span className="text-sky-300">{fight.hook.from}</span>
              </p>
              <span className="shrink-0 font-display text-[9px] uppercase tracking-[0.2em] text-amber-300">Report if phish</span>
            </div>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full origin-left rounded-full bg-amber-400"
                style={{ animation: 'cb-drain 7s linear forwards' }}
                key={fight.hook.key}
              />
            </div>
          </div>
        )}

        <p className="mt-2 text-center font-display text-[10px] uppercase tracking-[0.25em] text-white/30">
          <Heart className="mr-1 inline h-3 w-3" /> Run to the hook and press E to report it. Report only real phish.
        </p>
      </div>
    </div>
  );
}