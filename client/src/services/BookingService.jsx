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

  /**
   * Creates a booking.
   * @param {number} slot_id - The ID of the slot to book.
   * @param {object} topicData - An object containing EITHER weekly_plan_subtopic_id OR custom_topic.
   * @param {number} [topicData.weekly_plan_subtopic_id] - ID of the subtopic from the plan.
   * @param {string} [topicData.custom_topic] - User-defined topic string.
   */
  async createBooking(slot_id, topicData) {
    if (!topicData || (!topicData.weekly_plan_subtopic_id && !topicData.custom_topic)) {
      throw new Error('Either weekly_plan_subtopic_id or custom_topic must be provided.');
    }
    if (topicData.weekly_plan_subtopic_id && topicData.custom_topic) {
      throw new Error('Provide either weekly_plan_subtopic_id or custom_topic, not both.');
    }
    const payload = {
      slot_id,
      ...(topicData.weekly_plan_subtopic_id && { weekly_plan_subtopic_id: topicData.weekly_plan_subtopic_id }),
      ...(topicData.custom_topic && { custom_topic: topicData.custom_topic }),
    };
    const res = await axios.post('/bookings', payload);
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