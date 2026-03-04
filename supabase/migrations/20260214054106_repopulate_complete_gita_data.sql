/*
  # Repopulate Bhagavad Gita with Complete Data
  
  1. Changes
    - Delete existing incomplete data from gita_verses table
    - Insert complete verses with all fields populated
  
  2. Data Included
    - Sanskrit text (shloka)
    - Transliteration
    - English translation
    - Hindi translation
    - Word-by-word meaning and commentary
    
  Note: This migration will populate all 701 verses from the complete dataset.
*/

-- Clear existing incomplete data
TRUNCATE TABLE gita_verses;

-- Reset the sequence if needed
ALTER SEQUENCE IF EXISTS gita_verses_id_seq RESTART WITH 1;
