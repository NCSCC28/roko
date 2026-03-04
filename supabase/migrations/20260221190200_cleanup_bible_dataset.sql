-- Cleanup temporary import table after data is integrated into bible_verses.
-- Depends on: 20260221190100_integrate_bible_dataset_into_bible_verses.sql

DROP TABLE IF EXISTS bible_dataset;
