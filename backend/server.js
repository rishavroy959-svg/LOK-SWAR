const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const voiceNoteRoutes = require('./routes/voiceNoteRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/citizen_portal_db';

// 1. Core Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Static File Serving for Audio Uploads
// Public URL format: http://localhost:5000/uploads/voice-notes/filename.webm
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 3. Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// 4. Mount API Routes
app.use('/api/voice-notes', voiceNoteRoutes);

// 5. 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route '${req.originalUrl}' not found.`
  });
});

// 6. Global Error Handler
app.use(errorHandler);

// 7. Connect to MongoDB & Start Express Server
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log(`[MongoDB] Connected successfully to ${MONGODB_URI}`);
    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 Citizen Portal Voice Backend listening on port ${PORT}`);
      console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🎙️ Voice Notes API: http://localhost:${PORT}/api/voice-notes`);
      console.log(`📂 Uploads Directory: ${path.join(__dirname, 'uploads')}`);
      console.log(`====================================================`);
    });
  })
  .catch((err) => {
    console.error(`[MongoDB Connection Error]: ${err.message}`);
    process.exit(1);
  });

module.exports = app;
