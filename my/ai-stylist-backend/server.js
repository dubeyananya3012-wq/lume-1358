// server.js - POLLINATIONS.AI VERSION (100% FREE, NO CARD REQUIRED)

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-stylist', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✨ Connected to MongoDB');
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
});

// Pollinations.ai - 100% FREE Image Generation (No API Key Needed!)
async function generateImage(prompt) {
  try {
    console.log('🎨 Generating image with Pollinations.ai (FREE)...');
    
    // Pollinations.ai uses a simple URL-based API
    // Just encode the prompt in the URL!
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=768&model=flux&nologo=true`;
    
    console.log('📥 Downloading generated image...');
    
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 60000 // 60 second timeout
    });
    
    console.log('✅ Image generated successfully!');
    return Buffer.from(response.data, 'binary');
    
  } catch (error) {
    console.error('❌ Pollinations Error:', error.message);
    throw new Error('Failed to generate image with Pollinations.ai');
  }
}

// MongoDB Schema
const wardrobeSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  imageData: { type: String, required: true },
  imageMimeType: { type: String, required: true },
  category: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
  fileName: { type: String }
});

const Wardrobe = mongoose.model('Wardrobe', wardrobeSchema);

// Multer Configuration
const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Helper functions
function bufferToBase64(buffer) {
  return buffer.toString('base64');
}

function createDataURL(base64, mimeType) {
  return `data:${mimeType};base64,${base64}`;
}

// API Routes

// 1. Get wardrobe statistics
app.get('/api/wardrobe/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const items = await Wardrobe.find({ userId });
    
    const stats = {
      totalItems: items.length,
      categories: {}
    };
    
    items.forEach(item => {
      stats.categories[item.category] = (stats.categories[item.category] || 0) + 1;
    });
    
    console.log(`✅ Stats for ${userId}:`, stats);
    res.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// 2. Get single item by ID
app.get('/api/wardrobe/item/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Wardrobe.findById(id);
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json({
      _id: item._id,
      imageUrl: createDataURL(item.imageData, item.imageMimeType),
      category: item.category,
      uploadDate: item.uploadDate,
      fileName: item.fileName
    });
  } catch (error) {
    console.error('Fetch item error:', error);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

// 3. Get user's wardrobe
app.get('/api/wardrobe/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const items = await Wardrobe.find({ userId }).sort({ uploadDate: -1 });
    
    const itemsWithDataURLs = items.map(item => ({
      _id: item._id,
      imageUrl: createDataURL(item.imageData, item.imageMimeType),
      category: item.category,
      uploadDate: item.uploadDate,
      fileName: item.fileName
    }));
    
    console.log(`✅ Retrieved ${items.length} items for user ${userId}`);
    
    res.json(itemsWithDataURLs);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch wardrobe' });
  }
});

// 4. Upload wardrobe item
app.post('/api/wardrobe/upload', upload.single('image'), async (req, res) => {
  try {
    const { userId, category } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const base64Image = bufferToBase64(req.file.buffer);

    const wardrobeItem = new Wardrobe({
      userId,
      imageData: base64Image,
      imageMimeType: req.file.mimetype,
      category,
      fileName: req.file.originalname
    });

    await wardrobeItem.save();
    
    console.log(`✅ Image uploaded for user ${userId}, category: ${category}`);
    
    res.json({ 
      message: 'Item uploaded successfully', 
      item: {
        _id: wardrobeItem._id,
        category: wardrobeItem.category,
        uploadDate: wardrobeItem.uploadDate
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload item' });
  }
});

// 5. Delete wardrobe item
app.delete('/api/wardrobe/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Wardrobe.findById(id);
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    await Wardrobe.findByIdAndDelete(id);
    
    console.log(`✅ Deleted item ${id}`);
    
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// 6. Generate outfit image with Pollinations.ai
app.post('/api/stylist/generate-outfit', async (req, res) => {
  try {
    const { userId, preferences } = req.body;
    
    const wardrobeItems = await Wardrobe.find({ userId });
    const categories = [...new Set(wardrobeItems.map(item => item.category))].join(', ') || 'tops, bottoms, dresses, shoes';

    // Optimized prompt for fashion illustrations
    const styleMap = {
      casual: 'casual comfortable everyday',
      formal: 'elegant formal sophisticated',
      sporty: 'athletic sporty activewear',
      trendy: 'trendy fashionable modern',
      classic: 'classic timeless elegant'
    };

    const weatherMap = {
      hot: 'light breathable summer',
      warm: 'comfortable spring',
      mild: 'layered transitional',
      cool: 'cozy autumn',
      cold: 'warm winter layered'
    };

    const style = styleMap[preferences.trends] || preferences.trends;
    const weatherDesc = weatherMap[preferences.weather] || preferences.weather;
    const vibe = preferences.voicePreference || 'colorful';

    const prompt = `professional fashion illustration, full body outfit, ${style} style, ${preferences.season} season, ${weatherDesc} weather, ${preferences.occasion} outfit, ${vibe} aesthetic, fashion sketch, clean white background, detailed clothing design, high quality`;

    console.log('🎨 Generating outfit with prompt:', prompt);
    
    const imageBuffer = await generateImage(prompt);
    const base64Image = bufferToBase64(imageBuffer);
    const mimeType = 'image/png';

    res.json({
      description: `AI-generated ${preferences.occasion} outfit for ${preferences.season} 👗✨`,
      imageUrl: createDataURL(base64Image, mimeType),
      preferences,
      provider: 'Pollinations.ai',
      model: 'Flux (Free)'
    });
  } catch (error) {
    console.error('Outfit generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate outfit', 
      details: error.message 
    });
  }
});

// 7. Generate moodboard image
app.post('/api/stylist/generate-moodboard', async (req, res) => {
  try {
    const { theme, colors, style } = req.body;

    // Optimized moodboard prompt
    const prompt = `fashion moodboard collage, ${theme} aesthetic, ${colors} color palette, ${style} style, outfit inspirations, accessories, textures, fabric swatches, trendy fashion design board, professional styling, pinterest aesthetic, high quality`;

    console.log('🎨 Generating moodboard with prompt:', prompt);
    
    const imageBuffer = await generateImage(prompt);
    const base64Image = bufferToBase64(imageBuffer);
    const mimeType = 'image/png';

    res.json({
      description: `AI-generated ${theme} fashion moodboard 🎨💖`,
      imageUrl: createDataURL(base64Image, mimeType),
      theme,
      style,
      provider: 'Pollinations.ai',
      model: 'Flux (Free)'
    });
  } catch (error) {
    console.error('Moodboard generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate moodboard', 
      details: error.message 
    });
  }
});

// 8. Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    provider: 'Pollinations.ai',
    model: 'Flux',
    cost: 'FREE - No API key or card required!'
  });
});

// 9. Test image generation endpoint
app.get('/api/test-generation', async (req, res) => {
  try {
    console.log('🧪 Testing image generation with Pollinations.ai...');
    const testPrompt = 'a simple fashion outfit illustration, clean white background, professional';
    const imageBuffer = await generateImage(testPrompt);
    const base64Image = bufferToBase64(imageBuffer);
    
    res.json({
      success: true,
      message: 'Image generation working! ✨ (100% FREE)',
      imageUrl: createDataURL(base64Image, 'image/png'),
      provider: 'Pollinations.ai',
      model: 'Flux'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      provider: 'Pollinations.ai'
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    error: 'Something went wrong!', 
    message: error.message 
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║      AI STYLIST BACKEND - POLLINATIONS.AI VERSION          ║
║                   100% FREE FOREVER                        ║
╚════════════════════════════════════════════════════════════╝

✨ Server Status: RUNNING
🌐 Port: ${PORT}
📡 API Base: http://localhost:${PORT}/api
🖼️  Storage: MongoDB (Base64)
🤖 AI Provider: Pollinations.ai
🎨 Model: Flux (Latest & Free!)

💰 Cost: 100% FREE FOREVER
   ✅ No API key required
   ✅ No credit card required
   ✅ No signup required
   ✅ Unlimited generations
   ⚡ Fast generation (5-15 seconds)

📋 Available Endpoints:
   GET  /api/health                    - Health check
   GET  /api/test-generation           - Test AI generation
   GET  /api/wardrobe/:userId          - Get user wardrobe
   GET  /api/wardrobe/stats/:userId    - Get wardrobe stats
   POST /api/wardrobe/upload           - Upload wardrobe item
   POST /api/stylist/generate-outfit   - Generate AI outfit
   POST /api/stylist/generate-moodboard - Generate AI moodboard
   DELETE /api/wardrobe/:id            - Delete wardrobe item

🚀 READY TO USE - No setup needed!
  `);
});