import React from 'react';
import { Lock } from 'lucide-react';
import { INTEL } from '@/game/constants';

export default function IntelPanel({ game, hero }) {
  const unlocked = game.intel || [];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-lg tracking-[0.25em] text-white">INTEL CODEX</h2>
        <p className="text-xs text-white/40">Notes unlocked by playing the district</p>
      </div>

      <div className="space-y-2">
        {INTEL.map((note) => {
          const has = unlocked.includes(note.id);
          return (
            <div
              key={note.id}
              className="rounded-lg border p-3"
              style={{ borderColor: has ? `${hero.color}33` : 'rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-center gap-2">
                {!has && <Lock className="h-3 w-3 text-white/25" />}
                <p className={`font-display text-[11px] tracking-[0.18em] ${has ? 'text-white' : 'text-white/30'}`}>
                  {has ? note.title.toUpperCase() : 'ENCRYPTED ENTRY'}
                </p>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-white/45">
                {has ? note.body : 'Complete missions and talk to contacts in the district to decrypt this entry.'}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}