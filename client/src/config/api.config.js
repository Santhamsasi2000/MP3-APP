// 🌐 API Configuration
// Auto-switches between development and production URLs

// ⚠️ UPDATE THESE URLs WITH YOUR ACTUAL VALUES

// Local URL - Your laptop IP (for development in Expo Go)
const LOCAL_URL = 'http://192.168.0.108:5000/api';

// Cloud URL - Your Render deployment (for production APK)
const CLOUD_URL = 'https://mp3-app-tn6l.onrender.com/api';

// Auto-switch based on environment
// __DEV__ is TRUE in Expo Go (development)
// __DEV__ is FALSE in APK (production)
export const BASE_URL = __DEV__ ? LOCAL_URL : CLOUD_URL;

// Log for debugging
console.log('🌐 API URL:', BASE_URL);
console.log('📱 Mode:', __DEV__ ? 'Development (Expo Go)' : 'Production (APK)');

// Export both URLs (in case needed elsewhere)
export const API_CONFIG = {
  LOCAL_URL,
  CLOUD_URL,
  BASE_URL,
  IS_DEV: __DEV__,
};

export default API_CONFIG;