-- Add google_id column to books table
-- This column stores the Google Books API ID for duplicate detection
ALTER TABLE books 
ADD COLUMN IF NOT EXISTS google_id TEXT;

-- Optional: Add an index for faster lookups on google_id
CREATE INDEX IF NOT EXISTS idx_books_google_id ON books(google_id);

-- Optional: Add a unique constraint per user (a user can't have the same google_id twice)
-- Note: This allows NULL values (multiple NULLs are allowed)
-- If you want stricter control, you might want a partial unique index:
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_books_user_google_id_unique 
-- ON books(user_id, google_id) 
-- WHERE google_id IS NOT NULL;

