# Audio Processing Backend

Simple microservices backend for audio transcription, text improvement, and voice synthesis.

## Architecture

- **Gateway Service** (Node.js/Express) - Port 3000
- **User Service** (Node.js/Express/MongoDB) - Port 3001  
- **AI Service** (Python/FastAPI) - Port 8000

## Prerequisites

- Node.js 18+
- Python 3.9+
- MongoDB
- Google Gemini API key

## Setup

### 1. User Service

```powershell
cd Microservices\User
npm install
cp .env.example .env
# Edit .env and set your MongoDB URI and JWT secret
npm start
```

### 2. Gateway Service

```powershell
cd Microservices\Gateway
npm install
cp .env.example .env
# Edit .env if needed (default ports should work)
npm start
```

### 3. AI Service

```powershell
cd Microservices\AI
```

**Install uv (Python package manager):**
```powershell
pip install -U uv
```

**Clone IndexTTS repository:**
```powershell
git lfs install
git clone https://github.com/index-tts/index-tts.git
cd index-tts
git lfs pull
```

**Install dependencies:**
```powershell
uv sync --all-extras
```

**Download IndexTTS-2 model:**
```powershell
uv tool install "huggingface-hub[cli,hf_xet]"
hf download IndexTeam/IndexTTS-2 --local-dir=checkpoints
```

**Go back to AI service directory and install Python dependencies:**
```powershell
cd ..
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

**Start the service:**
```powershell
python main.py
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify token

### Audio Processing
- `POST /api/process-audio` - Upload audio, get improved audio back
  - Requires authentication (Bearer token)
  - Content-Type: multipart/form-data
  - Field: `audio` (audio file)

## Workflow

1. Frontend sends audio to Gateway `/api/process-audio`
2. Gateway forwards to AI service `/process`
3. AI service:
   - Transcribes audio (faster-whisper)
   - Improves text (Google Gemini)
   - Generates new audio with user's voice (IndexTTS)
4. Returns improved audio to Gateway → Frontend

## Environment Variables

**User Service (.env):**
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/user_service
JWT_SECRET=your_secret_key
```

**Gateway Service (.env):**
```
PORT=3000
USER_SERVICE_URL=http://localhost:3001
AI_SERVICE_URL=http://localhost:8000
```

**AI Service (.env):**
```
GEMINI_API_KEY=your_gemini_api_key
WHISPER_MODEL=base
```
