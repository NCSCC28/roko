export type Sentiment = 'positive' | 'negative' | 'neutral';

interface SentimentScore {
  sentiment: Sentiment;
  score: number;
  confidence: number;
}

const positiveWords = [
  'happy', 'glad', 'great', 'awesome', 'wonderful', 'excellent', 'love', 'amazing',
  'brilliant', 'fantastic', 'good', 'nice', 'perfect', 'beautiful', 'lovely',
  'enjoyed', 'thanks', 'thank', 'please', 'grateful', 'appreciative', 'blessed'
];

const negativeWords = [
  'sad', 'angry', 'upset', 'frustrated', 'hate', 'terrible', 'awful', 'horrible',
  'bad', 'worse', 'worst', 'disappointing', 'disappointed', 'disappointed', 'anxious',
  'worried', 'stressed', 'tired', 'sick', 'ill', 'struggling', 'difficult', 'hard',
  'pain', 'hurt', 'suffering', 'lonely', 'alone', 'depressed'
];

const intensifiers = ['really', 'very', 'so', 'extremely', 'absolutely', 'totally', 'completely'];
const negators = ['not', 'no', 'never', "don't", "didn't", "won't", "can't"];

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
