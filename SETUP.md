# VoxaAI Setup Guide

Complete guide to set up and run VoxaAI on your own device.

---

## Prerequisites

Install these before starting:

1. **Node.js** (v16 or higher)

   - Download from: https://nodejs.org/

2. **MongoDB** (v4.4 or higher)

   - Download from: https://www.mongodb.com/try/download/community
   - Make sure MongoDB service is running

3. **ngrok** (for remote access)

   - Install globally: `npm install -g ngrok`
   - Sign up at: https://ngrok.com/ (free account)
   - Get your auth token from dashboard

4. **Expo Go** app on your phone
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent
   - iOS: https://apps.apple.com/app/expo-go/id982107779

---

## Step 1: Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/Usman-Khan49/VoxaAI.git
cd VoxaAI

# Install frontend dependencies
cd VoxaAi
npm install

# Install Gateway service dependencies
cd ..\VoxaAI_Backend\Microservices\Gateway
npm install

# Install User service dependencies
cd ..\User
npm install
```

---

## Step 2: Configure ngrok

```bash
# Authenticate ngrok with your token
ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
```

---

## Step 3: Configure Backend

### Gateway Service Configuration

Edit `VoxaAI_Backend/Microservices/Gateway/.env`:

```env
PORT=3000
USER_SERVICE_URL=http://localhost:3001
AI_SERVICE_URL=http://localhost:8000
PUBLIC_URL=YOUR_NGROK_URL_HERE
```

**Note:** You'll update `PUBLIC_URL` after starting ngrok in Step 5.

### User Service Configuration

Edit `VoxaAI_Backend/Microservices/User/.env`:

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/voxaai
JWT_SECRET=your-super-secret-jwt-key-change-this
```

---

## Step 4: Start MongoDB

Make sure MongoDB is running:

**Windows:**

- MongoDB should start automatically as a service
- Or run: `net start MongoDB`

**Mac/Linux:**

```bash
mongod --dbpath /path/to/your/data/folder
```

---

## Step 5: Start Backend Services & ngrok

Open **3 separate terminals**:

### Terminal 1: Start Gateway Service

```bash
cd VoxaAI_Backend\Microservices\Gateway
npm start
```

Should see: `Gateway service listening on port 3000`

### Terminal 2: Start User Service

```bash
cd VoxaAI_Backend\Microservices\User
npm start
```

Should see: `User service listening on port 3001`

### Terminal 3: Start ngrok

```bash
cd VoxaAI_Backend
ngrok http 3000
```

**Copy your ngrok URL:**

1. Look for the line that says `Forwarding`
2. Copy the HTTPS URL (e.g., `https://abcd-12-34-56-78.ngrok-free.app`)
3. Update `VoxaAI_Backend/Microservices/Gateway/.env`:
   ```env
   PUBLIC_URL=https://abcd-12-34-56-78.ngrok-free.app
   ```
4. **Restart the Gateway service** (Ctrl+C in Terminal 1, then `npm start` again)

---

## Step 6: Configure Frontend

Edit `VoxaAi/src/config/apiConfig.js`:

```javascript
// Update these values:
const NGROK_URL = "YOUR_NGROK_URL_HERE"; // Same URL from Step 5
export const USE_NGROK = true; // Set to true
```

---

## Step 7: Start Frontend

Open a **4th terminal**:

```bash
cd VoxaAi
npx expo start
```

You'll see a QR code in the terminal.

---

## Step 8: Run on Your Phone

1. **Open Expo Go** app on your phone
2. **Scan the QR code** from Terminal 4
3. Wait for the app to load
4. **Register a new account** or login

---

## Quick Reference

### Starting Everything (After Initial Setup)

You need **4 terminals** running:

```bash
# Terminal 1: Gateway
cd VoxaAI_Backend\Microservices\Gateway
npm start

# Terminal 2: User Service
cd VoxaAI_Backend\Microservices\User
npm start

# Terminal 3: ngrok
cd VoxaAI_Backend
ngrok http 3000

# Terminal 4: Frontend
cd VoxaAi
npx expo start
```

### Stopping Everything

Press `Ctrl+C` in each terminal to stop the services.

---

## Troubleshooting

### "Network Error" when logging in

- ✅ Check all 3 backend services are running (Gateway, User, ngrok)
- ✅ Verify `PUBLIC_URL` in Gateway `.env` matches your ngrok URL
- ✅ Verify `NGROK_URL` in `apiConfig.js` matches your ngrok URL
- ✅ Make sure `USE_NGROK = true` in `apiConfig.js`
- ✅ Restart Gateway service after changing `PUBLIC_URL`

### "Cannot connect to MongoDB"

- ✅ Make sure MongoDB service is running
- ✅ Check `MONGODB_URI` in User service `.env` is correct

### ngrok URL changes every time

- Free ngrok accounts get a new URL each time you start ngrok
- You'll need to update:
  1. `VoxaAI_Backend/Microservices/Gateway/.env` → `PUBLIC_URL`
  2. `VoxaAi/src/config/apiConfig.js` → `NGROK_URL`
  3. Restart Gateway service
  4. Restart Expo (Ctrl+C and `npx expo start` again)

**Solution:** Upgrade to ngrok paid plan for a permanent URL, or use local network mode (see below).

### Using Local Network Instead of ngrok

If you only want to test on devices on the same WiFi:

1. Find your computer's IP address:

   ```bash
   # Windows
   ipconfig
   # Look for IPv4 Address (e.g., 192.168.1.100)
   ```

2. Edit `VoxaAi/src/config/apiConfig.js`:

   ```javascript
   export const COMPUTER_IP = "YOUR_IP_ADDRESS"; // Your IPv4
   export const USE_NGROK = false; // Set to false
   ```

3. Edit `VoxaAI_Backend/Microservices/Gateway/.env`:

   ```env
   PUBLIC_URL=http://YOUR_IP_ADDRESS:3000
   ```

4. Restart Gateway service

5. Skip the ngrok terminal - you only need 3 terminals now

---

## File Structure

```
VoxaAI/
├── VoxaAi/                          # React Native Frontend
│   ├── src/
│   │   ├── config/
│   │   │   └── apiConfig.js        # ⚙️ Configure API URL here
│   │   ├── screens/
│   │   └── services/
│   └── package.json
│
└── VoxaAI_Backend/                  # Backend Services
    ├── Microservices/
    │   ├── Gateway/
    │   │   ├── .env                # ⚙️ Configure Gateway here
    │   │   ├── server.js
    │   │   └── package.json
    │   └── User/
    │       ├── .env                # ⚙️ Configure User Service here
    │       ├── server.js
    │       └── package.json
    └── start-ngrok.bat             # Helper script to start ngrok
```

---

## Notes

- **ngrok free plan** shows a warning page on first visit - users just click "Visit Site"
- **Keep all terminals running** while using the app
- **Recordings and profile pictures** are saved in `VoxaAI_Backend/Microservices/Gateway/uploads/`
- **Database** is stored in MongoDB (default location varies by OS)

---

## Support

If you encounter issues:

1. Check all services are running (4 terminals)
2. Verify all URLs match in configuration files
3. Check terminal outputs for error messages
4. Make sure MongoDB is running
5. Try restarting all services

---

**You're all set! 🚀**
