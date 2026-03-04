export type Sentiment = 'positive' | 'negative' | 'neutral';
export type EmotionTheme =
  | 'anxiety'
  | 'sadness'
  | 'anger'
  | 'loneliness'
  | 'uncertainty'
  | 'joy'
  | 'gratitude'
  | 'neutral';

interface SentimentScore {
  sentiment: Sentiment;
  score: number;
  confidence: number;
}

export interface EmotionProfile {
  sentiment: Sentiment;
  primaryEmotion: EmotionTheme;
  confidence: number;
}

const positiveWords = [
  'happy', 'glad', 'great', 'awesome', 'wonderful', 'excellent', 'love', 'amazing',
  'brilliant', 'fantastic', 'good', 'nice', 'perfect', 'beautiful', 'lovely',
  'enjoyed', 'thanks', 'thank', 'please', 'grateful', 'appreciative', 'blessed'
];

const negativeWords = [
  'sad', 'angry', 'upset', 'frustrated', 'hate', 'terrible', 'awful', 'horrible',
  'bad', 'worse', 'worst', 'disappointing', 'disappointed', 'anxious',
  'worried', 'stressed', 'tired', 'sick', 'ill', 'struggling', 'difficult', 'hard',
  'pain', 'hurt', 'suffering', 'lonely', 'alone', 'depressed'
];

const intensifiers = ['really', 'very', 'so', 'extremely', 'absolutely', 'totally', 'completely'];
const negators = ['not', 'no', 'never', "don't", "didn't", "won't", "can't"];
const emotionKeywords: Record<Exclude<EmotionTheme, 'neutral'>, string[]> = {
  anxiety: [
    'anxious', 'anxiety', 'worried', 'worry', 'stress', 'stressed', 'panic', 'overwhelmed', 'nervous',
  ],
  sadness: [
    'sad', 'down', 'depressed', 'hopeless', 'heartbroken', 'grief', 'crying', 'tired of life',
  ],
  anger: [
    'angry', 'mad', 'furious', 'irritated', 'frustrated', 'rage', 'annoyed',
  ],
  loneliness: [
    'lonely', 'alone', 'isolated', 'left out', 'abandoned', 'nobody understands',
  ],
  uncertainty: [
    'confused', 'uncertain', 'lost', 'doubt', 'fear', 'afraid', 'scared', 'stuck', 'unsure',
  ],
  joy: [
    'happy', 'joy', 'excited', 'peaceful', 'calm', 'hopeful', 'motivated', 'energetic',
  ],
  gratitude: [
    'grateful', 'thankful', 'blessed', 'appreciate', 'thank you',
  ],
};
const motivationIntentPatterns = [
  /\b(i feel|i am feeling|i'm feeling|my mood|emotion)\b/i,
  /\b(motivate|motivation|encourage|encouragement|uplift|inspire|comfort|cheer me up)\b/i,
  /\b(help me feel better|i need support|i need hope)\b/i,
];

export function analyzeSentiment(text: string): SentimentScore {
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/);

  let positiveCount = 0;
  let negativeCount = 0;
  let intensifierBoost = 1;
  let negatorActive = false;

  for (let i = 0; i < words.length; i++) {
    const word = words[i].replace(/[.,!?;:]/g, '');

    if (negators.includes(word)) {
      negatorActive = true;
      continue;
    }

    if (intensifiers.includes(word)) {
      intensifierBoost = 1.5;
      continue;
    }

    if (positiveWords.includes(word)) {
      positiveCount += negatorActive ? -1 : intensifierBoost;
      negatorActive = false;
      intensifierBoost = 1;
    } else if (negativeWords.includes(word)) {
      negativeCount += negatorActive ? -1 : intensifierBoost;
      negatorActive = false;
      intensifierBoost = 1;
    }
  }

  const total = Math.abs(positiveCount) + Math.abs(negativeCount);
  const score = total > 0 ? positiveCount / total : 0;
  let sentiment: Sentiment = 'neutral';

  if (score > 0.2) {
    sentiment = 'positive';
  } else if (score < -0.2) {
    sentiment = 'negative';
  }

  const confidence = Math.min(Math.abs(score), 1);

  return {
    sentiment,
    score: parseFloat(score.toFixed(2)),
    confidence: parseFloat(confidence.toFixed(2))
  };
}

export function getEmpatheticResponse(sentiment: Sentiment): string {
  if (sentiment === 'negative') {
    const responses = [
      "I hear you're going through something difficult. I'm here to help.",
      "That sounds challenging. Let me assist you with what you need.",
      "I understand you're feeling down. How can I make things better?",
      "It sounds like you're struggling. I'm here for you."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  } else if (sentiment === 'positive') {
    const responses = [
      "That's wonderful! I'm glad to help you with that.",
      "I love your energy! Let's get that done for you.",
      "Fantastic! I'm excited to assist you.",
      "That's great! Let's make it happen."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  return "How can I assist you?";
}

function countKeywordHits(lowerText: string, keywords: string[]): number {
  return keywords.reduce((count, keyword) => {
    if (!lowerText.includes(keyword)) {
      return count;
    }

    return count + (keyword.includes(' ') ? 2 : 1);
  }, 0);
}

export function detectEmotionTheme(text: string): EmotionTheme {
  const lowerText = text.toLowerCase();
  const ranked = (Object.entries(emotionKeywords) as Array<[Exclude<EmotionTheme, 'neutral'>, string[]]>)
    .map(([emotion, keywords]) => ({
      emotion,
      score: countKeywordHits(lowerText, keywords),
    }))
    .sort((a, b) => b.score - a.score);

  if (!ranked[0] || ranked[0].score <= 0) {
    return 'neutral';
  }

  return ranked[0].emotion;
}

export function isMotivationRequest(text: string): boolean {
  return motivationIntentPatterns.some((pattern) => pattern.test(text));
}

export function analyzeEmotion(text: string): EmotionProfile {
  const sentimentResult = analyzeSentiment(text);
  const primaryEmotion = detectEmotionTheme(text);
  const confidence =
    primaryEmotion === 'neutral'
      ? sentimentResult.confidence
      : Math.max(0.45, sentimentResult.confidence);

  return {
    sentiment: sentimentResult.sentiment,
    primaryEmotion,
    confidence: parseFloat(confidence.toFixed(2)),
  };
}
