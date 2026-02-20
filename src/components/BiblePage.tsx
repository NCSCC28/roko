import { useEffect, useState, useCallback } from 'react';
import { supabase, BibleVerse } from '../lib/supabase';
import { Volume2, Heart, Search, Book, Languages } from 'lucide-react';
import { useSpeech } from '../hooks/useSpeech';
import useFavorites from '../hooks/useFavorites';
import { generateTeluguExplanation } from '../utils/teluguNlp';

export default function BiblePage() {
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [filteredVerses, setFilteredVerses] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [selectedTestament, setSelectedTestament] = useState<'All' | 'Old' | 'New'>('All');
  const [audioLanguage, setAudioLanguage] = useState<'en' | 'te'>('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [teluguExplanations, setTeluguExplanations] = useState<Record<string, string>>({});
  const [loadingExplanationId, setLoadingExplanationId] = useState<string | null>(null);
  const { speak, isSpeaking } = useSpeech();
  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    loadVerses();
  }, []);

  const loadVerses = async () => {
    try {
      const { data, error } = await supabase
        .from('bible_verses')
        .select('*')
        .order('book', { ascending: true })
        .order('chapter', { ascending: true })
        .order('verse', { ascending: true });

      if (error) throw error;
      setVerses(data || []);
      setFilteredVerses(data || []);
    } catch (error) {
      console.error('Error loading verses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterVerses = useCallback(() => {
    let filtered = verses;

    if (selectedTestament !== 'All') {
      filtered = filtered.filter(v => v.testament === selectedTestament);
    }

    if (selectedBook) {
      filtered = filtered.filter(v => v.book === selectedBook);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(v =>
        v.text.toLowerCase().includes(query) ||
        v.book.toLowerCase().includes(query)
      );
    }

    setFilteredVerses(filtered);
  }, [selectedBook, selectedTestament, searchQuery, verses]);

  useEffect(() => {
    filterVerses();
  }, [filterVerses]);

  const ensureTeluguExplanation = useCallback(async (verse: BibleVerse) => {
    const verseId = verse.id;
    if (teluguExplanations[verseId]) {
      return teluguExplanations[verseId];
    }

    const sourceText = `${verse.book} ${verse.chapter}:${verse.verse}. ${verse.text}`;
    setLoadingExplanationId(verseId);
    try {
      const explanation = await generateTeluguExplanation(sourceText);
      setTeluguExplanations((prev) => ({ ...prev, [verseId]: explanation }));
      return explanation;
    } catch (error) {
      console.error('Error generating Telugu explanation:', error);
      const fallback = 'Telugu explanation is currently unavailable.';
      setTeluguExplanations((prev) => ({
        ...prev,
        [verseId]: fallback,
      }));
      return fallback;
    } finally {
      setLoadingExplanationId((prev) => (prev === verseId ? null : prev));
    }
  }, [teluguExplanations]);

  const handleTeluguExplanation = useCallback(async (verse: BibleVerse) => {
    await ensureTeluguExplanation(verse);
  }, [ensureTeluguExplanation]);

  const handleSpeak = useCallback(async (verse: BibleVerse) => {
    if (audioLanguage === 'te') {
      const explanation = await ensureTeluguExplanation(verse);
      if (!explanation) {
        return;
      }

      speak(explanation, 'te-IN');
      return;
    }

    speak(`${verse.book} ${verse.chapter}:${verse.verse}. ${verse.text}`, 'en-US');
  }, [audioLanguage, ensureTeluguExplanation, speak]);

  const uniqueBooks = Array.from(new Set(verses.map(v => v.book)));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading verses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center space-x-3 mb-8">
          <Book className="h-10 w-10 text-blue-600 dark:text-blue-500" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">The Bible</h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search verses by keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="flex space-x-2">
              {(['All', 'Old', 'New'] as const).map(testament => (
                <button
                  key={testament}
                  onClick={() => {
                    setSelectedTestament(testament);
                    setSelectedBook(null);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedTestament === testament
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {testament === 'All' ? 'All' : `${testament} Testament`}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4 max-w-xs">
            <label htmlFor="bible-audio-language" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Audio Language
            </label>
            <select
              id="bible-audio-language"
              value={audioLanguage}
              onChange={(e) => setAudioLanguage(e.target.value as 'en' | 'te')}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="en">English</option>
              <option value="te">Telugu</option>
            </select>
          </div>

          {uniqueBooks.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedBook(null)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  selectedBook === null
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All Books
              </button>
              {uniqueBooks
                .filter(book => {
                  if (selectedTestament === 'All') return true;
                  const verse = verses.find(v => v.book === book);
                  return verse?.testament === selectedTestament;
                })
                .map(book => (
                  <button
                    key={book}
                    onClick={() => setSelectedBook(book)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      selectedBook === book
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {book}
                  </button>
                ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {filteredVerses.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">No verses found matching your search.</p>
            </div>
          ) : (
            filteredVerses.map((verse) => (
              <div
                key={verse.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-sm font-semibold text-blue-600 dark:text-blue-500">
                    {verse.book} {verse.chapter}:{verse.verse} ({verse.testament} Testament)
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        void handleSpeak(verse);
                      }}
                      disabled={isSpeaking || (audioLanguage === 'te' && loadingExplanationId === verse.id)}
                      className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-500 transition-colors duration-200 disabled:opacity-50"
                      aria-label="Play audio"
                    >
                      <Volume2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => toggleFavorite('bible', verse.id)}
                      className={`p-2 rounded-full transition-colors duration-200 ${
                        isFavorite('bible', verse.id)
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300'
                      }`}
                      aria-label="Toggle favorite"
                    >
                      <Heart className={`h-5 w-5 ${isFavorite('bible', verse.id) ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={() => handleTeluguExplanation(verse)}
                      disabled={loadingExplanationId === verse.id}
                      className="p-2 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-700 transition-colors duration-200 disabled:opacity-50"
                      aria-label="Explain in Telugu"
                    >
                      <Languages className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                  {verse.text}
                </p>

                {teluguExplanations[verse.id] && (
                  <div className="mt-4 pt-4 border-t border-emerald-200 dark:border-emerald-900/40">
                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
                      Telugu Explanation
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {teluguExplanations[verse.id]}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

