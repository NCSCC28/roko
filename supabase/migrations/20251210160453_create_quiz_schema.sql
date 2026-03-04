/*
  # Quiz Questions Schema

  ## Overview
  This migration creates the database schema for quiz questions
  covering Bhagavad Gita and Bible knowledge.

  ## Tables Created
  
  ### 1. quiz_questions
  Stores multiple-choice quiz questions about sacred texts
  - `id` (uuid, primary key)
  - `religion` (text) - "gita" or "bible"
  - `category` (text) - Question category (e.g., "history", "teachings", "practices")
  - `question` (text) - The question text
  - `option_a` (text) - Option A
  - `option_b` (text) - Option B
  - `option_c` (text) - Option C
  - `option_d` (text) - Option D
  - `correct_answer` (text) - Correct option ("A", "B", "C", or "D")
  - `explanation` (text) - Explanation of the correct answer
  - `difficulty` (text) - Question difficulty ("easy", "medium", "hard")
  - `created_at` (timestamptz)

  ### 2. user_quiz_results
  Stores user quiz attempt results
  - `id` (uuid, primary key)
  - `user_id` (uuid) - Reference to auth.users
  - `religion` (text) - "gita" or "bible"
  - `total_questions` (integer) - Total questions attempted
  - `correct_answers` (integer) - Number of correct answers
  - `score_percentage` (integer) - Percentage score
  - `completed_at` (timestamptz)
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on both tables
  - Public read access for quiz questions
  - Authenticated users can record their quiz results
  - Users can only view their own results
*/

CREATE TABLE IF NOT EXISTS quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  religion text NOT NULL CHECK (religion IN ('gita', 'bible')),
  category text NOT NULL,
  question text NOT NULL,
  option_a text NOT NULL,
  option_b text NOT NULL,
  option_c text NOT NULL,
  option_d text NOT NULL,
  correct_answer text NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  explanation text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_quiz_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  religion text NOT NULL CHECK (religion IN ('gita', 'bible')),
  total_questions integer NOT NULL,
  correct_answers integer NOT NULL,
  score_percentage integer NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quiz_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view quiz questions"
  ON quiz_questions FOR SELECT
  USING (true);

CREATE POLICY "Users can view own quiz results"
  ON user_quiz_results FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can record quiz results"
  ON user_quiz_results FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_religion ON quiz_questions(religion);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_difficulty ON quiz_questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_user_quiz_results_user_id ON user_quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_results_religion ON user_quiz_results(religion);