// src/services/SlotService.js
import axios from './axios';

class SlotService {
  async getAvailableSlots() {
    const res = await axios.get('/slots');
    return res.data;
  }
}

export default new SlotService();