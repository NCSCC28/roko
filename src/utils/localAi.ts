interface KnowledgeCard {
  tradition: 'Gita' | 'Bible' | 'Quran';
  reference: string;
  idea: string;
  summary: string;
  moral: string;
  keywords: string[];
}

interface ConceptCard {
  title: string;
  explanation: string;
  summary: string;
  moral: string;
  practice: string;
  keywords: string[];
  relatedReference: string;
}

type ResponseMode = 'full' | 'summary' | 'moral' | 'practice';

const knowledgeBase: KnowledgeCard[] = [
  {
    tradition: 'Gita',
    reference: '2:47',
    idea: 'Do your duty with full effort, but do not become attached to the final result.',
    summary: 'Focus on right action, not anxiety about outcomes.',
    moral: 'Effort is your responsibility; outcome is not always in your control.',
    keywords: ['duty', 'karma', 'work', 'result', 'action', 'focus', 'discipline'],
  },
  {
    tradition: 'Gita',
    reference: '2:50',
    idea: 'Yoga is excellence in action, where wisdom guides effort and reduces inner conflict.',
    summary: 'Spirituality can be practiced through quality work and balanced judgment.',
    moral: 'Skill and ethics together create meaningful success.',
    keywords: ['yoga', 'skill', 'action', 'wisdom', 'balance', 'work'],
  },
  {
    tradition: 'Gita',
    reference: '2:70',
    idea: 'A stable person remains peaceful even when desires flow in continuously.',
    summary: 'Peace belongs to those who are not ruled by cravings.',
    moral: 'Contentment protects the mind from endless restlessness.',
    keywords: ['desire', 'peace', 'contentment', 'mind', 'stability', 'calm'],
  },
  {
    tradition: 'Gita',
    reference: '3:19',
    idea: 'Act with responsibility and without attachment to personal gain.',
    summary: 'Detached action keeps the heart pure and the mind clear.',
    moral: 'Serve through action, not ego.',
    keywords: ['detachment', 'service', 'responsibility', 'action', 'ego'],
  },
  {
    tradition: 'Gita',
    reference: '4:7',
    idea: 'Whenever righteousness declines, divine guidance appears to restore moral order.',
    summary: 'Truth and justice are never permanently lost.',
    moral: 'Stand for dharma even in difficult times.',
    keywords: ['dharma', 'justice', 'truth', 'righteous', 'protection'],
  },
  {
    tradition: 'Gita',
    reference: '6:5',
    idea: 'Elevate yourself through self-discipline rather than self-neglect.',
    summary: 'Your own mind can be your best helper or worst enemy.',
    moral: 'Self-mastery creates inner strength.',
    keywords: ['mind', 'self', 'discipline', 'growth', 'control', 'improve'],
  },
  {
    tradition: 'Gita',
    reference: '6:26',
    idea: 'When the mind wanders, gently bring it back with patience and awareness.',
    summary: 'Meditation is repeated returning, not instant perfection.',
    moral: 'Consistency matters more than intensity.',
    keywords: ['meditation', 'mind', 'focus', 'attention', 'patience', 'practice'],
  },
  {
    tradition: 'Gita',
    reference: '12:13',
    idea: 'The true devotee avoids hatred and lives with compassion and humility.',
    summary: 'Spiritual maturity is seen through kindness and ego reduction.',
    moral: 'Compassion is higher than pride.',
    keywords: ['compassion', 'kindness', 'devotion', 'humility', 'love'],
  },
  {
    tradition: 'Gita',
    reference: '17:15',
    idea: 'Speech becomes spiritual when it is truthful, gentle, beneficial, and self-controlled.',
    summary: 'Words shape karma, relationships, and inner purity.',
    moral: 'Speak to heal, not to harm.',
    keywords: ['speech', 'truth', 'gentle', 'communication', 'words', 'self-control'],
  },
  {
    tradition: 'Gita',
    reference: '18:66',
    idea: 'Surrendering deeply to the Divine dissolves fear, guilt, and confusion.',
    summary: 'Spiritual trust gives courage beyond intellectual doubt.',
    moral: 'Let faith carry what ego cannot.',
    keywords: ['surrender', 'faith', 'trust', 'fear', 'freedom', 'devotion'],
  },
  {
    tradition: 'Bible',
    reference: 'James 1:5',
    idea: 'If you seek wisdom sincerely, ask God and keep an open heart.',
    summary: 'Wisdom grows through prayer, humility, and learning.',
    moral: 'Asking for guidance is strength, not weakness.',
    keywords: ['wisdom', 'guidance', 'understanding', 'pray', 'decision'],
  },
  {
    tradition: 'Bible',
    reference: 'John 13:34',
    idea: 'Love is the central commandment and visible proof of spiritual maturity.',
    summary: 'Authentic faith is recognized through practical love.',
    moral: 'Love is not optional; it is foundational.',
    keywords: ['love', 'commandment', 'care', 'service', 'community'],
  },
  {
    tradition: 'Bible',
    reference: 'Matthew 5:9',
    idea: 'Peacemakers are honored because they heal conflict instead of spreading it.',
    summary: 'Peace-building is active moral leadership.',
    moral: 'Choose reconciliation over revenge.',
    keywords: ['peace', 'conflict', 'forgive', 'reconcile', 'harmony'],
  },
  {
    tradition: 'Bible',
    reference: 'Matthew 6:34',
    idea: 'Do not let tomorrow steal today’s strength through excessive worry.',
    summary: 'Anxiety shrinks when attention returns to present responsibilities.',
    moral: 'Handle today faithfully; tomorrow will unfold in time.',
    keywords: ['worry', 'anxiety', 'future', 'present', 'trust'],
  },
  {
    tradition: 'Bible',
    reference: 'Proverbs 3:5',
    idea: 'Trust beyond your limited understanding and walk with faith.',
    summary: 'Faith gives direction when certainty is missing.',
    moral: 'Trust and humility protect against arrogance.',
    keywords: ['faith', 'trust', 'guidance', 'future', 'fear'],
  },
  {
    tradition: 'Bible',
    reference: 'Proverbs 15:1',
    idea: 'Gentle speech can calm anger and prevent conflict from escalating.',
    summary: 'Tone often matters as much as content.',
    moral: 'Respond softly when emotions are high.',
    keywords: ['speech', 'anger', 'gentle', 'conflict', 'communication'],
  },
  {
    tradition: 'Bible',
    reference: 'Philippians 4:6',
    idea: 'Replace anxious loops with prayer, gratitude, and intentional trust.',
    summary: 'Peace grows when worry is converted into surrender and gratitude.',
    moral: 'Prayer can transform panic into perspective.',
    keywords: ['anxiety', 'prayer', 'gratitude', 'peace', 'trust'],
  },
  {
    tradition: 'Bible',
    reference: 'Galatians 6:9',
    idea: 'Do not quit doing good even when results seem delayed.',
    summary: 'Faithful consistency eventually bears fruit.',
    moral: 'Perseverance is silent strength.',
    keywords: ['perseverance', 'good', 'patience', 'consistency', 'hope'],
  },
  {
    tradition: 'Bible',
    reference: 'Ephesians 4:32',
    idea: 'Kindness and forgiveness heal hearts and communities.',
    summary: 'Mercy is stronger than resentment.',
    moral: 'Forgiveness frees both giver and receiver.',
    keywords: ['forgive', 'kindness', 'mercy', 'compassion', 'healing'],
  },
  {
    tradition: 'Bible',
    reference: '1 Corinthians 13:4',
    idea: 'True love is patient, humble, and enduring under pressure.',
    summary: 'Love is a discipline of character, not just emotion.',
    moral: 'Patience is one of love’s strongest forms.',
    keywords: ['love', 'patience', 'humility', 'character', 'enduring'],
  },
  {
    tradition: 'Quran',
    reference: '1:1',
    idea: 'Begin with awareness of Divine mercy and compassion.',
    summary: 'Spiritual life starts with gratitude and mercy-consciousness.',
    moral: 'Lead with compassion in every action.',
    keywords: ['mercy', 'compassion', 'beginning', 'gratitude', 'rahman'],
  },
  {
    tradition: 'Quran',
    reference: '2:153',
    idea: 'Seek strength through patience and prayer in moments of hardship.',
    summary: 'Endurance and spiritual discipline create resilience.',
    moral: 'Patience is active trust, not passive waiting.',
    keywords: ['patience', 'prayer', 'strength', 'hardship', 'resilience'],
  },
  {
    tradition: 'Quran',
    reference: '2:286',
    idea: 'A person is not burdened beyond capacity; trials are matched with ability.',
    summary: 'Hardship does not mean abandonment; it can build resilience.',
    moral: 'You are stronger than your current difficulty.',
    keywords: ['hardship', 'struggle', 'strength', 'patience', 'resilience'],
  },
  {
    tradition: 'Quran',
    reference: '3:159',
    idea: 'Lead with gentleness, forgiveness, and consultation rather than harshness.',
    summary: 'Wise leadership combines mercy with collective thinking.',
    moral: 'Soft character builds strong communities.',
    keywords: ['leadership', 'gentle', 'forgive', 'consultation', 'community'],
  },
  {
    tradition: 'Quran',
    reference: '13:28',
    idea: 'Hearts become calm through remembrance of the Divine.',
    summary: 'Spiritual remembrance steadies emotional turbulence.',
    moral: 'Inner peace grows from consistent remembrance.',
    keywords: ['peace', 'heart', 'remembrance', 'calm', 'spiritual'],
  },
  {
    tradition: 'Quran',
    reference: '16:90',
    idea: 'God commands justice, excellence, and generosity, while forbidding oppression.',
    summary: 'Ethical life requires fairness and active goodness.',
    moral: 'Justice and kindness must walk together.',
    keywords: ['justice', 'kindness', 'ethics', 'generosity', 'fairness'],
  },
  {
    tradition: 'Quran',
    reference: '49:13',
    idea: 'Human diversity is meant for mutual recognition, not superiority.',
    summary: 'Honor is based on character, not identity labels.',
    moral: 'Respect people beyond race, tribe, or status.',
    keywords: ['diversity', 'respect', 'equality', 'humanity', 'unity'],
  },
  {
    tradition: 'Quran',
    reference: '94:5',
    idea: 'Ease can emerge with hardship when one continues with trust and patience.',
    summary: 'Difficult seasons are not permanent.',
    moral: 'Hope and patience are practical forms of faith.',
    keywords: ['difficulty', 'ease', 'hope', 'patience', 'stress'],
  },
  {
    tradition: 'Quran',
    reference: '103:1',
    idea: 'Time is precious, and success belongs to those who combine faith, good deeds, and truth.',
    summary: 'Life quality depends on values, actions, and disciplined time use.',
    moral: 'Use time with purpose and integrity.',
    keywords: ['time', 'discipline', 'faith', 'good deeds', 'truth'],
  },
];

