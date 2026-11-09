// One source of truth for the controls legend.
// The HUD legend, the first-visit controls card and Tablet > Settings all read
// this list, so they can never disagree again.

export const CONTROL_GROUPS = [
  {
    id: 'move',
    title: 'Move',
    items: [
      { keys: 'WASD', label: 'Move', detail: 'Arrow keys work too.' },
      { keys: 'Shift', label: 'Sprint', detail: 'Hold while moving.' },
      { keys: 'Space', label: 'Jump', detail: 'Press twice in the air for a flip jump.' },
      { keys: 'L', label: 'Dash', detail: 'Quick burst in the direction you are moving.' },
      { keys: 'Drag', label: 'Camera', detail: 'Click and drag to orbit the camera.' }
    ]
  },
  {
    id: 'act',
    title: 'Act',
    items: [
      { keys: 'E', label: 'Interact', detail: 'Enter gates, talk to analysts, collect data shards.' },
      { keys: 'Tab', label: 'Tablet', detail: 'Profile, quests, intel, badges and map.' }
    ]
  },
  {
    id: 'tools',
    title: 'Analyst tools',
    items: [
      { keys: 'J', label: 'Scan', detail: 'Reveals data shards within 12m and flags unverified contacts.' },
      { keys: 'K', label: 'Firewall', detail: 'Blocks an incoming stranger. No intel, no XP.' },
      { keys: 'F', label: 'Uplink', detail: 'The SOC marks your next objective with a beacon.' }
    ]
  }
];

export const LEGEND_TOGGLE_KEY = 'H';
