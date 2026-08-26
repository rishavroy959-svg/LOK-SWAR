const multer = require('multer');

/**
 * Global Error Handler Middleware
 * Normalizes all Multer, Mongoose, and application errors into uniform JSON responses.
 */
const errorHandler = (err, req, res, next) => {
  console.error('[API Error]:', err);

  // 1. Handle Multer File Size Limit Error
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        error: 'File size exceeds the 10MB limit. Please upload a smaller audio recording.'
      });
    }
    return res.status(400).json({
      success: false,
      error: `Upload error: ${err.message}`
    });
  }

  // 2. Handle Custom MIME Validation Error from File Filter
  if (err.code === 'INVALID_AUDIO_MIME') {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }

  // 3. Handle Mongoose Validation Errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      error: messages.join(', ')
    });
  }

  // 4. Handle Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: `Invalid resource identifier format for '${err.path}'.`
    });
  }

  // 5. General Fallback Server Error
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
};

module.exports = errorHandler;
