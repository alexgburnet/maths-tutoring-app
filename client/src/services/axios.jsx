// src/services/axios.js
import axios from 'axios';
import { getTokenFromCookie } from './auth';

const instance = axios.create({
  baseURL: 'https://localhost:5000/api',
});

instance.interceptors.request.use((config) => {
  const token = getTokenFromCookie();
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

export default instance;