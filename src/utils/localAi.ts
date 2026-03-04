import { supabase } from '../lib/supabase';
import { analyzeEmotion, isMotivationRequest, type EmotionTheme, type Sentiment } from './sentimentAnalysis';

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
export type AiContextMode =
  | 'standard'
  | 'historical'
  | 'philosophical'
  | 'simple_english'
  | 'for_10_year_old';

interface AiReplyOptions {
  ultraBrief?: boolean;
  contextMode?: AiContextMode;
  conversationHistory?: AiConversationTurn[];
}

export interface AiConversationTurn {
  role: 'user' | 'assistant';
  content: string;
}

type GuidedEmotion = Exclude<EmotionTheme, 'neutral'>;

interface EmotionGuidancePlan {
  label: string;
  motivation: string;
  action: string;
  references: string[];
  keywords: string[];
}

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
const emotionGuidancePlans: Record<GuidedEmotion, EmotionGuidancePlan> = {
  anxiety: {
    label: 'Anxiety / Stress',
    motivation: 'You do not need to solve everything at once.',
    action: 'Breathe slowly for one minute, then take one clear next step.',
    references: ['Philippians 4:6', 'Matthew 6:34', 'Proverbs 3:5', 'James 1:5'],
    keywords: ['anxiety', 'peace', 'trust', 'worry'],
  },
  sadness: {
    label: 'Sadness / Discouragement',
    motivation: 'This season can pass, and your effort still matters.',
    action: 'Choose one meaningful action today, even if it is small.',
    references: ['Galatians 6:9', 'Proverbs 3:5', 'Philippians 4:6', 'Matthew 6:34'],
    keywords: ['hope', 'faith', 'trust', 'perseverance'],
  },
  anger: {
    label: 'Anger / Frustration',
    motivation: 'Strength is shown by calm response, not by escalation.',
    action: 'Pause before replying and choose one gentle sentence.',
    references: ['Proverbs 15:1', 'Matthew 5:9', 'Ephesians 4:32', 'James 1:5'],
    keywords: ['anger', 'peace', 'gentle', 'conflict'],
  },
  loneliness: {
    label: 'Loneliness / Isolation',
    motivation: 'You are worthy of care, connection, and compassionate support.',
    action: 'Reach out to one trusted person today with a simple message.',
    references: ['John 13:34', '1 Corinthians 13:4', 'Ephesians 4:32', 'Galatians 6:9'],
    keywords: ['love', 'community', 'kindness', 'compassion'],
  },
  uncertainty: {
    label: 'Confusion / Uncertainty',
    motivation: 'Direction becomes clearer when you move one step at a time.',
    action: 'Ask for wisdom, then write down the next practical action.',
    references: ['James 1:5', 'Proverbs 3:5', 'Philippians 4:6', 'Matthew 6:34'],
    keywords: ['wisdom', 'guidance', 'trust', 'decision'],
  },
  joy: {
    label: 'Joy / Hope',
    motivation: 'Use this positive energy to strengthen your purpose and discipline.',
    action: 'Channel your momentum into one good action for someone else.',
    references: ['Galatians 6:9', 'John 13:34', '1 Corinthians 13:4', 'Ephesians 4:32'],
    keywords: ['good', 'love', 'hope', 'patience'],
  },
  gratitude: {
    label: 'Gratitude / Thankfulness',
    motivation: 'Gratitude is fuel for resilient, meaningful living.',
    action: 'Name three blessings and one way to serve others today.',
    references: ['Philippians 4:6', 'Ephesians 4:32', 'John 13:34', 'Galatians 6:9'],
    keywords: ['gratitude', 'kindness', 'peace', 'prayer'],
  },
};
const emotionTraditionReferences: Record<GuidedEmotion, Record<KnowledgeCard['tradition'], string[]>> = {
  anxiety: {
    Gita: ['Gita 2:47', 'Gita 6:26', 'Gita 2:70', 'Gita 18:66'],
    Bible: ['Philippians 4:6', 'Matthew 6:34', 'Proverbs 3:5', 'James 1:5'],
    Quran: ['Quran 13:28', 'Quran 2:153', 'Quran 94:5', 'Quran 2:286'],
  },
  sadness: {
    Gita: ['Gita 6:5', 'Gita 18:66', 'Gita 4:7', 'Gita 3:19'],
    Bible: ['Galatians 6:9', 'Proverbs 3:5', 'Philippians 4:6', 'Matthew 6:34'],
    Quran: ['Quran 94:5', 'Quran 2:286', 'Quran 2:153', 'Quran 13:28'],
  },
  anger: {
    Gita: ['Gita 17:15', 'Gita 6:26', 'Gita 12:13', 'Gita 2:70'],
    Bible: ['Proverbs 15:1', 'Matthew 5:9', 'Ephesians 4:32', 'James 1:5'],
    Quran: ['Quran 3:159', 'Quran 16:90', 'Quran 13:28', 'Quran 49:13'],
  },
  loneliness: {
    Gita: ['Gita 12:13', 'Gita 3:19', 'Gita 18:66', 'Gita 6:5'],
    Bible: ['John 13:34', '1 Corinthians 13:4', 'Ephesians 4:32', 'Galatians 6:9'],
    Quran: ['Quran 49:13', 'Quran 1:1', 'Quran 2:153', 'Quran 16:90'],
  },
  uncertainty: {
    Gita: ['Gita 2:47', 'Gita 6:5', 'Gita 4:7', 'Gita 18:66'],
    Bible: ['James 1:5', 'Proverbs 3:5', 'Philippians 4:6', 'Matthew 6:34'],
    Quran: ['Quran 2:153', 'Quran 3:159', 'Quran 2:286', 'Quran 13:28'],
  },
  joy: {
    Gita: ['Gita 2:50', 'Gita 3:19', 'Gita 12:13', 'Gita 17:15'],
    Bible: ['Galatians 6:9', 'John 13:34', '1 Corinthians 13:4', 'Ephesians 4:32'],
    Quran: ['Quran 1:1', 'Quran 16:90', 'Quran 103:1', 'Quran 49:13'],
  },
  gratitude: {
    Gita: ['Gita 12:13', 'Gita 3:19', 'Gita 2:50', 'Gita 18:66'],
    Bible: ['Philippians 4:6', 'Ephesians 4:32', 'John 13:34', 'Galatians 6:9'],
    Quran: ['Quran 1:1', 'Quran 16:90', 'Quran 49:13', 'Quran 103:1'],
  },
};
const historicalContextByTradition: Record<KnowledgeCard['tradition'], string> = {
  Gita:
    'The Gita is set in the Mahabharata war setting, where Arjuna faces a moral crisis about duty, justice, and action.',
  Bible:
    'Biblical passages were written across ancient Israel and early Christian communities, often during conflict, exile, and Roman-era pressure.',
  Quran:
    'Quranic revelation came in 7th-century Arabia, first in Mecca and later in Medina, addressing belief, ethics, law, and social justice.',
};
const philosophicalLensByTradition: Record<KnowledgeCard['tradition'], string> = {
  Gita:
    'It emphasizes dharma, disciplined action, and inner freedom from ego and attachment.',
  Bible:
    'It emphasizes covenant, love, grace, justice, and transformation of the heart.',
  Quran:
    'It emphasizes tawhid (oneness of God), moral accountability, mercy, and balanced living.',
};
const kidAnalogyByTradition: Record<KnowledgeCard['tradition'], string> = {
  Gita:
    'It is like doing your role in a team match with focus, even when you feel nervous.',
  Bible:
    'It is like choosing kindness and honesty with friends, even when it is hard.',
  Quran:
    'It is like following fair rules that protect everyone, not just yourself.',
};
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

