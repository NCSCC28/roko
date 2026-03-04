-- Enable secure read access and query performance for Quran ayahs
ALTER TABLE public.quran_ayahs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view Quran ayahs" ON public.quran_ayahs;
CREATE POLICY "Anyone can view Quran ayahs"
  ON public.quran_ayahs
  FOR SELECT
  USING (true);

CREATE INDEX IF NOT EXISTS idx_quran_ayahs_surah_ayah
  ON public.quran_ayahs (surah_no, ayah_no_surah);

CREATE INDEX IF NOT EXISTS idx_quran_ayahs_surah_name_en
  ON public.quran_ayahs (surah_name_en);

CREATE INDEX IF NOT EXISTS idx_quran_ayahs_surah_name_roman
  ON public.quran_ayahs (surah_name_roman);
