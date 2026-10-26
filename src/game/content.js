// Mission 1: server-room emails the player sorts into SAFE / PHISH.
export const EMAILS = [
  {
    id: 'mail1',
    from: 'it-support@micros0ft-helpdesk.com',
    subject: 'Urgent: your mailbox closes in 2 hours',
    body: 'We detected unusual activity. Re-enter your password at the secure link below or lose all mail access permanently.',
    link: 'http://micros0ft-helpdesk.com/verify',
    phish: true,
    explain: 'The domain micros0ft-helpdesk.com is not Microsoft \u2014 a zero swapped for the letter o, plus a two-hour deadline to stop you checking.'
  },
  {
    id: 'mail2',
    from: 'no-reply@paypal.com',
    subject: 'Your monthly statement is ready',
    body: 'Your statement for October is available in your account. No action is needed. Links point to paypal.com.',
    link: 'https://www.paypal.com/statements',
    phish: false,
    explain: 'The domain matches the real brand, the link stays on that domain, and nothing asks for credentials or payment.'
  },
  {
    id: 'mail3',
    from: 'hr@yourcompany-hr.net',
    subject: 'Payroll details must be confirmed in 24h',
    body: 'We are updating payroll. Confirm your bank details in the portal today or your salary will be delayed.',
    link: 'http://yourcompany-hr.net/payroll',
    phish: true,
    explain: 'Your real HR address ends in yourcompany.com. A lookalike domain asking for bank details on a deadline is payroll phishing.'
  },
  {
    id: 'mail4',
    from: 'security@yourcompany.com',
    subject: 'Ticket #8842 closed: MFA reset you requested',
    body: 'The MFA reset you opened yesterday is complete. No further action required. Reply to this thread if you did not request it.',
    link: 'https://portal.yourcompany.com/tickets/8842',
    phish: false,
    explain: 'You opened this ticket yourself, the sender is the internal domain, and it requests nothing new from you.'
  },
  {
    id: 'mail5',
    from: 'ceo.andrew.thomas@gmail.com',
    subject: 'Quick favour \u2014 are you at your desk?',
    body: 'I am in a meeting and cannot talk. Need you to buy four $200 gift cards for a client and send me the codes. Keep this between us.',
    link: null,
    phish: true,
    explain: 'An executive writing from Gmail, asking for gift cards and secrecy, is textbook business email compromise. Call them on a known number.'
  },
  {
    id: 'mail6',
    from: 'news@neonchicago.dev',
    subject: 'Weekly security digest \u2014 issue 41',
    body: 'This week: the new passphrase guidance, a router firmware patch, and how to spot a lookalike domain.',
    link: 'https://neonchicago.dev/digest/41',
    phish: false,
    explain: 'A newsletter you subscribed to, from its real domain, asking you to do nothing but read.'
  }
];

// Boss arena: hooks the Lure King dangles. Report only the real phish.
export const HOOKS = [
  {
    id: 'hook1',
    from: 'billing@micros0ft-support.com',
    subject: 'Your license expires today',
    phish: true,
    explain: 'Lookalike domain plus a same-day deadline \u2014 verify inside the vendor portal, never through the link.'
  },
  {
    id: 'hook2',
    from: 'security@yourcompany.com',
    subject: 'Ticket #8842 closed as requested',
    phish: false,
    explain: 'Internal domain, a ticket you opened yourself, and nothing new being requested.'
  },
  {
    id: 'hook3',
    from: 'ceo@yourcompany.co',
    subject: 'Urgent wire transfer before 5pm',
    phish: true,
    explain: 'Right brand, wrong ending (.co instead of .com), and payment pressure. Confirm by phone.'
  },
  {
    id: 'hook4',
    from: 'it-helpdesk@yourcompany.com',
    subject: 'Password policy reminder \u2014 no action needed',
    phish: false,
    explain: 'Internal sender, routine message, no link asking for credentials.'
  },
  {
    id: 'hook5',
    from: 'no-reply@dropbox-share.net',
    subject: 'Andrew shared "Payroll.xlsx" with you',
    phish: true,
    explain: 'A file you never expected, from a lookalike domain. Confirm with the sender out of band.'
  },
  {
    id: 'hook6',
    from: 'hr@yourcompany.com',
    subject: 'Benefits enrollment opens Monday',
    phish: false,
    explain: 'Expected internal sender, normal timing, and a link to the internal portal.'
  },
  {
    id: 'hook7',
    from: 'support@amaz0n-billing.com',
    subject: 'Refund failed \u2014 re-enter your card',
    phish: true,
    explain: 'Any email asking you to re-enter card details is harvesting payment data.'
  },
  {
    id: 'hook8',
    from: 'calendar@yourcompany.com',
    subject: 'Invitation: quarterly security review',
    phish: false,
    explain: 'A calendar invite from the internal domain that asks only for your attendance.'
  }
];

