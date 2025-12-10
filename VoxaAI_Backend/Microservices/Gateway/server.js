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
// Note: We use uploadProfile (disk storage) or create a new one for recordings?
// Let's reuse uploadProfile for disk storage or create a dedicated one if we want separate folder.
// For simplicity, reusing 'uploads' folder via uploadProfile config is fine, or we can make a new one.
// Let's use uploadProfile as it saves to 'uploads/'.
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
      const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

      // Construct data for User Service
      const recordingData = {
        originalAudioUrl: fileUrl,
        title: req.body.title || `Recording ${new Date().toLocaleString()}`,
        duration: req.body.duration || "0:00",
      };

      console.log("[Gateway] Forwarding to User Service:", recordingData);

      // Forward to User Service
      const response = await axios.post(
        `${process.env.USER_SERVICE_URL}/api/recordings`,
        recordingData,
        {
          headers: { Authorization: req.headers["authorization"] },
        }
      );

      console.log("[Gateway] Recording saved successfully");
      res.status(201).json(response.data);
    } catch (error) {
      console.error("Gateway Recording Upload Error:", error.message);
      res
        .status(error.response?.status || 500)
        .json(error.response?.data || { error: "Failed to save recording" });
    }
  }
);

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
