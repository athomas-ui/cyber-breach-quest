import React from 'react';
import { Shield, Layers, Tablet as TabletIcon, Radio } from 'lucide-react';
import { rankFor, rankProgress, nextRank, MISSIONS, gateState } from '@/game/constants';

export default function HubHud({ game, hero, onTablet, prompt }) {
  const rank = rankFor(game.xp);
  const pct = Math.round(rankProgress(game.xp) * 100);
  const next = nextRank(game.xp);
  const shards = (game.shards || []).length;
  const cleared = (game.completed_missions || []).length;
  const unlocked = MISSIONS.filter((m) => gateState(m, game) === 'unlocked').length;

  return (
    <>
      <div className="pointer-events-none fixed left-3 top-3 z-20 sm:left-5 sm:top-5">
        <div className="rounded-lg border border-white/10 bg-black/55 px-3 py-2.5 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-md border font-display text-[10px]"
              style={{ borderColor: `${hero.color}66`, color: hero.color, background: `${hero.color}14` }}
            >
              {hero.name.slice(0, 2)}
            </span>
            <div>
              <p className="font-display text-[11px] tracking-[0.2em] text-white">{hero.name}</p>
              <p className="font-display text-[9px] uppercase tracking-[0.2em]" style={{ color: hero.color }}>
                {rank.name}
              </p>
            </div>
          </div>
          <div className="mt-2 h-1 w-36 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: hero.color, boxShadow: `0 0 8px ${hero.color}` }} />
          </div>
          <p className="mt-1 font-display text-[9px] tracking-[0.15em] text-white/35">
            {game.xp} XP{next ? ` · ${next.xp - game.xp} to ${next.name}` : ' · MAX'}
          </p>
        </div>
      </div>

      <div className="fixed right-3 top-3 z-20 flex flex-col items-end gap-2 sm:right-5 sm:top-5">
        <button
          onClick={onTablet}
          className="pointer-events-auto flex items-center gap-2 rounded-lg border border-white/15 bg-black/55 px-3 py-2 font-display text-[9px] uppercase tracking-[0.25em] text-white/70 backdrop-blur-md transition hover:border-white/40 hover:text-white"
        >
          <TabletIcon className="h-3.5 w-3.5" /> Tablet
          <span className="hidden text-white/25 sm:inline">TAB</span>
        </button>
        <div className="flex gap-2">
          <span className="flex items-center gap-1 rounded-md border border-white/10 bg-black/45 px-2 py-1 font-display text-[9px] tracking-[0.15em] text-cyan-200/80">
            <Layers className="h-3 w-3" /> {shards}/10
          </span>
          <span className="flex items-center gap-1 rounded-md border border-white/10 bg-black/45 px-2 py-1 font-display text-[9px] tracking-[0.15em] text-emerald-200/80">
            <Shield className="h-3 w-3" /> {cleared}/5
          </span>
        </div>
        <span className="flex items-center gap-1 rounded-md border border-white/10 bg-black/45 px-2 py-1 font-display text-[9px] tracking-[0.15em] text-white/40">
          <Radio className="h-3 w-3" /> {unlocked} gate{unlocked === 1 ? '' : 's'} live
        </span>
      </div>

      {prompt && (
        <div className="pointer-events-none fixed inset-x-0 bottom-28 z-20 flex justify-center px-4 sm:bottom-8">
          <div className="cb-rise flex items-center gap-2 rounded-full border border-white/20 bg-black/70 px-4 py-2 backdrop-blur-md">
            <span className="flex h-5 w-5 items-center justify-center rounded border border-white/30 font-display text-[9px] text-white/80">
              E
            </span>
            <span className="font-display text-[10px] uppercase tracking-[0.22em] text-white/80">{prompt}</span>
          </div>
        </div>
      )}
    </>
  );
}