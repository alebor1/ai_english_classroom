// /home/ubuntu/app/ai_english_classroom/src/hooks/useSpeechRecognition.js
import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for speech recognition using Web Speech API
 * @param {Object} options - Configuration options
 * @param {string} options.language - Recognition language (default: 'en-US')
 * @param {boolean} options.continuous - Whether recognition should continue after results (default: false)
 * @param {boolean} options.interimResults - Whether to return interim results (default: true)
 * @returns {Object} - Speech recognition controls and state
 */
const useSpeechRecognition = (options = {}) => {
  const {
    language = localStorage.getItem('speech-recognition-language') || 'en-US',
    continuous = false,
    interimResults = true,
  } = options;

  const [text, setText] = useState('');
  const [listening, setListening] = useState(false);
  const [error, setError] = useState(null);
  const [supported, setSupported] = useState(true);
  
  const recognitionRef = useRef(null);

  // Check if browser supports speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setSupported(false);
      setError('Speech recognition is not supported in this browser. Please use Chrome desktop.');
      return;
    }

    // Initialize recognition instance
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = continuous;
    recognitionRef.current.interimResults = interimResults;
    recognitionRef.current.lang = language;

    // Configure event handlers
    recognitionRef.current.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      
      setText(transcript);
    };

    recognitionRef.current.onerror = (event) => {
      setError(`Speech recognition error: ${event.error}`);
      setListening(false);
    };

    recognitionRef.current.onend = () => {
      if (listening) {
        // If we're supposed to be listening but it ended, restart
        try {
          recognitionRef.current.start();
        } catch (e) {
          // Ignore any errors when restarting
          setListening(false);
        }
      } else {
        setListening(false);
      }
    };

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors when stopping
        }
      }
    };
  }, [continuous, interimResults, language, listening]);

  // Start recognition
  const start = useCallback(() => {
    if (!supported) return;
    setText('');
    setError(null);
    
    try {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setListening(true);
      }
    } catch (e) {
      setError(`Error starting speech recognition: ${e.message}`);
    }
  }, [supported]);

  // Stop recognition
  const stop = useCallback(() => {
    if (!supported) return;
    
    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        setListening(false);
      }
    } catch (e) {
      setError(`Error stopping speech recognition: ${e.message}`);
    }
  }, [supported]);

  // Reset recognition and text
  const reset = useCallback(() => {
    setText('');
    setError(null);
  }, []);

  return {
    text,
    listening,
    supported,
    error,
    start,
    stop,
    reset,
  };
};

export default useSpeechRecognition;