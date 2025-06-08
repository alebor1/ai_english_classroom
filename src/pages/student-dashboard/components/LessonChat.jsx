// src/pages/student-dashboard/components/LessonChat.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Button from 'components/ui/Button';
import Icon from 'components/AppIcon';
import useSpeechRecognition from 'hooks/useSpeechRecognition';
import useTextToSpeech from 'hooks/useTextToSpeech';
import { useSupabase } from 'context/SupabaseContext';

const LessonChat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionId } = useParams();
  const { 
    getLessonSessionById,
    getLessonMessages,
    generateLessonTurn,
    updateLessonSessionStatus,
    user,
    initialized
  } = useSupabase();
  
  // State management
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [pendingText, setPendingText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [showEndLessonMenu, setShowEndLessonMenu] = useState(false);
  
  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Speech recognition hook
  const { 
    text: recognizedText, 
    listening, 
    supported: speechRecognitionSupported,
    start: startListening, 
    stop: stopListening,
    reset: resetSpeech
  } = useSpeechRecognition();

  // Text-to-speech hook
  const { play, speaking } = useTextToSpeech();

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
          text: msg?.content,
          role: msg?.role,
          timestamp: msg?.created_at,
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
    if (recognizedText) {
      setPendingText(recognizedText);
    }
  }, [recognizedText]);

  // Auto-scroll to newest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  // Handle microphone toggle
  const handleMicToggle = () => {
    if (listening) {
      stopListening();
      if (pendingText) {
        setInputText(pendingText);
        setPendingText('');
        resetSpeech();
      }
    } else {
      setPendingText('');
      resetSpeech();
      startListening();
    }
  };

  // Handle send message
  const handleSend = async () => {
    const messageText = inputText.trim() || pendingText.trim();
    if (!messageText || !sessionId) return;

    const userMessage = {
      id: `temp-${Date.now()}`,
      text: messageText,
      role: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setPendingText('');
    resetSpeech();
    setIsProcessing(true);
    setError(null);

    try {
      const response = await generateLessonTurn(sessionId, messageText);
      
      if (response?.aiMessage) {
        const aiMessage = {
          id: `ai-${Date.now()}`,
          text: response.aiMessage,
          role: 'ai',
          timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, aiMessage]);
        
        try {
          await play(response.aiMessage);
        } catch (ttsError) {
          console.warn('TTS playback failed:', ttsError);
        }
        
        if (response.status === 'completed') {
          setLessonCompleted(true);
        }
      }
    } catch (err) {
      console.error('Error generating lesson turn:', err);
      setError(err?.message || 'Failed to generate AI response');
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
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

  // Handle bubble click to replay TTS
  const handleBubbleClick = (message) => {
    if (message?.role === 'ai' && message?.text) {
      play(message.text).catch(err => {
        console.warn('TTS replay failed:', err);
      });
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
    <div className="flex flex-col h-screen bg-background">
      {/* Fixed Header */}
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

      {/* Scrollable Message List */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages?.length === 0 && (
          <div className="text-center py-8">
            <Icon name="MessageSquare" size={48} className="text-text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">Start Your Conversation</h3>
            <p className="text-text-secondary">Type a message or use the microphone to begin practicing English!</p>
          </div>
        )}
        
        {messages?.map((message) => (
          <div 
            key={message?.id} 
            className={`flex ${message?.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
                message?.role === 'user' ?'bg-primary text-white rounded-br-none' :'bg-surface border border-border rounded-bl-none shadow-sm hover:bg-background'
              }`}
              onClick={() => handleBubbleClick(message)}
            >
              <p className="whitespace-pre-wrap">{message?.text}</p>
              <div className={`text-xs mt-1 text-right ${
                message?.role === 'user' ? 'text-primary-100' : 'text-text-secondary'
              }`}>
                {message?.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                }) : ''}
              </div>
            </div>
          </div>
        ))}
        
        {/* Loading Spinner for AI Response */}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-surface border border-border rounded-lg rounded-bl-none p-3 shadow-sm max-w-[80%]">
              <div className="flex space-x-2 items-center">
                <div className="w-2 h-2 rounded-full bg-text-secondary animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-text-secondary animate-pulse delay-75"></div>
                <div className="w-2 h-2 rounded-full bg-text-secondary animate-pulse delay-150"></div>
                <span className="text-sm text-text-secondary ml-2">AI is typing...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Footer with Input */}
      <div className="bg-surface border-t border-border p-4 flex-shrink-0">
        <div className="flex items-end space-x-2">
          <div className="flex-grow relative">
            <textarea
              ref={inputRef}
              className="w-full border border-border rounded-lg p-3 pr-10 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-surface text-text-primary placeholder-text-secondary"
              placeholder={speechRecognitionSupported ? "Type or speak your message..." : "Type your message..."}
              value={listening ? pendingText : inputText}
              onChange={(e) => {
                if (!listening) {
                  setInputText(e.target.value);
                }
              }}
              onKeyDown={handleKeyDown}
              rows={2}
              disabled={listening || lessonCompleted}
            />
            
            {/* Speaking indicator */}
            {speaking && (
              <div className="absolute right-3 bottom-3 text-primary">
                <Icon name="Volume2" className="animate-pulse" size={20} />
              </div>
            )}
          </div>
          
          {/* Microphone button */}
          {speechRecognitionSupported && (
            <Button
              onClick={handleMicToggle}
              variant={listening ? "error" : "outline"}
              className={`h-12 w-12 rounded-full p-0 flex items-center justify-center transition-all duration-200 ${
                listening ? 'shadow-lg shadow-error/25 animate-pulse' : ''
              }`}
              iconName={listening ? "MicOff" : "Mic"}
              title={listening ? "Stop listening" : "Start listening"}
              disabled={isProcessing || lessonCompleted}
            />
          )}
          
          {/* Send button */}
          <Button
            onClick={handleSend}
            className="h-12 w-12 rounded-full p-0 flex items-center justify-center"
            disabled={(!inputText.trim() && !pendingText.trim()) || isProcessing || lessonCompleted}
            iconName="Send"
            title="Send message"
          />
        </div>
        
        {/* Recording indicator */}
        {listening && (
          <div className="mt-2 text-xs text-primary flex items-center">
            <span className="animate-pulse mr-1 w-2 h-2 bg-primary rounded-full"></span>
            <span>Listening... Tap the microphone again to stop and send</span>
          </div>
        )}
        
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
      </div>
      
      {/* Click outside handler for end lesson menu */}
      {showEndLessonMenu && (
        <div 
          className="fixed inset-0 z-5"
          onClick={() => setShowEndLessonMenu(false)}
        />
      )}
    </div>
  );
};

export default LessonChat;