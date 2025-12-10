// API Configuration
// IMPORTANT: Choose the appropriate configuration for your use case

// ========================================
// OPTION 1: Local Network (Same WiFi)
// ========================================
// Use this when testing on devices connected to the same WiFi
// To find your IP: run 'ipconfig' in Windows PowerShell and look for IPv4 Address
export const COMPUTER_IP = "10.218.198.149";
export const API_PORT = "3000";
const LOCAL_URL = `http://${COMPUTER_IP}:${API_PORT}`;

// ========================================
// OPTION 2: Ngrok (Remote Access)
// ========================================
// Use this when testing from different networks or sharing with others
// Steps to use ngrok:
// 1. Run: VoxaAI_Backend\start-ngrok.bat
// 2. Visit http://localhost:4040 to see your URLs
// 3. Copy the HTTPS URL for port 3000 (looks like: https://xxxx-xx-xx-xx-xx.ngrok-free.app)
// 4. Paste it below (without /api at the end)
const NGROK_URL = "https://nonimperial-valrie-graniferous.ngrok-free.dev"; // Example: "https://1234-56-78-90-12.ngrok-free.app"

// ========================================
// Configuration Selection
// ========================================
// Set USE_NGROK to true when using ngrok, false for local network
export const USE_NGROK = true;

// This gets automatically used by api.js and other components
export const getApiBaseUrl = () => {
  if (USE_NGROK && NGROK_URL) {
    return NGROK_URL;
  }
  return LOCAL_URL;
};
