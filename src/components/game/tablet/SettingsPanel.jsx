import React from 'react';
import { actions } from '@/game/store';
import { setVolume, sfx } from '@/game/audio';

export default function SettingsPanel({ game, hero }) {
  const { settings } = game;

  const setVol = (v) => {
    actions.setSettings({ volume: v, muted: false });
    setVolume(v);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg tracking-[0.25em] text-white">SETTINGS</h2>
        <p className="text-xs text-white/40">Device and control preferences</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/70">Volume</span>
          <span className="font-display text-xs text-white/40">{Math.round((settings.muted ? 0 : settings.volume) * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={Math.round((settings.muted ? 0 : settings.volume) * 100)}
          onChange={(e) => setVol(Number(e.target.value) / 100)}
          className="w-full accent-current"
          style={{ accentColor: hero.color }}
        />
        <button
          onClick={() => {
            actions.setSettings({ muted: !settings.muted });
            setVolume(settings.muted ? settings.volume : 0);
            sfx('click');
          }}
          className="mt-1 rounded-md border border-white/12 px-3 py-1.5 font-display text-[10px] uppercase tracking-[0.2em] text-white/60 transition hover:text-white"
        >
          {settings.muted ? 'Unmute audio' : 'Mute audio'}
        </button>
      </div>

      <div className="space-y-2">
        <span className="text-sm text-white/70">Graphics quality</span>
        <div className="flex gap-2">
          {['low', 'high'].map((q) => (
            <button
              key={q}
              onClick={() => {
                actions.setSettings({ quality: q });
                sfx('click');
              }}
              className="flex-1 rounded-md border px-3 py-2 font-display text-[10px] uppercase tracking-[0.2em] transition"
              style={{
                borderColor: settings.quality === q ? `${hero.color}88` : 'rgba(255,255,255,0.12)',
                background: settings.quality === q ? `${hero.color}18` : 'transparent',
                color: settings.quality === q ? hero.color : 'rgba(255,255,255,0.5)'
              }}
            >
              {q}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-white/35">Low drops rain density and distant skyline detail for smoother frames.</p>
      </div>

      <div className="space-y-1.5">
        <span className="text-sm text-white/70">Controls</span>
        {[
          ['WASD / Arrows', 'Move'],
          ['Shift', 'Sprint'],
          ['Space', 'Jump'],
          ['E', 'Interact / report'],
          ['Tab', 'Open tablet'],
          ['Drag', 'Orbit camera']
        ].map(([key, label]) => (
          <div key={key} className="flex items-center justify-between rounded-md bg-white/[0.03] px-3 py-1.5">
            <span className="font-display text-[10px] uppercase tracking-[0.2em] text-white/55">{key}</span>
            <span className="text-xs text-white/40">{label}</span>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-3">
        <p className="text-xs text-white/50">Reset wipes XP, missions, badges and shards on this device.</p>
        <button
          onClick={() => {
            actions.reset();
            sfx('wrong');
          }}
          className="mt-2 rounded-md border border-rose-500/40 px-3 py-1.5 font-display text-[10px] uppercase tracking-[0.2em] text-rose-300 transition hover:bg-rose-500/10"
        >
          Reset progress
        </button>
      </div>
    </div>
  );
}