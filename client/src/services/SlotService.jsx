// src/services/SlotService.js
import axios from './axios';

class SlotService {
  /**
   * Fetches available slots for a given date range.
   * @param {string} startDate - in 'YYYY-MM-DD' format
   * @param {string} endDate - in 'YYYY-MM-DD' format
   * @returns {Promise<Array>} List of available slots
   */
  async getAvailableSlots(startDate, endDate) {
    const res = await axios.get('/slots', {
      params: {
        start: startDate,
        end: endDate,
      },
    });
    return res.data;
  }
}

export default new SlotService();