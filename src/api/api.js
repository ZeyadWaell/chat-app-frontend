// src/api/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'https://localhost:44307/api/v1', // or your API base URL
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // Attach bearer token to every request
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;
