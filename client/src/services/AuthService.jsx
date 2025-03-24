// src/services/AuthService.js
import axios from './axios';
import { setAccessToken, clearAccessToken } from './auth';

class AuthService {
  async login(email, password) {
    const res = await axios.post('/login', { email, password }, { withCredentials: true });
    setAccessToken(res.data.access_token); // Store in memory
    return res.data;
  }

  async register(name, surname, email, password) {
    const res = await axios.post('/register', { name, surname, email, password }, { withCredentials: true });
    setAccessToken(res.data.access_token); // Store in memory
    return res.data;
  }

  async logout() {
    await axios.post('/logout', {}, { withCredentials: true });
    clearAccessToken(); // Clear access token from memory
  }
}

export default new AuthService();