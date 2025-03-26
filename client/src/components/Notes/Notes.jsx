import { useEffect, useState } from 'react';
import BookingService from '../../services/BookingService';
import './Notes.css';

export default function Notes() {
  const [notesBookings, setNotesBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    BookingService.getBookingsWithNotes()
      .then(data => {
        // Sort by scheduled_time (newest first)
        const sorted = data.sort((a, b) => new Date(b.scheduled_time) - new Date(a.scheduled_time));
        setNotesBookings(sorted);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Notes</h1>
        <hr className="page-separator" />
      </div>
      <div className="page-content">
        {loading ? (
          <p>Loading notes...</p>
        ) : notesBookings.length === 0 ? (
          <p>No notes available yet.</p>
        ) : (
          <div className="notes-grid">
            {notesBookings.map(booking => (
              <a
                key={booking.id}
                href={booking.notes_url}
                target="_blank"
                rel="noopener noreferrer"
                className="note-card"
              >
                <h3>{booking.topic}</h3>
                <p>{new Date(booking.scheduled_time).toLocaleDateString()}</p>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}