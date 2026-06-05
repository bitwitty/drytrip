-- Add voted_city column to waitlist table
-- Nullable — existing rows and signups without a vote remain NULL
-- Run in Supabase SQL Editor
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS voted_city TEXT;