const conceptBase: ConceptCard[] = [
  {
    title: 'Karma Yoga',
    explanation:
      'Karma Yoga means performing duties sincerely without emotional dependence on rewards. It builds steady focus and reduces anxiety.',
    summary: 'Work with excellence, release result-obsession.',
    moral: 'Character is built by right effort, not by instant reward.',
    practice: 'Before work, set intention: "I will give my best and accept outcomes calmly."',
    keywords: ['karma yoga', 'karma', 'duty', 'result', 'action', 'work'],
    relatedReference: 'Gita 2:47',
  },
  {
    title: 'Dharma',
    explanation:
      'Dharma is right conduct based on responsibility, ethics, and context. It asks: what is the right action here?',
    summary: 'Dharma is responsibility aligned with truth and fairness.',
    moral: 'Do what is right, even when it is difficult.',
    practice: 'In decisions, ask: "Is this honest, fair, and helpful?"',
    keywords: ['dharma', 'righteous', 'ethics', 'responsibility', 'right'],
    relatedReference: 'Gita 3:30',
  },
  {
    title: 'Bhakti',
    explanation:
      'Bhakti is devotion expressed through humility, gratitude, and loving remembrance of the Divine.',
    summary: 'Devotion transforms ego into compassion.',
    moral: 'A soft heart and steady faith bring inner peace.',
    practice: 'Spend 5 minutes daily in gratitude and prayerful reflection.',
    keywords: ['bhakti', 'devotion', 'faith', 'love', 'prayer'],
    relatedReference: 'Gita 12:13',
  },
  {
    title: 'Jnana (Wisdom Path)',
    explanation:
      'The wisdom path uses inquiry, discrimination, and reflection to separate lasting truth from temporary appearances.',
    summary: 'Right understanding reduces confusion and ego-driven reactions.',
    moral: 'Clarity grows when you question assumptions honestly.',
    practice: 'Before reacting, ask: "What is truly important here?"',
    keywords: ['jnana', 'wisdom', 'knowledge', 'truth', 'understanding', 'viveka'],
    relatedReference: 'Gita 4:38',
  },
  {
    title: 'Detachment',
    explanation:
      'Detachment is not indifference; it is caring deeply while not being emotionally controlled by outcomes.',
    summary: 'Detached effort keeps motivation strong and anxiety low.',
    moral: 'Be committed to effort, not chained to outcome.',
    practice: 'Set process goals daily and review effort before result.',
    keywords: ['detachment', 'attachment', 'result', 'anxiety', 'balance', 'equanimity'],
    relatedReference: 'Gita 2:70',
  },
  {
    title: 'Seva (Selfless Service)',
    explanation:
      'Seva means serving others with humility and sincerity, without demanding recognition.',
    summary: 'Service transforms spirituality into social goodness.',
    moral: 'Greatness is measured by contribution, not attention.',
    practice: 'Do one helpful action daily without announcing it.',
    keywords: ['seva', 'service', 'selfless', 'help', 'humanity', 'duty'],
    relatedReference: 'Gita 3:19',
  },
  {
    title: 'Inner Peace',
    explanation:
      'Inner peace comes from disciplined thought, forgiveness, and trust in a higher purpose.',
    summary: 'Peace is practiced, not passively received.',
    moral: 'Control response, not everything around you.',
    practice: 'Pause before reacting: breathe, then respond from values.',
    keywords: ['peace', 'calm', 'anger', 'stress', 'patience', 'forgive'],
    relatedReference: 'Matthew 5:9',
  },
  {
    title: 'Forgiveness',
    explanation:
      'Forgiveness does not deny hurt; it releases the cycle of revenge and restores inner freedom.',
    summary: 'Forgiveness protects the heart from bitterness.',
    moral: 'Mercy is moral courage.',
    practice: 'Name one resentment and consciously release retaliation thoughts.',
    keywords: ['forgive', 'forgiveness', 'mercy', 'hurt', 'resentment', 'healing'],
    relatedReference: 'Ephesians 4:32',
  },
  {
    title: 'Faith and Trust',
    explanation:
      'Faith is confidence in Divine wisdom even when immediate evidence is incomplete.',
    summary: 'Faith gives direction when certainty is unavailable.',
    moral: 'Trust can steady the mind through uncertainty.',
    practice: 'When fearful, write one worry and one trust-based action.',
    keywords: ['faith', 'trust', 'belief', 'uncertainty', 'future', 'hope'],
    relatedReference: 'Proverbs 3:5',
  },
  {
    title: 'Sabr (Patient Endurance)',
    explanation:
      'Sabr combines emotional restraint, perseverance, and trust during pressure.',
    summary: 'Patience is disciplined strength over time.',
    moral: 'Steady endurance often wins long battles.',
    practice: 'In stressful moments, pause, breathe, and choose the next right step.',
    keywords: ['sabr', 'patience', 'endurance', 'difficulty', 'struggle', 'steadfast'],
    relatedReference: 'Quran 2:153',
  },
  {
    title: 'Tawakkul (Reliance on God)',
    explanation:
      'Tawakkul means taking practical action while trusting Divine wisdom for final outcomes.',
    summary: 'Do your best, then place outcomes in God’s care.',
    moral: 'Effort and trust are partners, not opposites.',
    practice: 'Act fully, then mentally release fear of what you cannot control.',
    keywords: ['tawakkul', 'reliance', 'trust', 'god', 'outcome', 'effort'],
    relatedReference: 'Quran 3:159',
  },
  {
    title: 'Gratitude',
    explanation:
      'Gratitude trains the mind to notice grace and possibility, reducing negativity bias.',
    summary: 'A grateful heart sees abundance even during challenge.',
    moral: 'Gratitude turns ordinary life into meaningful life.',
    practice: 'List three blessings every evening and one way to honor them.',
    keywords: ['gratitude', 'thankful', 'blessing', 'contentment', 'joy'],
    relatedReference: 'Quran 1:1',
  },
  {
    title: 'Right Speech',
    explanation:
      'Right speech is truthful, gentle, and beneficial. It avoids harshness, gossip, and ego-driven words.',
    summary: 'Language can either heal trust or damage it.',
    moral: 'Speak with responsibility and compassion.',
    practice: 'Before speaking, ask: Is it true, kind, and useful?',
    keywords: ['speech', 'communication', 'truth', 'gentle', 'words', 'anger'],
    relatedReference: 'Gita 17:15',
  },
];

