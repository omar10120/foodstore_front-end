// src/services/adminService.js
import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const getAuthHeader = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const getAdminProfile = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/users/me`, getAuthHeader(token));
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Add other admin API calls here as needed