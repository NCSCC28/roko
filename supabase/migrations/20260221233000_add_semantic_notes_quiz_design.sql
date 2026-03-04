/*
  # Clean Data Model for Notes, Semantic Search, and Advanced Quiz Attempts

  ## Adds
  - `user_notes` for notes + personal reflection
  - `quiz_attempts` for normalized advanced quiz history
  - `cross_scripture_comparisons` for AI comparison logs
  - Full-text + trigram indexes for semantic search acceleration
  - `scripture_search_documents` unified searchable view
  - `semantic_search_scriptures(...)` SQL function for ranked search
*/

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE OR REPLACE FUNCTION public.set_updated_at_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS public.user_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_key text,
  tradition text NOT NULL CHECK (tradition IN ('gita', 'bible', 'quran', 'general')),
  reference_label text,
  note_title text NOT NULL DEFAULT '',
  note_body text NOT NULL DEFAULT '',
  reflection_body text NOT NULL DEFAULT '',
  mood text,
  tags text[] NOT NULL DEFAULT '{}'::text[],
  is_private boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_notes_content_check CHECK (
    length(trim(note_body)) > 0 OR length(trim(reflection_body)) > 0
  )
);

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_key text,
  religion text NOT NULL CHECK (religion IN ('gita', 'bible', 'quran')),
  level text NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced', 'scholar')),
  source_mode text NOT NULL CHECK (source_mode IN ('database', 'ai_generated')),
  timed_mode boolean NOT NULL DEFAULT false,
  time_per_question integer,
  total_questions integer NOT NULL CHECK (total_questions > 0),
  correct_answers integer NOT NULL CHECK (correct_answers >= 0),
  score_percentage integer NOT NULL CHECK (score_percentage BETWEEN 0 AND 100),
  xp_earned integer NOT NULL DEFAULT 0 CHECK (xp_earned >= 0),
  best_streak integer NOT NULL DEFAULT 0 CHECK (best_streak >= 0),
  duration_seconds integer NOT NULL DEFAULT 0 CHECK (duration_seconds >= 0),
  completed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT quiz_attempts_answers_check CHECK (correct_answers <= total_questions)
);

CREATE TABLE IF NOT EXISTS public.cross_scripture_comparisons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_key text,
  topic text NOT NULL,
  prompt text NOT NULL,
  ai_response text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'set_user_notes_updated_at'
  ) THEN
    CREATE TRIGGER set_user_notes_updated_at
    BEFORE UPDATE ON public.user_notes
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_timestamp();
  END IF;
END;
$$;

ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cross_scripture_comparisons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own notes" ON public.user_notes;
CREATE POLICY "Users can read own notes"
  ON public.user_notes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own notes" ON public.user_notes;
CREATE POLICY "Users can insert own notes"
  ON public.user_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notes" ON public.user_notes;
CREATE POLICY "Users can update own notes"
  ON public.user_notes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own notes" ON public.user_notes;
CREATE POLICY "Users can delete own notes"
  ON public.user_notes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public can read shared notes" ON public.user_notes;
CREATE POLICY "Public can read shared notes"
  ON public.user_notes
  FOR SELECT
  USING (is_private = false);

DROP POLICY IF EXISTS "Users can read own quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Users can read own quiz attempts"
  ON public.quiz_attempts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Users can insert own quiz attempts"
  ON public.quiz_attempts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read own comparison logs" ON public.cross_scripture_comparisons;
CREATE POLICY "Users can read own comparison logs"
  ON public.cross_scripture_comparisons
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own comparison logs" ON public.cross_scripture_comparisons;
CREATE POLICY "Users can insert own comparison logs"
  ON public.cross_scripture_comparisons
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_notes_user_id ON public.user_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notes_created_at ON public.user_notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_notes_tradition ON public.user_notes(tradition);
CREATE INDEX IF NOT EXISTS idx_user_notes_tags ON public.user_notes USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_user_notes_search_fts
  ON public.user_notes
  USING gin (
    to_tsvector('english', coalesce(note_title, '') || ' ' || coalesce(note_body, '') || ' ' || coalesce(reflection_body, ''))
  );

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_religion_level ON public.quiz_attempts(religion, level);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_score ON public.quiz_attempts(score_percentage DESC, duration_seconds ASC, completed_at DESC);

