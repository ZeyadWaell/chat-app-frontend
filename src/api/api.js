// src/api/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'https://localhost:44307/api/v1', // Update this with your back-end URL if needed.
});

// Attach token to every request if available.
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
