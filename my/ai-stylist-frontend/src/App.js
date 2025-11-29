import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import LoginPage from './components/LoginPage';
import WardrobePage from './components/WardrobePage';
import StylistQuiz from './components/StylistQuiz';
import MoodboardGenerator from './components/MoodboardGenerator';
import './App.css';

// 🔥 Firebase configuration - REPLACE WITH YOUR CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyBzKjWzICFNnQcto3OihjE_8n_ixO3OPRs",
  authDomain: "lume-50154.firebaseapp.com",
  projectId: "lume-50154",
  storageBucket: "lume-50154.firebasestorage.app",
  messagingSenderId: "734736032145",
  appId: "Y1:734736032145:web:b94e658e9448ab29827a30",
  measurementId: "G-X8PP5V8R2J"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('login');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        setCurrentPage('wardrobe');
      }
    });
    return unsubscribe;
  }, []);

  const handleLogin = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: email,
        lastLogin: new Date().toISOString()
      }, { merge: true });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handleSignup = async (email, password, name) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: email,
        name: name,
        createdAt: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setCurrentPage('login');
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="pixel-spinner">✨</div>
        <p className="pixel-text">Loading...</p>
      </div>
    );
  }

  return (
    <div className="App">
      {!user ? (
        <LoginPage onLogin={handleLogin} onSignup={handleSignup} />
      ) : (
        <>
          <nav className="navbar pixel-border">
            <h1 className="pixel-text logo">✨ AI Stylist ✨</h1>
            <div className="nav-buttons">
              <button 
                className={`pixel-btn ${currentPage === 'wardrobe' ? 'active' : ''}`}
                onClick={() => setCurrentPage('wardrobe')}
              >
                👗 Wardrobe
              </button>
              <button 
                className={`pixel-btn ${currentPage === 'quiz' ? 'active' : ''}`}
                onClick={() => setCurrentPage('quiz')}
              >
                ✨ Style Quiz
              </button>
              <button 
                className={`pixel-btn ${currentPage === 'moodboard' ? 'active' : ''}`}
                onClick={() => setCurrentPage('moodboard')}
              >
                🎨 Moodboard
              </button>
              <button className="pixel-btn logout-btn" onClick={handleLogout}>
                👋 Logout
              </button>
            </div>
          </nav>
          <div className="content">
            {currentPage === 'wardrobe' && <WardrobePage userId={user.uid} />}
            {currentPage === 'quiz' && <StylistQuiz userId={user.uid} />}
            {currentPage === 'moodboard' && <MoodboardGenerator userId={user.uid} />}
          </div>
          <div className="stars">
            {[...Array(20)].map((_, i) => (
              <span key={i} className="star" style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`
              }}>✨</span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default App;