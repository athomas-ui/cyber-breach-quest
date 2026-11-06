# AGENTS.md

Instructions for AI coding assistants working in this repository.

## Project

CYBER//BREACH is Andrew Thomas's 3D cybersecurity training game (React 18, Vite, three.js via React Three Fiber, Tailwind). It is a standalone, local-first web app: no backend, no accounts. Progress saves to `localStorage` in `src/game/store.js`.

## Working rules

- Treat this as Andrew's code. Keep changes focused on what he asked for and explain them so he can defend every line in an interview.
- Content (emails, NPC dialogue, stranger scenarios) lives in `src/game/content.js`. Add scenarios as data there before writing new engine code.
- 3D movement and animation run inside `useFrame` with refs, not React state, so scenes don't re-render every frame.
- Use `useScreenNav()` from `src/components/game/ScreenTransition.jsx` for page changes so transitions stay smooth.
- Never commit secrets. `.env*` files are ignored.

## Checks before finishing

```bash
npm run lint
npm run build
```

Then play the hub and THE BAIT once in a browser to confirm nothing broke.
