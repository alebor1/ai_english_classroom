// src/pages/student-dashboard/components/LessonChat.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Button from 'components/ui/Button';
import Icon from 'components/AppIcon';
import useSpeechRecognition from 'hooks/useSpeechRecognition';
import useTextToSpeech from 'hooks/useTextToSpeech';
import { useSupabase } from 'context/SupabaseContext';
import { askAI } from 'lib/askAI';

const LessonChat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionId } = useParams();
  const { 
    getLessonSessionById,
    getLessonMessages,
    updateLessonSessionStatus,
    user,
    initialized
  } = useSupabase();
  
  // State management
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [showEndLessonMenu, setShowEndLessonMenu] = useState(false);
  
  // Refs
  const listRef = useRef(null);
  const inputRef = useRef(null);

  // Speech recognition hook
  const { 
    transcript, 
    listening, 
    supported: speechRecognitionSupported,
    start, 
    stop,
    resetTranscript
  } = useSpeechRecognition();

  // Text-to-speech hook
  const { play } = useTextToSpeech();

  // Route guard and session validation
  useEffect(() => {
    const validateSession = async () => {
      // Check if authentication is initialized
      if (!initialized) {
        return; // Wait for initialization
      }

      // Validate sessionId parameter
      if (!sessionId) {
        navigate('/student-dashboard', {
          state: { 
            showToast: true, 
            toastMessage: 'Invalid lesson session.', 
            toastType: 'error' 
          }
        });
        return;
      }

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(sessionId)) {
        console.error('Invalid UUID format for sessionId:', sessionId);
        navigate('/student-dashboard', {
          state: { 
            showToast: true, 
            toastMessage: 'Invalid lesson session format.', 
            toastType: 'error' 
          }
        });
        return;
      }

      // Check if user is authenticated
      if (!user?.id) {
        navigate('/user-login', {
          state: { 
            from: `/lesson-chat/${sessionId}`,
            message: 'Please log in to access your lesson.'
          }
        });
        return;
      }

      try {
        const sessionData = await getLessonSessionById(sessionId);
        
        // Check if session exists and belongs to current user
        if (!sessionData || sessionData.user_id !== user.id) {
          navigate('/student-dashboard', {
            state: { 
              showToast: true, 
              toastMessage: 'Lesson not found or access denied.', 
              toastType: 'error' 
            }
          });
          return;
        }
        
        // Check if session is completed
        if (sessionData.status === 'completed') {
          navigate('/student-dashboard', {
            state: { 
              showToast: true, 
              toastMessage: 'This lesson has already been completed.', 
              toastType: 'info' 
            }
          });
          return;
        }
        
        setSession(sessionData);
      } catch (err) {
        console.error('Error validating session:', err);
        navigate('/student-dashboard', {
          state: { 
            showToast: true, 
            toastMessage: err?.message || 'Failed to load lesson session.', 
            toastType: 'error' 
          }
        });
      }
    };

    validateSession();
  }, [sessionId, user?.id, initialized, getLessonSessionById, navigate]);

  // Load session messages
  useEffect(() => {
    const loadSessionData = async () => {
      if (!sessionId || !session || !initialized) {
        return;
      }

      try {
        setError(null);
        const messagesData = await getLessonMessages(sessionId);
        const formattedMessages = messagesData?.map(msg => ({
          id: msg?.id,
          role: msg?.role,
          content: msg?.content,
        })) || [];
        
        setMessages(formattedMessages);
      } catch (err) {
        console.error('Error loading session data:', err);
        setError(err?.message || 'Failed to load lesson messages');
      } finally {
        setLoading(false);
      }
    };

    if (session && initialized) {
      loadSessionData();
    }
  }, [session, sessionId, initialized, getLessonMessages]);

  // Update input field when speech is recognized
  useEffect(() => {
    if (transcript) {
      setInputText(transcript);
    }
  }, [transcript]);

  // Auto-scroll to newest message
  useEffect(() => {
    listRef.current?.scrollTo(0, listRef.current.scrollHeight);
  }, [messages]);

  // Check for lesson completion based on message count threshold
  useEffect(() => {
    const checkLessonProgress = async () => {
      if (lessonCompleted || !session || !sessionId) return;
      
      if (messages.length >= 20 && session?.status !== 'completed') {
        try {
          await updateLessonSessionStatus(sessionId, 'completed');
          setLessonCompleted(true);
        } catch (err) {
          console.error('Error updating lesson status:', err);
        }
      }
    };
    
    checkLessonProgress();
  }, [messages.length, sessionId, session?.status, lessonCompleted, updateLessonSessionStatus, session]);

  // Redirect to dashboard when lesson is completed
  useEffect(() => {
    if (lessonCompleted) {
      const redirectTimer = setTimeout(() => {
        navigate('/student-dashboard', { 
          state: { 
            showToast: true, 
            toastMessage: 'Lesson finished 🎉', 
            toastType: 'success' 
          } 
        });
      }, 2000);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [lessonCompleted, navigate]);

  // Toast Error helper
  const toastError = (message) => {
    setError(message);
  };

  // Send message function
  const sendMessage = async (text) => {
    const tmpId = crypto.randomUUID();
    setMessages(m => [...m, { id: tmpId, role: 'user', content: text }]);
    try {
      const ai = await askAI(sessionId, text);
      setMessages(m => [
        ...m.filter(msg => msg.id !== tmpId),
        { id: crypto.randomUUID(), role: 'user', content: text },
        { id: crypto.randomUUID(), role: 'ai', content: ai }
      ]);
      await play(ai);
    } catch (err) { 
      toastError(err.message); 
    }
  };

  // Handle microphone toggle
  const handleMicToggle = () => {
    if (listening) {
      stop();
    } else {
      resetTranscript();
      start();
    }
  };

  // Handle send message
  const handleSend = async () => {
    const messageText = inputText.trim();
    if (!messageText || !sessionId) return;

    setInputText('');
    resetTranscript();
    setIsProcessing(true);
    setError(null);

    try {
      await sendMessage(messageText);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle key down in input
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle end lesson
  const handleEndLesson = async () => {
    if (!sessionId) return;
    
    try {
      await updateLessonSessionStatus(sessionId, 'completed');
      navigate('/student-dashboard', {
        state: { 
          showToast: true, 
          toastMessage: 'Lesson finished 🎉', 
          toastType: 'success' 
        }
      });
    } catch (err) {
      console.error('Error ending lesson:', err);
      setError(err?.message || 'Failed to end lesson');
    }
  };

  // Show loading while authentication or session is being initialized
  if (!initialized || loading) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading lesson...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !session) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Icon name="AlertCircle" size={48} className="text-error mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-text-primary mb-2">Error</h2>
            <p className="text-text-secondary mb-4">{error}</p>
            <Button 
              onClick={() => navigate('/student-dashboard')}
              variant="primary"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Progress calculation
  const progress = messages?.length ? Math.min((messages.length / 20) * 100, 100) : 0;

  // Get display values
  const displayTopic = location.state?.topic || session?.topic || 'English Conversation';
  const displayLevel = session?.level || 'Intermediate';

  return (
    <div className="flex flex-col h-full">
      <div className="bg-surface shadow-sm border-b border-border px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center min-w-0 flex-1">
            <button 
              onClick={() => navigate('/student-dashboard')}
              className="mr-3 text-text-secondary hover:text-text-primary transition-colors flex-shrink-0"
            >
              <Icon name="ArrowLeft" size={24} />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-semibold text-text-primary truncate">
                Level: {displayLevel} • Topic: {displayTopic}
              </h1>
              <p className="text-sm text-text-secondary">
                AI English Conversation
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0 relative">
            <Button 
              variant="ghost" 
              iconName="Settings"
              onClick={() => navigate('/speech-settings-modal')}
              title="Speech Settings"
              size="sm"
            />
            <Button 
              variant="outline" 
              iconName="MoreVertical"
              title="More Options"
              size="sm"
              onClick={() => setShowEndLessonMenu(!showEndLessonMenu)}
            />
            
            {/* End Lesson Menu */}
            {showEndLessonMenu && (
              <div className="absolute top-full right-0 mt-2 bg-surface border border-border rounded-lg shadow-lg z-10 min-w-[160px]">
                <button
                  onClick={() => {
                    setShowEndLessonMenu(false);
                    handleEndLesson();
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-error hover:bg-error/10 rounded-lg flex items-center"
                >
                  <Icon name="XCircle" size={16} className="mr-2" />
                  End Lesson
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-text-secondary mb-1">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-border-light rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        {/* Lesson completion banner */}
        {lessonCompleted && (
          <div className="mt-3 bg-success/10 border border-success/30 text-success rounded-lg px-4 py-3 flex items-center justify-between">
            <div className="flex items-center">
              <Icon name="CheckCircle" className="mr-2" />
              <span>Lesson completed! Redirecting to dashboard...</span>
            </div>
            <div className="animate-spin h-4 w-4 border-2 border-success border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto flex flex-col gap-4 px-4 py-6">
        {messages.map(m => (
          <p key={m.id}
             className={`max-w-xs rounded-3xl px-4 py-2 text-sm
               ${m.role==='user' ?'self-end bg-primary text-white' :'self-start bg-muted/20 text-muted-foreground'}`}>
             {m.content}
          </p>
        ))}
      </div>

      <footer className="p-4">
        <div className="relative">
          <input 
            ref={inputRef}
            className="w-full border rounded-full px-4 py-3 pr-14"
            placeholder={speechRecognitionSupported ? "Type or speak your message..." : "Type your message..."}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isProcessing || lessonCompleted}
          />
          <button
             onClick={listening ? stop : start}
             className="absolute right-3 top-1/2 -translate-y-1/2 z-50">
            <Icon name={listening?'Mic':'MicOff'} size={20}/>
          </button>
        </div>
        
        {/* Error display */}
        {error && (
          <div className="mt-2 text-xs text-error flex items-center">
            <Icon name="AlertCircle" size={16} className="mr-1" />
            <span>{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-2 text-error hover:text-error/80"
            >
              <Icon name="X" size={14} />
            </button>
          </div>
        )}
      </footer>
    </div>
  );
};

export default LessonChat;