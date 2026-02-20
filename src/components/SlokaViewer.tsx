import { useEffect, useMemo, useState } from 'react';
import { Search, ChevronRight, Loader2 } from 'lucide-react';
import { supabase, BibleVerse, GitaVerse, QuranAyah } from '../lib/supabase';

type Tradition = 'gita' | 'bible' | 'quran';
type ViewMode = 'single' | 'chapter' | 'search';

type BibleBookRow = {
  book: string | null;
};

interface SurahOption {
  surahNo: string;
  surahNameEn: string;
  surahNameRoman: string;
  totalAyahSurah: string;
}

interface SurahMetaRow {
  surah_no: string | null;
  surah_name_en: string | null;
  surah_name_roman: string | null;
  total_ayah_surah: string | null;
}

interface ScriptureVerse {
  id: string;
  tradition: Tradition;
  source: string;
  chapterLabel: string;
  chapterNumber: number;
  verseNumber: number;
  primaryText: string;
  secondaryText?: string;
  translation: string;
}

const traditionLabels: Record<Tradition, string> = {
  gita: 'Bhagavad Gita',
  bible: 'Bible',
  quran: 'Quran',
};

function toNumber(value: string | null | undefined): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function mapGitaVerse(verse: GitaVerse): ScriptureVerse {
  return {
    id: String(verse.id),
    tradition: 'gita',
    source: 'Bhagavad Gita',
    chapterLabel: 'Chapter',
    chapterNumber: verse.chapter,
    verseNumber: verse.verse,
    primaryText: verse.sanskrit || '',
    secondaryText: verse.transliteration || '',
    translation: verse.translation_en || verse.translation_hi || verse.commentary || '',
  };
}

function mapBibleVerse(verse: BibleVerse): ScriptureVerse {
  return {
    id: String(verse.id),
    tradition: 'bible',
    source: `Bible - ${verse.book}`,
    chapterLabel: 'Chapter',
    chapterNumber: verse.chapter,
    verseNumber: verse.verse,
    primaryText: verse.text || '',
    translation: verse.text || '',
  };
}

function mapQuranAyah(ayah: QuranAyah): ScriptureVerse {
  const surahNo = toNumber(ayah.surah_no);
  const ayahNo = toNumber(ayah.ayah_no_surah);
  const surahName = ayah.surah_name_roman || ayah.surah_name_en || '';

  return {
    id: String(ayah.id),
    tradition: 'quran',
    source: surahName ? `Quran - ${surahName}` : 'Quran',
    chapterLabel: 'Surah',
    chapterNumber: surahNo,
    verseNumber: ayahNo,
    primaryText: ayah.ayah_ar || '',
    translation: ayah.ayah_en || '',
  };
}

