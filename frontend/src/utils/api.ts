/**
 * API utility for making requests to the backend
 * Uses environment variable VITE_API_URL for the base URL
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const getApiUrl = (endpoint: string): string => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_URL}${cleanEndpoint}`;
};

export const api = {
  get: async (endpoint: string, options?: RequestInit) => {
    const response = await fetch(getApiUrl(endpoint), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      ...options,
    });
    return response;
  },

  post: async (endpoint: string, data?: any, options?: RequestInit) => {
    const response = await fetch(getApiUrl(endpoint), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
    return response;
  },

  put: async (endpoint: string, data?: any, options?: RequestInit) => {
    const response = await fetch(getApiUrl(endpoint), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
    return response;
  },

  delete: async (endpoint: string, options?: RequestInit) => {
    const response = await fetch(getApiUrl(endpoint), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      ...options,
    });
    return response;
  },

  patch: async (endpoint: string, data?: any, options?: RequestInit) => {
    const response = await fetch(getApiUrl(endpoint), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
    return response;
  },
};

export default api;
