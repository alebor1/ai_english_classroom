import React, { useState, useRef, useEffect } from 'react';
import Icon from 'components/AppIcon';

const AITutorChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Mock initial messages
  useEffect(() => {
    const initialMessages = [
      {
        id: 1,
        type: 'ai',
        content: `Hello! I'm your AI English tutor. I'm here to help you practice and improve your English skills. What would you like to work on today?`,
        timestamp: new Date(Date.now() - 300000)
      },
      {
        id: 2,
        type: 'user',
        content: "I want to practice business English conversations.",
        timestamp: new Date(Date.now() - 240000)
      },
      {
        id: 3,
        type: 'ai',
        content: `Great choice! Business English is very useful. Let's start with a common scenario: introducing yourself in a business meeting. Can you tell me how you would introduce yourself to new colleagues?`,
        timestamp: new Date(Date.now() - 180000)
      }
    ];
    setMessages(initialMessages);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponses = [
        `That's a good start! Let me help you improve that introduction. Try adding more specific details about your role and experience.`,
        `Excellent! Your pronunciation is getting better. Let's practice some business vocabulary now.`,
        `I notice you're using more complex sentence structures. That's great progress! Keep practicing.`,
        `Let's work on that grammar point. In business English, we often use the present perfect tense when talking about experience.`,`Perfect! You're showing great improvement in your business communication skills.`
      ];

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickSuggestions = [
    "Help me with pronunciation",
    "Practice job interview",
    "Business email writing",
    "Grammar check"
  ];

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-surface rounded-lg border border-border h-96 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
            <Icon name="Bot" size={20} color="white" />
          </div>
          <div>
            <h3 className="font-medium text-text-primary">AI Tutor</h3>
            <div className="flex items-center space-x-1 text-xs text-success">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span>Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs lg:max-w-sm ${
              message.type === 'user' ?'bg-primary text-white' :'bg-border text-text-primary'
            } rounded-lg px-3 py-2`}>
              <p className="text-sm">{message.content}</p>
              <p className={`text-xs mt-1 ${
                message.type === 'user' ? 'text-primary-100' : 'text-text-secondary'
              }`}>
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-border rounded-lg px-3 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce animation-delay-100"></div>
                <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce animation-delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions */}
      {messages.length <= 3 && (
        <div className="px-4 py-2 border-t border-border">
          <div className="flex flex-wrap gap-2">
            {quickSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setInputValue(suggestion)}
                className="text-xs bg-primary-50 text-primary px-2 py-1 rounded-full hover:bg-primary-100 animation-smooth"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 input-field text-sm"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="bg-primary text-white p-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed animation-smooth"
          >
            <Icon name="Send" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AITutorChat;