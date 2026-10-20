import React from 'react';
import { AlertTriangle, CheckCircle2, Mail, Link2 } from 'lucide-react';

export default function EmailInspector({ email, onDecide }) {
  return (
    <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="cb-rise w-full max-w-xl overflow-hidden rounded-xl border border-sky-400/30 bg-[#060b12]/97">
        <div className="flex items-center gap-2 border-b border-sky-400/20 px-5 py-3">
          <Mail className="h-4 w-4 text-sky-300" />
          <p className="font-display text-[10px] uppercase tracking-[0.3em] text-sky-300">Message inspection</p>
        </div>

        <div className="space-y-3 px-5 py-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">From</p>
            <p className="break-all font-mono text-sm text-sky-200">{email.from}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">Subject</p>
            <p className="text-sm text-white/85">{email.subject}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <p className="text-sm leading-relaxed text-white/65">{email.body}</p>
            {email.link && (
              <p className="mt-2 flex items-center gap-1.5 break-all font-mono text-xs text-amber-300/80">
                <Link2 className="h-3 w-3 shrink-0" />
                {email.link}
              </p>
            )}
          </div>
          <p className="text-xs text-white/35">Read the sender domain, the deadline, and where the link actually goes.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-white/10 px-5 py-4">
          <button
            onClick={() => onDecide(true)}
            className="flex items-center justify-center gap-2 rounded-lg border border-emerald-400/40 bg-emerald-400/10 py-3 font-display text-xs uppercase tracking-[0.2em] text-emerald-200 transition hover:bg-emerald-400/20"
          >
            <CheckCircle2 className="h-4 w-4" /> Safe
          </button>
          <button
            onClick={() => onDecide(false)}
            className="flex items-center justify-center gap-2 rounded-lg border border-rose-400/40 bg-rose-400/10 py-3 font-display text-xs uppercase tracking-[0.2em] text-rose-200 transition hover:bg-rose-400/20"
          >
            <AlertTriangle className="h-4 w-4" /> Phish
          </button>
        </div>
      </div>
    </div>
  );
}