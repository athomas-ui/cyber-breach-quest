# CYBER//BREACH Expo Kit

**Event:** i.c.stars Tech Expo, Monday, November 23, 2026
**Presenter:** Andrew Thomas, i.c.stars Cycle 60
**Format:** booth with hands-on play + timed stage presentation
**Mission:** Show a working security training game, prove the skills behind it, and leave with real conversations about cybersecurity roles.

Contents: 1. Primer | 2. Demo scripts | 3. Countdown plan and run of show | 4. Booth setup checklist | 5. Enhancements | 6. Keywords | 7. Opportunity playbook | 8. Skills showcase and "Know your code" | 9. Q&A prep | 10. After the expo

---

## 1. Primer: know this cold

**One sentence:** CYBER//BREACH is a 3D browser game that teaches people to catch phishing by making them do what a security analyst does: inspect the sender, judge the request, and act under pressure.

**Why it matters:** Most breaches start with a human clicking something. Companies spend real money on security awareness training, and most of it is a slideshow people skip. This game makes the training a skill you practice, not a video you sit through.

**Why me:** I spent years as a program manager and prevention specialist teaching people to make safer decisions. Security awareness is the same work with a different threat. I built this to prove I can combine that experience with technical skill.

**The three things every visitor should walk away knowing:**
1. Check the real sender domain, not the display name (`micros0ft-helpdesk.com` is not Microsoft).
2. Urgency plus a request for money, passwords, or secrecy is the attack pattern.
3. Verify out of band: call a number you already have, not the one in the message.

**What's live vs. roadmap**

| Live today | Roadmap (visible as gates in the hub) |
|---|---|
| Title, character select (Andrew / Werdna) | Mission 2 LOCKSMITH: Passwords and MFA |
| 3D city hub with NPCs Maya, Dev, Rio, Kai | Mission 3 THE IMPOSTER: Social engineering |
| Mission 1 THE BAIT: sort 6 emails, then boss fight | Mission 4 INFECTED: Malware |
| THE LURE KING: 8 hooks, 7 second decision window | Mission 5 LOCKDOWN: Ransomware and NIST incident response |
| Stranger encounters: tailgating, fake IT tech, borrow-your-laptop (press B to summon) | |
| XP, ranks, badges, intel, quest log, tablet UI | |
| Touch controls, quality setting, reset progress | |

Say it this way: "Mission 1 is the polished vertical slice. I chose to finish one mission well instead of shipping five half-built ones." That is a project management decision, and you should own it.

---

## 2. Demo scripts

Speaking rate target: about 140 words per minute. Practice out loud with a timer.

### A. The 30 second hook (booth, hallway, elevator)

> "Ninety percent of breaches start with someone clicking the wrong email. I built CYBER//BREACH, a 3D game where you play a junior security officer. You sort a flooded inbox, catch lookalike domains, and then fight a boss called the Lure King who throws real phishing tactics at you with seven seconds to decide. Want to see if you can beat him?"

Then hand them the controller. Verify the statistic you use before expo day (see Q&A section). If you can't source it, say "most breaches start with a human mistake."

### B. The 2 minute booth walkthrough (visitor is playing)

| Time | What's on screen | What you say |
|---|---|---|
| 0:00 | Title screen | "This is CYBER//BREACH. It teaches people to spot phishing and social engineering through gameplay instead of slides." |
| 0:10 | Character select | "Pick Andrew or Werdna. Both are junior security officers, which is where I'm headed." |
| 0:20 | Hub: press **B** | "Watch this. Someone's walking straight toward you. The attack isn't always an email. Sometimes it's a person at the door." |
| 0:30 | Stranger dialogue | Let them choose. Then point at the red-flag chips: "Full hands, no badge, a name-drop. Those are the tells." |
| 0:50 | Hub, near KAI, walk to THE BAIT gate | "Kai's lesson: a familiar display name doesn't prove who sent the message." |
| 1:00 | Server room, email inspector | "Look at the sender. `micros0ft-helpdesk.com`: that's a zero, not an O. Safe or phish?" |
| 1:20 | Lure King boss | "Now the boss. He dangles hooks, you get seven seconds. Report the phish, let the real mail through." |
| 1:45 | Results screen | "XP, rank and badges. Four more missions are on the roadmap: passwords, social engineering, malware, ransomware." |
| 1:55 | Close | "I'm transitioning into cybersecurity. Can I connect with you on LinkedIn?" Point at the QR code. |

