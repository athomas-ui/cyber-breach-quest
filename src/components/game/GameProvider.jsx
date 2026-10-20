import React, { useEffect } from 'react';
import { installKeyboard } from '@/game/input';
import { ensureAudio, setVolume } from '@/game/audio';
import { loadProgress, useGame } from '@/game/store';

let booted = false;

export default function GameProvider({ children }) {
  const game = useGame();

  useEffect(() => {
    installKeyboard();
    if (!booted) {
      booted = true;
      loadProgress();
    }
  }, []);

  useEffect(() => {
    const unlock = () => {
      ensureAudio();
      setVolume(game.settings.muted ? 0 : game.settings.volume);
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, [game.settings.muted, game.settings.volume]);

  return children;
}