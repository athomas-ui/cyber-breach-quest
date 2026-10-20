import React from 'react';
import { MISSIONS, rankFor, nextRank, rankProgress } from '@/game/constants';

export default function ProfilePanel({ game, hero }) {
  const rank = rankFor(game.xp);
  const next = nextRank(game.xp);
  const pct = Math.round(rankProgress(game.xp) * 100);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-xl border font-display text-xl"
          style={{ borderColor: `${hero.color}66`, color: hero.color, background: `${hero.color}12` }}
        >
          {hero.name.slice(0, 2)}
        </div>
        <div>
          <h2 className="font-display text-2xl tracking-[0.2em] text-white">{hero.name}</h2>
          <p className="text-sm text-white/45">{hero.role}</p>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 p-4">
        <div className="mb-2 flex items-end justify-between">
          <span className="font-display text-sm tracking-[0.25em]" style={{ color: hero.color }}>
            {rank.name.toUpperCase()}
          </span>
          <span className="font-display text-sm text-white/60">
            {game.xp} XP{next ? ` / ${next.xp}` : ''}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: hero.color, boxShadow: `0 0 14px ${hero.color}` }}
          />
        </div>
        <p className="mt-2 text-xs text-white/40">
          {next ? `${next.xp - game.xp} XP to ${next.name}` : 'Maximum rank reached'}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Missions', value: `${(game.completed_missions || []).length}/5` },
          { label: 'Shards', value: `${(game.shards || []).length}/10` },
          { label: 'Badges', value: `${(game.badges || []).length}` }
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-white/10 p-3 text-center">
            <p className="font-display text-xl text-white">{stat.value}</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">{stat.label}</p>
          </div>
        ))}
      </div>

      <p className="border-l-2 pl-3 text-sm italic text-white/45" style={{ borderColor: `${hero.color}66` }}>
        {hero.line}
      </p>

      <div>
        <p className="mb-2 font-display text-[10px] uppercase tracking-[0.3em] text-white/35">Mission record</p>
        <div className="space-y-1.5">
          {MISSIONS.map((m) => {
            const done = (game.completed_missions || []).includes(m.id);
            return (
              <div key={m.id} className="flex items-center justify-between rounded-md bg-white/[0.03] px-3 py-2 text-sm">
                <span className="text-white/65">
                  <span className="mr-2 text-white/25">{String(m.index).padStart(2, '0')}</span>
                  {m.name}
                </span>
                <span className="text-[10px] uppercase tracking-widest" style={{ color: done ? '#00ff9d' : 'rgba(255,255,255,0.25)' }}>
                  {done ? 'Cleared' : 'Pending'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}