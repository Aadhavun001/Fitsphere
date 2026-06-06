const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing middleware
app.use(cors());
app.use(express.json());

// Firebase Admin SDK Initialization (Optional Backend verification)
// To activate, set the FIREBASE_SERVICE_ACCOUNT_KEY env variable pointing to your service account json file.
if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('Firebase Admin SDK initialized successfully.');
} else {
  console.log('Firebase Admin SDK not initialized (running without service account key).');
}

// Sample API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Example route to verify user token sent from frontend
app.post('/api/verify-token', async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) {
    return res.status(400).json({ error: 'Missing idToken' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    res.json({ uid: decodedToken.uid, email: decodedToken.email });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`FitSphere backend service running on port ${PORT}`);
});