const bibleBooks = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
  'Joshua', 'Judges', 'Ruth',
  '1 Samuel', '2 Samuel', '1 Kings', '2 Kings',
  '1 Chronicles', '2 Chronicles',
  'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
  'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah', 'Lamentations',
  'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah',
  'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
  'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans',
  '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians',
  '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon',
  'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation',
] as const;

const bibleBookAliases: Record<string, string> = {
  psalm: 'Psalms',
  psalms: 'Psalms',
  songofsolomon: 'Song of Solomon',
  songofsongs: 'Song of Solomon',
  canticles: 'Song of Solomon',
};

const escapedBibleBooks = [...bibleBooks]
  .sort((a, b) => b.length - a.length)
  .map((book) => book.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+'));

const bibleCompactRegex = new RegExp(
  `(?:bible\\s+)?(${escapedBibleBooks.join('|')})\\s+(\\d+)\\s*[:.]\\s*(\\d+)`,
  'i'
);

const bibleChapterVerseRegex = new RegExp(
  `(?:bible\\s+)?(${escapedBibleBooks.join('|')})\\s+chapter\\s*(\\d+)\\D+verse\\s*(\\d+)`,
  'i'
);

function cleanWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function truncateForReply(text: string, maxChars = 210): string {
  const normalized = cleanWhitespace(text);
  if (normalized.length <= maxChars) {
    return normalized;
  }

  const sliced = normalized.slice(0, maxChars);
  const breakAt = sliced.lastIndexOf(' ');
  return `${sliced.slice(0, breakAt > 60 ? breakAt : maxChars).trim()}...`;
}

function makeUltraBriefReply(text: string): string {
  const lines = text
    .split('\n')
    .map((line) => cleanWhitespace(line))
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return '';
  }

  const isEmotionSupportReply = lines.some((line) => /^Feeling detected:/i.test(line));
  if (isEmotionSupportReply) {
    const feelingLine = lines.find((line) => /^Feeling detected:/i.test(line));
    const firstVerseLine =
      lines.find((line) => /^\d+\.\s+(Bible|Gita|Quran)\b/i.test(line)) ??
      lines.find((line) => /^(Bible|Gita|Quran)\b/i.test(line));
    const motivationLine = lines.find((line) => /^Motivation:/i.test(line));
    const reflectionLine = lines.find((line) => /^Reflection:/i.test(line));
    const distilled = [feelingLine, firstVerseLine, motivationLine, reflectionLine].filter(
      (line): line is string => Boolean(line)
    );

    if (distilled.length > 0) {
      return distilled
        .slice(0, 4)
        .map((line, index) => truncateForReply(line, index === 0 ? 100 : 170))
        .join('\n');
    }
  }

  const compactLines = lines.filter((line) => !/^try:$/i.test(line) && !line.startsWith('- '));
  const first = truncateForReply(compactLines[0] ?? lines[0], 85);
  const secondSource = compactLines[1] ?? compactLines[0] ?? lines[0];
  const second = truncateForReply(secondSource, 125);

  if (first === second) {
    return first;
  }

  return `${first}\n${second}`;
}

