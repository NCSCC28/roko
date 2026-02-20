import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface GitaVerse {
  id: string;
  chapter: number;
  verse: number;
  sanskrit: string;
  transliteration: string;
  translation_en: string;
  translation_hi: string;
  translation_te?: string;
  commentary: string;
  audio_url: string;
  created_at: string;
}

export interface BibleVerse {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  testament: 'Old' | 'New';
  audio_url: string;
  created_at: string;
}

export interface QuranAyah {
  id: number;
  surah_no: string | null;
  surah_name_en: string | null;
  surah_name_ar: string | null;
  surah_name_roman: string | null;
  ayah_no_surah: string | null;
  ayah_no_quran: string | null;
  ayah_ar: string | null;
  ayah_en: string | null;
  ruko_no: string | null;
  juz_no: string | null;
  manzil_no: string | null;
  hizb_quarter: string | null;
  total_ayah_surah: string | null;
  total_ayah_quran: string | null;
  place_of_revelation: string | null;
  sajah_ayah: string | null;
  sajdah_no: string | null;
  no_of_word_ayah: string | null;
  list_of_words: string | null;
}

export interface UserFavorite {
  id: string;
  user_id: string;
  verse_type: 'gita' | 'bible' | 'quran';
  verse_id: string;
  created_at: string;
}

export interface DailyVerse {
  id: string;
  date: string;
  verse_type: 'gita' | 'bible';
  verse_id: string;
  created_at: string;
}
