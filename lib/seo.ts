export type SeoPackage = {
  title: string;
  description: string;
  tags: string[];
  hashtags: string[];
  thumbnailPrompt: string;
};

const CATEGORY_TEMPLATES: Record<string, { titleFrames: string[]; descriptionFocus: string[]; thumbnailScenes: string[]; }> = {
  tech: {
    titleFrames: [
      'Next-Gen {core} Breakdown',
      'Mastering {core} in Minutes',
      'Pro Guide: {core} Explained',
      '{core}: Tips, Tools & Workflows'
    ],
    descriptionFocus: [
      'Stay ahead with the latest {core} strategies, best practices, and hands-on demos.',
      'We cover must-know updates, performance tweaks, and insider workflows to keep you sharp.',
      'Learn how to deploy, optimize, and scale with a practical walkthrough using real-world examples.'
    ],
    thumbnailScenes: [
      'futuristic workstation, neon accents, holographic UI elements',
      'bold tech creator pointing at floating diagrams and schematics',
      'sleek gadget close-up with dramatic lighting and energy trails'
    ]
  },
  vlog: {
    titleFrames: [
      'Day in the Life: {core}',
      'Behind the Scenes: {core}',
      '{core} Adventure Unfiltered',
      'Real Talk: {core} Moments'
    ],
    descriptionFocus: [
      'Join me as I dive into {core} and share raw, unscripted moments from the journey.',
      'Expect candid highlights, honest reflections, and practical takeaways from today’s experience.',
      'Stay until the end for surprise lessons, personal wins, and what’s coming next.'
    ],
    thumbnailScenes: [
      'cinematic cityscape background, creator smiling mid-action',
      'warm lifestyle aesthetic with candid snapshots and polaroids',
      'dynamic travel shot with motion blur and bold text overlays'
    ]
  },
  shorts: {
    titleFrames: [
      '60s {core} Challenge',
      '{core} in 30 Seconds',
      'Quick Fix: {core}',
      'Rapid Fire Tips: {core}'
    ],
    descriptionFocus: [
      'A punchy, fast-paced breakdown of {core} packed into bite-sized insights.',
      'Perfect for creators on the move—save this short for quick reference anytime.',
      'Drop a comment with what you want covered next and share with someone who needs this.'
    ],
    thumbnailScenes: [
      'bold text overlay with countdown timer vibe, vibrant gradients',
      'creator mid-motion with exaggerated expression and emojis',
      'split-screen comparison before vs after with punchy colors'
    ]
  },
  gaming: {
    titleFrames: [
      'Winning {core} Strategy Revealed',
      'Ultimate {core} Guide',
      '{core} Gameplay Breakdown',
      'Insane {core} Moments You Need to See'
    ],
    descriptionFocus: [
      'Walk through the key plays, clutch moments, and tactical decisions behind this {core} run.',
      'Get the loadouts, builds, and pro-level moves that helped secure the win.',
      'Drop your favorite moment in the comments and share how you would play it differently.'
    ],
    thumbnailScenes: [
      'intense action scene with character in spotlight, motion blur effects',
      'dramatic contrast lighting with bold stat overlays',
      'esports stage energy, neon streaks, triumphant pose'
    ]
  },
  tutorial: {
    titleFrames: [
      'Step-by-Step {core} Tutorial',
      'Beginner to Pro: {core}',
      '{core} Complete Walkthrough',
      'Everything You Need to Know About {core}'
    ],
    descriptionFocus: [
      'A structured, beginner-friendly tutorial covering every step of {core}.',
      'We walk through tools, common mistakes, and expert shortcuts to speed up your progress.',
      'Practice alongside the timestamps and download the resources linked below.'
    ],
    thumbnailScenes: [
      'clean layout with numbered steps, bold highlight colors',
      'teacher-style pose in front of whiteboard with diagrams',
      'close-up on hands demonstrating steps with crisp lighting'
    ]
  }
};

const DEFAULT_TEMPLATE = CATEGORY_TEMPLATES.tech;

function normalizeKeywords(source: string | null | undefined): string[] {
  if (!source) return [];
  const cleaned = source
    .replace(/https?:\/\//g, ' ')
    .replace(/[\-_]/g, ' ')
    .replace(/\.[a-zA-Z0-9]+$/, '')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .toLowerCase();
  const tokens = cleaned.split(/\s+/).filter(Boolean);
  const unique = Array.from(new Set(tokens));
  return unique.slice(0, 12);
}

function toTitleCase(input: string): string {
  return input
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(' ');
}

function ensureTitleLength(title: string): string {
  if (title.length >= 60 && title.length <= 70) return title;
  if (title.length < 60) {
    return `${title} | 2024 Guide`.slice(0, 70);
  }
  return `${title.slice(0, 66).trim()}…`;
}

function buildKeywordPhrases(keywords: string[], fallback: string): string[] {
  if (keywords.length === 0) {
    return [fallback];
  }
  const primary = toTitleCase(keywords.slice(0, 3).join(' '));
  const secondary = toTitleCase(keywords.slice(3, 6).join(' '));
  return [primary, secondary].filter(Boolean);
}

export function generateSeoPackage(params: {
  sourceLabel: string;
  category: string;
  language: string;
  monetization: string;
}): SeoPackage {
  const { sourceLabel, category, language, monetization } = params;
  const template = CATEGORY_TEMPLATES[category] ?? DEFAULT_TEMPLATE;
  const keywords = normalizeKeywords(sourceLabel);
  const [primaryPhrase, secondaryPhrase] = buildKeywordPhrases(keywords, 'YouTube Upload');
  const core = primaryPhrase || 'YouTube Upload';

  const rawTitle = template.titleFrames
    .map((frame) => frame.replace('{core}', core))
    .sort((a, b) => Math.abs(a.length - 65) - Math.abs(b.length - 65))[0];
  const title = ensureTitleLength(rawTitle);

  const descriptionBlocks = template.descriptionFocus.map((block) =>
    block.replace('{core}', primaryPhrase || 'this video')
  );

  const keywordList = Array.from(
    new Set([
      ...(keywords.length ? keywords : ['youtube', 'video', category]),
      ...core.toLowerCase().split(' '),
      language.toLowerCase(),
      `${category} video`,
      `best ${category} tips`,
      monetization
    ].filter(Boolean))
  ).slice(0, 15);

  const description = [
    `${title} — ${primaryPhrase || 'Complete Video'}`,
    '',
    ...descriptionBlocks,
    '',
    'Timestamps:',
    '00:00 Intro',
    '00:45 Key Insights',
    '02:00 Deep Dive',
    '05:00 Final Thoughts',
    '',
    'Key Takeaways:',
    ...descriptionBlocks.slice(0, 2).map((line) => `- ${line}`),
    '',
    '🔔 Subscribe for more: https://youtube.com',
    '👍 Like & comment what you want to see next!',
    '',
    `Keywords: ${keywordList.join(', ')}`
  ].join('\n');

  const tags = keywordList.map((keyword) => toTitleCase(keyword)).slice(0, 15);
  const hashtags = keywordList
    .slice(0, 5)
    .map((keyword) => `#${keyword.replace(/\s+/g, '')}`);

  const thumbnailPrompt = `Create a high-impact thumbnail featuring ${template.thumbnailScenes[0]} with the text "${title.split(':')[0]}" in bold typography. Style: HDR, ultra sharp, punchy contrast.`;

  return {
    title,
    description,
    tags,
    hashtags,
    thumbnailPrompt
  };
}
