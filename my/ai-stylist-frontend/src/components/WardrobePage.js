import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './WardrobePage.css';

function WardrobePage({ userId }) {
  const [clothes, setClothes] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState('tops');
  const [stats, setStats] = useState(null);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    fetchClothes();
    fetchStats();
  }, [userId]);

  const fetchClothes = async () => {
    try {
      console.log('🔍 Fetching clothes for user:', userId);
      const response = await axios.get(`https://lume-1358.onrender.com/api/wardrobe/${userId}`);
      console.log('✅ Fetched clothes:', response.data);
      setClothes(response.data);
    } catch (error) {
      console.error('❌ Error fetching clothes:', error);
      console.error('Error details:', error.response?.data || error.message);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`https://lume-1358.onrender.com/api/wardrobe/stats/${userId}`);
      setStats(response.data);
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) {
      console.log('No files selected');
      return;
    }

    setUploading(true);
    setUploadError('');
    
    console.log(`📤 Starting upload of ${files.length} file(s)`);

    let successCount = 0;
    let failCount = 0;

    for (const file of files) {
      console.log(`📤 Uploading: ${file.name}`, {
        size: `${(file.size / 1024).toFixed(2)} KB`,
        type: file.type,
        category: category,
        userId: userId
      });

      const formData = new FormData();
      formData.append('image', file);
      formData.append('userId', userId);
      formData.append('category', category);

      try {
        const response = await axios.post(
          'https://lume-1358.onrender.com/api/wardrobe/upload', 
          formData,
          {
            headers: { 
              'Content-Type': 'multipart/form-data'
            },
            timeout: 30000 // 30 second timeout
          }
        );
        
        console.log(`✅ Successfully uploaded: ${file.name}`, response.data);
        successCount++;
        
      } catch (error) {
        console.error(`❌ Failed to upload ${file.name}:`, error);
        
        if (error.response) {
          // Server responded with error
          console.error('Server error:', error.response.data);
          console.error('Status code:', error.response.status);
          setUploadError(`Server error: ${error.response.data.error || 'Unknown error'}`);
        } else if (error.request) {
          // Request made but no response
          console.error('No response from server');
          setUploadError('Cannot connect to server. Is backend running at https://lume-1358.onrender.com?');
        } else {
          // Error setting up request
          console.error('Request setup error:', error.message);
          setUploadError(`Error: ${error.message}`);
        }
        
        failCount++;
      }
    }

    setUploading(false);
    
    // Show result
    if (successCount > 0) {
      console.log(`✅ Upload complete! Success: ${successCount}, Failed: ${failCount}`);
      fetchClothes();
      fetchStats();
    }
    
    if (failCount > 0 && successCount === 0) {
      alert(`Failed to upload ${failCount} file(s). Check console for details.`);
    }
    
    // Clear file input
    e.target.value = '';
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      console.log(`🗑️ Deleting item: ${id}`);
      await axios.delete(`https://lume-1358.onrender.com/api/wardrobe/${id}`);
      console.log(`✅ Deleted item ${id}`);
      fetchClothes();
      fetchStats();
    } catch (error) {
      console.error('❌ Error deleting:', error);
      alert('Failed to delete item');
    }
  };

  const categories = [
    { value: 'tops', emoji: '👚', label: 'Tops' },
    { value: 'bottoms', emoji: '👖', label: 'Bottoms' },
    { value: 'dresses', emoji: '👗', label: 'Dresses' },
    { value: 'outerwear', emoji: '🧥', label: 'Outerwear' },
    { value: 'shoes', emoji: '👠', label: 'Shoes' },
    { value: 'accessories', emoji: '👜', label: 'Accessories' }
  ];

  return (
    <div className="wardrobe-container pixel-border">
      <h2 className="pixel-text section-title">👗 My Wardrobe 👗</h2>
      
      {/* Debug Info */}
      <div className="debug-info pixel-border-inner" style={{ marginBottom: '20px', fontSize: '8px' }}>
        <p className="pixel-text">🔍 User ID: {userId}</p>
        <p className="pixel-text">📊 Items: {clothes.length}</p>
        <p className="pixel-text">🔗 Backend: https://lume-1358.onrender.com</p>
      </div>

      {/* Error Display */}
      {uploadError && (
        <div className="error-message pixel-border-inner" style={{ 
          backgroundColor: '#ffcccc', 
          border: '3px solid #ff6b6b',
          marginBottom: '20px',
          padding: '15px'
        }}>
          <p className="pixel-text" style={{ color: '#c92a2a', fontSize: '9px' }}>
            ❌ {uploadError}
          </p>
        </div>
      )}
      
      {/* Stats Section */}
      {stats && stats.totalItems > 0 && (
        <div className="stats-section pixel-border-inner">
          <p className="pixel-text">📊 Total Items: {stats.totalItems}</p>
          <div className="category-stats">
            {Object.entries(stats.categories).map(([cat, count]) => (
              <span key={cat} className="stat-badge pixel-text">
                {categories.find(c => c.value === cat)?.emoji} {cat}: {count}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Upload Section */}
      <div className="upload-section pixel-border-inner">
        <div className="category-selector">
          {categories.map(cat => (
            <button
              key={cat.value}
              className={`category-btn pixel-btn-small ${category === cat.value ? 'active' : ''}`}
              onClick={() => setCategory(cat.value)}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
        <div className="upload-controls">
          <label className="upload-label pixel-btn">
            📸 Upload Photos
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              style={{ display: 'none' }}
            />
          </label>
          {uploading && (
            <div className="uploading-indicator pixel-text">
              ✨ Uploading to MongoDB...
            </div>
          )}
        </div>
      </div>

      {/* Clothes Grid */}
      <div className="clothes-grid">
        {clothes.map((item) => (
          <div key={item._id} className="clothes-item pixel-border">
            <div className="item-image-container">
              <img 
                src={item.imageUrl} 
                alt={item.category}
                loading="lazy"
                onError={(e) => {
                  console.error('Image load error for:', item._id);
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23FFB6D9" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23fff" font-family="Arial" font-size="20"%3EImage Error%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>
            <div className="item-info">
              <p className="pixel-text">
                {categories.find(c => c.value === item.category)?.emoji} {item.category}
              </p>
              {item.fileName && (
                <p className="pixel-text file-name">{item.fileName}</p>
              )}
              <button 
                className="delete-btn pixel-btn-small" 
                onClick={() => handleDelete(item._id)}
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {clothes.length === 0 && (
        <div className="empty-state pixel-text">
          <p>✨ Your wardrobe is empty! ✨</p>
          <p>Upload some clothes to get started 💕</p>
          <p className="hint">Images will be stored directly in MongoDB!</p>
        </div>
      )}
    </div>
  );
}

export default WardrobePage;