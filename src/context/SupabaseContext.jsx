// src/context/SupabaseContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const SupabaseContext = createContext();

export function SupabaseProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        }
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
          setInitialized(true);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
          
          // Handle auth events
          if (event === 'SIGNED_OUT') {
            // Clear any cached data when user signs out
            setUser(null);
            setSession(null);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Auth functions
  const signUp = async (email, password, options = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          ...options,
          emailRedirectTo: `${window.location.origin}/email-verification` // Update redirect to new verification page
        }
      });
      
      if (error) throw error;
      
      // Send welcome email with confirmation link
      if (data?.user) {
        try {
          await sendWelcomeEmail(data.user);
        } catch (emailError) {
          console.error('Error sending welcome email:', emailError);
          // Don't fail the signup if email sending fails
        }
      }
      
      return data;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const sendWelcomeEmail = async (user) => {
    try {
      const response = await axios({
        method: 'POST',
        url: `${supabaseUrl}/functions/v1/sendWelcomeEmail`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        data: JSON.stringify({ user })
      });
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return { data: null, error: error.message };
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signInWithProvider = async (provider) => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({ 
        provider,
        options: {
          redirectTo: window.location.origin + '/student-dashboard'
        }
      });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Sign in with ${provider} error:`, error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };
  
  // Email verification functions
  const verifyEmail = async (token, type = 'signup') => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type
      });
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  };
  
  const resendVerificationEmail = async (email) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email
      });
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error resending verification email:', error);
      throw error;
    }
  };

  // Authentication check helper
  const requireAuth = () => {
    if (!initialized) {
      throw new Error('Authentication not initialized yet');
    }
    if (!user?.id) {
      throw new Error('User must be authenticated to perform this action');
    }
    return user;
  };

  // Lesson session functions
  const createLessonSession = async (topic, level) => {
    try {
      const authenticatedUser = requireAuth();

      const { data, error } = await supabase
        .from('lesson_sessions')
        .insert({ 
          topic, 
          level, 
          status: 'active',
          user_id: authenticatedUser.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating lesson session:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error creating lesson session:', error.message);
      throw error;
    }
  };

  const getLessonSessions = async () => {
    try {
      const authenticatedUser = requireAuth();

      const { data, error } = await supabase
        .from('lesson_sessions')
        .select('*')
        .eq('user_id', authenticatedUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching lesson sessions:', error.message);
      throw error;
    }
  };

  const getLessonSessionById = async (sessionId) => {
    try {
      // Validate sessionId parameter
      if (!sessionId || typeof sessionId !== 'string') {
        throw new Error('Invalid session ID provided');
      }

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(sessionId)) {
        throw new Error(`Invalid UUID format for session ID: ${sessionId}`);
      }

      const authenticatedUser = requireAuth();

      const { data, error } = await supabase
        .from('lesson_sessions')
        .select('*, lesson_messages(*)')
        .eq('id', sessionId)
        .eq('user_id', authenticatedUser.id)
        .single();

      if (error) {
        console.error('Error fetching lesson session:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error fetching lesson session:', error.message);
      throw error;
    }
  };

  const updateLessonSessionStatus = async (sessionId, status) => {
    try {
      // Validate parameters
      if (!sessionId || typeof sessionId !== 'string') {
        throw new Error('Invalid session ID provided');
      }

      if (!status || !['active', 'completed'].includes(status)) {
        throw new Error('Invalid status provided');
      }

      const authenticatedUser = requireAuth();

      const { data, error } = await supabase
        .from('lesson_sessions')
        .update({ status })
        .eq('id', sessionId)
        .eq('user_id', authenticatedUser.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating lesson session status:', error.message);
      throw error;
    }
  };

  // Lesson message functions
  const addLessonMessage = async (sessionId, role, content) => {
    try {
      // Validate parameters
      if (!sessionId || typeof sessionId !== 'string') {
        throw new Error('Invalid session ID provided');
      }

      if (!role || !['user', 'ai'].includes(role)) {
        throw new Error('Invalid role provided');
      }

      if (!content || typeof content !== 'string') {
        throw new Error('Invalid content provided');
      }

      const authenticatedUser = requireAuth();

      // Verify session belongs to user before adding message
      const session = await getLessonSessionById(sessionId);
      if (!session) {
        throw new Error('Session not found or access denied');
      }

      const { data, error } = await supabase
        .from('lesson_messages')
        .insert({ session_id: sessionId, role, content })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding lesson message:', error.message);
      throw error;
    }
  };

  const getLessonMessages = async (sessionId) => {
    try {
      // Validate sessionId parameter
      if (!sessionId || typeof sessionId !== 'string') {
        throw new Error('Invalid session ID provided');
      }

      const authenticatedUser = requireAuth();

      // Verify session belongs to user before fetching messages
      const session = await getLessonSessionById(sessionId);
      if (!session) {
        throw new Error('Session not found or access denied');
      }

      const { data, error } = await supabase
        .from('lesson_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching lesson messages:', error.message);
      throw error;
    }
  };

  // Edge function calls
  const generateLessonTurn = async (sessionId, userMessage) => {
    try {
      // Validate parameters
      if (!sessionId || typeof sessionId !== 'string') {
        throw new Error('Invalid session ID provided');
      }

      if (!userMessage || typeof userMessage !== 'string') {
        throw new Error('Invalid user message provided');
      }

      const authenticatedUser = requireAuth();

      const { data, error } = await supabase.functions.invoke('generateLessonTurn', {
        body: { sessionId, userMessage },
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating lesson turn:', error.message);
      throw error;
    }
  };

  const synthesizeSpeech = async (text) => {
    try {
      // Validate parameter
      if (!text || typeof text !== 'string') {
        throw new Error('Invalid text provided for speech synthesis');
      }

      const authenticatedUser = requireAuth();

      const { data, error } = await supabase.functions.invoke('synthesizeSpeech', {
        body: { text },
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error synthesizing speech:', error.message);
      throw error;
    }
  };

  const value = {
    supabase,
    user,
    session,
    loading,
    initialized,
    signUp,
    signIn,
    signInWithProvider,
    signOut,
    resetPassword,
    sendWelcomeEmail,
    verifyEmail,
    resendVerificationEmail,
    requireAuth,
    createLessonSession,
    getLessonSessions,
    getLessonSessionById,
    updateLessonSessionStatus,
    addLessonMessage,
    getLessonMessages,
    generateLessonTurn,
    synthesizeSpeech
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
}

export { supabase };