export const LIBRARY = [
  { id: 1, title: 'Senior Code Reviewer',  category: 'Engineering', content: 'Review my code for bugs.',                       uses: 4821, rating: 4.9, tags: ['code', 'review'],    trend: 12  },
  { id: 2, title: 'Socratic Tutor',        category: 'Education',   content: 'Teach me about this topic using questions.',     uses: 3102, rating: 4.7, tags: ['teaching', 'learning'], trend: 8  },
  { id: 3, title: 'Startup Pitch Critic',  category: 'Business',    content: 'Critique my startup idea.',                     uses: 2799, rating: 4.8, tags: ['startup', 'pitch'],   trend: 22  },
  { id: 4, title: 'UX Friction Finder',    category: 'Design',      content: 'Find problems in my user flow.',                uses: 1984, rating: 4.6, tags: ['ux', 'design'],       trend: 5   },
  { id: 5, title: 'Debate Opponent',       category: 'Writing',     content: 'Argue against my position.',                    uses: 2311, rating: 4.5, tags: ['debate', 'writing'],  trend: -2  },
  { id: 6, title: 'Data Story Narrator',   category: 'Analytics',   content: 'Turn this data into a story.',                  uses: 1654, rating: 4.7, tags: ['data', 'analytics'],  trend: 18  },
];

export const CATEGORIES = ['All', 'Engineering', 'Education', 'Business', 'Design', 'Writing', 'Analytics'];

export const CAT_COLORS = {
  Engineering: '#3b82f6',
  Education:   '#10b981',
  Business:    '#f59e0b',
  Design:      '#ec4899',
  Writing:     '#8b5cf6',
  Analytics:   '#06b6d4',
};

export const RISK_COLORS = {
  LOW:      '#10b981',
  MED:      '#f59e0b',
  HIGH:     '#f97316',
  CRITICAL: '#ef4444',
};

export const TAG_COLORS = {
  FIX:    '#10b981',
  WARN:   '#f59e0b',
  INJECT: '#3b82f6',
};
