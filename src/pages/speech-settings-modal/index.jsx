// /home/ubuntu/app/ai_english_classroom/src/pages/speech-settings-modal/index.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import TextToSpeechSettings from './components/TextToSpeechSettings';
import SpeechRecognitionSettings from './components/SpeechRecognitionSettings';

const SpeechSettingsModal = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tts'); // 'tts' or 'recognition'
  const [isDirty, setIsDirty] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Check for changes in localStorage settings to track dirty state
  useEffect(() => {
    const handleStorageChange = () => {
      setIsDirty(true);
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleClose = () => {
    if (isDirty && !showConfirmation) {
      setShowConfirmation(true);
    } else {
      navigate(-1); // Go back to previous page
    }
  };

  const handleResetDefaults = () => {
    // Reset all speech-related settings
    const speechSettings = [
      'tts-voice',
      'tts-rate',
      'tts-pitch',
      'tts-volume',
      'speech-recognition-language',
      'speech-recognition-continuous',
      'speech-recognition-noise-cancellation'
    ];
    
    speechSettings.forEach(key => localStorage.removeItem(key));
    setIsDirty(true);
    
    // Force refresh the page to reload with default settings
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center">
            <Icon name="Settings" className="mr-2" />
            Speech Settings
          </h2>
          <button 
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            <Icon name="X" size={20} />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="border-b px-4">
          <div className="flex space-x-4">
            <button
              className={`py-3 font-medium text-sm border-b-2 ${activeTab === 'tts' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('tts')}
            >
              Text-to-Speech
            </button>
            <button
              className={`py-3 font-medium text-sm border-b-2 ${activeTab === 'recognition' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('recognition')}
            >
              Speech Recognition
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto p-6 flex-grow">
          {activeTab === 'tts' ? <TextToSpeechSettings /> : <SpeechRecognitionSettings />}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t flex justify-between">
          <Button 
            variant="outline" 
            onClick={handleResetDefaults}
            iconName="RotateCcw"
          >
            Reset to Defaults
          </Button>
          
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              onClick={handleClose}
            >
              Close
            </Button>
            <Button 
              variant="primary" 
              onClick={() => {
                setIsDirty(false);
                handleClose();
              }}
              iconName="Save"
            >
              Save & Close
            </Button>
          </div>
        </div>
        
        {/* Confirmation Dialog */}
        {showConfirmation && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-sm shadow-lg">
              <h3 className="text-lg font-medium mb-3">Unsaved Changes</h3>
              <p className="text-gray-600 mb-4">
                You have unsaved changes. Are you sure you want to leave without saving?
              </p>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowConfirmation(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="error" 
                  size="sm"
                  onClick={() => {
                    setShowConfirmation(false);
                    navigate(-1);
                  }}
                >
                  Leave
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpeechSettingsModal;