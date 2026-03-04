/*
  # Expand Quiz Content with Quran Questions

  ## Overview
  - Extends quiz religion constraints to support `quran`.
  - Adds a large Quran question set across easy/medium/hard.
  - Inserts are idempotent (skip duplicates by religion + question text).
*/

ALTER TABLE quiz_questions
  DROP CONSTRAINT IF EXISTS quiz_questions_religion_check;

ALTER TABLE quiz_questions
  ADD CONSTRAINT quiz_questions_religion_check
  CHECK (religion IN ('gita', 'bible', 'quran'));

ALTER TABLE user_quiz_results
  DROP CONSTRAINT IF EXISTS user_quiz_results_religion_check;

ALTER TABLE user_quiz_results
  ADD CONSTRAINT user_quiz_results_religion_check
  CHECK (religion IN ('gita', 'bible', 'quran'));

WITH new_questions (
  religion,
  category,
  question,
  option_a,
  option_b,
  option_c,
  option_d,
  correct_answer,
  explanation,
  difficulty
) AS (
  VALUES
    ('quran', 'fundamentals', 'How many chapters (surahs) are in the Quran?', '99', '110', '114', '120', 'C', 'The Quran has 114 surahs.', 'easy'),
    ('quran', 'fundamentals', 'Which surah opens the Quran?', 'Al-Baqarah', 'Al-Fatihah', 'Yasin', 'An-Nas', 'B', 'The first chapter is Surah Al-Fatihah.', 'easy'),
    ('quran', 'revelation', 'What was the first revealed command according to Islamic tradition?', 'Pray', 'Fast', 'Read (Iqra)', 'Give charity', 'C', 'The first revealed word was "Iqra" (Read) in Surah Al-Alaq.', 'easy'),
    ('quran', 'revelation', 'In which month is fasting made obligatory in the Quran?', 'Muharram', 'Ramadan', 'Shawwal', 'Dhul-Hijjah', 'B', 'Surah Al-Baqarah states fasting is prescribed in Ramadan.', 'easy'),
    ('quran', 'prophets', 'Which prophet is known for building the Ark?', 'Ibrahim (Abraham)', 'Musa (Moses)', 'Nuh (Noah)', 'Yunus (Jonah)', 'C', 'Prophet Nuh built the Ark by Allah''s command.', 'easy'),
    ('quran', 'prophets', 'Who is the mother of Prophet Isa (Jesus) in the Quran?', 'Asiya', 'Maryam', 'Hajar', 'Khadijah', 'B', 'Maryam is honored in the Quran as the mother of Isa.', 'easy'),
    ('quran', 'belief', 'What is the central message of Surah Al-Ikhlas?', 'History of prophets', 'Oneness of Allah', 'Rules of fasting', 'Inheritance law', 'B', 'Surah Al-Ikhlas affirms absolute monotheism.', 'easy'),
    ('quran', 'worship', 'Which direction do Muslims face in prayer, as commanded in the Quran?', 'Jerusalem', 'Mount Sinai', 'Kaaba in Makkah', 'Madinah Mosque', 'C', 'The qiblah was changed to the Kaaba (Surah Al-Baqarah).', 'easy'),
    ('quran', 'ethics', 'According to the Quran, which quality is strongly praised with prayer?', 'Pride', 'Patience', 'Wealth', 'Silence only', 'B', 'The Quran repeatedly commands patience (sabr) alongside prayer.', 'easy'),
    ('quran', 'ethics', 'What does the Quran emphasize about speaking to others?', 'Speak harshly to win', 'Speak with wisdom and good words', 'Avoid all speech', 'Debate for status', 'B', 'Believers are taught to speak kindly and wisely.', 'easy'),

    ('quran', 'fundamentals', 'Which verse is commonly called Ayat al-Kursi?', '2:255', '1:1', '36:1', '112:1', 'A', 'Ayat al-Kursi is Quran 2:255.', 'medium'),
    ('quran', 'revelation', 'Where did the first revelation come to Prophet Muhammad (PBUH)?', 'Mount Uhud', 'Cave Hira', 'Mount Arafat', 'Mina', 'B', 'The first revelation came in Cave Hira.', 'medium'),
    ('quran', 'law', 'Which surah contains many rulings on family and social law and is called "The Women"?', 'Al-Ma''idah', 'An-Nisa', 'Al-An''am', 'At-Tawbah', 'B', 'An-Nisa includes many family and social legal rulings.', 'medium'),
    ('quran', 'worship', 'Which surah is often recited in every unit of prayer?', 'Al-Fatihah', 'Al-Mulk', 'Al-Kahf', 'Ar-Rahman', 'A', 'Al-Fatihah is recited in every rak''ah of salah.', 'medium'),
    ('quran', 'prophets', 'Which prophet is directly associated with the parting of the sea in Quranic narrative?', 'Yusuf', 'Musa', 'Dawud', 'Ilyas', 'B', 'Allah aided Prophet Musa by parting the sea.', 'medium'),
    ('quran', 'values', 'In Quran 49:13, what is the true measure of honor before Allah?', 'Wealth', 'Lineage', 'Nationality', 'Taqwa (God-consciousness)', 'D', 'The Quran teaches that honor is by taqwa.', 'medium'),
    ('quran', 'ethics', 'What does the Quran command regarding parents?', 'Ignore old age burdens', 'Honor and kindness toward them', 'Obey only if easy', 'Keep distance always', 'B', 'Many verses command excellence and mercy toward parents.', 'medium'),
    ('quran', 'faith', 'What does Quran 2:286 teach about burdens?', 'Everyone carries equal burdens', 'Believers are burdened beyond capacity', 'Allah does not burden a soul beyond its capacity', 'Only scholars are tested', 'C', 'Quran 2:286 assures proportional responsibility and mercy.', 'medium'),
    ('quran', 'afterlife', 'Which concept is repeatedly emphasized as accountability after death?', 'Reincarnation cycles', 'Day of Judgment', 'No afterlife', 'Only worldly reward', 'B', 'The Quran consistently emphasizes the Day of Judgment.', 'medium'),
    ('quran', 'charity', 'What is the purpose of zakat according to Quranic teaching?', 'Social status', 'Purification and support of the needy', 'Political control', 'Trade expansion', 'B', 'Zakat purifies wealth and supports social justice.', 'medium'),

    ('quran', 'structure', 'Which surah is the longest in the Quran?', 'Al-Baqarah', 'Yasin', 'Al-Kahf', 'An-Nur', 'A', 'Al-Baqarah is the longest chapter.', 'hard'),
    ('quran', 'structure', 'Which surah does NOT begin with "Bismillah" in the standard mushaf?', 'Al-Anfal', 'At-Tawbah', 'Yusuf', 'Ibrahim', 'B', 'Surah At-Tawbah uniquely begins without Bismillah.', 'hard'),
    ('quran', 'history', 'The change of qiblah is addressed in which surah?', 'Al-Baqarah', 'Al-Fath', 'Al-Ahzab', 'Al-Hadid', 'A', 'The qiblah change is discussed in Surah Al-Baqarah.', 'hard'),
    ('quran', 'prophets', 'Which prophet is called "Kalimullah" (one spoken to by Allah)?', 'Ibrahim', 'Musa', 'Isa', 'Yahya', 'B', 'Musa is known for directly receiving divine speech.', 'hard'),
    ('quran', 'theology', 'What is the theological emphasis of Surah Al-Fatihah''s phrase "Iyyaka na''budu wa iyyaka nasta''in"?', 'Human self-sufficiency', 'Exclusive worship and reliance on Allah', 'Prophetic authority only', 'Material success first', 'B', 'It affirms exclusive worship and reliance upon Allah alone.', 'hard'),
    ('quran', 'ethics', 'Quran 16:90 is often cited because it commands which trio?', 'Power, wealth, dominance', 'Justice, excellence, and generosity', 'Silence, withdrawal, isolation', 'Debate, rivalry, victory', 'B', 'This verse summarizes a broad Quranic ethical framework.', 'hard'),
    ('quran', 'revelation', 'Which night is described as "better than a thousand months"?', 'Night of Isra', 'Laylat al-Qadr', 'Night of Arafah', 'Night of Bara''ah', 'B', 'Surah Al-Qadr describes Laylat al-Qadr.', 'hard'),
    ('quran', 'principles', 'What principle is highlighted by "There is no compulsion in religion" (2:256)?', 'Forced conversion', 'Faith must be sincere and voluntary', 'Religion is optional law', 'No moral duties', 'B', 'The verse establishes that true faith cannot be coerced.', 'hard'),
    ('quran', 'reflection', 'Many Quranic passages invite humans to reflect on creation primarily to:', 'Predict markets', 'Debate endlessly', 'Recognize signs of Allah and strengthen faith', 'Avoid community life', 'C', 'Reflection on creation is presented as a path to certainty and gratitude.', 'hard'),
    ('quran', 'spirituality', 'In Quran 13:28, hearts find tranquility through:', 'Material success', 'Public praise', 'Remembrance of Allah', 'Silence from all people', 'C', 'The verse teaches that true inner calm comes through remembrance of Allah.', 'hard')
)
INSERT INTO quiz_questions (
  religion,
  category,
  question,
  option_a,
  option_b,
  option_c,
  option_d,
  correct_answer,
  explanation,
  difficulty
)
SELECT
  religion,
  category,
  question,
  option_a,
  option_b,
  option_c,
  option_d,
  correct_answer,
  explanation,
  difficulty
FROM new_questions nq
WHERE NOT EXISTS (
  SELECT 1
  FROM quiz_questions qq
  WHERE qq.religion = nq.religion
    AND qq.question = nq.question
);
