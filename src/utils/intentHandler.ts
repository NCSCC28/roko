export interface Intent {
  name: string;
  patterns: string[];
  handler: (input: string) => Promise<string>;
}

export interface IntentResult {
  matched: boolean;
  intent?: string;
  response: string;
}

const searchVerseIntentPatterns = ['search', 'find', 'look for', 'show me', 'get me'];
const gitaVersePatterns = ['gita', 'bhagavad', 'chapter.*verse', 'sloka'];
const bibleVersePatterns = ['bible', 'genesis', 'john', 'psalm', 'matthew', 'luke', 'mark'];
const musicPatterns = ['play', 'music', 'song', 'audio', 'listen', 'hear'];
const weatherPatterns = ['weather', 'forecast', 'temperature', 'rain', 'sunny'];
const newsPatterns = ['news', 'headlines', 'latest', 'update'];
const timePatterns = ['time', 'what time', 'tell me', 'what is the'];
const helpPatterns = ['help', 'assist', 'support', 'guide', 'tutorial'];
const greetingPatterns = ['hi', 'hello', 'hlo', 'hey', 'namaste'];
const moodLiftPatterns = ['sad', 'anxious', 'motivate', 'motivation', 'low', 'depressed'];
const verseReferenceRegex = /\d+\s*:\s*\d+/;
const topicSearchRegex = /verses about\s+(.+)/i;
const lifeSituations: Record<string, { keywords: string[]; response: string }> = {
  career: {
    keywords: ['career', 'job', 'work', 'confusion'],
    response: formatLifeResponse({
      title: 'Career confusion',
      verse: '“karmanye vadhikaraste ma phaleshu kadachana” — You have a right to action, not its fruits. (Gita 2:47)',
      parallel: '“Commit your work to the LORD, and your plans will be established.” (Proverbs 16:3)',
      action: 'Write one thing you can do today that serves others; do it without worrying about outcomes.'
    })
  },
  failure: {
    keywords: ['failure', 'fail', 'fear of failure'],
    response: formatLifeResponse({
      title: 'Fear of failure',
      verse: '“yogaḥ karmasu kauśalam” — Yoga is skill in action. (Gita 2:50)',
      parallel: '“For God gave us a spirit not of fear but of power, love, and self-control.” (2 Tim 1:7)',
      action: 'Pick a small, safe experiment and ship it in 24 hours.'
    })
  },
  breakup: {
    keywords: ['breakup', 'heartbreak'],
    response: formatLifeResponse({
      title: 'Breakup',
      verse: '“This too shall pass; be steadfast in yoga.” (Gita 2:15 paraphrase)',
      parallel: '“The LORD is close to the brokenhearted.” (Psalm 34:18)',
      action: 'Call a trusted friend and share one feeling; then take a 20-minute walk.'
    })
  },
  anger: {
    keywords: ['anger', 'angry'],
    response: formatLifeResponse({
      title: 'Anger',
      verse: '“From anger comes delusion; from delusion, loss of memory.” (Gita 2:63)',
      parallel: '“Be slow to anger.” (James 1:19)',
      action: 'Pause for 3 deep breaths, step away for 5 minutes, then write what you actually need.'
    })
  },
  exam: {
    keywords: ['exam', 'exam stress', 'study', 'test'],
    response: formatLifeResponse({
      title: 'Exam stress',
      verse: '“Stand firm in your duty.” (Gita 3:19)',
      parallel: '“Ask, and it will be given to you; seek, and you will find.” (Matthew 7:7)',
      action: 'Do a 50-minute focused study block, then 10-minute break; repeat twice.'
    })
  },
  family: {
    keywords: ['family', 'conflict', 'parents', 'siblings'],
    response: formatLifeResponse({
      title: 'Family conflict',
      verse: '“Speak words that are truthful, pleasant, and beneficial.” (Gita 17:15)',
      parallel: '“Blessed are the peacemakers.” (Matthew 5:9)',
      action: 'Schedule a calm 15-minute talk; start by stating what you appreciate before the issue.'
    })
  }
};

function formatLifeResponse(opts: { title: string; verse: string; parallel: string; action: string }): string {
  return `${opts.title}\nVerse: ${opts.verse}\nAlso: ${opts.parallel}\nAction: ${opts.action}`;
}

function getMotivationalVerses(): string {
  return [
    '“uddhared ātmanātmānaṁ nātmānam avasādayet” — Lift yourself by your own self; do not let yourself down. (Gita 6.5)',
    '“yogaḥ karmasu kauśalam” — Yoga is skill in action. (Gita 2.50)',
    '“Allah does not burden a soul beyond that it can bear.” (Qur’an 2:286)',
    '“The LORD is my shepherd; I shall not want.” (Psalm 23:1)'
  ].join('\n');
}

