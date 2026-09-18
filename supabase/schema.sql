-- Run this in the Supabase SQL Editor.

-- Create users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT DEFAULT 'free',
  subscription_status TEXT,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create uploads table
CREATE TABLE uploads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  csv_data TEXT,
  duplicates_found INTEGER DEFAULT 0,
  total_transactions INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create duplicates table
CREATE TABLE duplicates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  upload_id UUID REFERENCES uploads(id) ON DELETE CASCADE,
  vendor TEXT,
  amount NUMERIC,
  confidence_score NUMERIC,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_uploads_user_id ON uploads(user_id);
CREATE INDEX idx_duplicates_upload_id ON duplicates(upload_id);

-- Lock the tables down. The anon key ships to the browser, so without RLS
-- anyone could read every user's uploaded CSV data. All server code uses the
-- service key, which bypasses RLS, so no policies are needed yet.
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE duplicates ENABLE ROW LEVEL SECURITY;
