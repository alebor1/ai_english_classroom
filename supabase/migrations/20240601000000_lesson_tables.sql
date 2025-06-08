-- supabase/migrations/20240601000000_lesson_tables.sql

-- Create lesson_sessions table
CREATE TABLE lesson_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  topic TEXT NOT NULL,
  level TEXT NOT NULL,
  status TEXT CHECK (status IN ('active', 'completed')) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create index on user_id for better performance
CREATE INDEX idx_lesson_sessions_user_id ON lesson_sessions(user_id);

-- Enable RLS for lesson_sessions
ALTER TABLE lesson_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy for user to access only their own lesson sessions
CREATE POLICY "Users can only access their own lesson sessions"
  ON lesson_sessions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create lesson_messages table
CREATE TABLE lesson_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES lesson_sessions(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('user', 'ai')) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create index on session_id for better performance
CREATE INDEX idx_lesson_messages_session_id ON lesson_messages(session_id);

-- Enable RLS for lesson_messages
ALTER TABLE lesson_messages ENABLE ROW LEVEL SECURITY;

-- Create policy for users to access only messages from their own sessions
CREATE POLICY "Users can only access messages from their own sessions"
  ON lesson_messages
  FOR ALL
  TO authenticated
  USING (
    session_id IN (
      SELECT id FROM lesson_sessions WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    session_id IN (
      SELECT id FROM lesson_sessions WHERE user_id = auth.uid()
    )
  );