export function createIntents(): Intent[] {
  return [
    {
      name: 'greeting',
      patterns: greetingPatterns,
      handler: async () => "Hello 🙏 I'm your spiritual assistant. How can I guide you today?"
    },
    {
      name: 'motivation',
      patterns: moodLiftPatterns,
      handler: async () => getMotivationalVerses()
    },
    {
      name: 'search_verse',
      patterns: searchVerseIntentPatterns,
      handler: async (input: string) => {
        const searchTerm = input.replace(/search|find|look for|show me|get me/gi, '').trim();
        return `I'll search for verses about "${searchTerm}". Let me find the most relevant passages for you.`;
      }
    },
    {
      name: 'gita_verse',
      patterns: gitaVersePatterns,
      handler: async (input: string) => {
        const chapterMatch = input.match(/chapter\s+(\d+)/i);
        const verseMatch = input.match(/verse\s+(\d+)/i);

        if (chapterMatch && verseMatch) {
          return `Loading Bhagavad Gita Chapter ${chapterMatch[1]}, Verse ${verseMatch[1]}.`;
        }
        return 'To access a specific Gita verse, please mention the chapter and verse number.';
      }
    },
    {
      name: 'bible_verse',
      patterns: bibleVersePatterns,
      handler: async (input: string) => {
        const bookMatch = input.match(/(genesis|john|psalm|matthew|luke|mark)/i);
        const chapterMatch = input.match(/chapter\s+(\d+)/i);
        const verseMatch = input.match(/verse\s+(\d+)/i);

        if (bookMatch && chapterMatch && verseMatch) {
          return `Opening ${bookMatch[0]} ${chapterMatch[1]}:${verseMatch[1]} for you.`;
        }
        return 'To access a specific Bible verse, please mention the book, chapter, and verse.';
      }
    },
    {
      name: 'music',
      patterns: musicPatterns,
      handler: async (input: string) => {
        const genreMatch = input.match(/\b(meditation|calming|peaceful|relaxing|uplifting|spiritual)\b/i);
        const genre = genreMatch ? genreMatch[0] : 'meditation';
        return `Playing ${genre} music for you. Enjoy!`;
      }
    },
    {
      name: 'weather',
      patterns: weatherPatterns,
      handler: async (input: string) => {
        const locationMatch = input.match(/(?:in|at|around)\s+(\w+)/i);
        const location = locationMatch ? locationMatch[1] : 'your area';
        return `Fetching weather information for ${location}. One moment please.`;
      }
    },
    {
      name: 'news',
      patterns: newsPatterns,
      handler: async (_input: string) => {
        return 'Fetching the latest news headlines for you.';
      }
    },
    {
      name: 'time',
      patterns: timePatterns,
      handler: async (_input: string) => {
        const now = new Date();
        const time = now.toLocaleTimeString();
        return `It's currently ${time}.`;
      }
    },
    {
      name: 'help',
      patterns: helpPatterns,
      handler: async (_input: string) => {
        return `I'm Roko, your AI voice assistant. I can help you search verses from the Bhagavad Gita and Bible, play music, get weather updates, and much more. Just ask me!`;
      }
    }
  ];
}

export async function matchIntent(input: string): Promise<IntentResult> {
  const lowerInput = input.toLowerCase();
  const message = lowerInput.trim();

  // Step 1: Greeting
  if (message.match(/\b(hi|hello|hlo|how are you|hey)\b/)) {
    return { matched: true, intent: 'greeting', response: "Hello 🙏 I'm your spiritual assistant. How can I guide you today?" };
  }

  // Step 2: Emotion / motivation
  if (message.includes('sad') || message.includes('anxious')) {
    return { matched: true, intent: 'motivation', response: getMotivationalVerses() };
  }

  // Step 3: Direct verse reference (e.g., "2:47" or "john 3:16")
  if (verseReferenceRegex.test(message)) {
    return {
      matched: true,
      intent: 'verse_reference',
      response: `I noticed a verse reference (${message.match(verseReferenceRegex)?.[0]}). Fetching it now...`
    };
  }

  // Step 4: Topic search (e.g., "verses about peace")
  const topicMatch = message.match(topicSearchRegex);
  if (topicMatch) {
    const topic = topicMatch[1].trim();
    return {
      matched: true,
      intent: 'topic_search',
      response: `Searching for verses about "${topic}".`
    };
  }

  // Step 4b: Life situations
  for (const key of Object.keys(lifeSituations)) {
    const { keywords, response } = lifeSituations[key];
    if (keywords.some((k) => message.includes(k))) {
      return { matched: true, intent: `life_${key}`, response };
    }
  }

  // Legacy intents (search, music, weather, news, time, help, etc.)
  const intents = createIntents();
  for (const intent of intents) {
    for (const pattern of intent.patterns) {
      if (message.includes(pattern)) {
        const response = await intent.handler(input);
        return { matched: true, intent: intent.name, response };
      }
    }
  }

  // Step 5: Fallback
  return {
    matched: false,
    response: "I'm here to help with Bible, Gita, or Quran verses.\nTry:\n- John 3:16\n- Gita 2:47\n- Verses about peace"
  };
}
