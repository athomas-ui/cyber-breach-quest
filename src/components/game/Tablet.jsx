import React, { useState } from 'react';
import { Award, BookOpen, ClipboardList, Map as MapIcon, Settings as SettingsIcon, User, X } from 'lucide-react';
import ProfilePanel from '@/components/game/tablet/ProfilePanel';
import MapPanel from '@/components/game/tablet/MapPanel';
import QuestPanel from '@/components/game/tablet/QuestPanel';
import BadgesPanel from '@/components/game/tablet/BadgesPanel';
import IntelPanel from '@/components/game/tablet/IntelPanel';
import SettingsPanel from '@/components/game/tablet/SettingsPanel';
import { HEROES } from '@/game/constants';
import { sfx } from '@/game/audio';

const TABS = [
  { id: 'profile', label: 'Profile', Icon: User },
  { id: 'map', label: 'Map', Icon: MapIcon },
  { id: 'quests', label: 'Quests', Icon: ClipboardList },
  { id: 'badges', label: 'Badges', Icon: Award },
  { id: 'intel', label: 'Intel', Icon: BookOpen },
  { id: 'settings', label: 'Settings', Icon: SettingsIcon }
];

export default function Tablet({ game, onClose }) {
  const [tab, setTab] = useState('profile');
  const hero = HEROES[game.hero] || HEROES.andrew;

  const pick = (id) => {
    sfx('click');
    setTab(id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center">
      <div
        className="cb-tablet mx-auto flex h-[86vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl border sm:h-[80vh] sm:rounded-2xl"
        style={{
          borderColor: `${hero.color}55`,
          background: 'linear-gradient(165deg, rgba(8,14,22,0.98), rgba(4,7,12,0.99))',
          boxShadow: `0 0 60px ${hero.color}22, inset 0 0 80px ${hero.color}0d`
        }}
      >
        <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: `${hero.color}22` }}>
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full" style={{ background: hero.color, boxShadow: `0 0 10px ${hero.color}` }} />
            <div>
              <p className="font-display text-xs tracking-[0.35em] text-white/40">CYBER//BREACH TABLET</p>
              <p className="font-display text-lg tracking-widest" style={{ color: hero.color }}>
                {hero.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md border border-white/10 p-2 text-white/60 transition hover:border-white/30 hover:text-white"
            aria-label="Close tablet"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
          <nav className="order-2 flex shrink-0 gap-1 overflow-x-auto border-t px-3 py-2 sm:order-1 sm:w-44 sm:flex-col sm:border-r sm:border-t-0 sm:py-4" style={{ borderColor: `${hero.color}18` }}>
            {TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => pick(id)}
                className="flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-left font-display text-[11px] uppercase tracking-[0.18em] transition"
                style={{
                  background: tab === id ? `${hero.color}18` : 'transparent',
                  color: tab === id ? hero.color : 'rgba(255,255,255,0.5)'
                }}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </nav>

          <div className="order-1 min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:order-2">
            {tab === 'profile' && <ProfilePanel game={game} hero={hero} />}
            {tab === 'map' && <MapPanel game={game} />}
            {tab === 'quests' && <QuestPanel game={game} />}
            {tab === 'badges' && <BadgesPanel game={game} hero={hero} />}
            {tab === 'intel' && <IntelPanel game={game} hero={hero} />}
            {tab === 'settings' && <SettingsPanel game={game} hero={hero} />}
          </div>
        </div>
      </div>
    </div>
  );
}