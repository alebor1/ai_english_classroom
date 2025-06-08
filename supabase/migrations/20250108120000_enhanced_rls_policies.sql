-- supabase/migrations/20250108120000_enhanced_rls_policies.sql

-- Drop existing policies to recreate with better error handling
DROP POLICY IF EXISTS "users_select_own_sessions" ON lesson_sessions;
DROP POLICY IF EXISTS "users_insert_own_sessions" ON lesson_sessions;
DROP POLICY IF EXISTS "users_update_own_sessions" ON lesson_sessions;
DROP POLICY IF EXISTS "users_delete_own_sessions" ON lesson_sessions;
DROP POLICY IF EXISTS "users_select_own_messages" ON lesson_messages;
DROP POLICY IF EXISTS "users_insert_own_messages" ON lesson_messages;
DROP POLICY IF EXISTS "users_update_own_messages" ON lesson_messages;
DROP POLICY IF EXISTS "users_delete_own_messages" ON lesson_messages;

-- Enhanced lesson_sessions policies with better authentication checks
CREATE POLICY "authenticated_users_select_own_sessions"
  ON lesson_sessions
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id
  );

CREATE POLICY "authenticated_users_insert_own_sessions"
  ON lesson_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id
  );

CREATE POLICY "authenticated_users_update_own_sessions"
  ON lesson_sessions
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id
  )
  WITH CHECK (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id
  );

CREATE POLICY "authenticated_users_delete_own_sessions"
  ON lesson_sessions
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id
  );

-- Enhanced lesson_messages policies with better session ownership checks
CREATE POLICY "authenticated_users_select_own_messages"
  ON lesson_messages
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND
    session_id IN (
      SELECT id FROM lesson_sessions 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "authenticated_users_insert_own_messages"
  ON lesson_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    session_id IN (
      SELECT id FROM lesson_sessions 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "authenticated_users_update_own_messages"
  ON lesson_messages
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND
    session_id IN (
      SELECT id FROM lesson_sessions 
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    session_id IN (
      SELECT id FROM lesson_sessions 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "authenticated_users_delete_own_messages"
  ON lesson_messages
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND
    session_id IN (
      SELECT id FROM lesson_sessions 
      WHERE user_id = auth.uid()
    )
  );

-- Add helpful functions for debugging
CREATE OR REPLACE FUNCTION debug_auth_context()
RETURNS TABLE(
  current_user_id UUID,
  current_role TEXT,
  is_authenticated BOOLEAN
) AS $$
BEGIN
  RETURN QUERY SELECT 
    auth.uid() as current_user_id,
    auth.role() as current_role,
    (auth.uid() IS NOT NULL) as is_authenticated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION debug_auth_context() TO authenticated;

-- Add indexes for better performance on auth queries
CREATE INDEX IF NOT EXISTS idx_lesson_sessions_user_auth 
  ON lesson_sessions(user_id) 
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_lesson_messages_session_auth 
  ON lesson_messages(session_id) 
  WHERE session_id IS NOT NULL;