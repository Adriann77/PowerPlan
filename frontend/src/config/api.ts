// API Configuration
// IMPORTANT: Update the base URL based on your development environment:
//
// - iOS Simulator: http://localhost:5226
// - Android Emulator: http://10.0.2.2:5226
// - Physical Device (Expo Go): http://YOUR_COMPUTER_IP:5226
//   (Find your IP: macOS/Linux: `ifconfig` or `ip addr`, Windows: `ipconfig`)
//   Example: http://192.168.1.100:5226
//
// Make sure your backend is running on the configured port (default: 5226)

const getApiBaseUrl = () => {
  if (__DEV__) {
    // Development mode - change this based on your setup
    // For iOS Simulator:
    return 'http://localhost:5226';

    // For Android Emulator, uncomment this instead:
    // return 'http://10.0.2.2:5226';

    // For physical device, replace with your computer's IP:
    // return 'http://192.168.1.100:5226';
  }

  // Production mode - replace with your production API URL
  return 'https://your-api-domain.com';
};

export const API_BASE_URL = getApiBaseUrl();

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
} as const;
