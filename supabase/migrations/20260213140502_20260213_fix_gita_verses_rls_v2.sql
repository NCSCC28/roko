/*
  # Fix Gita Verses RLS Policy - Remove restrictive SELECT

  1. Changes
    - Drop the existing SELECT policy with USING clause
    - Keep SELECT accessible to everyone via permissive policy
    - Ensure INSERT and UPDATE work without USING clause issues
*/

DROP POLICY IF EXISTS "Anyone can view Gita verses" ON gita_verses;
DROP POLICY IF EXISTS "Anyone can insert Gita verses" ON gita_verses;
DROP POLICY IF EXISTS "Anyone can update Gita verses" ON gita_verses;

-- Create new non-restrictive policies
CREATE POLICY "Public can read gita verses"
  ON gita_verses FOR SELECT
  USING (true);

CREATE POLICY "Public can insert gita verses"
  ON gita_verses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update gita verses"
  ON gita_verses FOR UPDATE
  USING (true)
  WITH CHECK (true);
