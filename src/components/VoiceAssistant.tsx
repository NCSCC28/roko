import { useEffect, useRef, useState } from 'react';
import { Bot, Loader2, Send, Sparkles, Trash2, User } from 'lucide-react';
import { generateLocalAiReply } from '../utils/localAi';

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

export default function VoiceAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    createMessage(
      'assistant',
      [
        'I am ROKO Local AI.',
        'I work with smart offline logic: keyword understanding, concepts, summaries, and morals.',
        '',
        'Try:',
        '- Explain karma yoga',
        '- Give moral from Gita 2:47',
        '- Summarize Bible James 1:5',
        '- Search verses about peace',
      ].join('\n')
    ),
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
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const reply = await generateLocalAiReply(question);
      setMessages((prev) => [...prev, createMessage('assistant', reply)]);
    } catch (error) {
      const errorText = error instanceof Error ? error.message : 'Unknown local AI error.';
      setMessages((prev) => [
        ...prev,
        createMessage('assistant', `I could not process that right now. ${errorText}`),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      createMessage(
        'assistant',
        [
          'Chat cleared.',
          'Ask your next question.',
        ].join('\n')
      ),
    ]);
  };

  const quickPrompts = [
    'Explain karma yoga',
    'Give moral from Gita 2:47',
    'Summarize Bible James 1:5',
    'Search verses about peace',
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
            Smart local AI logic for scripture explanation, morals, and summaries.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-2">
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
            <button
              onClick={handleClear}
              disabled={loading}
              className="ml-auto px-3 py-1.5 text-sm rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 inline-flex items-center gap-1"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </button>
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
                placeholder="Ask your question..."
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
