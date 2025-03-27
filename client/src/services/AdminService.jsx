// src/services/AdminService.js
import axios from './axios';

class AdminService {
  async checkAllPayments() {
    const res = await axios.post('/admin/check-payments');
    return res.data;
  }

  async deleteNotes(bookingId) {
    const res = await axios.delete(`/admin/delete-notes/${bookingId}`);
    return res.data;
  }
  
  async regenerateFollowup(bookingId) {
    const res = await axios.post(`/admin/generate-followup/${bookingId}`);
    return res.data;
  }
}

export default new AdminService();