const greetings = ['hi', 'hello', 'hey', 'namaste', 'salam'];
const stopWords = new Set([
  'the',
  'is',
  'a',
  'an',
  'and',
  'or',
  'to',
  'of',
  'for',
  'in',
  'on',
  'with',
  'about',
  'what',
  'how',
  'please',
  'me',
  'my',
  'i',
  'you',
  'explain',
  'search',
  'find',
  'give',
  'tell',
  'show',
  'provide',
  'about',
  'from',
  'on',
  'this',
  'that',
  'its',
  'it',
  'verse',
  'verses',
  'summary',
  'moral',
  'meaning',
]);

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s:]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 1 && !stopWords.has(token));
}

function scoreKeywords(query: string, keywords: string[]): number {
  const lower = query.toLowerCase();
  return keywords.reduce((acc, keyword) => (lower.includes(keyword) ? acc + 1 : acc), 0);
}

function parseGitaReference(input: string): string | null {
  const byContext = input.match(/(?:gita|bhagavad\s*gita).*?(\d+)\s*[:.]\s*(\d+)/i);
  if (byContext) return `${Number(byContext[1])}:${Number(byContext[2])}`;

  const chapterVerse = input.match(/(?:gita|bhagavad\s*gita).*?chapter\s*(\d+)\D+verse\s*(\d+)/i);
  if (chapterVerse) return `${Number(chapterVerse[1])}:${Number(chapterVerse[2])}`;

  return null;
}

