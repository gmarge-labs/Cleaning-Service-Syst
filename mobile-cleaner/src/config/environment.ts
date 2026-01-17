import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Use the local IP of the machine running the server
// The user's current IP seems to be 192.168.1.27 based on Expo output
const LOCAL_IP = '10.30.35.253';
const DEV_URL = Platform.OS === 'web' ? 'http://localhost:5000' : `http://${LOCAL_IP}:5000`;

// Environment configuration
const ENV = {
  dev: {
    apiUrl: `${DEV_URL}/api`,
    socketUrl: DEV_URL,
  },
  staging: {
    apiUrl: 'https://api.sparkleville.co/api',
    socketUrl: 'https://api.sparkleville.co',
  },
  prod: {
    apiUrl: 'https://api.sparkleville.co/api',
    socketUrl: 'https://api.sparkleville.co',
  }
};

// Get environment from app.json extra field or default to dev
const getEnvVars = () => {
  // Prefer explicit env for builds; allow local dev to default to the dev profile
  const envKey = process.env.APP_ENV || Constants.expoConfig?.extra?.environment;

  // In dev mode, default to local unless explicitly overridden
  if (__DEV__ && !process.env.APP_ENV) return ENV.dev;

  if (envKey === 'staging') return ENV.staging;
  if (envKey === 'prod') return ENV.prod;
  
  // Default to production to avoid accidental localhost in builds
  return ENV.prod;
};

export default getEnvVars();
