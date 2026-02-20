import { supabase } from '../lib/supabase';

export interface Sloka {
  id: string;
  chapter: number;
  verse: number;
  sanskrit: string;
  transliteration: string;
  translation_en: string;
  translation_hi: string;
  commentary: string;
  audio_url?: string;
}

export interface SlokaResponse {
  success: boolean;
  data?: {
    chapter: number;
    verse: number;
    sloka: string;
    transliteration: string;
    translation: {
      english: string;
      hindi: string;
    };
    meaning: {
      wordByWord: string;
      commentary: string;
    };
    audio?: string;
  };
  error?: string;
}

export interface SlokasByChapterResponse {
  success: boolean;
  data?: {
    chapter: number;
    totalVerses: number;
    verses: Sloka[];
  };
  error?: string;
}

export interface AllSlokasResponse {
  success: boolean;
  data?: {
    verses: Sloka[];
  };
  error?: string;
}

export async function getSlokaByChapterVerse(
  chapter: number,
  verse: number
): Promise<SlokaResponse> {
  if (!chapter || !verse || chapter < 1 || chapter > 18 || verse < 1) {
    return {
      success: false,
      error: 'Invalid chapter or verse number. Chapter must be 1-18, verse must be positive.',
    };
  }

  const { data, error } = await supabase
    .from('gita_verses')
    .select('*')
    .eq('chapter', chapter)
    .eq('verse', verse)
    .maybeSingle();

  if (error) {
    return {
      success: false,
      error: `Database error: ${error.message}`,
    };
  }

  if (!data) {
    return {
      success: false,
      error: `Sloka not found for Chapter ${chapter}, Verse ${verse}`,
    };
  }

  return {
    success: true,
    data: {
      chapter: data.chapter,
      verse: data.verse,
      sloka: data.sanskrit,
      transliteration: data.transliteration,
      translation: {
        english: data.translation_en,
        hindi: data.translation_hi,
      },
      meaning: {
        wordByWord: data.commentary,
        commentary: data.commentary,
      },
      audio: data.audio_url || undefined,
    },
  };
}

export async function getSlokasByChapter(
  chapter: number
): Promise<SlokasByChapterResponse> {
  if (!chapter || chapter < 1 || chapter > 18) {
    return {
      success: false,
      error: 'Invalid chapter number. Must be 1-18.',
    };
  }

  const { data, error } = await supabase
    .from('gita_verses')
    .select('*')
    .eq('chapter', chapter)
    .order('verse', { ascending: true });

  if (error) {
    return {
      success: false,
      error: `Database error: ${error.message}`,
    };
  }

  if (!data || data.length === 0) {
    return {
      success: false,
      error: `No verses found for Chapter ${chapter}`,
    };
  }

  return {
    success: true,
    data: {
      chapter,
      totalVerses: data.length,
      verses: data as Sloka[],
    },
  };
}

export async function getAllSlokas(limit?: number): Promise<AllSlokasResponse> {
  let query = supabase
    .from('gita_verses')
    .select('*')
    .order('chapter', { ascending: true })
    .order('verse', { ascending: true });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    return {
      success: false,
      error: `Database error: ${error.message}`,
    };
  }

  if (!data || data.length === 0) {
    return {
      success: false,
      error: 'No verses found in database',
    };
  }

  return {
    success: true,
    data: {
      verses: data as Sloka[],
    },
  };
}

export async function searchSlokas(searchTerm: string): Promise<{
  success: boolean;
  data?: Sloka[];
  error?: string;
}> {
  if (!searchTerm || searchTerm.trim().length < 2) {
    return {
      success: false,
      error: 'Search term must be at least 2 characters',
    };
  }

  const { data, error } = await supabase
    .from('gita_verses')
    .select('*')
    .or(
      `translation_en.ilike.%${searchTerm}%,translation_hi.ilike.%${searchTerm}%,commentary.ilike.%${searchTerm}%`
    )
    .limit(20);

  if (error) {
    return {
      success: false,
      error: `Database error: ${error.message}`,
    };
  }

  return {
    success: true,
    data: data as Sloka[],
  };
}
