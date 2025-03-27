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
    const params = {};
  
    if (startDate) params.start = startDate;
    if (endDate) params.end = endDate;
  
    const res = await axios.get('/slots', { params });
    return res.data;
  }

  async addSlot(start_time, duration_minutes = 60) {
    const res = await axios.post('/admin/slots', { start_time, duration_minutes });
    return res.data;
  }

  async deleteSlot(slotId) {
    const res = await axios.delete(`/admin/slots/${slotId}`);
    return res.data;
  }

  async assignUserToSlot(slot_id, user_id, topic = 'General') {
    const res = await axios.post('/admin/assign-slot', { slot_id, user_id, topic });
    return res.data;
  }

  async unassignSlot(slotId) {
    const res = await axios.post(`/admin/unassign-slot/${slotId}`);
    return res.data;
  }
}



export default new SlotService();