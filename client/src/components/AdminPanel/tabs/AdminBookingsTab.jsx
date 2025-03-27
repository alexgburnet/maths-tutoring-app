import { useEffect, useState } from 'react';
import BookingService from '../../../services/BookingService';
import FileService from '../../../services/FileService';
import AdminService from '../../../services/AdminService';

export default function AdminBookingsTab() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploadingId, setUploadingId] = useState(null);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        setLoading(true);
        const data = await BookingService.getAllBookings();
        const sorted = [...data].sort((a, b) => new Date(b.scheduled_time) - new Date(a.scheduled_time));
        setBookings(sorted);
        setLoading(false);
    };

    const handleMarkPaid = async (id) => {
        await BookingService.markBookingPaid(id);
        fetchBookings();
    };

    const handleCheckPayment = async (id) => {
        await BookingService.checkPayment(id);
        fetchBookings();
    };

    const handleRegenerateFollowup = async (id) => {
        await AdminService.regenerateFollowup(id);
        fetchBookings();
    };

    const handleDeleteNotes = async (id) => {
        await BookingService.deleteNotes(id);
        fetchBookings();
    };

    const handleUploadNotes = async (e, bookingId) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadingId(bookingId);
        await FileService.uploadNotes(bookingId, file);
        setUploadingId(null);
        fetchBookings();
    };

    const handleDeleteBooking = async (id) => {
        await BookingService.deleteBooking(id);
        fetchBookings();
    };

    const downloadFile = async (url) => {
        try {
          await FileService.downloadNotes(url);
        } catch (err) {
          console.error('Failed to download file', err);
        }
    };

    return (
        <div>
            <h2>Manage Bookings</h2>
            {loading ? (
                <p>Loading bookings...</p>
            ) : (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Student</th>
                                <th>Topic</th>
                                <th>Time</th>
                                <th>Paid</th>
                                <th>Notes</th>
                                <th>Follow-up</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((b) => (
                                <tr key={b.id}>
                                    <td>{b.id}</td>
                                    <td>{b.student_name}</td>
                                    <td>{b.topic}</td>
                                    <td>{new Date(b.scheduled_time).toLocaleString()}</td>
                                    <td>{b.is_paid ? "✅" : "❌"}</td>
                                    <td>
                                        {b.notes_url ? (
                                            <>
                                                <button onClick={() => downloadFile(b.notes_url.split('/').pop())}>
                                                    Download
                                                </button>
                                                <button onClick={() => handleDeleteNotes(b.id)} className="button-danger">🗑</button>
                                            </>
                                        ) : (
                                            <input
                                                type="file"
                                                accept="application/pdf"
                                                onChange={(e) => handleUploadNotes(e, b.id)}
                                                disabled={uploadingId === b.id}
                                            />
                                        )}
                                    </td>
                                    <td>
                                        {b.followup_url ? (
                                            <button onClick={() => downloadFile(b.followup_url.split('/').pop())}>
                                                Download
                                            </button>
                                        ) : (
                                            <button onClick={() => handleRegenerateFollowup(b.id)}>↻</button>
                                        )}
                                    </td>
                                    <td>
                                        <button onClick={() => handleMarkPaid(b.id)}>💰</button>
                                        <button onClick={() => handleCheckPayment(b.id)}>🔍</button>
                                        <button onClick={() => handleDeleteBooking(b.id)} className="button-danger">❌</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}