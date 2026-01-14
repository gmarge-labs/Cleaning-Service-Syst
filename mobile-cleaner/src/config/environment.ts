import Constants from 'expo-constants';

// Environment configuration
const ENV = {
  dev: {
    apiUrl: 'http://192.168.0.155:5000/api', // Your local dev server
    socketUrl: 'http://192.168.0.155:5000',
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
  const releaseChannel = Constants.expoConfig?.extra?.environment || 'dev';
  
  if (releaseChannel === 'prod') return ENV.prod;
  if (releaseChannel === 'staging') return ENV.staging;
  return ENV.dev;
};

export default getEnvVars();