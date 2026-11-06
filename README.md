# CYBER//BREACH

**A 3D browser game that trains people to spot phishing and social engineering by making them do what a security analyst does.**

Created by **Andrew Thomas**, i.c.stars Cycle 60.
Portfolio: https://athomas-ui.github.io/portfolio/ · LinkedIn: https://www.linkedin.com/in/andrew-thomas-83564259/

---

## Why I built it

Most breaches don't start with someone hacking through a firewall. They start with a person: a clicked link, a held door, a password read over the phone. Security awareness training is meant to fix that, but it is usually a video people skip. CYBER//BREACH turns the training into decisions you make under pressure, with an explanation after every choice.

## What you can play today

| Area | What happens | Security skill |
|---|---|---|
| **Security District (hub)** | Explore a neon city, talk to contacts (Maya, Dev, Rio, Kai), collect data shards | Evil twin Wi-Fi, USB drops, password sharing, checking sender domains |
| **Stranger encounters** | At random, someone walks up to you and tries a trick: tailgating through a secure door, a fake IT tech asking for your password and MFA code, or a "new hire" asking to use your laptop | Tailgating, pretexting, physical device security |
| **Mission 1: THE BAIT** | Sort a flooded inbox into SAFE or PHISH | Lookalike domains, urgency, BEC, credential harvesting |
| **Boss: THE LURE KING** | Report real phishing hooks within a 7 second window | Fast triage under pressure |

Progression: XP, ranks (Rookie to Architect), badges (including **Human Firewall** for beating every stranger), an intel codex, a quest log and a tablet UI.

**Roadmap** (gates visible in the hub): LOCKSMITH (passwords and MFA), THE IMPOSTER (social engineering), INFECTED (malware), LOCKDOWN (ransomware and NIST incident response).

## Controls

| Key | Action |
|---|---|
| WASD / arrows | Move (Shift to sprint) |
| Mouse drag | Orbit camera |
| E | Interact / talk |
| Space (x2) | Jump / flip jump |
| J K L F | Scan, firewall, dash, uplink |
| Tab | Tablet (map, quests, intel, badges, settings) |
| **B** | Summon a stranger encounter now (demo shortcut, also in Tablet > Settings) |

Touch controls appear automatically on phones and tablets.

## Tech stack

- **React 18 + Vite** for the app and build
- **three.js via React Three Fiber** for the 3D world; every character and building is procedural geometry (no downloaded models)
- **Web Audio API** for synthesized music and sound effects (no audio files)
- **Tailwind CSS** for the interface
- **Local-first save**: progress is stored in the browser with `localStorage`; no accounts or server needed

## How it's organized

```
src/
  game/                  game logic, no rendering
    content.js           every email, hook, NPC conversation and stranger scenario (pure data)
    constants.js         heroes, ranks, missions, badges, intel codex
    store.js             player progress + save/load (useSyncExternalStore)
    lureFight.js         boss fight state
    useStrangerEncounter.js  when strangers appear and which trick they try
    world.js, input.js, audio.js, fx*.js
  components/
    game/                2D interface: dialogue, HUD, tablet, screen transitions
    game3d/              3D scene pieces: player, NPCs, strangers, city, boss arena
  pages/                 one file per screen: Title, CharacterSelect, Hub, MissionBait, Credits
```

Design choice: **content is separate from the engine.** Adding a new phishing email or a new stranger trick means adding an entry to `src/game/content.js`, not writing new game code.

## Run it locally

Requires Node.js 18 or newer.

```bash
npm install
npm run dev       # opens on http://localhost:5173
npm run build     # production build in dist/
npm run preview   # serve the production build
npm run lint      # code checks
```

## What I learned

- How to structure a game so data and logic stay separate
- Easing and damping (camera follow, screen transitions) so motion feels smooth
- How to review, test and debug AI-assisted code instead of trusting it
- How to scope a project: one polished mission beats five unfinished ones

## Security practices for this repo

Because CYBER//BREACH teaches security, the repo follows it too:

- Never commit API keys, passwords, access tokens or other secrets. `.env*` files are git-ignored.
- Keep dependencies updated (`npm outdated`, `npm audit`).
- Review AI-generated code before committing it, and test new features in the browser.
- The game stores progress only in the player's own browser; it collects no personal data.

## License

A license has not been chosen yet.

## Credits

Design, security content and development: Andrew Thomas. Built with AI-assisted development tools.
