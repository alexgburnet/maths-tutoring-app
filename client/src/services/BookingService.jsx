// src/services/BookingService.js
import axios from './axios';

class BookingService {

  async getAllBookings() {
    const res = await axios.get('/admin/bookings');
    return res.data;
  }

  async markBookingPaid(bookingId) {
    const res = await axios.post(`/admin/mark-paid/${bookingId}`);
    return res.data;
  }

  async getUserBookings() {
    const res = await axios.get('/bookings');
    return res.data;
  }

  async getBookingById(id) {
    const res = await axios.get(`/bookings/${id}`);
    return res.data;
  }

  async createBooking(slot_id, topic) {
    const res = await axios.post('/bookings', { slot_id, topic });
    return res.data;
  }

  async deleteBooking(id) {
    const res = await axios.delete(`/bookings/${id}`);
    return res.data;
  }

  async checkPayment(bookingId) {
    const res = await axios.post(`/bookings/${bookingId}/check_payment`);
    return res.data;
  }

  async getBookingsWithNotes() {
    const res = await axios.get('/bookings/with-notes');
    return res.data;
  }

  async getBookingsWithFollowups() {
    const res = await axios.get('/bookings/with-followups');
    return res.data;
  }
}

export default new BookingService();