CREATE INDEX IF NOT EXISTS idx_cross_scripture_comparisons_user_id ON public.cross_scripture_comparisons(user_id);
CREATE INDEX IF NOT EXISTS idx_cross_scripture_comparisons_created_at ON public.cross_scripture_comparisons(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_gita_verses_semantic_fts
  ON public.gita_verses
  USING gin (
    to_tsvector('simple', coalesce(translation_en, '') || ' ' || coalesce(translation_hi, '') || ' ' || coalesce(commentary, '') || ' ' || coalesce(transliteration, ''))
  );

CREATE INDEX IF NOT EXISTS idx_bible_verses_semantic_fts
  ON public.bible_verses
  USING gin (to_tsvector('english', coalesce(book, '') || ' ' || coalesce(text, '')));

CREATE INDEX IF NOT EXISTS idx_quran_ayahs_semantic_fts
  ON public.quran_ayahs
  USING gin (to_tsvector('simple', coalesce(surah_name_en, '') || ' ' || coalesce(surah_name_roman, '') || ' ' || coalesce(ayah_en, '')));

CREATE INDEX IF NOT EXISTS idx_gita_verses_semantic_trgm
  ON public.gita_verses
  USING gin ((coalesce(translation_en, '') || ' ' || coalesce(commentary, '')) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_bible_verses_semantic_trgm
  ON public.bible_verses
  USING gin ((coalesce(book, '') || ' ' || coalesce(text, '')) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_quran_ayahs_semantic_trgm
  ON public.quran_ayahs
  USING gin ((coalesce(surah_name_en, '') || ' ' || coalesce(ayah_en, '')) gin_trgm_ops);

CREATE OR REPLACE VIEW public.scripture_search_documents AS
SELECT
  concat('gita-', gv.id::text) AS document_id,
  'gita'::text AS tradition,
  concat('Gita ', gv.chapter, ':', gv.verse) AS reference_label,
  'Bhagavad Gita'::text AS source_title,
  gv.sanskrit AS primary_text,
  gv.transliteration AS secondary_text,
  coalesce(gv.translation_en, gv.translation_hi, gv.commentary, '') AS translated_text,
  concat_ws(' ', gv.sanskrit, gv.transliteration, gv.translation_en, gv.translation_hi, gv.commentary) AS search_text
FROM public.gita_verses gv
UNION ALL
SELECT
  concat('bible-', bv.id::text) AS document_id,
  'bible'::text AS tradition,
  concat(bv.book, ' ', bv.chapter, ':', bv.verse) AS reference_label,
  concat('Bible - ', bv.book) AS source_title,
  bv.text AS primary_text,
  ''::text AS secondary_text,
  bv.text AS translated_text,
  concat_ws(' ', bv.book, bv.text) AS search_text
FROM public.bible_verses bv
UNION ALL
SELECT
  concat('quran-', qa.id::text) AS document_id,
  'quran'::text AS tradition,
  concat('Quran ', qa.surah_no, ':', qa.ayah_no_surah) AS reference_label,
  concat('Quran - ', coalesce(qa.surah_name_roman, qa.surah_name_en, 'Surah')) AS source_title,
  coalesce(qa.ayah_ar, '') AS primary_text,
  ''::text AS secondary_text,
  coalesce(qa.ayah_en, '') AS translated_text,
  concat_ws(' ', qa.surah_name_en, qa.surah_name_roman, qa.ayah_ar, qa.ayah_en) AS search_text
FROM public.quran_ayahs qa;

CREATE OR REPLACE FUNCTION public.semantic_search_scriptures(
  query_text text,
  match_count integer DEFAULT 30,
  filter_tradition text DEFAULT NULL
)
RETURNS TABLE (
  document_id text,
  tradition text,
  reference_label text,
  source_title text,
  primary_text text,
  translated_text text,
  rank_score real
)
LANGUAGE sql
STABLE
AS $$
  WITH docs AS (
    SELECT
      ssd.document_id,
      ssd.tradition,
      ssd.reference_label,
      ssd.source_title,
      ssd.primary_text,
      ssd.translated_text,
      ssd.search_text,
      to_tsvector('simple', coalesce(ssd.search_text, '')) AS document_vector
    FROM public.scripture_search_documents ssd
    WHERE filter_tradition IS NULL OR ssd.tradition = filter_tradition
  ),
  query_ctx AS (
    SELECT
      plainto_tsquery('simple', query_text) AS ts_query,
      lower(query_text) AS query_lower
  )
  SELECT
    docs.document_id,
    docs.tradition,
    docs.reference_label,
    docs.source_title,
    docs.primary_text,
    docs.translated_text,
    (
      (ts_rank(docs.document_vector, query_ctx.ts_query) * 0.75)::real +
      (greatest(similarity(lower(docs.search_text), query_ctx.query_lower), 0) * 0.25)::real
    ) AS rank_score
  FROM docs
  CROSS JOIN query_ctx
  WHERE
    docs.document_vector @@ query_ctx.ts_query
    OR similarity(lower(docs.search_text), query_ctx.query_lower) > 0.08
  ORDER BY rank_score DESC, docs.reference_label
  LIMIT greatest(1, least(match_count, 100));
$$;

GRANT SELECT ON public.scripture_search_documents TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.semantic_search_scriptures(text, integer, text) TO anon, authenticated;
