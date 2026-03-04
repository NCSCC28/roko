-- Integrate imported bible_dataset data into app table bible_verses.
-- Source migration: 20260221190000_import_bible_dataset_raw.sql

INSERT INTO bible_verses (book, chapter, verse, text, testament, audio_url)
SELECT
  trim(book) AS book,
  trim(chapter)::integer AS chapter,
  trim(verse)::integer AS verse,
  trim(regexp_replace(text, E'[\r\n\t]+', ' ', 'g')) AS text,
  CASE
    WHEN trim(book) = ANY (
      ARRAY[
        'Genesis','Exodus','Leviticus','Numbers','Deuteronomy',
        'Joshua','Judges','Ruth',
        '1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles',
        'Ezra','Nehemiah','Esther','Job','Psalms','Proverbs','Ecclesiastes','Song of Solomon',
        'Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel',
        'Hosea','Joel','Amos','Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi'
      ]
    )
      THEN 'Old'
    ELSE 'New'
  END AS testament,
  '' AS audio_url
FROM bible_dataset
WHERE
  trim(book) <> ''
  AND trim(chapter) ~ '^[0-9]+$'
  AND trim(verse) ~ '^[0-9]+$'
ON CONFLICT (book, chapter, verse) DO UPDATE
SET
  text = EXCLUDED.text,
  testament = EXCLUDED.testament;
