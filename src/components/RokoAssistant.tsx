import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader } from 'lucide-react';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { useSpeech } from '../hooks/useSpeech';
import { analyzeSentiment, getEmpatheticResponse } from '../utils/sentimentAnalysis';
import { matchIntent } from '../utils/intentHandler';

interface Message {
  id: string;
  speaker: 'user' | 'roko';
  text: string;
  sentiment?: string;
}

export default function RokoAssistant() {
  const { startListening, stopListening, transcript, isListening } = useVoiceRecognition();
  const { speak, stop, isSupported: isSpeechSupported } = useSpeech();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [awaitingWakeWord, setAwaitingWakeWord] = useState(true);
  const [rokoActive, setRokoActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (transcript && !isProcessing) {
      handleTranscript(transcript);
    }
  }, [transcript]);

  const handleTranscript = async (text: string) => {
    const lowerText = text.toLowerCase();

    if (awaitingWakeWord) {
      if (lowerText.includes('hey roko') || lowerText.includes('roko')) {
        addMessage('roko', 'Roko here! How can I help you today?');
        speak("Roko here! How can I help you today?", 'en-US');
        setAwaitingWakeWord(false);
        setRokoActive(true);
        stopListening();
      }
      return;
    }

    if (rokoActive) {
      setIsProcessing(true);
      addMessage('user', text);

      const sentimentResult = analyzeSentiment(text);
      const empatheticGreeting = getEmpatheticResponse(sentimentResult.sentiment);

      const intentResult = await matchIntent(text);

      const fullResponse = sentimentResult.sentiment !== 'neutral'
        ? `${empatheticGreeting} ${intentResult.response}`
        : intentResult.response;

      addMessage('roko', fullResponse, sentimentResult.sentiment);
      speak(fullResponse, 'en-US');

      stopListening();
      setRokoActive(false);
      setAwaitingWakeWord(true);
      setIsProcessing(false);
    }
  };

  const addMessage = (speaker: 'user' | 'roko', text: string, sentiment?: string) => {
    const message: Message = {
      id: `${Date.now()}`,
      speaker,
      text,
      sentiment
    };
    setMessages(prev => [...prev, message]);
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      if (!awaitingWakeWord) {
        addMessage('roko', 'Listening...');
      }
      startListening();
    }
  };

  const handleReset = () => {
    stop();
    stopListening();
    setMessages([]);
    setAwaitingWakeWord(true);
    setRokoActive(false);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8 h-screen flex flex-col">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4">
            <span className="text-2xl font-bold text-white">R</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Roko</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {awaitingWakeWord ? 'Say "Hey Roko" to get started' : 'I\'m listening...'}
          </p>
        </div>

        <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6 overflow-y-auto space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <Mic className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Start by saying "Hey Roko"</p>
                <p className="text-sm mt-2">Then ask me anything about verses, music, weather, or news!</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                      msg.speaker === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : `${
                            msg.sentiment === 'negative'
                              ? 'bg-orange-100 dark:bg-orange-900/30 border-l-4 border-orange-500'
                              : msg.sentiment === 'positive'
                              ? 'bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500'
                              : 'bg-gray-100 dark:bg-gray-700'
                          } text-gray-900 dark:text-gray-100 rounded-bl-none`
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <div className="flex flex-col items-center space-y-6">
          {isProcessing && (
            <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
              <Loader className="h-5 w-5 animate-spin" />
              <span className="text-sm font-medium">Processing...</span>
            </div>
          )}

          <button
            onClick={handleMicClick}
            disabled={isProcessing || !isSpeechSupported}
            className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 scale-110'
                : rokoActive || (messages.length > 0 && !awaitingWakeWord)
                ? 'bg-purple-600 hover:bg-purple-700'
                : 'bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
            } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isListening ? (
              <>
                <MicOff className="h-10 w-10 text-white" />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-600 rounded-full animate-pulse"></span>
              </>
            ) : (
              <Mic className="h-10 w-10 text-white" />
            )}
          </button>

          <button
            onClick={handleReset}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-full font-medium transition-colors duration-200 text-sm"
          >
            Clear Conversation
          </button>

          {!isSpeechSupported && (
            <p className="text-sm text-red-600 dark:text-red-400">
              Speech recognition is not supported in your browser.
            </p>
          )}
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-2 text-center text-blue-900 dark:text-blue-300">
            Search verses
          </div>
          <div className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-2 text-center text-purple-900 dark:text-purple-300">
            Play music
          </div>
          <div className="bg-pink-100 dark:bg-pink-900/30 rounded-lg p-2 text-center text-pink-900 dark:text-pink-300">
            Weather info
          </div>
          <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-2 text-center text-green-900 dark:text-green-300">
            Get help
          </div>
        </div>
      </div>
    </div>
  );
}
