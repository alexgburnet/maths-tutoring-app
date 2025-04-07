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

  /**
   * Assigns a user to a slot, potentially linking to a plan subtopic or using a custom topic.
   * @param {number} slot_id 
   * @param {number} user_id 
   * @param {object} topicData - Object with optional weekly_plan_subtopic_id OR custom_topic.
   */
  async assignUserToSlot(slot_id, user_id, topicData = {}) { // Default to empty object
    if (topicData.weekly_plan_subtopic_id && topicData.custom_topic) {
      throw new Error('Provide either weekly_plan_subtopic_id or custom_topic, not both.');
    }
    const payload = {
      slot_id,
      user_id,
      ...(topicData.weekly_plan_subtopic_id && { weekly_plan_subtopic_id: topicData.weekly_plan_subtopic_id }),
      ...(topicData.custom_topic && { custom_topic: topicData.custom_topic }),
    };
     // If neither is provided, backend defaults to "General"
    const res = await axios.post('/admin/assign-slot', payload);
    return res.data;
  }

  async unassignSlot(slotId) {
    const res = await axios.post(`/admin/unassign-slot/${slotId}`);
    return res.data;
  }
}

export default new SlotService();