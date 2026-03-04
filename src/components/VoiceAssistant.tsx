import { useEffect, useRef, useState } from 'react';
import { Bot, Loader2, Send, Sparkles, Trash2, User } from 'lucide-react';
import { type AiContextMode } from '../utils/localAi';
import { generateDialogflowReply } from '../utils/dialogflowAi';
import { generateGeminiReply } from '../utils/geminiAi';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

function createMessage(role: 'user' | 'assistant', content: string): ChatMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    content,
  };
}

const contextModeOptions: Array<{ mode: AiContextMode; label: string }> = [
  { mode: 'standard', label: 'Standard' },
  { mode: 'historical', label: 'Historical Context' },
  { mode: 'philosophical', label: 'Philosophical Meaning' },
  { mode: 'simple_english', label: 'Simple English' },
  { mode: 'for_10_year_old', label: 'For a 10-year-old' },
];

const contextModeLabelMap: Record<AiContextMode, string> = {
  standard: 'Standard',
  historical: 'Historical Context',
  philosophical: 'Philosophical Meaning',
  simple_english: 'Simple English',
  for_10_year_old: 'For a 10-year-old',
};

function buildWelcomeMessage(contextMode: AiContextMode, ultraBriefMode: boolean): string {
  return [
    'I am ROKO AI Bot.',
    'I use Dialogflow for intent understanding and can fall back to local scripture logic when needed.',
    `Mode: ${ultraBriefMode ? 'Ultra Brief ON' : 'Normal'} (toggle anytime).`,
    `Context: ${contextModeLabelMap[contextMode]}.`,
    '',
    'Try:',
    '- John 3:16',
    '- Gita 2:47 moral',
    '- Quran 2:153 summary',
    '- Compare patience across Gita, Bible, and Quran',
    '- Search verses about peace',
    '- I feel anxious. Give Bible verses and motivate me',
    '- I feel sad. Motivate me with Gita verses',
    '- Give me more verses',
  ].join('\n');
}

export default function VoiceAssistant() {
  const [ultraBriefMode, setUltraBriefMode] = useState(true);
  const [contextMode, setContextMode] = useState<AiContextMode>('standard');
  const [messages, setMessages] = useState<ChatMessage[]>([
    createMessage('assistant', buildWelcomeMessage('standard', true)),
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (preset?: string) => {
    const question = (preset ?? input).trim();
    if (!question || loading) {
      return;
    }

    const userMessage = createMessage('user', question);
    const historyForAi = [...messages, userMessage]
      .slice(-10)
      .map((entry) => ({ role: entry.role, content: entry.content }));
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const reply = await generateGeminiReply(question, {
        ultraBrief: ultraBriefMode,
        contextMode,
        conversationHistory: historyForAi,
      });
      setMessages((prev) => [...prev, createMessage('assistant', reply)]);
    } catch (error) {
      // Fallback to Dialogflow/local if Gemini fails
      try {
        const reply = await generateDialogflowReply(question, {
          ultraBrief: ultraBriefMode,
          contextMode,
          conversationHistory: historyForAi,
        });
        setMessages((prev) => [...prev, createMessage('assistant', reply)]);
      } catch (err) {
        const errorText =
          err instanceof Error
            ? err.message
            : error instanceof Error
            ? error.message
            : 'Unknown AI error.';
        setMessages((prev) => [
          ...prev,
          createMessage('assistant', `I could not process that right now. ${errorText}`),
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      createMessage(
        'assistant',
        [buildWelcomeMessage(contextMode, ultraBriefMode), 'Chat cleared. Ask your next question.'].join('\n\n')
      ),
    ]);
  };

  const quickPrompts = [
    'John 3:16',
    'Gita 2:47 moral',
    'Quran 2:153 summary',
    'Compare patience across Gita, Bible, and Quran',
    'Search verses about peace',
    'I feel sad. Please motivate me with Bible verses.',
    'I feel sad. Please motivate me with Gita verses.',
    'Give me more verses',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500 mb-4">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">ROKO AI Bot</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Context-aware scripture assistant.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-full border border-gray-300 dark:border-gray-600 overflow-hidden">
                <button
                  onClick={() => setUltraBriefMode(false)}
                  disabled={loading}
                  className={`px-3 py-1.5 text-sm transition-colors disabled:opacity-50 ${
                    !ultraBriefMode
                      ? 'bg-sky-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Normal
                </button>
                <button
                  onClick={() => setUltraBriefMode(true)}
                  disabled={loading}
                  className={`px-3 py-1.5 text-sm transition-colors disabled:opacity-50 ${
                    ultraBriefMode
                      ? 'bg-sky-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Ultra Brief
                </button>
              </div>

              <button
                onClick={handleClear}
                disabled={loading}
                className="ml-auto px-3 py-1.5 text-sm rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 inline-flex items-center gap-1"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {contextModeOptions.map((option) => (
                <button
                  key={option.mode}
                  onClick={() => setContextMode(option.mode)}
                  disabled={loading}
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors disabled:opacity-50 ${
                    contextMode === option.mode
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300">
              Active context mode: <span className="font-semibold">{contextModeLabelMap[contextMode]}</span>
            </p>

            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => {
                    void handleSend(prompt);
                  }}
                  disabled={loading}
                  className="px-3 py-1.5 text-sm rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-800 dark:text-sky-300 hover:bg-sky-200 dark:hover:bg-sky-900/50 transition-colors disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[58vh] overflow-y-auto p-4 space-y-4 bg-slate-50/60 dark:bg-gray-900/30">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm whitespace-pre-wrap ${
                    message.role === 'user'
                      ? 'bg-sky-600 text-white rounded-br-md'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-bl-md'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1 text-xs opacity-80">
                    {message.role === 'assistant' ? (
                      <>
                        <Bot className="h-3.5 w-3.5" />
                        <span>ROKO AI</span>
                      </>
                    ) : (
                      <>
                        <User className="h-3.5 w-3.5" />
                        <span>You</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-bl-md px-4 py-3 shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={endRef} />
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    void handleSend();
                  }
                }}
                placeholder="Ask a verse, concept, or share your feeling for motivational verses..."
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
              <button
                onClick={() => {
                  void handleSend();
                }}
                disabled={loading || !input.trim()}
                className="px-4 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:bg-gray-400 text-white transition-colors"
                aria-label="Send message"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
