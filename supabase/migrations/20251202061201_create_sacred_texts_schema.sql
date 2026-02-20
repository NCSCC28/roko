/*
  # Sacred Texts Platform Schema

  ## Overview
  This migration creates the database schema for a multi-ritual spiritual platform
  that integrates sacred texts from multiple traditions (Bhagavad Gita and Bible).

  ## Tables Created
  
  ### 1. gita_verses
  Stores Bhagavad Gita slokas with Sanskrit and translations
  - `id` (uuid, primary key)
  - `chapter` (integer) - Chapter number (1-18)
  - `verse` (integer) - Verse number within chapter
  - `sanskrit` (text) - Original Sanskrit text
  - `transliteration` (text) - Roman script transliteration
  - `translation_en` (text) - English translation
  - `translation_hi` (text) - Hindi translation
  - `commentary` (text) - Brief commentary/explanation
  - `audio_url` (text) - URL for audio pronunciation
  - `created_at` (timestamptz)

  ### 2. bible_verses
  Stores Bible verses with book, chapter, and verse references
  - `id` (uuid, primary key)
  - `book` (text) - Book name (e.g., "Genesis", "Matthew")
  - `chapter` (integer) - Chapter number
  - `verse` (integer) - Verse number
  - `text` (text) - Verse text
  - `testament` (text) - "Old" or "New"
  - `audio_url` (text) - URL for audio reading
  - `created_at` (timestamptz)

  ### 3. user_favorites
  Stores user bookmarks/favorites across all sacred texts
  - `id` (uuid, primary key)
  - `user_id` (uuid) - Reference to auth.users
  - `verse_type` (text) - "gita" or "bible"
  - `verse_id` (uuid) - Reference to verse
  - `created_at` (timestamptz)

  ### 4. daily_verses
  Stores daily recommended verses for users
  - `id` (uuid, primary key)
  - `date` (date) - The date for this recommendation
  - `verse_type` (text) - "gita" or "bible"
  - `verse_id` (uuid) - Reference to verse
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Public read access for verses (gita_verses, bible_verses, daily_verses)
  - Authenticated users can manage their own favorites
  - Only authenticated users can create/delete favorites
*/

-- Create gita_verses table
CREATE TABLE IF NOT EXISTS gita_verses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter integer NOT NULL,
  verse integer NOT NULL,
  sanskrit text NOT NULL,
  transliteration text NOT NULL,
  translation_en text NOT NULL,
  translation_hi text DEFAULT '',
  commentary text DEFAULT '',
  audio_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(chapter, verse)
);

-- Create bible_verses table
CREATE TABLE IF NOT EXISTS bible_verses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book text NOT NULL,
  chapter integer NOT NULL,
  verse integer NOT NULL,
  text text NOT NULL,
  testament text NOT NULL CHECK (testament IN ('Old', 'New')),
  audio_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(book, chapter, verse)
);

-- Create user_favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verse_type text NOT NULL CHECK (verse_type IN ('gita', 'bible')),
  verse_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, verse_type, verse_id)
);

-- Create daily_verses table
CREATE TABLE IF NOT EXISTS daily_verses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL UNIQUE,
  verse_type text NOT NULL CHECK (verse_type IN ('gita', 'bible')),
  verse_id uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE gita_verses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bible_verses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_verses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for gita_verses (public read)
CREATE POLICY "Anyone can view Gita verses"
  ON gita_verses FOR SELECT
  USING (true);

-- RLS Policies for bible_verses (public read)
CREATE POLICY "Anyone can view Bible verses"
  ON bible_verses FOR SELECT
  USING (true);

-- RLS Policies for user_favorites (authenticated users manage their own)
CREATE POLICY "Users can view own favorites"
  ON user_favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own favorites"
  ON user_favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON user_favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for daily_verses (public read)
CREATE POLICY "Anyone can view daily verses"
  ON daily_verses FOR SELECT
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_gita_verses_chapter_verse ON gita_verses(chapter, verse);
CREATE INDEX IF NOT EXISTS idx_bible_verses_book_chapter_verse ON bible_verses(book, chapter, verse);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_verses_date ON daily_verses(date);