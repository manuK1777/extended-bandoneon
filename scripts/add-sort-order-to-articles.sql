-- Add sort_order column to articles table for controlling display order
ALTER TABLE articles ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;

-- Create index for efficient sorting
CREATE INDEX IF NOT EXISTS idx_articles_sort_order ON articles (sort_order);

-- Set initial sort_order values based on current ID order (descending)
-- This preserves the current display order
UPDATE articles SET sort_order = id * 10;
