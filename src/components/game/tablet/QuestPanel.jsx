import React from 'react';

export default function QuestPanel({ game }) {
  const quests = game.quest_log || [];
  const active = quests.filter((q) => q.status !== 'completed');
  const done = quests.filter((q) => q.status === 'completed');

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-lg tracking-[0.25em] text-white">QUEST LOG</h2>
        <p className="text-xs text-white/40">Field assignments in the district</p>
      </div>

      {quests.length === 0 && (
        <div className="rounded-xl border border-dashed border-white/12 p-6 text-center text-sm text-white/40">
          No active quests yet. Explore the district and talk to the contacts marked overhead.
        </div>
      )}

      {active.length > 0 && (
        <div className="space-y-2">
          <p className="font-display text-[10px] uppercase tracking-[0.3em] text-white/35">Active</p>
          {active.map((q) => (
            <div key={q.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/85">{q.title}</span>
                <span className="font-display text-[10px] tracking-widest text-amber-300">+{q.xp} XP</span>
              </div>
              {q.desc && <p className="mt-1 text-xs text-white/40">{q.desc}</p>}
            </div>
          ))}
        </div>
      )}

      {done.length > 0 && (
        <div className="space-y-2">
          <p className="font-display text-[10px] uppercase tracking-[0.3em] text-white/35">Completed</p>
          {done.map((q) => (
            <div key={q.id} className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60 line-through decoration-white/20">{q.title}</span>
                <span className="font-display text-[10px] tracking-widest text-emerald-300">Cleared</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}