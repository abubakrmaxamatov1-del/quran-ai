-- Create Surahs table
CREATE TABLE surahs (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  number INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  englishName TEXT NOT NULL,
  englishNameTranslation TEXT NOT NULL,
  numberOfAyahs INTEGER NOT NULL,
  revelationType TEXT NOT NULL
);

-- Create Ayats table
CREATE TABLE ayats (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  surah_number INTEGER REFERENCES surahs(number),
  number INTEGER NOT NULL,
  text TEXT NOT NULL,
  translation TEXT NOT NULL,
  tafsir TEXT,
  audio_url TEXT
);

-- Create User Profiles table for Telegram linking
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  telegram_id BIGINT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE surahs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ayats ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Public read access for Surahs and Ayats
CREATE POLICY "Allow public read access for surahs" ON surahs FOR SELECT USING (true);
CREATE POLICY "Allow public read access for ayats" ON ayats FOR SELECT USING (true);

-- Profile policies
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
