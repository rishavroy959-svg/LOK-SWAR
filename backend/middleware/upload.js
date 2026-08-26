const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const UPLOAD_DIR = path.join(__dirname, '../uploads/voice-notes');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// 1. Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Generate sanitized unique filename: citizenId-timestamp.ext
    const ext = path.extname(file.originalname).toLowerCase() || getExtensionFromMime(file.mimetype);
    const citizenPrefix = req.body.citizenId ? req.body.citizenId.toString().replace(/[^a-zA-Z0-9_-]/g, '') : 'voice';
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${citizenPrefix}-${uniqueSuffix}${ext}`);
  }
});

// Helper for MIME to extension fallback
function getExtensionFromMime(mime) {
  switch (mime) {
    case 'audio/webm':
      return '.webm';
    case 'audio/wav':
    case 'audio/x-wav':
      return '.wav';
    case 'audio/mp4':
    case 'audio/x-m4a':
      return '.m4a';
    case 'audio/mpeg':
    case 'audio/mp3':
      return '.mp3';
    case 'audio/ogg':
      return '.ogg';
    default:
      return '.webm';
  }
}

// 2. MIME Type Validation Filter
const ALLOWED_AUDIO_MIMES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/webm',
  'audio/wav',
  'audio/x-wav',
  'audio/mp4',
  'audio/x-m4a',
  'audio/aac',
  'audio/ogg'
];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_AUDIO_MIMES.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    const error = new Error(
      `Invalid audio format (${file.mimetype}). Only MP3, WebM, WAV, MP4, and M4A audio files are allowed.`
    );
    error.statusCode = 400;
    error.code = 'INVALID_AUDIO_MIME';
    cb(error, false);
  }
};

// 3. Multer Instance (10MB Max File Size)
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB in bytes
  }
});

module.exports = upload;
