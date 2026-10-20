import React from 'react';
import { Award } from 'lucide-react';
import { BADGES } from '@/game/constants';

export default function BadgesPanel({ game, hero }) {
  const earned = game.badges || [];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-lg tracking-[0.25em] text-white">BADGES</h2>
        <p className="text-xs text-white/40">
          {earned.length} of {BADGES.length} earned
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {BADGES.map((badge) => {
          const has = earned.includes(badge.id);
          return (
            <div
              key={badge.id}
              className="flex gap-3 rounded-xl border p-3 transition"
              style={{
                borderColor: has ? `${hero.color}55` : 'rgba(255,255,255,0.08)',
                background: has ? `${hero.color}0d` : 'rgba(255,255,255,0.02)'
              }}
            >
              <Award
                className="mt-0.5 h-6 w-6 shrink-0"
                style={{ color: has ? hero.color : 'rgba(255,255,255,0.18)' }}
              />
              <div>
                <p className={`font-display text-xs tracking-[0.18em] ${has ? 'text-white' : 'text-white/35'}`}>
                  {badge.name.toUpperCase()}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-white/40">
                  {has ? badge.desc : 'Locked'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}