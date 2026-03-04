/*
  # Load Bhagavad Gita data into gita_verses

  - Assumes table public.bhagwad_gita is populated (from 20260303172000_import_bhagwad_gita.sql).
  - Upserts 700+ verses into public.gita_verses used by the app.
*/

INSERT INTO public.gita_verses (chapter, verse, sanskrit, transliteration, translation_hi, translation_en, commentary)
SELECT
  chapter::int,
  verse::int,
  shloka,
  transliteration,
  hin_meaning,
  eng_meaning,
  COALESCE(word_meaning, '')
FROM public.bhagwad_gita
ON CONFLICT (chapter, verse) DO UPDATE
SET
  sanskrit = EXCLUDED.sanskrit,
  transliteration = EXCLUDED.transliteration,
  translation_hi = EXCLUDED.translation_hi,
  translation_en = EXCLUDED.translation_en,
  commentary = EXCLUDED.commentary;
