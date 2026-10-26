import React from 'react';
import { ArrowUp, Route } from 'lucide-react';

const OPTIONS = [
  {
    id: 'arrow',
    title: 'Arrow overhead',
    description: 'Follow a floating arrow that points toward the first mission gate.',
    Icon: ArrowUp
  },
  {
    id: 'floor',
    title: 'Path on the floor',
    description: 'Follow glowing markers across the plaza to THE BAIT.',
    Icon: Route
  }
];

export default function GuideChoice({ onChoose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <section className="cb-rise w-full max-w-xl rounded-2xl border border-cyan-300/30 bg-[#060b12]/95 p-5 shadow-[0_0_60px_rgba(56,189,248,0.12)] sm:p-7">
        <p className="font-display text-[9px] uppercase tracking-[0.38em] text-cyan-300">Mission navigation</p>
        <h1 className="mt-2 font-display text-xl tracking-[0.12em] text-white sm:text-2xl">
          Choose your guide to THE BAIT
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-white/55">
          Pick how you want to find the first mission. You can explore the district and speak with its analysts along the way.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {OPTIONS.map(({ id, title, description, Icon }) => (
            <button
              key={id}
              onClick={() => onChoose(id)}
              className="group rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-cyan-300/50 hover:bg-cyan-300/[0.07]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-300/25 bg-cyan-300/[0.08] text-cyan-200">
                <Icon className="h-5 w-5" />
              </span>
              <span className="mt-3 block font-display text-[11px] uppercase tracking-[0.18em] text-white group-hover:text-cyan-100">
                {title}
              </span>
              <span className="mt-1.5 block text-xs leading-relaxed text-white/45">{description}</span>
            </button>
          ))}
        </div>
        <p className="mt-4 text-center font-display text-[9px] uppercase tracking-[0.2em] text-white/30">
          WASD or arrow keys to move · E to interact
        </p>
      </section>
    </div>
  );
}
