require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const authMiddleware = require("./middleware/auth");

const app = express();
const fs = require("fs");
const path = require("path");

// Configure Multer for disk storage (Profile Pictures)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "profile-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const uploadProfile = multer({ storage: storage });

// Configure Multer for memory storage (Audio)
const uploadAudio = multer({ storage: multer.memoryStorage() });

// Add request logging middleware
app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.url} from ${req.ip}`
  );
  next();
});

app.use(cors());
app.use(express.json());
// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// User service routes
app.post("/api/auth/register", async (req, res) => {
  try {
    const response = await axios.post(
      `${process.env.USER_SERVICE_URL}/api/auth/register`,
      req.body
    );
    res.json(response.data);
  } catch (error) {
    res
      .status(error.response?.status || 500)
      .json(error.response?.data || { error: "Service error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const response = await axios.post(
      `${process.env.USER_SERVICE_URL}/api/auth/login`,
      req.body
    );
    res.json(response.data);
  } catch (error) {
    res
      .status(error.response?.status || 500)
      .json(error.response?.data || { error: "Service error" });
  }
});

app.get("/api/auth/verify", authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

app.put(
  "/api/auth/profile",
  authMiddleware,
  uploadProfile.single("profilePicture"),
  async (req, res) => {
    try {
      console.log("Gateway: Received Profile Update");

      // Prepare data to forward
      const updateData = { ...req.body };

      // If file uploaded, add the URL to the data
      if (req.file) {
        // Use PUBLIC_URL from environment if available, otherwise construct from request
        const baseUrl =
          process.env.PUBLIC_URL || `${req.protocol}://${req.get("host")}`;
        const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
        updateData.profilePicture = fileUrl;
        console.log("Gateway: File uploaded, URL:", fileUrl);
      }

      // Forward the request to User Service
      // Note: We are sending JSON to User Service now, not FormData, because we handled the file here
      const response = await axios.put(
        `${process.env.USER_SERVICE_URL}/api/auth/profile`,
        updateData,
        {
          headers: { Authorization: req.headers["authorization"] },
        }
      );
      res.json(response.data);
    } catch (error) {
      console.error("Gateway Error:", error.message);
      res
        .status(error.response?.status || 500)
        .json(error.response?.data || { error: "Service error" });
    }
  }
);

// AI service route - main audio processing endpoint
app.post(
  "/api/process-audio",
  authMiddleware,
  uploadAudio.single("audio"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No audio file provided" });
      }

      const formData = new FormData();
      formData.append("audio", req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });

      const response = await axios.post(
        `${process.env.AI_SERVICE_URL}/process`,
        formData,
        {
          headers: formData.getHeaders(),
          responseType: "arraybuffer",
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }
      );

      res.set("Content-Type", "audio/wav");
      res.send(Buffer.from(response.data));
    } catch (error) {
      console.error("AI service error:", error.message);
      res
        .status(error.response?.status || 500)
        .json({ error: "Audio processing failed" });
    }
  }
);

// Recordings Routes
// POST /api/recordings - Upload audio and create recording entry
// POST /api/recordings - Save recording and process through AI
app.post(
  "/api/recordings",
  authMiddleware,
  uploadProfile.single("audio"),
  async (req, res) => {
    try {
      console.log(
        "[Gateway] POST /api/recordings - File received:",
        req.file ? "YES" : "NO"
      );
      console.log("[Gateway] Request body:", req.body);

      if (!req.file) {
        console.error("[Gateway] No audio file in request");
        return res.status(400).json({ error: "No audio file provided" });
      }

      console.log("[Gateway] File details:", {
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
      });

      // Use PUBLIC_URL from environment if available, otherwise construct from request
      const baseUrl =
        process.env.PUBLIC_URL || `${req.protocol}://${req.get("host")}`;
      const originalFileUrl = `${baseUrl}/uploads/${req.file.filename}`;

      // Save original recording immediately (don't wait for AI)
      const recordingData = {
        originalAudioUrl: originalFileUrl,
        enhancedAudioUrl: null, // Will be updated later when AI finishes
        title: req.body.title || `Recording ${new Date().toLocaleString()}`,
        duration: req.body.duration || "0:00",
      };

      console.log("[Gateway] Saving original recording to database...");
      const response = await axios.post(
        `${process.env.USER_SERVICE_URL}/api/recordings`,
        recordingData,
        {
          headers: { Authorization: req.headers["authorization"] },
        }
      );

      const savedRecording = response.data;
      console.log(
        "[Gateway] Original recording saved, ID:",
        savedRecording._id
      );

      // Process AI in background (don't block the response)
      console.log("[Gateway] Starting AI processing in background...");
      processAudioInBackground(
        req.file.path,
        savedRecording._id,
        baseUrl,
        req.headers["authorization"]
      );

      // Return immediately with original recording
      console.log(
        "[Gateway] Returning response to client (AI processing continues in background)"
      );
      res.status(201).json(savedRecording);
    } catch (error) {
      console.error("Gateway Recording Upload Error:", error.message);
      res
        .status(error.response?.status || 500)
        .json(error.response?.data || { error: "Failed to save recording" });
    }
  }
);

