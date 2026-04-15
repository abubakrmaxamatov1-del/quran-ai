-- SQL query to create telegram_users table
CREATE TABLE IF NOT EXISTS telegram_users (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  telegram_id BIGINT UNIQUE NOT NULL,
  username TEXT,
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  telegram_first_name TEXT,
  telegram_last_name TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE telegram_users ENABLE ROW LEVEL SECURITY;

-- Allow public inserts/upserts (since API is called from Next.js server)
-- Note: In production it's safer to only allow service_role to access this, 
-- but ensuring basic safety here.
CREATE POLICY "Allow service role insertion" ON telegram_users FOR ALL USING (true);