If a visitor only has 30 seconds, skip the mission: press **B**, let them beat one stranger, and close.

After they leave: open the tablet, Settings, **Reset progress**, back to title.

### C. Stage presentation (5 minutes, with a 3 minute cut)

Lines marked **[CUT]** come out for the 3 minute version.

**Open (0:00 to 0:30)**
> "Show of hands: who has gotten an email this year that said your account would be closed unless you clicked right now? Keep your hand up if you checked the actual sender address. That gap between those two groups is where attackers live. I'm Andrew Thomas, i.c.stars Cycle 60, and I built a game to close that gap."

**Problem (0:30 to 1:15)**
> "Most attacks don't break through firewalls. They trick people. Companies know this, so they run security awareness training. But most of it is a video people play on mute. People don't learn security by watching. They learn by practicing decisions."
> **[CUT]** "Before tech, I was a program manager at the YMCA and a prevention specialist. My job was helping people make better decisions under pressure. That's exactly what phishing defense is."

**Live demo (1:15 to 3:15)** (have the game pre-loaded at the hub; a teammate can drive while you narrate)
> "This is CYBER//BREACH. You're a junior security officer in a neon city."
> (Press **B**.) "And attackers don't wait for you to open your email. Someone's walking up to me right now. He says he's from IT and needs my password and the MFA code that's about to hit my phone. The right move: say no, and call the help desk on a number I already trust. That's pretexting, and the game shows you the red flags." (The trick is random: adapt the line if it's the tailgater or the laptop borrower.)
> "Now the inbox. Kai, the threat analyst, gives you the first rule: don't trust the display name."
> "This one says IT support. Look closer: micros0ft, with a zero. Phish. This one from PayPal? Real domain, link stays on paypal.com, asks for nothing. Safe. And this one is my favorite: the CEO, from a Gmail address, asking for gift cards and secrecy. That's business email compromise, and it costs companies billions."
> **[CUT]** "Every choice gets an explanation, so you learn the pattern, not the answer."
> "Then the boss: the Lure King. He throws eight hooks, you get seven seconds each. That pressure is the point. Real phishing works because you're busy."

**How I built it (3:15 to 4:15)**
> "Under the hood: React, three.js for the 3D world, and the Web Audio API for the music, all procedural, no downloaded models or sound files. I used AI tools to get a first prototype, then made it my own project: I removed the platform it started on, dropped the login so it runs offline, and built the stranger encounters you just saw. My job was the design, the security content, and debugging what the AI got wrong."
> **[CUT]** "I separated the content from the engine. Every email and every scenario lives in one data file, so adding a new attack means writing data, not rewriting code. That's how the next four missions get built."

**Close (4:15 to 5:00)**
> "Next up: passwords and MFA, social engineering, malware, and a ransomware mission built on the NIST incident response phases. I'm pursuing a career in cybersecurity, starting in IT support and security operations. If your team works on security, awareness training, or IT support, I want to talk to you. Scan the code, play the game, and let's connect. Thank you."

---

## 3. Countdown plan and run of show

### Backward plan (17 days)

| Dates | Focus | Done when |
|---|---|---|
| Fri 11/6 to Sun 11/8 | **Stabilize.** Paste master prompt into the project. Run `npm install`, `npm run build` and `npm run preview` on the expo laptop and confirm the game opens with Wi-Fi turned off. Play THE BAIT start to finish 3 times on a laptop and once on a phone. Log every bug. | Status block in master prompt filled in; bug list written. |
| Mon 11/9 to Fri 11/13 | **Own the code.** One "Know your code" file per day (section 8). Rewrite the 30 second and 2 minute scripts in your own words. Record a 2 minute backup video of a full run. Upgrade the GitHub README. | You explain each file out loud without notes; video saved offline on the expo laptop and a USB drive. |
| Sat 11/14 to Mon 11/16 | **Decide and order.** Choose at most two P1 enhancements and finish them. Make QR codes and print table signage. **Feature freeze: Monday 11/16, end of day.** | Freeze committed and pushed; printing ordered. |
| Tue 11/17 to Fri 11/20 | **Rehearse.** Two timed run-throughs per day. One mock Q&A with a cohort mate or mentor. Full dress rehearsal Friday on the actual expo laptop. | Stage pitch lands within 10 seconds of target, 3 days in a row. |
| Sat 11/21 to Sun 11/22 | **Pack and rest.** Pack the kit (section 4). Charge everything. One final run. Sleep. | Bag packed by Saturday night. |
| **Mon 11/23** | **Expo.** Execute the run of show below. | Contacts captured. |
| Tue 11/24 to Wed 11/25 | **Follow up** before Thanksgiving (Thu 11/26) kills everyone's inbox. | Every contact has a personalized message. |

### Expo day run of show

Times are relative to doors opening (T). Adjust once you have the official schedule.

| Time | Action |
|---|---|
| T minus 2:00 | Arrive. Find your table, power, and Wi-Fi. Ask staff for the network name (yes, the evil twin lesson applies). |
| T minus 1:30 | Set up laptop, second screen if available, controller or mouse, signage, QR codes. |
| T minus 1:00 | Full tech check: load live URL, play through the email room, trigger the boss. Test on hotspot as backup. Open the backup video in a second tab. |
| T minus 0:30 | Reset progress, park the game on the title screen with music muted or low. Water, mints, phone on silent. |
| T minus 0:15 | Run the 30 second hook twice out loud. |
| T to T plus 2:00 | Booth mode. Hook, hand off, coach, close, reset. Write a one line note on each contact right after they leave. |
| Stage slot minus 0:20 | Hand booth to a teammate or put up "Back at [time], play the game: QR". Pre-load the hub on the stage machine. |
| Stage slot | Deliver the 5 or 3 minute version. End on the QR code slide or screen. |
| Stage slot plus 0:05 | Stand near the stage exit for 5 minutes. People with questions come to you there. |
| Last 30 min | Walk the room. Visit other booths, especially sponsors. Ask what their security teams work on. |
| Close | Photo of the booth, pack up, send yourself a voice note of everyone you met. |

---

## 4. Booth setup checklist

**Hardware**
- [ ] Expo laptop, charger, power strip, extension cord
- [ ] Mouse and/or gamepad; test touch on a tablet if you bring one
- [ ] Game running locally (`npm run preview`); it needs no internet, but test once with Wi-Fi off
- [ ] Phone hotspot only for the hosted QR link and fonts (the game falls back to system fonts offline)
- [ ] USB drive with the backup video
- [ ] Headphones splitter or small speaker (audio is synthesized in the browser; keep volume low on the floor)

**Software**
- [ ] Chrome, hardware acceleration on, bookmarks bar hidden, notifications off
- [ ] Live URL bookmarked; tested in incognito the morning of
- [ ] Graphics quality set to fit the laptop (drop to low if the frame rate stutters)
- [ ] Backup video open in a second tab
- [ ] GitHub repo and portfolio open in other tabs for technical visitors

**Print**
- [ ] Table sign: "CYBER//BREACH: Can you beat the Lure King?"
- [ ] QR 1: play the game | QR 2: GitHub repo | QR 3: LinkedIn
- [ ] 20 to 30 business cards or half sheets with name, "Aspiring Cybersecurity Analyst", LinkedIn, portfolio
- [ ] Clipboard sign-up sheet: name, company, role, "What should I follow up about?"

**You**
- [ ] Business professional outfit, comfortable shoes
- [ ] This kit printed, sections 2 and 9 flagged

---

## 5. Enhancements: how to make the demo stronger

Scope rule: stability beats features. Nothing new after **Monday 11/16**.

### P0: must do (no code changes)
1. **Confirm offline play.** The game no longer needs a login or a server. Build it on the expo laptop and play it once with Wi-Fi off.
2. **Backup video.** A 2 minute screen recording of a clean run, saved offline.
3. **Reset ritual.** Practice the tablet, Settings, Reset progress, back to title sequence until it takes under 10 seconds.
4. **Second screen.** If you can get a monitor, mirror the game big so people across the room see the Lure King.

### P1: high impact, low risk (pick at most two, done by 11/16)
1. **Upgrade the GitHub README** (biggest career value). Add: one line pitch, screenshots or a GIF, "How to play", tech stack, architecture diagram (content.js to store.js to React Three Fiber scenes), security concepts taught, roadmap, and "What I learned." Done: the README now covers the pitch, how to play, controls, stack, structure and what you learned. Still to add: screenshots or a GIF.
2. **"Lure King Leaderboard" whiteboard.** Analog: write first names and boss score on a whiteboard. Creates a crowd and a reason to come back. Zero code risk.
3. **Phish flashcards handout.** A half sheet with the 3 rules from the primer and the 6 red flags. Visitors take your name home with them.
4. **One minute architecture slide** for technical visitors: how state, content, and 3D rendering connect.

### P2: after the expo (put on the roadmap, don't start now)
- Expo or kiosk mode: one button reset, auto return to title after idle.
- Hire me end card on the results screen linking to portfolio.
- Mission 2 LOCKSMITH (passwords and MFA).
- Anonymous analytics: how many visitors got each email right. That becomes real data for your story ("70% of players missed the payroll phish").
- Accessibility pass: keyboard only play, captions, color contrast.

---

## 6. Keywords

Use these naturally in your pitch, LinkedIn post, README, and resume. Know what each one means before you say it.

**Security**
- Phishing, spear phishing, business email compromise (BEC)
- Social engineering, pretexting, baiting (USB drop)
- Typosquatting and lookalike domains, homoglyphs (0 for o)
- Credential harvesting
- Out of band verification
- Evil twin access point, VPN
- Security awareness training, human risk management
- Defense in depth, least privilege, MFA
- NIST incident response lifecycle (preparation; detection and analysis; containment, eradication, and recovery; post incident activity)
- SOC (security operations center), threat analyst, triage

**Engineering**
- React, Vite, Tailwind CSS, JavaScript (ES modules)
- three.js, React Three Fiber, procedural 3D geometry
- Web Audio API, procedural audio
- State management (`useSyncExternalStore`), debounced persistence, localStorage
- Local-first persistence, offline-capable web app
- Data driven design, separation of content and engine
- Responsive design, touch input, performance settings
- Git, GitHub, version control, VS Code
- AI-assisted development, prompt engineering, code review of AI output

**Professional (your bridge from program management)**
- Gamification, adult learning, behavior change
- Scope management, vertical slice, MVP, product roadmap
- Stakeholder communication, user testing, iteration

---

## 7. Opportunity playbook: turn visitors into job leads

**Identify who you're talking to in the first 15 seconds.** Ask: "What brings you to the expo?" or read their badge.

| Visitor | What they care about | Your angle | Your ask |
|---|---|---|---|
| Recruiter / HR | Communication, coachability, culture | Career change story, i.c.stars, finishing one mission well | "Are you hiring for IT support, SOC, or security analyst roles? Who should I talk to?" |
| Security leader (CISO, SOC manager) | Can you think like an analyst? | The security content: BEC, lookalike domains, out of band verification | "What does your awareness program struggle with? What should a junior analyst learn first?" |
| Engineer / IT manager | Can you build and debug? | Stack, architecture, the bugs you fixed, how you validate AI code | "What would you change in my architecture?" |
| Executive / sponsor | Impact and mission | Human risk is the biggest attack surface; your community background | "Who on your team should see this?" |
| Student / youth | Is tech for me? | Your path from program manager to builder | Inspire them; this is your future nonprofit audience too. |

**Rules**
- Always close with an ask. Never let a good conversation end with "nice to meet you."
- Capture the contact on the spot (LinkedIn QR on their phone is fastest). Write one note: what they said, what you promised.
- Ask for advice, not jobs. Advice turns into referrals.
- Be honest about being early career. Confidence comes from what you've built, not from claiming more.

**Lines that work**
- "I'm targeting IT support and SOC analyst roles. Is there anyone on your team I should know?"
- "If you had to pick the next mission for a security team's training, what would it be?"
- "Can I send you the GitHub link and follow up next week?"

---

## 8. Skills showcase and "Know your code"

### What the project proves

| Skill | Evidence in the project |
|---|---|
| Security fundamentals | Phishing indicators, BEC, typosquatting, evil twin, USB baiting, out of band verification, NIST IR roadmap |
| Front end development | React components, routing, Tailwind UI, tablet interface, responsive and touch controls |
| 3D and graphics | three.js scenes via React Three Fiber, procedural characters and city, effects and camera |
| State and data | Custom store with `useSyncExternalStore`, local-first saves in localStorage, no backend dependency |
| Systems thinking | Content separated from engine; missions gated by XP and prior completion (`gateState`) |
| AI-assisted development | Directed an AI builder, exported to Git, extended and debugged with AI tools, validated output |
| Project management | Shipped a polished vertical slice, kept a roadmap, scoped for a deadline |
| Instructional design | Explanation after every choice, escalating difficulty, rewards for correct behavior |

### Resume bullet (draft; rewrite in your words)
> Designed and built CYBER//BREACH, a 3D browser game (React, three.js, Web Audio API) that trains users to identify phishing and social engineering; created 20+ scenarios covering BEC, typosquatting, credential harvesting, tailgating and pretexting; presented at i.c.stars Tech Expo 2026.

(Count check: 6 emails + 8 boss hooks + 4 NPC scenarios + 3 stranger encounters = 21 scenarios, so "20+" is accurate.)

### Know your code: one file a day, explain it out loud

| Day | File | You must be able to say |
|---|---|---|
| Mon 11/9 | `src/game/content.js` | Where every email, hook, and NPC lives; how `phish: true` and `explain` drive the game; how to add a scenario. |
| Tue 11/10 | `src/game/constants.js` | Heroes, ranks and XP thresholds, the 5 missions, and how `gateState` locks or unlocks a gate. |
| Wed 11/11 | `src/game/store.js` | What `useSyncExternalStore` does, why progress saves to localStorage first, and why the cloud save waits 700 ms (debounce). |
| Thu 11/12 | `src/game/lureFight.js` | Boss state: HP, shield, phase, the current hook, flawless tracking, and the 7 second window. |
| Fri 11/13 | `src/pages/MissionBait.jsx` | How the mission flows from level mode to boss mode to results, and which components it uses. |
| Sat 11/14 | `src/game/useStrangerEncounter.js` + `src/components/game3d/StrangerActor.jsx` | How the hook decides when a stranger appears and which trick they try; how the actor walks toward you each frame, then hands off to the dialogue. This is the feature you'll be asked about most, so own it. |

Drill for each file: read it, close it, then explain it in 60 seconds to a voice recorder. If you stall, that's the part to study.

---

## 9. Q&A prep

Practice each answer out loud. Keep answers under 30 seconds.

1. **"Did you code this yourself?"** "I designed it and wrote the security content. I used AI tools for the first prototype, then moved it into my own Git repo, removed the platform dependency, and kept extending and debugging it, including the stranger encounters. I can walk you through how the pieces fit." (Then show `content.js`.)
2. **"What was the hardest bug?"** Pick a real one from your commit history or bug log. Structure: what broke, how you found it, what fixed it, what you learned.
3. **"Why a game?"** "People remember what they practice. The boss fight adds time pressure, which is exactly the condition phishing exploits."
4. **"How do you know it works?"** Honest answer: "I haven't measured learning outcomes yet. The next step is tracking which emails players miss so I can prove improvement." (Don't invent numbers.)
5. **"What's the tech stack?"** React, Vite, Tailwind, three.js with React Three Fiber, Web Audio API, local-first saves, Git and GitHub.
6. **"Why is only one mission playable?"** "I chose a polished vertical slice over five rough ones. The engine is data driven, so the next missions are content work."
7. **"How does it save progress?"** "Instantly to the browser's localStorage, and to a cloud database when you're signed in, debounced so it doesn't spam the server."
8. **"What security role do you want?"** Have a direct answer: IT support moving into SOC analyst, with interest in security awareness and GRC.
9. **"What certifications are you working on?"** Answer with what is true and dated (for example, the cert you're studying for and your target exam month).
10. **"What would you do differently?"** Plan the architecture before generating code, write tests earlier, and set up analytics from day one.

**Fact check before you say it on stage:** any statistic (for example "X% of breaches start with phishing") must come from a named, current source such as the Verizon Data Breach Investigations Report or the FBI IC3 annual report. Ask the master agent to verify the latest figure before rehearsal week.

---

## 10. After the expo

| When | Action |
|---|---|
| Monday night 11/23 | Voice note or list of every contact while it's fresh. |
| Tuesday 11/24 | LinkedIn post: what you built, a 30 second clip, what you learned, thank i.c.stars. Use keywords from section 6. |
| Tue 11/24 to Wed 11/25 | Personalized follow up to every contact: where you met, what they said, the link, one specific ask. |
| Week of 11/30 | Update resume, portfolio, and README with "Presented at i.c.stars Tech Expo 2026." Log lessons learned. |
| December | Pick the next build: Mission 2 or analytics. Ask the master agent to plan it backward from a date. |

**Follow up template (personalize every one)**
> Hi [Name], great meeting you at the i.c.stars Tech Expo. You mentioned [specific thing they said]. Here's CYBER//BREACH on GitHub: [link]. I'm building toward [IT support / SOC analyst] roles and would value 15 minutes of your advice on [specific question]. Would next week work?