export const NPCS = [
  {
    id: 'maya',
    name: 'MAYA',
    role: 'SOC Analyst',
    color: '#38bdf8',
    patrol: [
      [-9, 3],
      [7, 3]
    ],
    intro: 'Vendor support just messaged me asking to confirm my password in chat. They already have my username, so it is fine, right?',
    prompt: 'What do you tell Maya?',
    choices: [
      {
        text: 'Share it \u2014 they already know your username.',
        xp: 0,
        correct: false,
        explain: 'Support teams never ask for a password. Anyone who does is harvesting credentials, no matter how much they already know.'
      },
      {
        text: 'Refuse, then call the vendor on a number you already have.',
        xp: 10,
        correct: true,
        explain: 'Verifying out of band on a known number defeats impersonation \u2014 the attacker cannot answer that phone.'
      }
    ],
    intel: 'phishing_domains'
  },
  {
    id: 'dev',
    name: 'DEV',
    role: 'Network Admin',
    color: '#ff9f1c',
    patrol: [
      [10, -4],
      [10, 6]
    ],
    intro: 'Two cafe networks: NeonCafe_Free and NeonCafe_Free_2. One is an evil twin. Which do I join?',
    prompt: 'Pick a safe approach.',
    choices: [
      {
        text: 'The open one \u2014 no password means fastest.',
        xp: 0,
        correct: false,
        explain: 'An open network with a clone beside it is the classic evil-twin setup: everything you send is visible to whoever runs it.'
      },
      {
        text: 'Ask staff for the official name, then use the VPN.',
        xp: 10,
        correct: true,
        explain: 'Confirming the real network with a human, then encrypting traffic through the VPN, removes the twin\u2019s advantage.'
      }
    ],
    intel: 'least_privilege'
  },
  {
    id: 'rio',
    name: 'RIO',
    role: 'Security Intern',
    color: '#c084fc',
    patrol: [
      [-6, -8],
      [6, -10]
    ],
    intro: 'I found a USB stick in the parking lot. It says PAYROLL 2026 on it. Should I plug it in to see whose it is?',
    prompt: 'What do you tell Rio?',
    choices: [
      {
        text: 'Plug it in \u2014 you need the owner\u2019s name.',
        xp: 0,
        correct: false,
        explain: 'A planted USB is a delivery method. Plugging it in can run code before you ever open a file.'
      },
      {
        text: 'Hand it to security \u2014 never plug in unknown media.',
        xp: 10,
        correct: true,
        explain: 'Unknown media goes to security for controlled analysis. Curiosity is exactly the hook being baited.'
      }
    ],
    intel: 'removable_media'
  }
];

export const MISSION_GUIDE = {
  id: 'kai',
  name: 'KAI',
  role: 'Threat Analyst',
  color: '#34d399',
  patrol: [
    [-4, 8],
    [-4, 8]
  ],
  intro: 'Before you sort the inbox, remember: a familiar display name does not prove who sent a message. What should you check first?',
  prompt: 'What is the safest first check?',
  choices: [
    {
      text: 'Inspect the full sender address and verify suspicious requests through a trusted channel.',
      xp: 10,
      correct: true,
      explain: 'Check the real sender domain, inspect links before opening them, and verify unexpected requests through a contact method you already trust.'
    },
    {
      text: 'Trust the display name if the message looks like it came from someone you know.',
      xp: 0,
      correct: false,
      explain: 'Display names are easy to imitate. Check the full sender address and verify unexpected requests independently.'
    }
  ],
  intel: 'phishing_domains'
};

export const BOSS_HOOK_WINDOW = 7000;