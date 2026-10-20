import React, { useEffect, useState } from 'react';

export default function DialogueBox({ name, color, role, intro, prompt, choices, onChoose, onClose }) {
  const [typed, setTyped] = useState('');
  const full = intro || '';

  useEffect(() => {
    setTyped('');
    let i = 0;
    const id = window.setInterval(() => {
      i += 2;
      setTyped(full.slice(0, i));
      if (i >= full.length) window.clearInterval(id);
    }, 18);
    return () => window.clearInterval(id);
  }, [full]);

  return (
    <div className="pointer-events-auto fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-3 sm:px-6 sm:pb-6">
      <div
        className="cb-rise w-full max-w-3xl rounded-xl border bg-[#060b12]/95 p-4 backdrop-blur-md sm:p-5"
        style={{ borderColor: `${color}55`, boxShadow: `0 0 40px ${color}22` }}
      >
        <div className="flex items-start gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border font-display text-sm"
            style={{ borderColor: `${color}66`, color, background: `${color}14` }}
          >
            {name.slice(0, 2)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <p className="font-display text-sm tracking-[0.22em]" style={{ color }}>
                {name}
              </p>
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/30">{role}</span>
            </div>
            <p className="mt-2 min-h-[2.6rem] text-sm leading-relaxed text-white/80">
              {typed}
              {typed.length < full.length && <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-white/60 align-middle" />}
            </p>
          </div>
        </div>

        {prompt && (
          <p className="mt-3 font-display text-[10px] uppercase tracking-[0.28em] text-white/35">{prompt}</p>
        )}

        <div className="mt-3 grid gap-2">
          {choices.map((c, i) => (
            <button
              key={i}
              onClick={() => onChoose(c)}
              className="group flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2.5 text-left text-sm text-white/75 transition hover:bg-white/[0.06]"
              style={{ borderColor: undefined }}
            >
              <span className="font-display text-[10px] tracking-widest text-white/25 group-hover:text-white/50">
                {String(i + 1).padStart(2, '0')}
              </span>
              {c.text}
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-3 font-display text-[10px] uppercase tracking-[0.25em] text-white/30 transition hover:text-white/70"
        >
          Close
        </button>
      </div>
    </div>
  );
}