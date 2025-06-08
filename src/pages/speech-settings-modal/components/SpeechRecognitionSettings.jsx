// /home/ubuntu/app/ai_english_classroom/src/pages/speech-settings-modal/components/SpeechRecognitionSettings.jsx
import React, { useState, useEffect } from 'react';
import Button from 'components/ui/Button';
import useSpeechRecognition from 'hooks/useSpeechRecognition';

const SpeechRecognitionSettings = () => {
  // List of available languages for speech recognition
  const availableLanguages = [
    { code: 'en-US', name: 'English (United States)' },
    { code: 'en-GB', name: 'English (United Kingdom)' },
    { code: 'en-AU', name: 'English (Australia)' },
    { code: 'en-CA', name: 'English (Canada)' },
    { code: 'en-IN', name: 'English (India)' },
    { code: 'es-ES', name: 'Spanish (Spain)' },
    { code: 'es-MX', name: 'Spanish (Mexico)' },
    { code: 'fr-FR', name: 'French (France)' },
    { code: 'fr-CA', name: 'French (Canada)' },
    { code: 'de-DE', name: 'German (Germany)' },
    { code: 'it-IT', name: 'Italian (Italy)' },
    { code: 'ja-JP', name: 'Japanese (Japan)' },
    { code: 'ko-KR', name: 'Korean (South Korea)' },
    { code: 'zh-CN', name: 'Chinese (Simplified, China)' },
    { code: 'zh-TW', name: 'Chinese (Traditional, Taiwan)' },
    { code: 'ru-RU', name: 'Russian (Russia)' },
    { code: 'pt-BR', name: 'Portuguese (Brazil)' },
    { code: 'pt-PT', name: 'Portuguese (Portugal)' },
    // Add more languages as needed
  ];

  // Get saved language from localStorage or default to en-US
  const savedLanguage = localStorage.getItem('speech-recognition-language') || 'en-US';
  
  const [selectedLanguage, setSelectedLanguage] = useState(savedLanguage);
  const [continuousMode, setContinuousMode] = useState(
    localStorage.getItem('speech-recognition-continuous') === 'true'
  );
  const [noiseCancellation, setNoiseCancellation] = useState(
    localStorage.getItem('speech-recognition-noise-cancellation') !== 'false'
  );

  const { text, listening, start, stop, supported, error } = useSpeechRecognition({
    language: selectedLanguage,
    continuous: true,
  });

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('speech-recognition-language', selectedLanguage);
    localStorage.setItem('speech-recognition-continuous', continuousMode.toString());
    localStorage.setItem('speech-recognition-noise-cancellation', noiseCancellation.toString());
  }, [selectedLanguage, continuousMode, noiseCancellation]);

  const handleStartTest = () => {
    start();
  };

  const handleStopTest = () => {
    stop();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Speech Recognition Settings</h3>
        <p className="text-sm text-gray-500">
          Configure how the application recognizes your speech.
          {!supported && (
            <span className="block mt-2 text-error">
              Warning: Speech recognition is not supported in your browser. 
              Please use Chrome on desktop for the best experience.
            </span>
          )}
        </p>
      </div>

      {/* Language selection */}
      <div>
        <label className="block text-sm font-medium mb-2">Recognition Language</label>
        <select
          className="w-full rounded-md border border-gray-300 p-2"
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          disabled={!supported}
        >
          {availableLanguages.map(lang => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Select the language you'll be speaking in during lessons
        </p>
      </div>

      {/* Recognition Options */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium">Continuous Listening</label>
            <p className="text-xs text-gray-500">Keep listening after pauses in speech</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer"
              checked={continuousMode}
              onChange={(e) => setContinuousMode(e.target.checked)}
              disabled={!supported}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium">Noise Cancellation</label>
            <p className="text-xs text-gray-500">Filter out background noise</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer"
              checked={noiseCancellation}
              onChange={(e) => setNoiseCancellation(e.target.checked)}
              disabled={!supported}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
      </div>

      {/* Test Recognition */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-2">Test Recognition</label>
          <div className="border rounded-md p-4 min-h-[100px] bg-gray-50 relative">
            {listening && (
              <div className="absolute top-2 right-2 flex items-center">
                <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse mr-1"></span>
                <span className="text-xs font-medium">Listening...</span>
              </div>
            )}
            <p className={`${text ? '' : 'text-gray-400'}`}>
              {text || 'Speak after clicking "Start Test" to see your speech transcribed here...'}
            </p>
          </div>
          {error && <p className="text-xs text-error mt-1">{error}</p>}
        </div>

        <div className="flex space-x-2">
          <Button 
            onClick={handleStartTest} 
            className="flex-1"
            iconName="Mic"
            disabled={!supported || listening}
          >
            Start Test
          </Button>
          <Button 
            onClick={handleStopTest} 
            className="flex-1"
            variant="outline"
            iconName="MicOff"
            disabled={!supported || !listening}
          >
            Stop Test
          </Button>
        </div>
      </div>

      {/* Browser Support Info */}
      <div className="bg-accent/10 p-3 rounded-md">
        <h4 className="text-sm font-medium mb-1">Browser Compatibility</h4>
        <p className="text-xs text-gray-700">
          Speech recognition works best in Chrome, Edge, and Safari on desktop devices. 
          Mobile support varies by browser and device. Firefox requires enabling flags for this feature.
        </p>
      </div>
    </div>
  );
};

export default SpeechRecognitionSettings;