function simplifyEnglish(text: string): string {
  const replacements: Array<[RegExp, string]> = [
    [/\bdharma\b/gi, 'right duty'],
    [/\bego\b/gi, 'self-centered thinking'],
    [/\bdetachment\b/gi, 'staying calm about results'],
    [/\bcovenant\b/gi, 'promise with God'],
    [/\bgrace\b/gi, 'kind help you do not earn'],
    [/\btawhid\b/gi, 'belief in one God'],
    [/\baccountability\b/gi, 'being responsible for your choices'],
    [/\bmetaphysical\b/gi, 'about deeper reality'],
  ];

  let simplified = cleanWhitespace(text);
  for (const [pattern, replacement] of replacements) {
    simplified = simplified.replace(pattern, replacement);
  }
  return truncateForReply(simplified, 230);
}

function detectTraditionFromText(text: string): KnowledgeCard['tradition'] | null {
  const lower = text.toLowerCase();
  if (lower.includes('gita') || lower.includes('bhagavad gita')) return 'Gita';
  if (lower.includes('bible')) return 'Bible';
  if (lower.includes('quran')) return 'Quran';
  return null;
}

function detectContextModeFromQuestion(lowerQuestion: string): AiContextMode | null {
  if (/\b(historical context|history|historical background|time period)\b/i.test(lowerQuestion)) {
    return 'historical';
  }

  if (/\b(philosophical meaning|philosophy|deeper meaning)\b/i.test(lowerQuestion)) {
    return 'philosophical';
  }

  if (/\b(simple english|easy english|plain english|in simple words)\b/i.test(lowerQuestion)) {
    return 'simple_english';
  }

  if (/\b(10[- ]year[- ]old|for kids|for a kid|for children|kid friendly)\b/i.test(lowerQuestion)) {
    return 'for_10_year_old';
  }

  return null;
}

function parseReplyParts(text: string): { heading: string; body: string; moral: string } {
  const lines = text
    .split('\n')
    .map((line) => cleanWhitespace(line))
    .filter((line) => line.length > 0);

  const heading = lines[0] ?? '';
  const moralLine = lines.find((line) => /^moral:\s*/i.test(line)) ?? '';
  const bodyLines = lines.slice(1).filter((line) => !/^moral:\s*/i.test(line));
  const body = bodyLines.join(' ');
  const moral = moralLine.replace(/^moral:\s*/i, '').trim();

  return {
    heading,
    body: body || heading,
    moral: moral || 'Apply this teaching through one clear action today.',
  };
}

