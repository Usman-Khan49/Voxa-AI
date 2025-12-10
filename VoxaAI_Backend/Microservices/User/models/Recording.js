const mongoose = require('mongoose');

const recordingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalAudioUrl: {
    type: String,
    required: true
  },
  enhancedAudioUrl: {
    type: String,
    default: null
  },
  title: {
    type: String,
    default: 'New Recording'
  },
  duration: {
    type: String, // Storing as string "MM:SS" for now, or could use Number (seconds)
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Recording', recordingSchema);
