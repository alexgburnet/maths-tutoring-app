// src/services/MonzoService.js
import axios from './axios';

class MonzoService {
  async getAuthURL() {
    const res = await axios.get('/monzo-auth', { responseType: 'text' });
    return res.data;
  }
}

export default new MonzoService();