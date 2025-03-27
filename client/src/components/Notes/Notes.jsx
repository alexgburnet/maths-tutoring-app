import { useEffect, useState } from 'react';
import BookingService from '../../services/BookingService';
import FileService from '../../services/FileService';
import './Notes.css';

export default function Notes() {
  const [notesBookings, setNotesBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    BookingService.getBookingsWithNotes()
      .then(data => {
        const sorted = data.sort((a, b) => new Date(b.scheduled_time) - new Date(a.scheduled_time));
        setNotesBookings(sorted);
      })
      .finally(() => setLoading(false));
  }, []);

  const downloadFile = async (url) => {
        try {
        await FileService.downloadNotes(url);
        } catch (err) {
        console.error('Failed to download file', err);
        }
    };

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
              <div
                key={booking.id}
                className="note-card"
                onClick={() => downloadFile(booking.notes_url)}
              >
                <h3>Click for notes on <span>{booking.topic}</span></h3>
                <p>{new Date(booking.scheduled_time).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}