function parseQuranReference(input: string): string | null {
  const compact = input.match(/(?:quran|surah)\s*(\d+)\s*[:.]\s*(\d+)/i);
  if (compact) return `${Number(compact[1])}:${Number(compact[2])}`;

  const long = input.match(/(?:quran|surah)\s*(\d+)\D+(?:ayah|verse)\s*(\d+)/i);
  if (long) return `${Number(long[1])}:${Number(long[2])}`;

  return null;
}

function normalizeBookName(book: string): string {
  return book
    .trim()
    .split(/\s+/)
    .map((part) => {
      if (/^\d+$/.test(part)) return part;
      return `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`;
    })
    .join(' ');
}

function parseBibleReference(input: string): string | null {
  const direct = input.match(/(?:bible\s+)?([1-3]?\s*[a-zA-Z]+(?:\s+[a-zA-Z]+)*)\s+(\d+)\s*[:.]\s*(\d+)/i);
  if (!direct) return null;

  const book = normalizeBookName(direct[1]);
  const chapter = Number(direct[2]);
  const verse = Number(direct[3]);
  return `${book} ${chapter}:${verse}`;
}

function detectResponseMode(lowerQuestion: string): ResponseMode {
  if (/\b(summary|summarize|short|brief|in short|gist)\b/i.test(lowerQuestion)) {
    return 'summary';
  }

  if (/\b(moral|lesson|teaching|takeaway)\b/i.test(lowerQuestion)) {
    return 'moral';
  }

  if (/\b(practice|practical|apply|implementation|daily step|how to apply)\b/i.test(lowerQuestion)) {
    return 'practice';
  }

  return 'full';
}

