/*
  # Fix Gita Verses RLS Policy

  1. Changes
    - Add INSERT policy to allow data loading into gita_verses table
    - The policy will allow service role and authenticated users to insert
    
  2. Purpose
    - Enable population of Gita verses from CSV data
    - Maintain public read access for all users
*/

-- Add INSERT policy for gita_verses (allow authenticated users and service role)
CREATE POLICY "Anyone can insert Gita verses"
  ON gita_verses FOR INSERT
  WITH CHECK (true);

-- Add UPDATE policy for gita_verses
CREATE POLICY "Anyone can update Gita verses"
  ON gita_verses FOR UPDATE
  WITH CHECK (true);
