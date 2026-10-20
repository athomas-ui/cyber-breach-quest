import React from 'react';
import { X } from 'lucide-react';

export default function NoticeCard({ title, body, onClose, action }) {
  return (
    <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm">
      <div className="cb-rise w-full max-w-sm rounded-xl border border-white/15 bg-[#060b12]/96 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-sm tracking-[0.2em] text-white">{title}</h3>
          <button onClick={onClose} className="text-white/30 transition hover:text-white" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-white/55">{body}</p>
        {action && (
          <button
            onClick={action.onClick}
            className="mt-4 w-full rounded-md border border-white/15 py-2 font-display text-[10px] uppercase tracking-[0.25em] text-white/70 transition hover:border-white/40 hover:text-white"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}