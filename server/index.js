import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import admin from 'firebase-admin';

dotenv.config();

// Initialize Firebase Admin (optional, for production)
if (!admin.apps.length && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.warn('Firebase Admin initialization failed, using client-side validation only:', error.message);
  }
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

/**
 * GET /api/auth/status
 * Check if user is authenticated
 */
app.get('/api/auth/status', async (req, res) => {
  try {
    if (req.session.user) {
      console.log('🔐 Backend auth status: User found in session', {
        uid: req.session.user.uid,
        email: req.session.user.email,
        hasApiKey: !!req.session.user.geminiApiKey
      });
      
      res.json({
        authenticated: true,
        user: {
          uid: req.session.user.uid,
          email: req.session.user.email,
          displayName: req.session.user.displayName,
          photoURL: req.session.user.photoURL,
          geminiApiKey: req.session.user.geminiApiKey || null,
        }
      });
    } else {
      console.log('🔐 Backend auth status: No user in session');
      res.json({ authenticated: false });
    }
  } catch (error) {
    console.error('❌ Auth status error:', error);
    req.session.destroy();
    res.json({ authenticated: false });
  }
});

/**
 * POST /api/auth/login
 * Verify Firebase ID token and create session
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      return res.status(400).json({ error: 'ID token is required' });
    }

    // Verify the ID token with Firebase Admin (if available)
    let decodedToken;
    try {
      if (admin.apps.length) {
        decodedToken = await admin.auth().verifyIdToken(idToken);
      } else {
        // Fallback: Basic token format validation (for development)
        const parts = idToken.split('.');
        if (parts.length !== 3) {
          throw new Error('Invalid token format');
        }
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        decodedToken = {
          uid: payload.user_id || payload.sub,
          email: payload.email,
          name: payload.name,
          picture: payload.picture,
        };
      }
    } catch (tokenError) {
      console.error('Token verification failed:', tokenError);
      return res.status(401).json({ error: 'Invalid ID token' });
    }
    
    // Create session
    req.session.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      displayName: decodedToken.name,
      photoURL: decodedToken.picture,
    };

    res.json({
      success: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        displayName: decodedToken.name,
        photoURL: decodedToken.picture,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ error: 'Invalid ID token' });
  }
});

/**
 * POST /api/auth/logout
 * Destroy user session
 */
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.json({ success: true });
  });
});

/**
 * POST /api/auth/set-api-key
 * Store user's Gemini API key in session and detect tier
 */
app.post('/api/auth/set-api-key', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { geminiApiKey } = req.body;

    if (!geminiApiKey || !geminiApiKey.startsWith('AIza')) {
      return res.status(400).json({ error: 'Valid Gemini API key is required' });
    }

    console.log('🔑 Validating Gemini API key and detecting tier...');

    // Step 1: List available models to detect tier
    const modelsUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${geminiApiKey}`;
    const modelsResponse = await fetch(modelsUrl);

    if (!modelsResponse.ok) {
      console.error('❌ API key validation failed');
      return res.status(400).json({ error: 'Invalid Gemini API key' });
    }

    const modelsData = await modelsResponse.json();
    const availableModels = modelsData.models?.map(m => m.name) || [];

    console.log('📋 Available models:', availableModels.length);

    // Step 2: Detect tier based on model access
    // Pro users have access to advanced models like gemini-1.5-pro or gemini-advanced
    const hasProModels = availableModels.some(model =>
      model.includes('gemini-1.5-pro') ||
      model.includes('gemini-advanced') ||
      model.includes('gemini-pro-vision') ||
      model.includes('gemini-ultra')
    );

    // Step 3: Verify API key works by making a test request
    const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`;
    const testResponse = await fetch(testUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Hello' }] }]
      })
    });

    if (!testResponse.ok) {
      console.error('❌ API key test request failed');
      return res.status(400).json({ error: 'Invalid Gemini API key or insufficient permissions' });
    }

    // Determine tier
    const detectedTier = hasProModels ? 'pro' : 'free';
    console.log(`✅ API key validated. Tier detected: ${detectedTier.toUpperCase()}`);

    // Store API key and tier in session
    req.session.user.geminiApiKey = geminiApiKey;
    req.session.user.tier = detectedTier;

    res.json({
      success: true,
      message: 'API key saved successfully',
      tier: detectedTier,
      modelCount: availableModels.length
    });
  } catch (error) {
    console.error('❌ Set API key error:', error);
    res.status(500).json({ error: 'Failed to set API key. Please try again.' });
  }
});

/**
 * POST /api/generate-logos
 * Generate logos using Google Imagen API with user-specific API key
 */
app.post('/api/generate-logos', async (req, res) => {
  try {
    const { prompt, sampleCount = 4 } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Get user from session and their API key
    const userId = req.session?.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required. Please log in with Google.' });
    }

    // Get user's personal Gemini API key from database
    const userApiKey = req.session?.user?.geminiApiKey;
    if (!userApiKey) {
      return res.status(400).json({
        error: 'Gemini API key not found. Please set your API key in your profile.',
        requiresApiKey: true
      });
    }

    // Call Google Imagen API
    const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${userApiKey}`;

    const payload = {
      instances: [{ prompt }],
      parameters: {
        sampleCount,
        outputMimeType: 'image/png',
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Imagen API error:', errorData);
      
      // Handle specific Gemini API errors
      if (errorData.error?.code === 400 && errorData.error?.message?.includes('API_KEY_INVALID')) {
        return res.status(400).json({
          error: 'Invalid API key. Please check your Gemini API key in your profile.',
          requiresApiKey: true
        });
      }
      
      return res.status(response.status).json({
        error: errorData.error?.message || 'Image generation failed',
      });
    }

    const result = await response.json();
    const predictions = result?.predictions || [];

    if (predictions.length === 0) {
      return res.status(500).json({ error: 'No images generated' });
    }

    // Extract base64 images
    const images = predictions
      .map((pred) => pred.bytesBase64Encoded)
      .filter(Boolean);

    res.json({ images });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Logo Generator API Server' });
});

app.listen(PORT, () => {
  console.log(`🚀 Logo Generator API server running on http://localhost:${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/api/health`);
});
