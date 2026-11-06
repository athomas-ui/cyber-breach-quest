import { useLocation } from 'react-router-dom';
import { useScreenNav } from '@/components/game/ScreenTransition';

export default function PageNotFound() {
  const location = useLocation();
  const go = useScreenNav();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#04060b] p-6">
      <div className="cb-rise max-w-md text-center">
        <p className="font-display text-[10px] uppercase tracking-[0.5em] text-rose-400/80">Signal lost</p>
        <h1 className="mt-3 font-display text-6xl tracking-tight text-white">404</h1>
        <p className="mt-4 text-sm leading-relaxed text-white/55">
          No route found at <span className="text-white/80">{location.pathname}</span>. Treat unexpected links
          like unexpected email: back out and navigate from somewhere you trust.
        </p>
        <button
          onClick={() => go('/')}
          className="mt-8 rounded-md border border-white/15 px-6 py-2.5 font-display text-[10px] uppercase tracking-[0.3em] text-white/60 transition hover:border-white/40 hover:text-white"
        >
          Back to title
        </button>
      </div>
    </div>
  );
}
