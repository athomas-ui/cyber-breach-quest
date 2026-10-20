import React, { useEffect, useState } from 'react';
import { onFx } from '@/game/fx';

export default function FxLayer() {
  const [items, setItems] = useState([]);

  useEffect(
    () =>
      onFx((item) => {
        setItems((prev) => [...prev.slice(-8), item]);
        window.setTimeout(() => {
          setItems((prev) => prev.filter((i) => i.id !== item.id));
        }, 1700);
      }),
    []
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center">
      <div className="relative h-0 w-0">
        {items.map((item, i) => (
          <div
            key={item.id}
            className={`cb-float absolute whitespace-nowrap font-display text-lg font-bold tracking-widest ${
              item.kind === 'bad' ? 'text-rose-400' : 'text-emerald-300'
            }`}
            style={{ left: `${(i % 3) * 46 - 46}px`, top: `${-40 - (i % 4) * 18}px` }}
          >
            {item.text}
          </div>
        ))}
      </div>
    </div>
  );
}