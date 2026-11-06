import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Screen-to-screen transitions.
// Instead of hard-cutting between pages, every route change runs three beats:
//   1. cover:  a dark veil with a scan line fades in over the current screen
//   2. swap:   the route changes underneath the veil (the 3D canvas mounts here,
//              so any first-frame hitch is hidden)
//   3. reveal: the veil fades out over the new screen
// Pages call useScreenNav() instead of useNavigate() to get this behavior.

const COVER_MS = 320;
const SETTLE_MS = 180;

const NavContext = createContext(null);

export function useScreenNav() {
  const ctx = useContext(NavContext);
  const navigate = useNavigate();
  return ctx ? ctx.go : navigate;
}

export default function ScreenTransition({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  // The game boots covered, then reveals: a fade in from black on first load.
  const [phase, setPhase] = useState('covered');
  const busy = useRef(false);
  const timers = useRef([]);

  const later = (fn, ms) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
  };

  const go = useCallback(
    (path, options) => {
      if (busy.current) return;
      busy.current = true;
      setPhase('cover');
      later(() => navigate(path, options), COVER_MS);
    },
    [navigate]
  );

  // Every time the route actually changes, give the new screen a beat to mount, then reveal it.
  useEffect(() => {
    later(() => {
      setPhase('reveal');
      busy.current = false;
    }, SETTLE_MS);
  }, [location.key]);

  useEffect(() => () => timers.current.forEach((id) => window.clearTimeout(id)), []);

  return (
    <NavContext.Provider value={{ go }}>
      {children}
      <div className="cb-veil" data-phase={phase} aria-hidden="true">
        <div className="cb-veil-line" />
      </div>
    </NavContext.Provider>
  );
}
