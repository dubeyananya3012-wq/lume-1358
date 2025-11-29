import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './StylistQuiz.css';

function StylistQuiz({ userId }) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    season: 'spring',
    weather: 'mild',
    occasion: '',
    trends: 'casual',
    voicePreference: ''
  });
  const [generatedOutfit, setGeneratedOutfit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        setFormData({ ...formData, voicePreference: text });
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, [formData]);

  const startRecording = () => {
    if (recognitionRef.current) {
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await axios.post('https://lume-1358.onrender.com/api/stylist/generate-outfit', {
        userId,
        preferences: formData
      });
      setGeneratedOutfit(response.data);
    } catch (error) {
      console.error('Error generating outfit:', error);
    }
    setLoading(false);
  };

  const questions = [
    {
      question: "What season are we styling for?",
      emoji: "🌸",
      field: "season",
      type: "select",
      options: [
        { value: "spring", label: "🌸 Spring", emoji: "🌸" },
        { value: "summer", label: "☀️ Summer", emoji: "☀️" },
        { value: "fall", label: "🍂 Fall", emoji: "🍂" },
        { value: "winter", label: "❄️ Winter", emoji: "❄️" }
      ]
    },
    {
      question: "What's the weather like?",
      emoji: "🌤️",
      field: "weather",
      type: "select",
      options: [
        { value: "hot", label: "🔥 Hot", emoji: "🔥" },
        { value: "warm", label: "☀️ Warm", emoji: "☀️" },
        { value: "mild", label: "🌤️ Mild", emoji: "🌤️" },
        { value: "cool", label: "🍃 Cool", emoji: "🍃" },
        { value: "cold", label: "❄️ Cold", emoji: "❄️" }
      ]
    },
    {
      question: "What's the occasion?",
      emoji: "🎉",
      field: "occasion",
      type: "text",
      placeholder: "e.g., work, party, casual outing..."
    },
    {
      question: "Which trends would you like to follow?",
      emoji: "✨",
      field: "trends",
      type: "select",
      options: [
        { value: "casual", label: "👕 Casual", emoji: "👕" },
        { value: "formal", label: "👔 Formal", emoji: "👔" },
        { value: "streetwear", label: "🎨 Streetwear", emoji: "🎨" },
        { value: "minimalist", label: "⚪ Minimalist", emoji: "⚪" },
        { value: "bohemian", label: "🌻 Bohemian", emoji: "🌻" },
        { value: "vintage", label: "🕰️ Vintage", emoji: "🕰️" }
      ]
    },
    {
      question: "Any specific preferences?",
      emoji: "💬",
      field: "voicePreference",
      type: "voice",
      placeholder: "e.g., I prefer bright colors, no patterns..."
    }
  ];

  const currentQuestion = questions[step];

  return (
    <div className="quiz-container pixel-border">
      {!generatedOutfit ? (
        <>
          <h2 className="pixel-text section-title">✨ Style Quiz ✨</h2>
          <div className="progress-container">
            <div className="progress-bar pixel-border-inner">
              <div 
                className="progress" 
                style={{ width: `${((step + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
            <p className="pixel-text progress-text">
              Question {step + 1} of {questions.length}
            </p>
          </div>
          <div className="question-card pixel-border-inner">
            <h3 className="pixel-text question-title">
              {currentQuestion.emoji} {currentQuestion.question}
            </h3>
            {currentQuestion.type === "select" && (
              <div className="options-grid">
                {currentQuestion.options.map(opt => (
                  <button
                    key={opt.value}
                    className={`option-btn pixel-btn ${formData[currentQuestion.field] === opt.value ? 'active' : ''}`}
                    onClick={() => handleChange(currentQuestion.field, opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
            {currentQuestion.type === "text" && (
              <input
                type="text"
                className="pixel-input"
                value={formData[currentQuestion.field]}
                onChange={(e) => handleChange(currentQuestion.field, e.target.value)}
                placeholder={currentQuestion.placeholder}
              />
            )}
            {currentQuestion.type === "voice" && (
              <div className="voice-input">
                <textarea
                  className="pixel-textarea"
                  value={formData[currentQuestion.field]}
                  onChange={(e) => handleChange(currentQuestion.field, e.target.value)}
                  placeholder={currentQuestion.placeholder}
                  rows="4"
                />
                <button
                  className={`voice-btn pixel-btn ${isRecording ? 'recording' : ''}`}
                  onClick={isRecording ? stopRecording : startRecording}
                >
                  {isRecording ? '🔴 Stop Recording' : '🎤 Voice Input'}
                </button>
                {transcript && (
                  <p className="transcript pixel-text">✨ Captured: "{transcript}"</p>
                )}
              </div>
            )}
            <div className="nav-buttons">
              {step > 0 && (
                <button className="pixel-btn nav-btn" onClick={() => setStep(step - 1)}>
                  ← Back
                </button>
              )}
              {step < questions.length - 1 ? (
                <button className="pixel-btn nav-btn" onClick={() => setStep(step + 1)}>
                  Next →
                </button>
              ) : (
                <button 
                  className="pixel-btn submit-btn" 
                  onClick={handleSubmit} 
                  disabled={loading}
                >
                  {loading ? '✨ Generating...' : '🌟 Generate Outfit'}
                </button>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="outfit-result">
          <h2 className="pixel-text section-title">✨ Your Personalized Outfit ✨</h2>
          <div className="result-card pixel-border">
            <div className="outfit-description pixel-border-inner">
              <h3 className="pixel-text">💕 Styling Suggestions:</h3>
              {generatedOutfit.imageUrl && (
                <img
                 src={generatedOutfit.imageUrl}
                 alt="Generated outfit"
                 className="generated-image"
                />
              )}

            </div>
            <button 
              className="pixel-btn submit-btn" 
              onClick={() => { setGeneratedOutfit(null); setStep(0); }}
            >
              🔄 Create Another Outfit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default StylistQuiz;