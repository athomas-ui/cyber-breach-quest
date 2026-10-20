import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Credits() {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 overflow-y-auto bg-[#04060b] px-6 py-16">
      <button
        onClick={() => navigate('/')}
        className="fixed left-5 top-5 rounded-md border border-white/10 p-2 text-white/40 transition hover:text-white"
        aria-label="Back"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>

      <div className="mx-auto max-w-lg text-center">
        <p className="font-display text-[10px] uppercase tracking-[0.5em] text-emerald-400/70">Credits</p>
        <h1 className="mt-3 font-display text-4xl tracking-tight text-white">
          CYBER<span className="text-emerald-400">//</span>BREACH
        </h1>

        <div className="mt-10 space-y-6 text-sm text-white/55">
          <div>
            <p className="font-display text-[10px] uppercase tracking-[0.3em] text-white/30">Created by</p>
            <p className="mt-1 text-lg text-white">Andrew Thomas</p>
            <p className="text-white/40">i.c.stars Cycle 60</p>
          </div>

          <div>
            <p className="font-display text-[10px] uppercase tracking-[0.3em] text-white/30">Built with</p>
            <p className="mt-1">React, three.js, procedural geometry \u2014 no external models or copyrighted assets.</p>
          </div>

          <div>
            <p className="font-display text-[10px] uppercase tracking-[0.3em] text-white/30">Security guidance</p>
            <p className="mt-1 leading-relaxed">
              Mission content follows real beginner practice: spotting lookalike domains, verifying out of band,
              MFA, least privilege, and the five NIST incident response phases.
            </p>
          </div>

          <div>
            <p className="font-display text-[10px] uppercase tracking-[0.3em] text-white/30">Cast</p>
            <p className="mt-1 leading-relaxed">
              Andrew and Werdna, Junior Security Officers. Maya, Dev and Rio of the district. And one very large
              angler fish made of envelopes.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="mt-12 rounded-md border border-white/15 px-6 py-2.5 font-display text-[10px] uppercase tracking-[0.3em] text-white/60 transition hover:border-white/40 hover:text-white"
        >
          Back to title
        </button>
      </div>
    </div>
  );
}