function findBestConcept(question: string): ConceptCard | null {
  const ranked = conceptBase
    .map((concept) => ({ concept, score: scoreKeywords(question, concept.keywords) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return ranked[0]?.concept ?? null;
}

function findTopConcepts(question: string, limit = 2): ConceptCard[] {
  return conceptBase
    .map((concept) => ({ concept, score: scoreKeywords(question, concept.keywords) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.concept);
}

function findByReference(question: string): KnowledgeCard | null {
  const gitaRef = parseGitaReference(question);
  if (gitaRef) {
    return knowledgeBase.find((card) => card.tradition === 'Gita' && card.reference === gitaRef) ?? null;
  }

  const quranRef = parseQuranReference(question);
  if (quranRef) {
    return knowledgeBase.find((card) => card.tradition === 'Quran' && card.reference === quranRef) ?? null;
  }

  const bibleRef = parseBibleReference(question);
  if (bibleRef) {
    return knowledgeBase.find((card) => card.tradition === 'Bible' && bibleRef.includes(card.reference)) ?? null;
  }

  return null;
}

function buildCardResponse(card: KnowledgeCard, mode: ResponseMode): string {
  if (mode === 'summary') {
    return [
      `${card.tradition} ${card.reference}`,
      '',
      `Summary: ${card.summary}`,
    ].join('\n');
  }

  if (mode === 'moral') {
    return [
      `${card.tradition} ${card.reference}`,
      '',
      `Moral: ${card.moral}`,
    ].join('\n');
  }

  if (mode === 'practice') {
    const practical = `Practical step: Reflect for 2 minutes and choose one action today based on this teaching.`;
    return [
      `${card.tradition} ${card.reference}`,
      '',
      `Summary: ${card.summary}`,
      practical,
      `Moral: ${card.moral}`,
    ].join('\n');
  }

  return [
    `${card.tradition} ${card.reference}`,
    '',
    `Summary: ${card.summary}`,
    `Explanation: ${card.idea}`,
    `Moral: ${card.moral}`,
  ].join('\n');
}

function buildConceptResponse(concept: ConceptCard, mode: ResponseMode): string {
  if (mode === 'summary') {
    return [
      `${concept.title}`,
      '',
      `Summary: ${concept.summary}`,
      `Related reference: ${concept.relatedReference}`,
    ].join('\n');
  }

  if (mode === 'moral') {
    return [
      `${concept.title}`,
      '',
      `Moral: ${concept.moral}`,
      `Related reference: ${concept.relatedReference}`,
    ].join('\n');
  }

  if (mode === 'practice') {
    return [
      `${concept.title}`,
      '',
      `Practical step: ${concept.practice}`,
      `Moral: ${concept.moral}`,
      `Related reference: ${concept.relatedReference}`,
    ].join('\n');
  }

  return [
    `${concept.title}`,
    '',
    `Summary: ${concept.summary}`,
    `Explanation: ${concept.explanation}`,
    `Moral: ${concept.moral}`,
    `Practical step: ${concept.practice}`,
    `Related reference: ${concept.relatedReference}`,
  ].join('\n');
}

function searchByTopic(question: string): KnowledgeCard[] {
  const tokens = tokenize(question);
  if (tokens.length === 0) return [];

  const ranked = knowledgeBase
    .map((card) => {
      const score = tokens.reduce(
        (acc, token) => (card.keywords.some((keyword) => keyword.includes(token) || token.includes(keyword)) ? acc + 1 : acc),
        0
      );
      return { card, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.card);

  return ranked;
}

function buildSearchResponse(matches: KnowledgeCard[], topic: string): string {
  const list = matches
    .map((card, index) => `${index + 1}. ${card.tradition} ${card.reference} - ${card.summary}`)
    .join('\n');

  const moralBlend = matches[0]?.moral ?? 'Choose patience, clarity, and compassion in action.';

  return [
    `I found ${matches.length} relevant verse ideas for "${topic}":`,
    '',
    list,
    '',
    `Moral: ${moralBlend}`,
  ].join('\n');
}

function buildCompareResponse(first: ConceptCard, second: ConceptCard): string {
  return [
    `Comparison: ${first.title} vs ${second.title}`,
    '',
    `${first.title}: ${first.summary}`,
    `Moral: ${first.moral}`,
    '',
    `${second.title}: ${second.summary}`,
    `Moral: ${second.moral}`,
    '',
    `Practical synthesis: ${first.practice}`,
  ].join('\n');
}

export async function generateLocalAiReply(question: string): Promise<string> {
  const clean = question.trim();
  const lower = clean.toLowerCase();
  const responseMode = detectResponseMode(lower);

  if (!clean) {
    return 'Please type your question. I can explain concepts, summaries, morals, and verse ideas.';
  }

  if (greetings.some((greet) => lower === greet || lower.startsWith(`${greet} `))) {
    return 'Hello. Ask me about Gita, Bible, or Quran concepts and I will explain with summary and moral.';
  }

  if (/help|how to use|commands|what can you do/i.test(lower)) {
    return [
      'I can answer with local AI logic (offline mode).',
      '',
      'Try:',
      '- Explain karma yoga',
      '- Give moral from Gita 2:47',
      '- Summarize Bible James 1:5',
      '- Search verses about peace',
    ].join('\n');
  }

  const referenceMatch = findByReference(clean);
  if (referenceMatch) {
    return buildCardResponse(referenceMatch, responseMode);
  }

  if (/\b(compare|difference|vs)\b/i.test(lower)) {
    const concepts = findTopConcepts(clean, 2);
    if (concepts.length >= 2) {
      return buildCompareResponse(concepts[0], concepts[1]);
    }
  }

  const conceptMatch = findBestConcept(clean);
  if (conceptMatch) {
    return buildConceptResponse(conceptMatch, responseMode);
  }

  const searchHits = searchByTopic(clean);
  if (searchHits.length > 0) {
    return buildSearchResponse(searchHits, clean);
  }

  return [
    'I did not find a strong match yet, but here is a helpful guidance:',
    '',
    'Summary: Live with clarity, compassion, and disciplined action.',
    'Moral: Do your duty sincerely, stay humble, and keep faith during difficulty.',
    'Try asking with a topic or reference, like "Gita 2:47" or "peace and patience".',
  ].join('\n');
}
