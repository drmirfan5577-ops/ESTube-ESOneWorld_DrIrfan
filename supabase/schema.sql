-- ESTube Database Schema (ESOneWorld)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  handle TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT false,
  subscribers_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES profiles(id),
  title TEXT,
  description TEXT,
  thumbnail_url TEXT,
  video_url TEXT,
  hls_url TEXT,
  resolution TEXT DEFAULT '1080p',
  duration_sec INT DEFAULT 0,
  status TEXT DEFAULT 'ready',
  visibility TEXT DEFAULT 'public',
  category TEXT,
  views_count BIGINT DEFAULT 0,
  likes_count INT DEFAULT 0,
  is_live BOOLEAN DEFAULT false,
  live_stream_url TEXT,
  published_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES videos(id),
  author_id UUID REFERENCES profiles(id),
  body TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE likes (
  user_id UUID, video_id UUID,
  PRIMARY KEY (user_id, video_id)
);

CREATE TABLE subscriptions (
  subscriber_id UUID, channel_id UUID,
  PRIMARY KEY (subscriber_id, channel_id)
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES profiles(id),
  receiver_id UUID REFERENCES profiles(id),
  body TEXT,
  media_type TEXT,
  media_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE video_events (
  id BIGSERIAL PRIMARY KEY,
  video_id UUID,
  viewer_id UUID,
  event_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "public videos" ON videos FOR SELECT USING (true);
CREATE POLICY "insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "auth insert video" ON videos FOR INSERT WITH CHECK (auth.uid() = channel_id);
CREATE POLICY "auth send message" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "auth read messages" ON messages FOR SELECT USING (auth.uid() IN (sender_id, receiver_id));