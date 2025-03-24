// src/services/AdminService.js
import axios from './axios';

class AdminService {
  async getAllUsers() {
    const res = await axios.get('/admin/users');
    return res.data;
  }

  async getAllBookings() {
    const res = await axios.get('/admin/bookings');
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

  async markBookingPaid(bookingId) {
    const res = await axios.post(`/admin/mark-paid/${bookingId}`);
    return res.data;
  }

  async checkAllPayments() {
    const res = await axios.post('/admin/check-payments');
    return res.data;
  }

  async deleteNotes(bookingId) {
    const res = await axios.delete(`/admin/delete-notes/${bookingId}`);
    return res.data;
  }
}

export default new AdminService();