// Background AI processing function
async function processAudioInBackground(
  audioFilePath,
  recordingId,
  baseUrl,
  authHeader
) {
  try {
    console.log(
      `[Gateway-BG] Starting AI processing for recording ${recordingId}`
    );

    const aiFormData = new FormData();
    aiFormData.append("audio", fs.createReadStream(audioFilePath));

    const aiResponse = await axios.post(
      `${process.env.AI_SERVICE_URL}/process`,
      aiFormData,
      {
        headers: aiFormData.getHeaders(),
        responseType: "arraybuffer",
        timeout: 600000, // 10 minutes timeout (generous for CPU)
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    console.log(
      `[Gateway-BG] AI processing complete for ${recordingId}, saving enhanced audio...`
    );

    // Save the enhanced audio file as M4A
    const enhancedFilename = `enhanced-${Date.now()}.m4a`;
    const tempWavPath = path.join(
      __dirname,
      "uploads",
      `temp-${Date.now()}.wav`
    );
    const enhancedPath = path.join(__dirname, "uploads", enhancedFilename);

    fs.writeFileSync(tempWavPath, aiResponse.data);

    // Convert WAV to M4A using ffmpeg
    let enhancedAudioUrl;
    try {
      const { execSync } = require("child_process");
      execSync(
        `ffmpeg -i "${tempWavPath}" -c:a aac -b:a 128k "${enhancedPath}"`,
        {
          stdio: "ignore",
        }
      );
      fs.unlinkSync(tempWavPath);
      enhancedAudioUrl = `${baseUrl}/uploads/${enhancedFilename}`;
      console.log(`[Gateway-BG] Enhanced audio converted to M4A`);
    } catch (convError) {
      console.log(`[Gateway-BG] FFmpeg not available, saving as WAV`);
      fs.renameSync(tempWavPath, enhancedPath.replace(".m4a", ".wav"));
      enhancedAudioUrl = `${baseUrl}/uploads/${enhancedFilename.replace(
        ".m4a",
        ".wav"
      )}`;
    }

    // Update the recording in database with enhanced audio URL
    console.log(
      `[Gateway-BG] Updating recording ${recordingId} with enhanced audio URL`
    );
    await axios.patch(
      `${process.env.USER_SERVICE_URL}/api/recordings/${recordingId}`,
      { enhancedAudioUrl },
      { headers: { Authorization: authHeader } }
    );

    console.log(
      `[Gateway-BG] ✅ Recording ${recordingId} enhanced successfully: ${enhancedAudioUrl}`
    );
  } catch (aiError) {
    console.error(
      `[Gateway-BG] ❌ AI processing failed for recording ${recordingId}:`,
      aiError.message
    );
    console.log(`[Gateway-BG] Recording will remain with original audio only`);
  }
}

// GET /api/recordings - List recordings
app.get("/api/recordings", authMiddleware, async (req, res) => {
  try {
    const response = await axios.get(
      `${process.env.USER_SERVICE_URL}/api/recordings`,
      {
        headers: { Authorization: req.headers["authorization"] },
      }
    );
    res.json(response.data);
  } catch (error) {
    res
      .status(error.response?.status || 500)
      .json(error.response?.data || { error: "Failed to fetch recordings" });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `Gateway service running on port ${PORT} and accessible from all network interfaces`
  );
});
