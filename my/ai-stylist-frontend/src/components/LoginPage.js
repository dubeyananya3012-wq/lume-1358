import React, { useState } from 'react';
import './LoginPage.css';

function LoginPage({ onLogin, onSignup }) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const result = isSignup 
      ? await onSignup(email, password, name)
      : await onLogin(email, password);
    
    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="clouds">☁️</div>
        <div className="clouds cloud2">☁️</div>
      </div>
      <div className="login-box pixel-border">
        <div className="login-header">
          <h2 className="pixel-text">✨ {isSignup ? 'Create Account' : 'Welcome Back'} ✨</h2>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          {isSignup && (
            <div className="input-group">
              <label className="pixel-label">👤 Full Name</label>
              <input
                type="text"
                className="pixel-input"
                placeholder="Enter your name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}
          <div className="input-group">
            <label className="pixel-label">📧 Email</label>
            <input
              type="email"
              className="pixel-input"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label className="pixel-label">🔒 Password</label>
            <input
              type="password"
              className="pixel-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error pixel-text">❌ {error}</p>}
          <button type="submit" className="pixel-btn submit-btn">
            {isSignup ? '✨ Sign Up' : '🌟 Login'}
          </button>
        </form>
        <p onClick={() => setIsSignup(!isSignup)} className="toggle-link pixel-text">
          {isSignup ? '💫 Already have an account? Login' : "🌸 Don't have an account? Sign Up"}
        </p>
      </div>
    </div>
  );
}

export default LoginPage;