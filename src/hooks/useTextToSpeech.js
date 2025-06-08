// /home/ubuntu/app/ai_english_classroom/src/hooks/useTextToSpeech.js
import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for text-to-speech functionality using Web Speech API
 * @param {Object} options - Configuration options
 * @param {string} options.voice - Voice name or identifier (default: from localStorage or first available)
 * @param {number} options.rate - Speech rate (0.1 to 10, default: 1)
 * @param {number} options.pitch - Speech pitch (0 to 2, default: 1)
 * @param {number} options.volume - Speech volume (0 to 1, default: 1)
 * @returns {Object} - Text-to-speech controls and state
 */
const useTextToSpeech = (options = {}) => {
  const [voices, setVoices] = useState([]);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState(null);
  const [supported, setSupported] = useState(true);
  const [paused, setPaused] = useState(false);
  
  // Get saved settings from localStorage or use defaults
  const savedVoice = localStorage.getItem('tts-voice');
  const savedRate = parseFloat(localStorage.getItem('tts-rate')) || 1;
  const savedPitch = parseFloat(localStorage.getItem('tts-pitch')) || 1;
  const savedVolume = parseFloat(localStorage.getItem('tts-volume')) || 1;

  const {
    voice = savedVoice,
    rate = savedRate,
    pitch = savedPitch,
    volume = savedVolume,
  } = options;

  const synthesisRef = useRef(null);
  const utteranceRef = useRef(null);
  const activePromiseRef = useRef(null);
  const isPlayingRef = useRef(false);
  const retryTimeoutRef = useRef(null);

  // Check if browser supports speech synthesis
  useEffect(() => {
    if (!window.speechSynthesis) {
      setSupported(false);
      setError('Text-to-speech is not supported in this browser.');
      return;
    }
    
    synthesisRef.current = window.speechSynthesis;
    
    // Get available voices
    const updateVoices = () => {
      const availableVoices = synthesisRef.current.getVoices();
      setVoices(availableVoices);
    };
    
    // Chrome loads voices asynchronously
    if (synthesisRef.current.onvoiceschanged !== undefined) {
      synthesisRef.current.onvoiceschanged = updateVoices;
    }
    
    updateVoices();
    
    // Handle page visibility changes to prevent interruption errors
    const handleVisibilityChange = () => {
      if (document.hidden && isPlayingRef.current) {
        // Page is hidden, pause or stop speech to prevent interruption
        if (synthesisRef.current?.speaking) {
          synthesisRef.current.pause();
          setPaused(true);
        }
      } else if (!document.hidden && paused && synthesisRef.current?.paused) {
        // Page is visible again, resume speech
        synthesisRef.current.resume();
        setPaused(false);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Clean up
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (synthesisRef.current) {
        synthesisRef.current.cancel();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [paused]);

  // Function to find the voice by name
  const findVoice = useCallback((voiceName) => {
    if (!voiceName || voices.length === 0) return null;
    
    // Try to find by name first
    return voices.find(v => 
      v.name === voiceName || 
      v.voiceURI === voiceName ||
      v.lang === voiceName
    ) || null;
  }, [voices]);

  // Clear error after a delay
  const clearError = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    retryTimeoutRef.current = setTimeout(() => {
      setError(null);
    }, 5000);
  }, []);

  // Play text as speech with improved error handling
  const play = useCallback((text, overrideOptions = {}) => {
    if (!supported || !text) {
      const errorMsg = !supported ? 'Speech synthesis not supported' : 'No text provided';
      return Promise.reject(new Error(errorMsg));
    }
    
    // Cancel any ongoing speech
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
    }

    // Cancel any active promise
    if (activePromiseRef.current) {
      activePromiseRef.current = null;
    }

    const promise = new Promise((resolve, reject) => {
      try {
        const mergedOptions = {
          voice: overrideOptions.voice || voice,
          rate: overrideOptions.rate || rate,
          pitch: overrideOptions.pitch || pitch,
          volume: overrideOptions.volume || volume,
        };

        utteranceRef.current = new SpeechSynthesisUtterance(text);
        
        // Configure speech settings
        utteranceRef.current.rate = Math.max(0.1, Math.min(10, mergedOptions.rate));
        utteranceRef.current.pitch = Math.max(0, Math.min(2, mergedOptions.pitch));
        utteranceRef.current.volume = Math.max(0, Math.min(1, mergedOptions.volume));
        
        // Set the voice if available
        const selectedVoice = findVoice(mergedOptions.voice);
        if (selectedVoice) {
          utteranceRef.current.voice = selectedVoice;
        }
        
        // Event handlers with improved error handling
        utteranceRef.current.onstart = () => {
          if (activePromiseRef.current === promise) {
            setSpeaking(true);
            setPaused(false);
            isPlayingRef.current = true;
            setError(null);
          }
        };
        
        utteranceRef.current.onend = () => {
          if (activePromiseRef.current === promise) {
            setSpeaking(false);
            setPaused(false);
            isPlayingRef.current = false;
            activePromiseRef.current = null;
            resolve();
          }
        };
        
        utteranceRef.current.onpause = () => {
          if (activePromiseRef.current === promise) {
            setPaused(true);
          }
        };
        
        utteranceRef.current.onresume = () => {
          if (activePromiseRef.current === promise) {
            setPaused(false);
          }
        };
        
        utteranceRef.current.onerror = (event) => {
          if (activePromiseRef.current === promise) {
            setSpeaking(false);
            setPaused(false);
            isPlayingRef.current = false;
            activePromiseRef.current = null;
            
            // Handle different error types
            let errorMessage = 'Speech synthesis error';
            switch (event.error) {
              case 'interrupted':
                errorMessage = 'Speech was interrupted. This may happen when the page loses focus or another speech starts.';
                break;
              case 'network':
                errorMessage = 'Network error occurred during speech synthesis.';
                break;
              case 'synthesis-failed':
                errorMessage = 'Speech synthesis failed. Please try again.';
                break;
              case 'synthesis-unavailable':
                errorMessage = 'Speech synthesis is unavailable. Please check your browser settings.';
                break;
              case 'audio-busy':
                errorMessage = 'Audio system is busy. Please wait and try again.';
                break;
              case 'not-allowed':
                errorMessage = 'Speech synthesis not allowed. Please check permissions.';
                break;
              default:
                errorMessage = `Speech synthesis error: ${event.error}`;
            }
            
            setError(errorMessage);
            clearError();
            
            // For interruption errors, resolve instead of reject to avoid breaking the flow
            if (event.error === 'interrupted') {
              console.warn('Speech synthesis was interrupted:', errorMessage);
              resolve(); // Resolve gracefully for interruptions
            } else {
              reject(new Error(errorMessage));
            }
          }
        };
        
        // Set this as the active promise
        activePromiseRef.current = promise;
        
        // Start speaking with a small delay to ensure proper initialization
        setTimeout(() => {
          if (activePromiseRef.current === promise && synthesisRef.current) {
            try {
              synthesisRef.current.speak(utteranceRef.current);
            } catch (speakError) {
              if (activePromiseRef.current === promise) {
                setSpeaking(false);
                isPlayingRef.current = false;
                activePromiseRef.current = null;
                setError(`Failed to start speech: ${speakError.message}`);
                clearError();
                reject(speakError);
              }
            }
          }
        }, 10);
        
      } catch (err) {
        setSpeaking(false);
        isPlayingRef.current = false;
        activePromiseRef.current = null;
        const errorMessage = `Error in speech synthesis: ${err.message}`;
        setError(errorMessage);
        clearError();
        reject(err);
      }
    });

    return promise;
  }, [supported, voice, rate, pitch, volume, findVoice, clearError]);

  // Stop speaking
  const stop = useCallback(() => {
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
      setSpeaking(false);
      setPaused(false);
      isPlayingRef.current = false;
      activePromiseRef.current = null;
    }
  }, []);

  // Pause speaking
  const pause = useCallback(() => {
    if (synthesisRef.current && speaking && !paused) {
      synthesisRef.current.pause();
      setPaused(true);
    }
  }, [speaking, paused]);

  // Resume speaking
  const resume = useCallback(() => {
    if (synthesisRef.current && speaking && paused) {
      synthesisRef.current.resume();
      setPaused(false);
    }
  }, [speaking, paused]);

  // Get the current voice object
  const currentVoice = findVoice(voice) || (voices.length > 0 ? voices[0] : null);

  return {
    voices,
    speaking,
    paused,
    supported,
    error,
    currentVoice,
    play,
    stop,
    pause,
    resume,
    settings: {
      voice,
      rate,
      pitch,
      volume
    }
  };
};

export default useTextToSpeech;