// src/services/api.js - API Service for Frontend
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============ Authentication Services ============

export const authService = {
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

// ============ User Profile Services ============

export const userService = {
  getProfile: async () => {
    try {
      const response = await api.get('/user/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/user/profile', profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

// ============ Medical Records Services ============

export const recordService = {
  uploadRecord: async (formData) => {
    try {
      const response = await api.post('/records/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log('Upload progress:', percentCompleted + '%');
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getAllRecords: async () => {
    try {
      const response = await api.get('/records');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getRecordById: async (recordId) => {
    try {
      const response = await api.get(`/records/${recordId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  downloadRecord: async (recordId) => {
    try {
      const record = await recordService.getRecordById(recordId);
      
      if (record.decryptedData) {
        // Convert base64 to blob
        const byteCharacters = atob(record.decryptedData.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: record.decryptedData.mimeType });
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = record.decryptedData.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
      
      return record;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  verifyRecord: async (recordHash) => {
    try {
      const response = await api.post('/records/verify', { recordHash });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteRecord: async (recordId) => {
    try {
      const response = await api.delete(`/records/${recordId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

// ============ Access Control Services ============

export const accessService = {
  requestAccess: async (userId, hospital, requestedBy) => {
    try {
      const response = await api.post('/access/request', {
        userId,
        hospital,
        requestedBy
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getAccessRequests: async () => {
    try {
      const response = await api.get('/access/requests');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateAccessRequest: async (requestId, status) => {
    try {
      const response = await api.put(`/access/requests/${requestId}`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  approveAccess: async (requestId) => {
    return accessService.updateAccessRequest(requestId, 'approved');
  },

  denyAccess: async (requestId) => {
    return accessService.updateAccessRequest(requestId, 'denied');
  }
};

// ============ Blockchain Services ============

export const blockchainService = {
  getTransactionDetails: async (txHash) => {
    try {
      const explorerUrl = process.env.REACT_APP_BLOCKCHAIN_EXPLORER || 
                         'https://mumbai.polygonscan.com';
      return `${explorerUrl}/tx/${txHash}`;
    } catch (error) {
      throw error;
    }
  },

  verifyOnBlockchain: async (recordHash) => {
    try {
      const response = await recordService.verifyRecord(recordHash);
      return response;
    } catch (error) {
      throw error;
    }
  }
};

// ============ Utility Functions ============

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatTimestamp = (timestamp) => {
  const date = new Date(parseInt(timestamp) * 1000);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const truncateHash = (hash, length = 10) => {
  if (!hash) return '';
  return `${hash.substring(0, length)}...${hash.substring(hash.length - 8)}`;
};

// Export default api instance
export default api;