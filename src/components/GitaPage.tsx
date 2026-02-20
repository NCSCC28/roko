import { useEffect, useState, useCallback } from 'react';
import { supabase, GitaVerse } from '../lib/supabase';
import { Volume2, Heart, Search, BookOpen, Languages } from 'lucide-react';
import { useSpeech } from '../hooks/useSpeech';
import useFavorites from '../hooks/useFavorites';
import { generateTeluguExplanation } from '../utils/teluguNlp';

export default function GitaPage() {
  const [verses, setVerses] = useState<GitaVerse[]>([]);
  const [filteredVerses, setFilteredVerses] = useState<GitaVerse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi' | 'te'>('en');
  const [audioLanguage, setAudioLanguage] = useState<'en' | 'te'>('en');
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
        .from('gita_verses')
        .select('*')
        .order('chapter', { ascending: true })
        .order('verse', { ascending: true });

      if (error) throw error;

      const safeData = data || [];
      setVerses(safeData);
      setFilteredVerses(safeData);
    } catch (error) {
      console.error('Error loading verses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterVerses = useCallback(() => {
    let filtered = verses;

    if (selectedChapter !== null) {
      filtered = filtered.filter(v => v.chapter === selectedChapter);
    }

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();

      filtered = filtered.filter(v =>
        (v.translation_en || '').toLowerCase().includes(query) ||
        (v.translation_hi || '').toLowerCase().includes(query) ||
        (v.translation_te || '').toLowerCase().includes(query) ||
        (v.transliteration || '').toLowerCase().includes(query) ||
        (v.sanskrit || '').toLowerCase().includes(query) ||
        (v.commentary || '').toLowerCase().includes(query)
      );
    }

    setFilteredVerses(filtered);
  }, [selectedChapter, searchQuery, verses]);

  useEffect(() => {
    filterVerses();
  }, [filterVerses]);

  const ensureTeluguExplanation = useCallback(async (verse: GitaVerse) => {
    const verseId = String(verse.id);
    if (teluguExplanations[verseId]) {
      return teluguExplanations[verseId];
    }

    const sourceText = verse.commentary || verse.translation_en || verse.transliteration || verse.sanskrit || '';
    if (!sourceText.trim()) {
      return '';
    }

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

  const handleSpeak = useCallback(async (verse: GitaVerse) => {
    if (audioLanguage === 'te') {
      const teluguText = (verse.translation_te || '').trim() || (await ensureTeluguExplanation(verse));
      if (!teluguText) {
        return;
      }

      speak(teluguText, 'te-IN');
      return;
    }

    speak(
      `Chapter ${verse.chapter}, Verse ${verse.verse}. ${verse.transliteration || ''}. ${verse.translation_en || ''}`,
      'en-US'
    );
  }, [audioLanguage, ensureTeluguExplanation, speak]);

  const handleTeluguExplanation = useCallback(async (verse: GitaVerse) => {
    await ensureTeluguExplanation(verse);
  }, [ensureTeluguExplanation]);

  const chapters = Array.from({ length: 18 }, (_, i) => i + 1);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading verses...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-center space-x-3 mb-8">
          <BookOpen className="h-10 w-10 text-amber-600" />
          <h1 className="text-4xl font-bold">
            Bhagavad Gita
          </h1>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">

          {/* Search */}
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search verses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-lg"
            />
          </div>

          {/* Language Selector */}
          <div className="mb-4">
            <p className="text-sm font-semibold mb-2">Translation Language:</p>
            <div className="flex gap-2">
              {(['en', 'hi', 'te'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`px-4 py-2 rounded-lg ${
                    selectedLanguage === lang
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-200'
                  }`}
                >
                  {lang === 'en'
                    ? 'English'
                    : lang === 'hi'
                    ? 'Hindi'
                    : 'Telugu'}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4 max-w-xs">
            <label htmlFor="gita-audio-language" className="block text-sm font-semibold mb-2">
              Audio Language:
            </label>
            <select
              id="gita-audio-language"
              value={audioLanguage}
              onChange={(e) => setAudioLanguage(e.target.value as 'en' | 'te')}
              className="w-full px-4 py-2 border rounded-lg bg-white"
            >
              <option value="en">English</option>
              <option value="te">Telugu</option>
            </select>
          </div>

          {/* Chapter Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedChapter(null)}
              className={`px-4 py-2 rounded-lg ${
                selectedChapter === null
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-200'
              }`}
            >
              All Chapters
            </button>

            {chapters.map((chapter) => (
              <button
                key={chapter}
                onClick={() => setSelectedChapter(chapter)}
                className={`px-4 py-2 rounded-lg ${
                  selectedChapter === chapter
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-200'
                }`}
              >
                {chapter}
              </button>
            ))}
          </div>
        </div>

        {/* Verses */}
        <div className="space-y-6">
          {filteredVerses.map((verse) => (
            <div
              key={verse.id}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex justify-between mb-4">
                <div className="text-sm font-semibold text-amber-600">
                  Chapter {verse.chapter}, Verse {verse.verse}
                </div>

                <div className="flex gap-2">
                  {/* Speak */}
                  <button
                    onClick={() => {
                      void handleSpeak(verse);
                    }}
                    disabled={
                      isSpeaking ||
                      (audioLanguage === 'te' && loadingExplanationId === String(verse.id))
                    }
                    className="p-2 rounded-full bg-amber-100"
                  >
                    <Volume2 className="h-5 w-5" />
                  </button>

                  {/* Favorite */}
                  <button
                    onClick={() => toggleFavorite('gita', String(verse.id))}
                    className={`p-2 rounded-full ${
                      isFavorite('gita', String(verse.id))
                        ? 'bg-amber-600 text-white'
                        : 'bg-gray-200'
                    }`}
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        isFavorite('gita', String(verse.id))
                          ? 'fill-current'
                          : ''
                      }`}
                    />
                  </button>

                  {/* Telugu Explanation */}
                  <button
                    onClick={() => handleTeluguExplanation(verse)}
                    disabled={loadingExplanationId === String(verse.id)}
                    className="p-2 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50 transition-colors duration-200"
                    aria-label="Explain in Telugu"
                  >
                    <Languages className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <p className="text-2xl font-serif mb-2">
                {verse.sanskrit || ''}
              </p>

              <p className="italic mb-2">
                {verse.transliteration || ''}
              </p>

              <p>
                {selectedLanguage === 'en'
                  ? verse.translation_en || ''
                  : selectedLanguage === 'hi'
                  ? verse.translation_hi || ''
                  : verse.translation_te || ''}
              </p>

              {verse.commentary && (
                <div className="mt-4 pt-4 border-t">
                  <strong>Commentary:</strong> {verse.commentary}
                </div>
              )}

              {teluguExplanations[String(verse.id)] && (
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <strong>Telugu Explanation:</strong> {teluguExplanations[String(verse.id)]}
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

