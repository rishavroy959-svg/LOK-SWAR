const express = require('express');
const router = express.Router();

const upload = require('../middleware/upload');
const {
  uploadVoiceNote,
  getMyVoiceNotes,
  getAdminVoiceNotes,
  updateVoiceNoteStatus
} = require('../controllers/voiceNoteController');

/**
 * Citizen & Admin Voice Note Routes
 * Base path: /api/voice-notes
 */

// POST /api/voice-notes/upload
// Field name: "audio" (or fallback "file")
router.post('/upload', upload.single('audio'), uploadVoiceNote);

// GET /api/voice-notes/my-notes/:citizenId
router.get('/my-notes/:citizenId', getMyVoiceNotes);

// GET /api/voice-notes/admin/all
router.get('/admin/all', getAdminVoiceNotes);

// PATCH /api/voice-notes/admin/:id/status
router.patch('/admin/:id/status', updateVoiceNoteStatus);

module.exports = router;
