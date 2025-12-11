const express = require("express");
const router = express.Router();
const Recording = require("../models/Recording");
const auth = require("../middleware/auth");

// Get all recordings for the current user
router.get("/", auth, async (req, res) => {
  try {
    const recordings = await Recording.find({ userId: req.userId }).sort({
      createdAt: -1,
    });
    res.json(recordings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch recordings" });
  }
});

// Create a new recording
router.post("/", auth, async (req, res) => {
  try {
    const { originalAudioUrl, enhancedAudioUrl, title, duration } = req.body;

    if (!originalAudioUrl || !duration) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newRecording = new Recording({
      userId: req.userId,
      originalAudioUrl,
      enhancedAudioUrl: enhancedAudioUrl || null,
      title: title || `Voice ${new Date().toLocaleDateString()}`,
      duration,
    });

    await newRecording.save();
    res.status(201).json(newRecording);
  } catch (error) {
    console.error("Create recording error:", error);
    res.status(500).json({ error: "Failed to save recording" });
  }
});

// Update recording (for adding enhanced audio after background processing)
router.patch("/:id", auth, async (req, res) => {
  try {
    const { enhancedAudioUrl } = req.body;
    const recordingId = req.params.id;

    const recording = await Recording.findOne({
      _id: recordingId,
      userId: req.userId,
    });

    if (!recording) {
      return res.status(404).json({ error: "Recording not found" });
    }

    if (enhancedAudioUrl) {
      recording.enhancedAudioUrl = enhancedAudioUrl;
    }

    await recording.save();
    res.json(recording);
  } catch (error) {
    console.error("Update recording error:", error);
    res.status(500).json({ error: "Failed to update recording" });
  }
});

module.exports = router;
