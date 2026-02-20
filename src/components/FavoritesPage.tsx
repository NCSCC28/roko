import { useEffect, useState } from 'react';
import { Heart, Volume2, BookOpen, Book } from 'lucide-react';
import { useSpeech } from '../hooks/useSpeech';
import useFavorites, { Favorite } from '../hooks/useFavorites';
import { supabase, GitaVerse, BibleVerse, QuranAyah } from '../lib/supabase';

type FavoriteItem = {
  favorite: Favorite;
  verse: GitaVerse | BibleVerse | QuranAyah | null;
};

export default function FavoritesPage() {
  const { speak, isSpeaking } = useSpeech();
  const { favorites, removeFavorite } = useFavorites();
  const [favoriteItems, setFavoriteItems] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = async () => {
      setLoading(true);
      try {
        const gitaIds = favorites.filter((f) => f.verseType === 'gita').map((f) => f.verseId);
        const bibleIds = favorites.filter((f) => f.verseType === 'bible').map((f) => f.verseId);
        const quranIds = favorites
          .filter((f) => f.verseType === 'quran')
          .map((f) => Number(f.verseId))
          .filter((id) => Number.isFinite(id));

        const [gitaResponse, bibleResponse, quranResponse] = await Promise.all([
          gitaIds.length
            ? supabase.from('gita_verses').select('*').in('id', gitaIds)
            : Promise.resolve({ data: [] as GitaVerse[], error: null }),
          bibleIds.length
            ? supabase.from('bible_verses').select('*').in('id', bibleIds)
            : Promise.resolve({ data: [] as BibleVerse[], error: null }),
          quranIds.length
            ? supabase.from('quran_ayahs').select('*').in('id', quranIds)
            : Promise.resolve({ data: [] as QuranAyah[], error: null }),
        ]);

        if (gitaResponse.error) {
          console.error('Error loading favorite Gita verses:', gitaResponse.error);
        }
        if (bibleResponse.error) {
          console.error('Error loading favorite Bible verses:', bibleResponse.error);
        }
        if (quranResponse.error) {
          console.error('Error loading favorite Quran ayahs:', quranResponse.error);
        }

        const gitaMap = new Map((gitaResponse.data || []).map((verse) => [verse.id, verse]));
        const bibleMap = new Map((bibleResponse.data || []).map((verse) => [verse.id, verse]));
        const quranMap = new Map((quranResponse.data || []).map((verse) => [String(verse.id), verse]));

        const items = favorites.map((favorite) => ({
          favorite,
          verse:
            favorite.verseType === 'gita'
              ? gitaMap.get(favorite.verseId) ?? null
              : favorite.verseType === 'bible'
              ? bibleMap.get(favorite.verseId) ?? null
              : quranMap.get(favorite.verseId) ?? null,
        }));

        setFavoriteItems(items);
      } catch (error) {
        console.error('Error loading favorites:', error);
        setFavoriteItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [favorites]);

  const handleSpeak = (item: FavoriteItem) => {
    if (!item.verse) return;
    if ('sanskrit' in item.verse) {
      speak(`${item.verse.transliteration}. ${item.verse.translation_en}`, 'en-US');
    } else if ('book' in item.verse) {
      speak(item.verse.text, 'en-US');
    } else {
      const speechParts = [item.verse.ayah_ar, item.verse.ayah_en].filter(Boolean);
      speak(speechParts.join('. '), 'ar-SA');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center space-x-3 mb-8">
          <Heart className="h-10 w-10 text-rose-600 dark:text-rose-500" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">My Favorites</h1>
        </div>

        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading favorites...</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center">
            <Heart className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">No favorites yet</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start saving your favorite verses by clicking the heart icon on any verse
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 flex items-center space-x-3">
                <BookOpen className="h-8 w-8 text-amber-600 dark:text-amber-500" />
                <div className="text-left">
                  <div className="font-semibold text-gray-900 dark:text-white">Bhagavad Gita</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Browse sacred verses</div>
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 flex items-center space-x-3">
                <Book className="h-8 w-8 text-blue-600 dark:text-blue-500" />
                <div className="text-left">
                  <div className="font-semibold text-gray-900 dark:text-white">The Bible</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Explore scriptures</div>
                </div>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 flex items-center space-x-3">
                <Book className="h-8 w-8 text-emerald-600 dark:text-emerald-500" />
                <div className="text-left">
                  <div className="font-semibold text-gray-900 dark:text-white">The Quran</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Read translated ayahs</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {favoriteItems.map((item) => (
              <div
                key={`${item.favorite.verseType}-${item.favorite.verseId}`}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-sm font-semibold text-rose-600 dark:text-rose-500">
                    {item.favorite.verseType === 'gita'
                      ? 'Bhagavad Gita'
                      : item.favorite.verseType === 'bible'
                      ? 'The Bible'
                      : 'The Quran'}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSpeak(item)}
                      disabled={isSpeaking || !item.verse}
                      className="p-2 rounded-full bg-rose-100 dark:bg-rose-900/30 hover:bg-rose-200 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-500 transition-colors duration-200 disabled:opacity-50"
                      aria-label="Play audio"
                    >
                      <Volume2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => removeFavorite(item.favorite.verseType, item.favorite.verseId)}
                      className="p-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white transition-colors duration-200"
                      aria-label="Remove from favorites"
                    >
                      <Heart className="h-5 w-5 fill-current" />
                    </button>
                  </div>
                </div>
                {!item.verse ? (
                  <p className="text-gray-600 dark:text-gray-400">Verse not available.</p>
                ) : 'sanskrit' in item.verse ? (
                  <>
                    <div className="text-sm font-semibold text-amber-600 dark:text-amber-500 mb-2">
                      Chapter {item.verse.chapter}, Verse {item.verse.verse}
                    </div>
                    <p className="text-xl font-serif text-gray-800 dark:text-gray-200 mb-2 leading-relaxed">
                      {item.verse.sanskrit}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 italic mb-2">
                      {item.verse.transliteration}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {item.verse.translation_en}
                    </p>
                  </>
                ) : 'book' in item.verse ? (
                  <>
                    <div className="text-sm font-semibold text-blue-600 dark:text-blue-500 mb-2">
                      {item.verse.book} {item.verse.chapter}:{item.verse.verse}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{item.verse.text}</p>
                  </>
                ) : (
                  <>
                    <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-500 mb-2">
                      Surah {item.verse.surah_no}, Ayah {item.verse.ayah_no_surah} (
                      {item.verse.surah_name_roman || item.verse.surah_name_en})
                    </div>
                    <p dir="rtl" className="text-right text-xl text-gray-800 dark:text-gray-100 leading-loose mb-2">
                      {item.verse.ayah_ar}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{item.verse.ayah_en}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
