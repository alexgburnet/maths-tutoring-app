import { useEffect, useState } from 'react';
import BookingService from '../../services/BookingService';
import FileService from '../../services/FileService';
import './Worksheets.css';

export default function Worksheets() {
  const [worksheetBookings, setWorksheetBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    BookingService.getBookingsWithFollowups()
      .then(data => {
        const sorted = data.sort((a, b) => new Date(b.scheduled_time) - new Date(a.scheduled_time));
        setWorksheetBookings(sorted);
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
        <h1 className="page-title">Worksheets</h1>
        <hr className="page-separator" />
      </div>
      <div className="page-content">
        {loading ? (
          <p>Loading worksheets...</p>
        ) : worksheetBookings.length === 0 ? (
          <p>No follow-up worksheets available yet.</p>
        ) : (
          <div className="worksheets-grid">
            {worksheetBookings.map(booking => (
              <div
                key={booking.id}
                className="worksheet-card"
                onClick={() => downloadFile(booking.followup_url)}
              >
                <h3>Click to download the AI-generated worksheet on <span>{booking.topic}</span></h3>
                <p>{new Date(booking.scheduled_time).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}