export function SlokaViewer() {
  const [tradition, setTradition] = useState<Tradition>('gita');
  const [viewMode, setViewMode] = useState<ViewMode>('single');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [singleResult, setSingleResult] = useState<ScriptureVerse | null>(null);
  const [listResults, setListResults] = useState<ScriptureVerse[]>([]);

  const [gitaChapter, setGitaChapter] = useState(1);
  const [gitaVerse, setGitaVerse] = useState(1);

  const [bibleBook, setBibleBook] = useState('');
  const [bibleChapter, setBibleChapter] = useState(1);
  const [bibleVerse, setBibleVerse] = useState(1);
  const [bibleBooks, setBibleBooks] = useState<string[]>([]);
  const [bibleChapters, setBibleChapters] = useState<number[]>([]);
  const [bibleVerses, setBibleVerses] = useState<number[]>([]);
  const [loadingBibleBooks, setLoadingBibleBooks] = useState(true);
  const [loadingBibleRefs, setLoadingBibleRefs] = useState(false);

  const [quranSurah, setQuranSurah] = useState('1');
  const [quranAyah, setQuranAyah] = useState(1);
  const [surahs, setSurahs] = useState<SurahOption[]>([]);
  const [loadingSurahs, setLoadingSurahs] = useState(true);

  useEffect(() => {
    const loadBibleBooks = async () => {
      setLoadingBibleBooks(true);
      try {
        const { data, error: queryError } = await supabase
          .from('bible_verses')
          .select('book')
          .order('book', { ascending: true });

        if (queryError) throw queryError;

        const uniqueBooks = Array.from(
          new Set(
            ((data ?? []) as BibleBookRow[])
              .map((row) => row.book ?? '')
              .filter((book) => book.length > 0)
          )
        );

        setBibleBooks(uniqueBooks);
        if (uniqueBooks.length > 0) {
          setBibleBook((prev) => prev || uniqueBooks[0]);
        }
      } catch (err) {
        console.error('Error loading Bible books:', err);
      } finally {
        setLoadingBibleBooks(false);
      }
    };

    loadBibleBooks();
  }, []);

  useEffect(() => {
    const loadSurahs = async () => {
      setLoadingSurahs(true);
      try {
        const { data, error: queryError } = await supabase
          .from('quran_ayahs')
          .select('surah_no,surah_name_en,surah_name_roman,total_ayah_surah');

        if (queryError) throw queryError;

        const rows = (data ?? []) as SurahMetaRow[];
        const surahMap = new Map<string, SurahOption>();

        for (const row of rows) {
          const surahNo = row.surah_no ?? '';
          if (!surahNo || surahMap.has(surahNo)) {
            continue;
          }

          surahMap.set(surahNo, {
            surahNo,
            surahNameEn: row.surah_name_en ?? '',
            surahNameRoman: row.surah_name_roman ?? '',
            totalAyahSurah: row.total_ayah_surah ?? '',
          });
        }

        const options = Array.from(surahMap.values()).sort(
          (a, b) => toNumber(a.surahNo) - toNumber(b.surahNo)
        );

        setSurahs(options);
        if (options.length > 0) {
          setQuranSurah((prev) => prev || options[0].surahNo);
        }
      } catch (err) {
        console.error('Error loading Surahs:', err);
      } finally {
        setLoadingSurahs(false);
      }
    };

    loadSurahs();
  }, []);

  useEffect(() => {
    if (!bibleBook) {
      setBibleChapters([]);
      return;
    }

    const loadChapters = async () => {
      setLoadingBibleRefs(true);
      try {
        const { data, error: queryError } = await supabase
          .from('bible_verses')
          .select('chapter,verse')
          .eq('book', bibleBook)
          .order('chapter', { ascending: true })
          .order('verse', { ascending: true });

        if (queryError) throw queryError;

        const chapters = Array.from(
          new Set((data ?? []).map((row) => Number(row.chapter)).filter((n) => Number.isFinite(n)))
        ).sort((a, b) => a - b);

        setBibleChapters(chapters);
        if (chapters.length > 0) {
          setBibleChapter((prev) => (chapters.includes(prev) ? prev : chapters[0]));
        }
      } catch (err) {
        console.error('Error loading Bible chapters:', err);
        setBibleChapters([]);
      } finally {
        setLoadingBibleRefs(false);
      }
    };

    void loadChapters();
  }, [bibleBook]);

  useEffect(() => {
    if (!bibleBook || !bibleChapter) {
      setBibleVerses([]);
      return;
    }

    const loadVerses = async () => {
      setLoadingBibleRefs(true);
      try {
        const { data, error: queryError } = await supabase
          .from('bible_verses')
          .select('verse')
          .eq('book', bibleBook)
          .eq('chapter', bibleChapter)
          .order('verse', { ascending: true });

        if (queryError) throw queryError;

        const verses = Array.from(
          new Set((data ?? []).map((row) => Number(row.verse)).filter((n) => Number.isFinite(n)))
        ).sort((a, b) => a - b);

        setBibleVerses(verses);
        if (verses.length > 0) {
          setBibleVerse((prev) => (verses.includes(prev) ? prev : verses[0]));
        }
      } catch (err) {
        console.error('Error loading Bible verses:', err);
        setBibleVerses([]);
      } finally {
        setLoadingBibleRefs(false);
      }
    };

    void loadVerses();
  }, [bibleBook, bibleChapter]);

  useEffect(() => {
    setError(null);
    setSingleResult(null);
    setListResults([]);
    setViewMode('single');
  }, [tradition]);

  const selectedSurah = useMemo(
    () => surahs.find((surah) => surah.surahNo === quranSurah) ?? null,
    [quranSurah, surahs]
  );

  const chapterTitle = useMemo(() => {
    if (tradition === 'gita') {
      return `Chapter ${gitaChapter}`;
    }

    if (tradition === 'bible') {
      return `${bibleBook} Chapter ${bibleChapter}`;
    }

    const surahName = selectedSurah?.surahNameRoman || selectedSurah?.surahNameEn || '';
    return surahName ? `Surah ${quranSurah} - ${surahName}` : `Surah ${quranSurah}`;
  }, [tradition, gitaChapter, bibleBook, bibleChapter, quranSurah, selectedSurah]);

  const handleFetchVerse = async () => {
    setLoading(true);
    setError(null);
    setViewMode('single');

    try {
      if (tradition === 'gita') {
        const { data, error: queryError } = await supabase
          .from('gita_verses')
          .select('*')
          .eq('chapter', gitaChapter)
          .eq('verse', gitaVerse)
          .maybeSingle();

        if (queryError) throw queryError;
        if (!data) {
          throw new Error(`No verse found for Chapter ${gitaChapter}, Verse ${gitaVerse}.`);
        }

        setSingleResult(mapGitaVerse(data as GitaVerse));
        setListResults([]);
        return;
      }

      if (tradition === 'bible') {
        if (!bibleBook) {
          throw new Error('Select a Bible book first.');
        }

        const { data, error: queryError } = await supabase
          .from('bible_verses')
          .select('*')
          .eq('book', bibleBook)
          .eq('chapter', bibleChapter)
          .eq('verse', bibleVerse)
          .maybeSingle();

        if (queryError) throw queryError;
        if (!data) {
          throw new Error(`No verse found for ${bibleBook} ${bibleChapter}:${bibleVerse}.`);
        }

        setSingleResult(mapBibleVerse(data as BibleVerse));
        setListResults([]);
        return;
      }

      const { data, error: queryError } = await supabase
        .from('quran_ayahs')
        .select('*')
        .eq('surah_no', quranSurah)
        .eq('ayah_no_surah', String(quranAyah))
        .maybeSingle();

      if (queryError) throw queryError;
      if (!data) {
        throw new Error(`No ayah found for Surah ${quranSurah}, Ayah ${quranAyah}.`);
      }

      setSingleResult(mapQuranAyah(data as QuranAyah));
      setListResults([]);
    } catch (err) {
      setSingleResult(null);
      setError(err instanceof Error ? err.message : 'Unable to fetch verse right now.');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchChapter = async () => {
    setLoading(true);
    setError(null);
    setViewMode('chapter');

    try {
      if (tradition === 'gita') {
        const { data, error: queryError } = await supabase
          .from('gita_verses')
          .select('*')
          .eq('chapter', gitaChapter)
          .order('verse', { ascending: true });

        if (queryError) throw queryError;

        const verses = ((data ?? []) as GitaVerse[]).map(mapGitaVerse);
        if (verses.length === 0) {
          throw new Error(`No verses found for Chapter ${gitaChapter}.`);
        }

        setSingleResult(null);
        setListResults(verses);
        return;
      }

      if (tradition === 'bible') {
        if (!bibleBook) {
          throw new Error('Select a Bible book first.');
        }

        const { data, error: queryError } = await supabase
          .from('bible_verses')
          .select('*')
          .eq('book', bibleBook)
          .eq('chapter', bibleChapter)
          .order('verse', { ascending: true });

        if (queryError) throw queryError;

        const verses = ((data ?? []) as BibleVerse[]).map(mapBibleVerse);
        if (verses.length === 0) {
          throw new Error(`No verses found for ${bibleBook} Chapter ${bibleChapter}.`);
        }

        setSingleResult(null);
        setListResults(verses);
        return;
      }

      const { data, error: queryError } = await supabase
        .from('quran_ayahs')
        .select('*')
        .eq('surah_no', quranSurah);

      if (queryError) throw queryError;

      const verses = ((data ?? []) as QuranAyah[])
        .sort((a, b) => toNumber(a.ayah_no_surah) - toNumber(b.ayah_no_surah))
        .map(mapQuranAyah);

      if (verses.length === 0) {
        throw new Error(`No ayahs found for Surah ${quranSurah}.`);
      }

      setSingleResult(null);
      setListResults(verses);
    } catch (err) {
      setListResults([]);
      setError(err instanceof Error ? err.message : 'Unable to fetch chapter right now.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      return;
    }

    setLoading(true);
    setError(null);
    setViewMode('search');

    try {
      const safeTerm = trimmed.replace(/[%_,]/g, '');

      if (tradition === 'gita') {
        const { data, error: queryError } = await supabase
          .from('gita_verses')
          .select('*')
          .or(
            `translation_en.ilike.%${safeTerm}%,translation_hi.ilike.%${safeTerm}%,commentary.ilike.%${safeTerm}%,sanskrit.ilike.%${safeTerm}%`
          )
          .limit(50);

        if (queryError) throw queryError;

        setSingleResult(null);
        setListResults(((data ?? []) as GitaVerse[]).map(mapGitaVerse));
        return;
      }

      if (tradition === 'bible') {
        const { data, error: queryError } = await supabase
          .from('bible_verses')
          .select('*')
          .or(`text.ilike.%${safeTerm}%,book.ilike.%${safeTerm}%`)
          .limit(50);

        if (queryError) throw queryError;

        setSingleResult(null);
        setListResults(((data ?? []) as BibleVerse[]).map(mapBibleVerse));
        return;
      }

      const { data, error: queryError } = await supabase
        .from('quran_ayahs')
        .select('*')
        .or(
          `ayah_en.ilike.%${safeTerm}%,ayah_ar.ilike.%${safeTerm}%,surah_name_en.ilike.%${safeTerm}%,surah_name_roman.ilike.%${safeTerm}%`
        )
        .limit(50);

      if (queryError) throw queryError;

      setSingleResult(null);
      setListResults(
        ((data ?? []) as QuranAyah[])
          .sort((a, b) => {
            const surahDiff = toNumber(a.surah_no) - toNumber(b.surah_no);
            if (surahDiff !== 0) {
              return surahDiff;
            }

            return toNumber(a.ayah_no_surah) - toNumber(b.ayah_no_surah);
          })
          .map(mapQuranAyah)
      );
    } catch (err) {
      setListResults([]);
      setError(err instanceof Error ? err.message : 'Unable to search right now.');
    } finally {
      setLoading(false);
    }
  };

  const renderPrimaryText = (verse: ScriptureVerse, className: string) => {
    if (verse.tradition === 'quran') {
      return (
        <p dir="rtl" className={`${className} text-right text-2xl`}>
          {verse.primaryText}
        </p>
      );
    }

    return <p className={className}>{verse.primaryText}</p>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Scripture Verse Explorer</h1>
          <p className="text-slate-600">Browse verses from Bhagavad Gita, Bible, and Quran in one place</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Choose Tradition</h2>
              <div className="flex gap-2 flex-wrap">
                {(['gita', 'bible', 'quran'] as const).map((item) => (
                  <button
                    key={item}
                    onClick={() => setTradition(item)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      tradition === item
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {traditionLabels[item]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Retrieve by Reference</h2>
              <div className="flex gap-3 flex-wrap">
                {tradition === 'gita' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Chapter (1-18)</label>
                      <input
                        type="number"
                        min="1"
                        max="18"
                        value={gitaChapter}
                        onChange={(e) =>
                          setGitaChapter(Math.max(1, Math.min(18, Number.parseInt(e.target.value, 10) || 1)))
                        }
                        className="w-28 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Verse</label>
                      <input
                        type="number"
                        min="1"
                        value={gitaVerse}
                        onChange={(e) => setGitaVerse(Math.max(1, Number.parseInt(e.target.value, 10) || 1))}
                        className="w-28 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </>
                )}

                {tradition === 'bible' && (
                  <>
                    <div className="min-w-52">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Book</label>
                      <select
                        value={bibleBook}
                        onChange={(e) => setBibleBook(e.target.value)}
                        disabled={loadingBibleBooks || loadingBibleRefs}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      >
                        {bibleBooks.map((book) => (
                          <option key={book} value={book}>
                            {book}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Chapter</label>
                      <select
                        value={bibleChapter}
                        onChange={(e) => setBibleChapter(Number(e.target.value))}
                        disabled={loadingBibleRefs || bibleChapters.length === 0}
                        className="w-28 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      >
                        {bibleChapters.map((chapterNo) => (
                          <option key={chapterNo} value={chapterNo}>
                            {chapterNo}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Verse</label>
                      <select
                        value={bibleVerse}
                        onChange={(e) => setBibleVerse(Number(e.target.value))}
                        disabled={loadingBibleRefs || bibleVerses.length === 0}
                        className="w-28 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      >
                        {bibleVerses.map((verseNo) => (
                          <option key={verseNo} value={verseNo}>
                            {verseNo}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {tradition === 'quran' && (
                  <>
                    <div className="min-w-60">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Surah</label>
                      <select
                        value={quranSurah}
                        onChange={(e) => setQuranSurah(e.target.value)}
                        disabled={loadingSurahs}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      >
                        {surahs.map((surah) => (
                          <option key={surah.surahNo} value={surah.surahNo}>
                            {surah.surahNo}. {surah.surahNameRoman || surah.surahNameEn}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Ayah</label>
                      <input
                        type="number"
                        min="1"
                        value={quranAyah}
                        onChange={(e) => setQuranAyah(Math.max(1, Number.parseInt(e.target.value, 10) || 1))}
                        className="w-28 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </>
                )}

                <div className="flex items-end gap-2">
                  <button
                    onClick={handleFetchVerse}
                    disabled={loading || loadingBibleBooks || loadingSurahs || loadingBibleRefs}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 transition-colors flex items-center gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                    Get Verse
                  </button>
                  <button
                    onClick={handleFetchChapter}
                    disabled={loading || loadingBibleBooks || loadingSurahs || loadingBibleRefs}
                    className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:bg-slate-400 transition-colors"
                  >
                    Get Chapter
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Search {traditionLabels[tradition]} Verses
              </h2>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search in verses and translations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && void handleSearch()}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => {
                    void handleSearch();
                  }}
                  disabled={loading || !searchTerm.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-slate-400 transition-colors"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {viewMode === 'single' && singleResult && (
          <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
            <div className="border-b pb-4">
              <p className="text-sm font-semibold text-slate-600 mb-1">{singleResult.source}</p>
              <p className="text-sm font-semibold text-slate-600 mb-3">
                {singleResult.chapterLabel} {singleResult.chapterNumber} | Verse {singleResult.verseNumber}
              </p>
              {renderPrimaryText(singleResult, 'font-semibold text-slate-900 mb-3')}
              {singleResult.secondaryText && (
                <p className="text-lg text-slate-700 italic">{singleResult.secondaryText}</p>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Translation</h3>
              <p className="text-slate-700 leading-relaxed">{singleResult.translation}</p>
            </div>
          </div>
        )}

        {(viewMode === 'chapter' || viewMode === 'search') && listResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              {viewMode === 'chapter'
                ? `${chapterTitle} | ${listResults.length} verses`
                : `${traditionLabels[tradition]} search results | ${listResults.length} matches`}
            </h2>
            <div className="space-y-4">
              {listResults.map((verse) => (
                <div
                  key={`${verse.tradition}-${verse.id}`}
                  className="border rounded-lg p-4 hover:bg-slate-50 transition-colors"
                >
                  <p className="text-sm font-semibold text-slate-600 mb-1">{verse.source}</p>
                  <p className="text-sm font-semibold text-slate-600 mb-2">
                    {verse.chapterLabel} {verse.chapterNumber} | Verse {verse.verseNumber}
                  </p>
                  {renderPrimaryText(verse, 'font-semibold text-slate-900 mb-2')}
                  {verse.secondaryText && (
                    <p className="text-slate-600 text-sm italic mb-2">{verse.secondaryText}</p>
                  )}
                  <p className="text-slate-600 text-sm">{verse.translation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {viewMode === 'search' && !loading && listResults.length === 0 && (
          <div className="bg-slate-50 rounded-lg p-8 text-center">
            <p className="text-slate-600">No results found for "{searchTerm}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
