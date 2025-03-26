import React, { useState } from 'react';
import './BookingForm.css'; // optional styling

export default function BookingForm({ slot, onClose, onBooked }) {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!slot) return null;

  const handleBooking = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          scheduled_time: slot.startIso, // we'll add this in WeeklyCalendar
          topic,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Booking failed');
      }

      if (onBooked) onBooked(); // optional success callback
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-form">
      <h3>Book Session</h3>
      <p><strong>Date:</strong> {slot.date}</p>
      <p><strong>Time:</strong> {slot.startTime}</p>

      <label htmlFor="topic">Topic</label>
      <input
        id="topic"
        type="text"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="e.g. Trigonometry, Algebra..."
        required
      />

      {error && <p className="error-text">{error}</p>}

      <div className="booking-actions">
        <button onClick={onClose} disabled={loading}>Close</button>
        <button onClick={handleBooking} disabled={loading || !topic.trim()}>
          {loading ? 'Booking...' : 'Book'}
        </button>
      </div>
    </div>
  );
}