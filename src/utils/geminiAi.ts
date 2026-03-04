interface GeminiOptions {
  ultraBrief?: boolean;
  contextMode?: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

function buildPrompt(
  question: string,
  opts: GeminiOptions = {}
): string {
  const { ultraBrief, contextMode, conversationHistory } = opts;
  const historyText =
    conversationHistory
      ?.map(
        (m) =>
          `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
      )
      .join('\n') ?? '';

  return `
You are ROKO, a concise spiritual assistant. You answer using scriptures (Bhagavad Gita, Bible, Quran) with short, clear explanations and a practical action step.
Context mode: ${contextMode ?? 'standard'}.
Tone: ${ultraBrief ? 'ultra-brief, bullet-sized answers' : 'concise, warm'}.

Conversation so far:
${historyText}

User question: ${question}

Reply with:
- A relevant verse (cite source)
- A one-sentence practical meaning
- One small actionable step
`.trim();
}

export async function generateGeminiReply(
  question: string,
  opts: GeminiOptions = {}
): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  if (!apiKey) {
    throw new Error('Gemini API key missing. Set VITE_GEMINI_API_KEY in .env');
  }

  const prompt = buildPrompt(question, opts);
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Gemini error ${res.status}: ${txt}`);
  }

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text =
    data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join(' ') ?? '';
  if (!text.trim()) throw new Error('Gemini returned an empty response.');
  return text.trim();
}
