// src/services/BookingService.js
import axios from './axios';

class BookingService {
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
}

export default new BookingService();