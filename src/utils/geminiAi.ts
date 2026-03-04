import { supabase } from '../lib/supabase';

interface GeminiOptions {
  ultraBrief?: boolean;
  contextMode?: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export async function generateGeminiReply(
  question: string,
  opts: GeminiOptions = {}
): Promise<string> {
  const { data, error } = await supabase.functions.invoke<{ text: string }>('gemini-proxy', {
    body: {
      question,
      ultraBrief: opts.ultraBrief,
      contextMode: opts.contextMode,
      conversationHistory: opts.conversationHistory,
    },
  });

  if (error) {
    throw new Error(error.message ?? 'Gemini proxy error');
  }

  if (!data?.text) {
    throw new Error('Gemini proxy returned empty response');
  }

  return data.text;
}