function applyContextMode(text: string, contextMode: AiContextMode, question: string): string {
  if (contextMode === 'standard') {
    return text;
  }

  if (/^Cross-Scripture comparison:/i.test(text)) {
    return text;
  }

  const { heading, body, moral } = parseReplyParts(text);
  const tradition = detectTraditionFromText(`${heading}\n${question}`) ?? 'Gita';

  if (contextMode === 'historical') {
    return [
      heading || 'Context',
      `Historical context: ${historicalContextByTradition[tradition]}`,
      `Meaning in that setting: ${truncateForReply(body, 180)}`,
      `Why it still matters: ${truncateForReply(moral, 160)}`,
    ].join('\n');
  }

  if (contextMode === 'philosophical') {
    return [
      heading || 'Meaning',
      `Philosophical meaning: ${truncateForReply(body, 190)}`,
      `Deeper lens: ${philosophicalLensByTradition[tradition]}`,
      `Life direction: ${truncateForReply(moral, 160)}`,
    ].join('\n');
  }

  if (contextMode === 'simple_english') {
    return [
      heading || 'Simple Explanation',
      `Simple English: ${simplifyEnglish(body)}`,
      `Takeaway: ${simplifyEnglish(moral)}`,
    ].join('\n');
  }

  return [
    heading || 'Kid-Friendly Explanation',
    `For a 10-year-old: ${simplifyEnglish(body)}`,
    `Example: ${kidAnalogyByTradition[tradition]}`,
    `What to do today: ${simplifyEnglish(moral)}`,
  ].join('\n');
}

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

  const reverseContext = input.match(/chapter\s*(\d+)\D+verse\s*(\d+).*(?:gita|bhagavad\s*gita)/i);
  if (reverseContext) return `${Number(reverseContext[1])}:${Number(reverseContext[2])}`;

  const compact = input.match(/\b(\d+)\s*[:.]\s*(\d+)\b.*(?:gita|bhagavad\s*gita)/i);
  if (compact) return `${Number(compact[1])}:${Number(compact[2])}`;

  return null;
}

