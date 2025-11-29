import React, { useState } from 'react';
import axios from 'axios';
import './MoodboardGenerator.css';

function MoodboardGenerator({ userId }) {
  const [theme, setTheme] = useState('');
  const [colors, setColors] = useState('');
  const [style, setStyle] = useState('minimalist');
  const [moodboard, setMoodboard] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/stylist/generate-moodboard', {
        userId,
        theme,
        colors,
        style
      });
      setMoodboard(response.data);
    } catch (error) {
      console.error('Error generating moodboard:', error);
    }
    setLoading(false);
  };

  const styleOptions = [
    { value: 'minimalist', emoji: '⚪', label: 'Minimalist' },
    { value: 'maximalist', emoji: '🌈', label: 'Maximalist' },
    { value: 'vintage', emoji: '🕰️', label: 'Vintage' },
    { value: 'modern', emoji: '✨', label: 'Modern' },
    { value: 'bohemian', emoji: '🌻', label: 'Bohemian' }
  ];

  return (
    <div className="moodboard-container pixel-border">
      <h2 className="pixel-text section-title">🎨 Moodboard Generator 🎨</h2>
      {!moodboard ? (
        <div className="moodboard-form pixel-border-inner">
          <div className="input-group">
            <label className="pixel-label">✨ Theme</label>
            <input
              type="text"
              className="pixel-input"
              placeholder="e.g., Summer Vibes, Urban Chic..."
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label className="pixel-label">🎨 Color Palette</label>
            <input
              type="text"
              className="pixel-input"
              placeholder="e.g., pastels, earth tones, neon..."
              value={colors}
              onChange={(e) => setColors(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label className="pixel-label">💫 Style</label>
            <div className="style-grid">
              {styleOptions.map(opt => (
                <button
                  key={opt.value}
                  className={`style-btn pixel-btn ${style === opt.value ? 'active' : ''}`}
                  onClick={() => setStyle(opt.value)}
                >
                  {opt.emoji} {opt.label}
                </button>
              ))}
            </div>
          </div>
          <button 
            className="pixel-btn submit-btn" 
            onClick={handleGenerate} 
            disabled={loading || !theme}
          >
            {loading ? '✨ Generating Magic...' : '🌟 Generate Moodboard'}
          </button>
        </div>
      ) : (
        <div className="moodboard-result">
          <div className="result-card pixel-border">
            <div className="moodboard-description pixel-border-inner">
              <h3 className="pixel-text">💕 Your Moodboard</h3>
              {moodboard.imageUrl && (
                <img 
                src={moodboard.imageUrl} 
                alt="Generated Moodboard" 
                className="generated-moodboard"
                style={{ width: "100%", borderRadius: "8px" }}
                />
              )}

            </div>
            <button 
              className="pixel-btn submit-btn" 
              onClick={() => setMoodboard(null)}
            >
              🔄 Create New Moodboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MoodboardGenerator;