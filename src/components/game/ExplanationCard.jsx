import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function ExplanationCard({ correct, text, xp, onContinue, label = 'Continue' }) {
  return (
    <div className="pointer-events-auto fixed inset-x-0 bottom-0 z-[60] flex justify-center p-3 sm:p-6">
      <div
        className="cb-rise w-full max-w-2xl rounded-xl border p-4 backdrop-blur-md"
        style={{
          borderColor: correct ? 'rgba(0,255,157,0.4)' : 'rgba(255,45,85,0.4)',
          background: correct ? 'rgba(4,24,18,0.96)' : 'rgba(24,4,12,0.96)'
        }}
      >
        <div className="flex items-start gap-3">
          {correct ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
          ) : (
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
          )}
          <div className="min-w-0">
            <p
              className="font-display text-[10px] uppercase tracking-[0.3em]"
              style={{ color: correct ? '#6ee7b7' : '#fda4af' }}
            >
              {correct ? 'Correct decision' : 'That one was a trap'}
              {correct && xp > 0 ? ` \u00b7 +${xp} XP` : ''}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-white/80">{text}</p>
          </div>
        </div>
        <button
          onClick={onContinue}
          className="mt-3 rounded-md border border-white/15 px-4 py-2 font-display text-[10px] uppercase tracking-[0.25em] text-white/70 transition hover:border-white/40 hover:text-white"
        >
          {label}
        </button>
      </div>
    </div>
  );
}