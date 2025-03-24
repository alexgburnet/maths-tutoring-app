// src/services/AuthService.js
import axios from './axios';
import { clearTokenCookie } from './auth';

class AuthService {
  async login(email, password) {
    const res = await axios.post('/login', { email, password });
    document.cookie = `token=${res.data.token}; path=/`;
    return res.data;
  }

  async register(name, surname, email, password) {
    const res = await axios.post('/register', { name, surname, email, password });
    document.cookie = `token=${res.data.token}; path=/`;
    return res.data;
  }

  logout() {
    clearTokenCookie();
  }
}

export default new AuthService();