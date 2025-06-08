// /home/ubuntu/app/ai_english_classroom/src/pages/speech-settings-modal/components/TextToSpeechSettings.jsx
import React, { useState, useEffect } from 'react';
import Button from 'components/ui/Button';
import useTextToSpeech from 'hooks/useTextToSpeech';

const TextToSpeechSettings = () => {
  const { voices, play, settings } = useTextToSpeech();
  const [selectedVoice, setSelectedVoice] = useState(settings.voice || '');
  const [rate, setRate] = useState(settings.rate);
  const [pitch, setPitch] = useState(settings.pitch);
  const [volume, setVolume] = useState(settings.volume);
  const [testPhrase, setTestPhrase] = useState('Hello, this is a test of the text-to-speech system.');
  const [language, setLanguage] = useState('');
  const [filteredVoices, setFilteredVoices] = useState([]);

  // Group voices by language
  const voicesByLanguage = voices.reduce((acc, voice) => {
    const lang = voice.lang.split('-')[0];
    if (!acc[lang]) {
      acc[lang] = [];
    }
    acc[lang].push(voice);
    return acc;
  }, {});

  // List of language names
  const languageNames = {
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    it: 'Italian',
    ja: 'Japanese',
    ko: 'Korean',
    zh: 'Chinese',
    ru: 'Russian',
    ar: 'Arabic',
    hi: 'Hindi',
    pt: 'Portuguese',
    // Add more languages as needed
  };

  // Set filtered voices when language changes
  useEffect(() => {
    if (language === '') {
      setFilteredVoices(voices);
    } else {
      setFilteredVoices(voicesByLanguage[language] || []);
    }
  }, [language, voices, voicesByLanguage]);

  // Save settings to localStorage when they change
  useEffect(() => {
    if (selectedVoice) {
      localStorage.setItem('tts-voice', selectedVoice);
    }
    localStorage.setItem('tts-rate', rate.toString());
    localStorage.setItem('tts-pitch', pitch.toString());
    localStorage.setItem('tts-volume', volume.toString());
  }, [selectedVoice, rate, pitch, volume]);

  // Test the current voice with settings
  const testVoice = () => {
    play(testPhrase, {
      voice: selectedVoice,
      rate,
      pitch,
      volume
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Text-to-Speech Settings</h3>
        <p className="text-sm text-gray-500">Configure how the AI will speak to you.</p>
      </div>

      {/* Language filter */}
      <div>
        <label className="block text-sm font-medium mb-2">Filter by Language</label>
        <select
          className="w-full rounded-md border border-gray-300 p-2"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="">All Languages</option>
          {Object.keys(voicesByLanguage).sort().map(lang => (
            <option key={lang} value={lang}>
              {languageNames[lang] || lang}
            </option>
          ))}
        </select>
      </div>

      {/* Voice selection */}
      <div>
        <label className="block text-sm font-medium mb-2">Voice</label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-64 overflow-y-auto p-2">
          {filteredVoices.map(voice => (
            <div 
              key={voice.voiceURI} 
              className={`p-3 border rounded-md cursor-pointer transition-colors ${selectedVoice === voice.voiceURI ? 'bg-primary text-white' : 'hover:bg-gray-50'}`}
              onClick={() => setSelectedVoice(voice.voiceURI)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{voice.name.split(' ').slice(0, 2).join(' ')}</p>
                  <p className="text-xs">{voice.lang}</p>
                </div>
                <Button 
                  size="xs" 
                  variant="ghost" 
                  iconName="Play"
                  onClick={(e) => {
                    e.stopPropagation();
                    play('This is a sample of my voice.', { voice: voice.voiceURI });
                  }}
                />
              </div>
              <div className="mt-2 flex items-center">
                <span className="text-xs mr-1">Quality:</span>
                <span className="text-xs font-medium">
                  {voice.localService ? 'Standard' : 'Premium'}
                </span>
              </div>
            </div>
          ))}
          {filteredVoices.length === 0 && (
            <div className="col-span-full text-center py-4 text-gray-500">
              No voices available for the selected language
            </div>
          )}
        </div>
      </div>

      {/* Voice parameters */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Speed: {rate.toFixed(1)}x</label>
          <input 
            type="range" 
            min="0.5" 
            max="2" 
            step="0.1" 
            value={rate} 
            onChange={(e) => setRate(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Pitch: {pitch.toFixed(1)}</label>
          <input 
            type="range" 
            min="0.5" 
            max="1.5" 
            step="0.1" 
            value={pitch} 
            onChange={(e) => setPitch(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Volume: {Math.round(volume * 100)}%</label>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.1" 
            value={volume} 
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      {/* Test voice section */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Test Phrase</label>
        <textarea
          className="w-full rounded-md border border-gray-300 p-2 min-h-[80px]"
          value={testPhrase}
          onChange={(e) => setTestPhrase(e.target.value)}
          placeholder="Enter text to test the voice..."
        />
        <Button 
          onClick={testVoice} 
          className="w-full" 
          iconName="VolumeX"
          disabled={!selectedVoice || !testPhrase.trim()}
        >
          Test Voice
        </Button>
      </div>
    </div>
  );
};

export default TextToSpeechSettings;