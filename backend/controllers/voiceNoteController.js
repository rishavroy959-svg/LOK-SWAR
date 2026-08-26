const VoiceNote = require('../models/VoiceNote');

/**
 * Voice Note Controllers
 */

// 1. POST /api/voice-notes/upload
// Upload voice recording, save metadata, and return 201 Created
exports.uploadVoiceNote = async (req, res, next) => {
  try {
    // Validate file presence from Multer
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No audio file provided. Please attach an audio file using field name "audio".'
      });
    }

    const { citizenId, citizenName, duration } = req.body;

    // Validate required fields
    if (!citizenId || !citizenName) {
      return res.status(400).json({
        success: false,
        error: 'Both citizenId and citizenName are required in request body.'
      });
    }

    // Construct accessible audio URL
    const audioUrl = `/uploads/voice-notes/${req.file.filename}`;

    // Create Mongoose document
    const newVoiceNote = await VoiceNote.create({
      citizenId,
      citizenName,
      audioUrl,
      duration: duration ? Number(duration) : 0,
      status: 'pending'
    });

    return res.status(201).json({
      success: true,
      message: 'Voice note uploaded and registered successfully.',
      data: newVoiceNote
    });
  } catch (error) {
    next(error);
  }
};

// 2. GET /api/voice-notes/my-notes/:citizenId
// Retrieve all voice notes for a specific citizen (playback history)
exports.getMyVoiceNotes = async (req, res, next) => {
  try {
    const { citizenId } = req.params;

    if (!citizenId) {
      return res.status(400).json({
        success: false,
        error: 'Citizen ID parameter is required.'
      });
    }

    const voiceNotes = await VoiceNote.find({ citizenId })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: voiceNotes.length,
      data: voiceNotes
    });
  } catch (error) {
    next(error);
  }
};

// 3. GET /api/voice-notes/admin/all
// Retrieve all voice notes for admin triage with optional ?status= query filter
exports.getAdminVoiceNotes = async (req, res, next) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status) {
      const allowedStatuses = ['pending', 'reviewed', 'resolved'];
      if (!allowedStatuses.includes(status.toLowerCase())) {
        return res.status(400).json({
          success: false,
          error: `Invalid status filter. Allowed values: ${allowedStatuses.join(', ')}`
        });
      }
      filter.status = status.toLowerCase();
    }

    const voiceNotes = await VoiceNote.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: voiceNotes.length,
      data: voiceNotes
    });
  } catch (error) {
    next(error);
  }
};

// 4. PATCH /api/voice-notes/admin/:id/status
// Update status of a specific voice note (pending -> reviewed -> resolved)
exports.updateVoiceNoteStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required in request body.'
      });
    }

    const allowedStatuses = ['pending', 'reviewed', 'resolved'];
    if (!allowedStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}`
      });
    }

    const updatedNote = await VoiceNote.findByIdAndUpdate(
      id,
      { status: status.toLowerCase() },
      { new: true, runValidators: true }
    );

    if (!updatedNote) {
      return res.status(404).json({
        success: false,
        error: `Voice note with ID '${id}' not found.`
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Voice note status updated successfully.',
      data: updatedNote
    });
  } catch (error) {
    next(error);
  }
};
