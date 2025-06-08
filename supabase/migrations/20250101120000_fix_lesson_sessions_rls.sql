-- supabase/migrations/20250101120000_fix_lesson_sessions_rls.sql

-- Drop existing policies to recreate them with better naming and clarity
DROP POLICY IF EXISTS "Users can only access their own lesson sessions" ON lesson_sessions;
DROP POLICY IF EXISTS "Users can only access messages from their own sessions" ON lesson_messages;

-- Recreate lesson_sessions policies with explicit operations
CREATE POLICY "users_select_own_sessions"
  ON lesson_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_sessions"
  ON lesson_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_sessions"
  ON lesson_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_delete_own_sessions"
  ON lesson_sessions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Recreate lesson_messages policies with explicit operations
CREATE POLICY "users_select_own_messages"
  ON lesson_messages
  FOR SELECT
  TO authenticated
  USING (
    session_id IN (
      SELECT id FROM lesson_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "users_insert_own_messages"
  ON lesson_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    session_id IN (
      SELECT id FROM lesson_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "users_update_own_messages"
  ON lesson_messages
  FOR UPDATE
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

CREATE POLICY "users_delete_own_messages"
  ON lesson_messages
  FOR DELETE
  TO authenticated
  USING (
    session_id IN (
      SELECT id FROM lesson_sessions WHERE user_id = auth.uid()
    )
  );