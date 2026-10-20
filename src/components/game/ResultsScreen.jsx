import React from 'react';
import { Award, ChevronRight, Sparkles } from 'lucide-react';
import { BADGES, rankFor, RANKS } from '@/game/constants';

export default function ResultsScreen({ xpEarned, badges, xpTotal, onContinue, nextMission }) {
  const rank = rankFor(xpTotal);
  const previous = [...RANKS].reverse().find((r) => r.xp <= xpTotal && r.name !== rank.name && rank.xp > 0);
  const rankedUp = rank.xp > 0 && previous && previous.xp <= xpTotal;

  return (
    <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur">
      <div className="cb-rise w-full max-w-lg overflow-hidden rounded-xl border border-emerald-400/30 bg-[#04100c]/97">
        <div className="border-b border-emerald-400/20 px-6 py-4 text-center">
          <p className="font-display text-[10px] uppercase tracking-[0.4em] text-emerald-400">Mission complete</p>
          <h2 className="mt-1 font-display text-3xl tracking-[0.18em] text-white">THE BAIT</h2>
          <p className="mt-1 text-xs text-white/40">The Lure King has been reported and contained.</p>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="flex items-center justify-center gap-2 rounded-lg border border-emerald-400/25 bg-emerald-400/5 py-3">
            <Sparkles className="h-5 w-5 text-emerald-300" />
            <span className="font-display text-2xl tracking-widest text-emerald-300">+{xpEarned} XP</span>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-white/[0.03] px-4 py-2.5">
            <span className="text-xs uppercase tracking-[0.2em] text-white/40">Rank</span>
            <span className="font-display text-sm tracking-widest text-white">
              {rank.name.toUpperCase()}
              {rankedUp && <span className="ml-2 text-[10px] text-emerald-300">NEW</span>}
            </span>
          </div>

          {badges.length > 0 && (
            <div className="space-y-2">
              <p className="font-display text-[10px] uppercase tracking-[0.3em] text-white/35">Badges earned</p>
              {badges.map((id) => {
                const badge = BADGES.find((b) => b.id === id);
                if (!badge) return null;
                return (
                  <div key={id} className="flex items-start gap-3 rounded-lg border border-amber-400/25 bg-amber-400/5 p-3">
                    <Award className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
                    <div>
                      <p className="font-display text-[11px] tracking-[0.18em] text-amber-200">{badge.name.toUpperCase()}</p>
                      <p className="mt-0.5 text-xs text-white/45">{badge.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {nextMission && (
            <p className="text-center text-xs text-white/35">
              {nextMission.name} gate is unlocking back in the district.
            </p>
          )}
        </div>

        <button
          onClick={onContinue}
          className="flex w-full items-center justify-center gap-2 border-t border-emerald-400/20 bg-emerald-400/10 py-4 font-display text-xs uppercase tracking-[0.3em] text-emerald-200 transition hover:bg-emerald-400/20"
        >
          Return to district <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}