function parseQuranReference(input: string): string | null {
  const compact = input.match(/(?:quran|surah)\s*(\d+)\s*[:.]\s*(\d+)/i);
  if (compact) return `${Number(compact[1])}:${Number(compact[2])}`;

  const long = input.match(/(?:quran|surah)\s*(\d+)\D+(?:ayah|verse)\s*(\d+)/i);
  if (long) return `${Number(long[1])}:${Number(long[2])}`;

  const reverse = input.match(/(?:ayah|verse)\s*(\d+)\D+(?:quran|surah)\s*(\d+)/i);
  if (reverse) return `${Number(reverse[2])}:${Number(reverse[1])}`;

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

function canonicalizeBibleBook(book: string): string {
  const cleaned = normalizeBookName(book);
  const alias = bibleBookAliases[cleaned.toLowerCase().replace(/\s+/g, '')];
  if (alias) {
    return alias;
  }

  const exact = bibleBooks.find((known) => known.toLowerCase() === cleaned.toLowerCase());
  return exact ?? cleaned;
}

function parseBibleReference(input: string): string | null {
  const compact = input.match(bibleCompactRegex);
  if (compact) {
    const book = canonicalizeBibleBook(compact[1]);
    const chapter = Number(compact[2]);
    const verse = Number(compact[3]);
    return `${book} ${chapter}:${verse}`;
  }

  const chapterVerse = input.match(bibleChapterVerseRegex);
  if (chapterVerse) {
    const book = canonicalizeBibleBook(chapterVerse[1]);
    const chapter = Number(chapterVerse[2]);
    const verse = Number(chapterVerse[3]);
    return `${book} ${chapter}:${verse}`;
  }

  return null;
}

async function fetchExactReferenceReply(question: string, mode: ResponseMode): Promise<string | null> {
  const gitaRef = parseGitaReference(question);
  if (gitaRef) {
    const [chapterStr, verseStr] = gitaRef.split(':');
    const chapter = Number(chapterStr);
    const verse = Number(verseStr);

    const { data, error } = await supabase
      .from('gita_verses')
      .select('chapter,verse,translation_en,transliteration,sanskrit')
      .eq('chapter', chapter)
      .eq('verse', verse)
      .maybeSingle();

    if (!error && data) {
      const coreText = data.translation_en || data.transliteration || data.sanskrit || '';
      const summary = truncateForReply(coreText);
      if (mode === 'moral') {
        const localMatch = knowledgeBase.find(
          (card) => card.tradition === 'Gita' && card.reference === `${chapter}:${verse}`
        );
        const moral = localMatch?.moral || 'Apply this verse in one concrete action today.';
        return `Gita ${chapter}:${verse}\n${summary}\nMoral: ${moral}`;
      }

      return `Gita ${chapter}:${verse}\n${summary}`;
    }
  }

  const bibleRef = parseBibleReference(question);
  if (bibleRef) {
    const parsed = bibleRef.match(/^(.+)\s+(\d+):(\d+)$/);
    if (parsed) {
      const book = canonicalizeBibleBook(parsed[1]);
      const chapter = Number(parsed[2]);
      const verse = Number(parsed[3]);

      const { data, error } = await supabase
        .from('bible_verses')
        .select('book,chapter,verse,text')
        .eq('book', book)
        .eq('chapter', chapter)
        .eq('verse', verse)
        .maybeSingle();

      if (!error && data) {
        const summary = truncateForReply(data.text || '');
        if (mode === 'moral') {
          const localMatch = knowledgeBase.find(
            (card) =>
              card.tradition === 'Bible' &&
              card.reference.toLowerCase() === `${data.book} ${chapter}:${verse}`.toLowerCase()
          );
          const moral = localMatch?.moral || 'Apply this verse through one kind action today.';
          return `Bible ${data.book} ${chapter}:${verse}\n${summary}\nMoral: ${moral}`;
        }

        return `Bible ${data.book} ${chapter}:${verse}\n${summary}`;
      }
    }
  }

  const quranRef = parseQuranReference(question);
  if (quranRef) {
    const [surahStr, ayahStr] = quranRef.split(':');
    const surah = Number(surahStr);
    const ayah = Number(ayahStr);

    const { data, error } = await supabase
      .from('quran_ayahs')
      .select('surah_no,ayah_no_surah,surah_name_roman,surah_name_en,ayah_en')
      .eq('surah_no', String(surah))
      .eq('ayah_no_surah', String(ayah))
      .maybeSingle();

    if (!error && data) {
      const surahName = cleanWhitespace(data.surah_name_roman || data.surah_name_en || '').trim();
      const heading = surahName.length > 0 ? `Quran ${surah}:${ayah} (${surahName})` : `Quran ${surah}:${ayah}`;
      const summary = truncateForReply(data.ayah_en || '');
      if (mode === 'moral') {
        const localMatch = knowledgeBase.find(
          (card) => card.tradition === 'Quran' && card.reference === `${surah}:${ayah}`
        );
        const moral = localMatch?.moral || 'Let this verse guide your next decision with sincerity.';
        return `${heading}\n${summary}\nMoral: ${moral}`;
      }

      return `${heading}\n${summary}`;
    }
  }

  return null;
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

function detectRequestedTradition(text: string): KnowledgeCard['tradition'] | null {
  const lower = text.toLowerCase();

  if (/\b(gita|bhagavad|bhagwat|krishna|sloka|shloka)\b/i.test(lower) || parseGitaReference(text)) {
    return 'Gita';
  }

  if (/\b(quran|qur'an|surah|ayah|allah|islamic)\b/i.test(lower) || parseQuranReference(text)) {
    return 'Quran';
  }

  if (/\b(bible|jesus|christ|christian|gospel|old testament|new testament)\b/i.test(lower) || parseBibleReference(text)) {
    return 'Bible';
  }

  return null;
}

function chooseGuidedEmotion(emotion: EmotionTheme, sentiment: Sentiment): GuidedEmotion {
  if (emotion !== 'neutral') {
    return emotion;
  }

  if (sentiment === 'negative') {
    return 'sadness';
  }

  if (sentiment === 'positive') {
    return 'joy';
  }

  return 'uncertainty';
}

function isEmotionFollowUpRequest(lowerQuestion: string): boolean {
  if (!/\b(more|another|next|again)\b/i.test(lowerQuestion)) {
    return false;
  }

  return /\b(verse|verses|motivate|motivation|encourage|encouragement|support|comfort|hope)\b/i.test(
    lowerQuestion
  );
}

function findLatestEmotionUserPrompt(history?: AiConversationTurn[]): string | null {
  if (!history || history.length === 0) {
    return null;
  }

  for (let i = history.length - 1; i >= 0; i -= 1) {
    const turn = history[i];
    if (turn.role !== 'user') {
      continue;
    }

    const text = cleanWhitespace(turn.content);
    if (!text) {
      continue;
    }

    const emotionalSignal = analyzeEmotion(text);
    const hasFeelingPhrase = /\b(i feel|i am|i'm|feeling|emotion|mood)\b/i.test(text);
    if (
      isMotivationRequest(text) ||
      emotionalSignal.primaryEmotion !== 'neutral' ||
      emotionalSignal.sentiment !== 'neutral' ||
      hasFeelingPhrase
    ) {
      return text;
    }
  }

  return null;
}

function findLatestRequestedTradition(history?: AiConversationTurn[]): KnowledgeCard['tradition'] | null {
  if (!history || history.length === 0) {
    return null;
  }

  for (let i = history.length - 1; i >= 0; i -= 1) {
    const turn = history[i];
    if (turn.role !== 'user') {
      continue;
    }

    const tradition = detectRequestedTradition(turn.content);
    if (tradition) {
      return tradition;
    }
  }

  return null;
}

function resolveQuestionWithHistory(question: string, history?: AiConversationTurn[]): string {
  const clean = cleanWhitespace(question);
  if (!clean) {
    return question;
  }

  if (!isEmotionFollowUpRequest(clean.toLowerCase())) {
    return question;
  }

  const anchorPrompt = findLatestEmotionUserPrompt(history);
  if (!anchorPrompt) {
    return question;
  }

  return `${anchorPrompt}. ${clean}`;
}

function getEmotionReflectionPrompt(emotion: GuidedEmotion): string {
  if (emotion === 'anxiety') {
    return 'What is one thing in your control today, and one thing you can release?';
  }

  if (emotion === 'sadness') {
    return 'Which small action today would show faith instead of discouragement?';
  }

  if (emotion === 'anger') {
    return 'What response would bring peace instead of escalation?';
  }

  if (emotion === 'loneliness') {
    return 'Who can you reach out to with honesty and kindness right now?';
  }

  if (emotion === 'uncertainty') {
    return 'What next step is clear even if the full path is not?';
  }

  if (emotion === 'gratitude') {
    return 'How can you turn gratitude into one act of service today?';
  }

  return 'How can you use this strength to uplift someone else today?';
}

function orderReferencesForQuestion(references: string[], question: string): string[] {
  if (references.length <= 1) {
    return references;
  }

  const hash = question
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const offset = Math.abs(hash) % references.length;

  return [...references.slice(offset), ...references.slice(0, offset)];
}

function flattenVerseReply(reply: string): string {
  const lines = reply
    .split('\n')
    .map((line) => cleanWhitespace(line))
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return '';
  }

  if (lines.length === 1) {
    return lines[0];
  }

  return `${lines[0]}: ${lines.slice(1).join(' ')}`;
}

async function buildEmotionSupportReply(
  question: string,
  lowerQuestion: string,
  mode: ResponseMode,
  history?: AiConversationTurn[]
): Promise<string | null> {
  const emotionProfile = analyzeEmotion(question);
  const hasFeelingPhrase = /\b(i am|i'm|i feel|feeling|my mood|emotionally)\b/i.test(lowerQuestion);
  const hasEmotionalSignal =
    emotionProfile.primaryEmotion !== 'neutral' || emotionProfile.sentiment !== 'neutral';
  const explicitSupportRequest = isMotivationRequest(question);

  if (!explicitSupportRequest && !(hasFeelingPhrase && hasEmotionalSignal)) {
    return null;
  }

  const guidedEmotion = chooseGuidedEmotion(emotionProfile.primaryEmotion, emotionProfile.sentiment);
  const plan = emotionGuidancePlans[guidedEmotion];
  const requestedTradition =
    detectRequestedTradition(question) ??
    findLatestRequestedTradition(history) ??
    'Bible';
  const followUpEmotionRequest = isEmotionFollowUpRequest(lowerQuestion);
  const verseLimit = mode === 'summary' ? 1 : followUpEmotionRequest ? 3 : 2;
  const traditionReferences = emotionTraditionReferences[guidedEmotion][requestedTradition] ?? plan.references;
  const orderedReferences = orderReferencesForQuestion(traditionReferences, question);

  const verseCandidates = await Promise.all(
    orderedReferences.map((reference) => fetchExactReferenceReply(reference, 'summary'))
  );

  const verseLines = verseCandidates
    .filter((candidate): candidate is string => Boolean(candidate))
    .map((candidate) => flattenVerseReply(candidate))
    .filter((line) => line.length > 0)
    .slice(0, verseLimit);

  if (verseLines.length === 0) {
    const fallbackCards = knowledgeBase
      .filter((card) => card.tradition === requestedTradition)
      .filter((card) => plan.keywords.some((keyword) => card.keywords.includes(keyword)))
      .slice(0, verseLimit);

    verseLines.push(
      ...fallbackCards.map((card) => `${card.tradition} ${card.reference}: ${truncateForReply(card.summary, 130)}`)
    );
  }

  if (verseLines.length === 0) {
    return null;
  }

  const versesSection = verseLines.map((line, index) => `${index + 1}. ${line}`).join('\n');
  const motivation =
    mode === 'summary'
      ? plan.motivation
      : `${plan.motivation} ${plan.action}`;
  const reflection = getEmotionReflectionPrompt(guidedEmotion);

  const responseLines = [
    `Feeling detected: ${plan.label}`,
    `${requestedTradition} verses for this feeling:`,
    versesSection,
    `Motivation: ${truncateForReply(motivation, 200)}`,
  ];

  if (mode !== 'summary') {
    responseLines.push(`Reflection: ${truncateForReply(reflection, 170)}`);
  }

  return responseLines.join('\n');
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
    return (
      knowledgeBase.find(
        (card) => card.tradition === 'Bible' && card.reference.toLowerCase() === bibleRef.toLowerCase()
      ) ?? null
    );
  }

  return null;
}

function buildCardResponse(card: KnowledgeCard, mode: ResponseMode): string {
  if (mode === 'summary') {
    return `${card.tradition} ${card.reference}\n${truncateForReply(card.summary)}`;
  }

  if (mode === 'moral') {
    return `${card.tradition} ${card.reference}\nMoral: ${truncateForReply(card.moral)}`;
  }

  if (mode === 'practice') {
    return `${card.tradition} ${card.reference}\nPractical: Reflect for 2 minutes, then take one action aligned with this teaching.`;
  }

  return `${card.tradition} ${card.reference}\n${truncateForReply(card.summary)}\nMoral: ${truncateForReply(card.moral)}`;
}

function buildConceptResponse(concept: ConceptCard, mode: ResponseMode): string {
  if (mode === 'summary') {
    return `${concept.title}\n${truncateForReply(concept.summary)}\nRef: ${concept.relatedReference}`;
  }

  if (mode === 'moral') {
    return `${concept.title}\nMoral: ${truncateForReply(concept.moral)}\nRef: ${concept.relatedReference}`;
  }

  if (mode === 'practice') {
    return `${concept.title}\nPractical: ${truncateForReply(concept.practice)}\nRef: ${concept.relatedReference}`;
  }

  return `${concept.title}\n${truncateForReply(concept.summary)}\nPractical: ${truncateForReply(concept.practice)}\nRef: ${concept.relatedReference}`;
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
  const topMatches = matches.slice(0, 2);
  const list = topMatches
    .map((card, index) => `${index + 1}. ${card.tradition} ${card.reference}: ${truncateForReply(card.summary, 100)}`)
    .join('\n');
  const moralBlend = topMatches[0]?.moral ?? 'Choose patience, clarity, and compassion in action.';

  return [
    `Top matches for "${truncateForReply(topic, 40)}":`,
    list,
    `Moral: ${truncateForReply(moralBlend)}`,
  ].join('\n');
}

function detectCrossScriptureIntent(lowerQuestion: string): boolean {
  const hasCompareWord = /\b(compare|comparison|difference|similarity|parallel)\b/i.test(lowerQuestion);
  const explicitCross = /\b(cross|across)\b.*\b(scripture|tradition|religion)\b/i.test(lowerQuestion);
  const explicitAll = /\b(all three|three scriptures|all scriptures)\b/i.test(lowerQuestion);
  const mentions = ['gita', 'bible', 'quran'].filter((item) => lowerQuestion.includes(item)).length;

  return explicitCross || explicitAll || (hasCompareWord && mentions >= 2);
}

function extractComparisonTopic(question: string): string {
  const explicitTopic = question.match(
    /\b(?:compare|comparison|cross[- ]scripture|across scriptures|across traditions)\b(?:\s+on|\s+about|\s+for)?\s+(.+)/i
  );

  if (explicitTopic?.[1]) {
    return truncateForReply(cleanWhitespace(explicitTopic[1]), 60);
  }

  const filteredTokens = tokenize(question).filter(
    (token) =>
      ![
        'compare',
        'comparison',
        'difference',
        'similarity',
        'scripture',
        'scriptures',
        'tradition',
        'traditions',
        'religion',
        'religions',
        'gita',
        'bible',
        'quran',
        'across',
        'cross',
      ].includes(token)
  );

  if (filteredTokens.length === 0) {
    return 'shared spiritual guidance';
  }

  return filteredTokens.slice(0, 5).join(' ');
}

function scoreTraditionCard(card: KnowledgeCard, topicTokens: string[]): number {
  const corpus = `${card.idea} ${card.summary} ${card.moral} ${card.keywords.join(' ')}`.toLowerCase();
  return topicTokens.reduce((acc, token) => {
    let score = 0;
    if (card.keywords.some((keyword) => keyword === token)) score += 7;
    if (card.keywords.some((keyword) => keyword.includes(token) || token.includes(keyword))) score += 4;
    if (corpus.includes(token)) score += 2;
    return acc + score;
  }, 0);
}

function pickTraditionCard(tradition: KnowledgeCard['tradition'], topicTokens: string[]): KnowledgeCard | null {
  const candidates = knowledgeBase.filter((card) => card.tradition === tradition);
  const ranked = candidates
    .map((card) => ({ card, score: scoreTraditionCard(card, topicTokens) }))
    .sort((a, b) => b.score - a.score);

  if (ranked[0]?.score && ranked[0].score > 0) {
    return ranked[0].card;
  }

  const fallback: Record<KnowledgeCard['tradition'], string> = {
    Gita: '2:47',
    Bible: 'John 13:34',
    Quran: '2:153',
  };

  return (
    candidates.find((candidate) => candidate.reference.toLowerCase() === fallback[tradition].toLowerCase()) ??
    candidates[0] ??
    null
  );
}

function formatComparisonCard(card: KnowledgeCard, mode: ResponseMode): string {
  if (mode === 'summary') {
    return truncateForReply(card.summary, 120);
  }

  if (mode === 'moral') {
    return `Moral: ${truncateForReply(card.moral, 120)}`;
  }

  if (mode === 'practice') {
    return `Practice: ${truncateForReply(`Reflect and apply: ${card.moral}`, 130)}`;
  }

  return `${truncateForReply(card.summary, 110)} Moral: ${truncateForReply(card.moral, 105)}`;
}

function buildCrossScriptureComparison(question: string, mode: ResponseMode): string | null {
  const topic = extractComparisonTopic(question);
  const topicTokens = tokenize(topic);

  const gitaCard = pickTraditionCard('Gita', topicTokens);
  const bibleCard = pickTraditionCard('Bible', topicTokens);
  const quranCard = pickTraditionCard('Quran', topicTokens);

  if (!gitaCard || !bibleCard || !quranCard) {
    return null;
  }

  const sharedDirection = truncateForReply(
    `${gitaCard.moral} ${bibleCard.moral} ${quranCard.moral}`,
    170
  );

  const practicalStep = truncateForReply(
    `Pick one action today that reflects ${topic}: stay mindful, speak with kindness, and act with discipline.`,
    150
  );

  return [
    `Cross-Scripture comparison: ${topic}`,
    `Gita ${gitaCard.reference}: ${formatComparisonCard(gitaCard, mode)}`,
    `Bible ${bibleCard.reference}: ${formatComparisonCard(bibleCard, mode)}`,
    `Quran ${quranCard.reference}: ${formatComparisonCard(quranCard, mode)}`,
    `Shared direction: ${sharedDirection}`,
    `Today: ${practicalStep}`,
  ].join('\n');
}

function buildCompareResponse(first: ConceptCard, second: ConceptCard): string {
  return [
    `${first.title} vs ${second.title}`,
    `${first.title}: ${truncateForReply(first.summary, 100)}`,
    `${second.title}: ${truncateForReply(second.summary, 100)}`,
    `Practical: ${truncateForReply(first.practice, 120)}`,
  ].join('\n');
}

export async function generateLocalAiReply(
  question: string,
  options?: AiReplyOptions
): Promise<string> {
  const clean = resolveQuestionWithHistory(question.trim(), options?.conversationHistory).trim();
  const lower = clean.toLowerCase();
  const responseMode = detectResponseMode(lower);
  const contextMode =
    options?.contextMode && options.contextMode !== 'standard'
      ? options.contextMode
      : detectContextModeFromQuestion(lower) ?? 'standard';
  const respond = (text: string, bypassContext = false) => {
    const contextual = bypassContext ? text : applyContextMode(text, contextMode, clean);
    return options?.ultraBrief ? makeUltraBriefReply(contextual) : contextual;
  };

  if (!clean) {
    return respond('Type a question or verse reference, for example: "John 3:16" or "Gita 2:47".');
  }

  if (greetings.some((greet) => lower === greet || lower.startsWith(`${greet} `))) {
    return respond('Hello. Ask for a verse or concept from Gita, Bible, or Quran.');
  }

  if (/help|how to use|commands|what can you do/i.test(lower)) {
    return respond([
      'I give concise, reference-based answers.',
      'Context modes: historical, philosophical, simple English, and for a 10-year-old.',
      'I can compare a topic across Gita, Bible, and Quran.',
      'Try:',
      '- John 3:16',
      '- Gita 2:47 moral',
      '- Quran 2:153 summary',
      '- Compare patience across Gita, Bible, and Quran',
      '- Search verses about peace',
      '- I feel anxious. Give Bible verses and motivate me',
    ].join('\n'));
  }

  const exactReferenceReply = await fetchExactReferenceReply(clean, responseMode);
  if (exactReferenceReply) {
    return respond(exactReferenceReply);
  }

  const referenceMatch = findByReference(clean);
  if (referenceMatch) {
    return respond(buildCardResponse(referenceMatch, responseMode));
  }

  const emotionSupportReply = await buildEmotionSupportReply(clean, lower, responseMode, options?.conversationHistory);
  if (emotionSupportReply) {
    return respond(emotionSupportReply, true);
  }

  if (detectCrossScriptureIntent(lower)) {
    const comparison = buildCrossScriptureComparison(clean, responseMode);
    if (comparison) {
      return respond(comparison);
    }
  }

  if (/\b(compare|difference|vs)\b/i.test(lower)) {
    const concepts = findTopConcepts(clean, 2);
    if (concepts.length >= 2) {
      return respond(buildCompareResponse(concepts[0], concepts[1]));
    }
  }

  const conceptMatch = findBestConcept(clean);
  if (conceptMatch) {
    return respond(buildConceptResponse(conceptMatch, responseMode));
  }

  const searchHits = searchByTopic(clean);
  if (searchHits.length > 0) {
    return respond(buildSearchResponse(searchHits, clean));
  }

  return respond('I could not match that precisely. Try a clearer reference like "Proverbs 3:5" or a topic like "forgiveness".');
}
