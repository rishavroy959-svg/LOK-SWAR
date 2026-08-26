const mongoose = require('mongoose');

/**
 * VoiceNote Mongoose Schema
 * Stores citizen audio recordings, metadata, and triage status.
 */
const VoiceNoteSchema = new mongoose.Schema(
  {
    citizenId: {
      type: mongoose.Schema.Types.Mixed, // Supports ObjectId referencing User or custom citizen ID string
      required: [true, 'Citizen ID is required'],
      index: true
    },
    citizenName: {
      type: String,
      required: [true, 'Citizen name is required'],
      trim: true
    },
    audioUrl: {
      type: String,
      required: [true, 'Audio URL is required'],
      trim: true
    },
    duration: {
      type: Number, // Duration in seconds
      default: 0,
      min: [0, 'Duration cannot be negative']
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'reviewed', 'resolved'],
        message: 'Status must be either pending, reviewed, or resolved'
      },
      default: 'pending',
      index: true
    }
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
    versionKey: false
  }
);

// Compound index for efficient citizen query sorting
VoiceNoteSchema.index({ citizenId: 1, createdAt: -1 });
VoiceNoteSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('VoiceNote', VoiceNoteSchema);
