const listeners = new Set();
let uid = 0;

export function fx(text, kind = 'xp') {
  const item = { id: ++uid, text, kind, born: Date.now() };
  listeners.forEach((fn) => fn(item));
}

export function onFx(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}