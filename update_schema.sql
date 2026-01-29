-- Add missing columns to website_content table
ALTER TABLE website_content 
ADD COLUMN IF NOT EXISTS about_us_json JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS peace_education_json JSONB DEFAULT '{}';

-- Optional: Update the row with ID 1 to ensure it has empty objects if null
UPDATE website_content 
SET 
  about_us_json = COALESCE(about_us_json, '{}'),
  peace_education_json = COALESCE(peace_education_json, '{}')
WHERE id = 1;