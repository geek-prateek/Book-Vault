-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- Add social link columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS github_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS youtube_url TEXT;

-- Add hidden_from_profile column to books table
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS hidden_from_profile BOOLEAN DEFAULT false;
