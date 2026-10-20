export const HEROES = {
  andrew: {
    id: 'andrew',
    name: 'ANDREW',
    role: 'Junior Security Officer',
    color: '#00ff9d',
    glow: '#8affda',
    dark: '#062e22',
    outfit: 'hoodie',
    headset: true,
    visor: false,
    line: 'Hood up, headset on. Slow is smooth, smooth is secure.'
  },
  werdna: {
    id: 'werdna',
    name: 'WERDNA',
    role: 'Junior Security Officer',
    color: '#c084fc',
    glow: '#e9c7ff',
    dark: '#2a1240',
    outfit: 'jacket',
    headset: false,
    visor: true,
    line: 'Never trust an unsolicited link. Not once. Not ever.'
  }
};

export const RANKS = [
  { name: 'Rookie', xp: 0 },
  { name: 'Analyst', xp: 100 },
  { name: 'Specialist', xp: 300 },
  { name: 'Engineer', xp: 600 },
  { name: 'Architect', xp: 1000 }
];

export function rankFor(xp) {
  let out = RANKS[0];
  for (const r of RANKS) if (xp >= r.xp) out = r;
  return out;
}

export function nextRank(xp) {
  return RANKS.find((r) => r.xp > xp) || null;
}

export function rankProgress(xp) {
  const cur = rankFor(xp);
  const nxt = nextRank(xp);
  if (!nxt) return 1;
  return Math.max(0, Math.min(1, (xp - cur.xp) / (nxt.xp - cur.xp)));
}

export const MISSIONS = [
  {
    id: 'bait',
    index: 1,
    name: 'THE BAIT',
    topic: 'Phishing',
    xpRequired: 0,
    boss: 'THE LURE KING',
    color: '#00ff9d',
    tagline: 'Sort the mail flood. Then face the thing that sets the hook.'
  },
  {
    id: 'locksmith',
    index: 2,
    name: 'LOCKSMITH',
    topic: 'Passwords & MFA',
    xpRequired: 100,
    boss: 'BRUTE',
    color: '#38bdf8',
    tagline: 'A vault maze that only opens for strong credentials.'
  },
  {
    id: 'imposter',
    index: 3,
    name: 'THE IMPOSTER',
    topic: 'Social Engineering',
    xpRequired: 250,
    boss: 'THE MIMIC',
    color: '#c084fc',
    tagline: 'Six coworkers. One is lying about who they are.'
  },
  {
    id: 'infected',
    index: 4,
    name: 'INFECTED',
    topic: 'Malware',
    xpRequired: 450,
    boss: 'THE WORM',
    color: '#ff9f1c',
    tagline: 'Quarantine the nodes before the spread becomes a flood.'
  },
  {
    id: 'lockdown',
    index: 5,
    name: 'LOCKDOWN',
    topic: 'Ransomware & Response',
    xpRequired: 700,
    boss: 'THE RANSOM LORD',
    color: '#ff2d55',
    tagline: 'A hospital data center is encrypting itself. Move fast.'
  }
];

export function gateState(mission, progress) {
  const done = progress.completed_missions || [];
  if (done.includes(mission.id)) return 'completed';
  const prev = MISSIONS[mission.index - 2];
  const prevDone = !prev || done.includes(prev.id);
  return prevDone && (progress.xp || 0) >= mission.xpRequired ? 'unlocked' : 'locked';
}

export function gateRequirement(mission, progress) {
  const prev = MISSIONS[mission.index - 2];
  if (prev && !(progress.completed_missions || []).includes(prev.id)) {
    return `Requires ${prev.name}`;
  }
  const gap = mission.xpRequired - (progress.xp || 0);
  if (gap > 0) return `Requires ${mission.xpRequired} XP \u00b7 ${gap} to go`;
  return 'Ready to enter';
}

export const GATE_SLOTS = [
  { x: 0, z: -18, ry: 0 },
  { x: 17, z: -7, ry: -Math.PI / 2.4 },
  { x: 16, z: 12, ry: -Math.PI / 1.35 },
  { x: -16, z: 12, ry: Math.PI / 1.35 },
  { x: -17, z: -7, ry: Math.PI / 2.4 }
];

export const BADGES = [
  { id: 'first_deploy', name: 'First Deploy', desc: 'Cleared THE BAIT and finished your first mission.' },
  { id: 'lure_slayer', name: 'Lure Slayer', desc: 'Defeated THE LURE KING in the bait arena.' },
  { id: 'shard_hunter', name: 'Shard Hunter', desc: 'Recovered all 10 Data Shards hidden in the district.' },
  { id: 'street_wise', name: 'Street Wise', desc: 'Talked with every contact in the security district.' },
  { id: 'flawless_sort', name: 'Flawless Sort', desc: 'Sorted every server-room email correctly, first try.' },
  { id: 'unbroken', name: 'Unbroken', desc: 'Defeated a boss without letting your shield drop below half.' }
];

export const INTEL = [
  { id: 'phishing_domains', title: 'Lookalike Domains', body: 'Phishing hides in the sender domain, not the display name. Attackers swap characters (micros0ft), add words (microsoft-support.net), or change the ending (.co for .com). Read right to left from the last dot and compare against the address you already trust.' },
  { id: 'urgency', title: 'Manufactured Urgency', body: 'Deadlines like "within 2 hours" exist to stop you from verifying. Real systems rarely delete your account on a timer. Urgency plus a link is a reason to slow down, not speed up.' },
  { id: 'bec', title: 'Business Email Compromise', body: 'An executive writing from a personal address, asking for a favour or a payment, is a classic BEC pattern. Confirm with them out of band using a number you already have \u2014 never the one in the email.' },
  { id: 'mfa', title: 'Why MFA Works', body: 'Multi-factor authentication asks for something you know plus something you have. A stolen password alone is no longer enough, which is why MFA blocks the overwhelming majority of account-takeover attempts.' },
  { id: 'passphrase', title: 'Passphrases Beat Complexity', body: 'Length beats symbol soup. Four or five random words make a passphrase that is easier to remember and far harder to crack than P@ssw0rd!. Never reuse one across accounts \u2014 use a manager.' },
  { id: 'least_privilege', title: 'Least Privilege', body: 'Give every account the smallest set of permissions it needs to do its job. If a marketing laptop is compromised, least privilege keeps it from reaching the payroll database.' },
  { id: 'removable_media', title: 'Unattended USB', body: 'A USB drive left in a parking lot is a delivery method, not a gift. Never plug in unknown media \u2014 hand it to security so it can be examined safely.' },
  { id: 'incident_response', title: 'NIST Incident Response', body: 'The five phases: Identify, Contain, Eradicate, Recover, Lessons Learned. Skipping Contain to go straight to cleanup is how ransomware gets a second foothold.' }
];

export const RANKS_LABEL = 'Rookie \u2192 Analyst \u2192 Specialist \u2192 Engineer \u2192 Architect';