import { useState, useEffect } from "react";
import BookingCard from "./BookingCard";
import Calendar from "./Calendar";
import BookingModal from "./BookingModal";

export default function Dashboard({ onLogout }) {
  const [bookings, setBookings] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  const fetchBookings = async () => {
    const res = await fetch("/api/bookings", {
      headers: { Authorization: token },
    });
    const data = await res.json();
    setBookings(data);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (id) => {
    await fetch(`/api/bookings/${id}`, {
      method: "DELETE",
      headers: { Authorization: token },
    });
    fetchBookings(); // refresh after cancellation
  };

  const upcoming = bookings.filter(
    (b) => new Date(b.scheduled_time).getTime() > Date.now()
  );
  const previous = bookings.filter(
    (b) => new Date(b.scheduled_time).getTime() <= Date.now()
  );

  return (
    <div className="dashboard-grid">
      {/* Left: Sessions */}
      <div className="session-lists">
        <h2>Upcoming Sessions</h2>
        {upcoming.length === 0 ? (
          <p>No upcoming sessions</p>
        ) : (
          upcoming.map((b) => (
            <div key={b.id} style={{ marginBottom: "1rem" }}>
              <BookingCard booking={b} />
              <button
                onClick={() => handleCancelBooking(b.id)}
                style={{ marginTop: "0.5rem" }}
              >
                ❌ Cancel
              </button>
            </div>
          ))
        )}

        <h2 style={{ marginTop: "2rem" }}>Previous Sessions</h2>
        {previous.length === 0 ? (
          <p>No previous sessions</p>
        ) : (
          previous.map((b) => <BookingCard key={b.id} booking={b} />)
        )}
      </div>

      {/* Right: Calendar */}
      <div className="calendar-column">
        <Calendar
          onSlotClick={(slot) => {
            setSelectedSlot(slot);
            setShowModal(true);
          }}
        />
      </div>

      {showModal && (
        <BookingModal
          slot={selectedSlot}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchBookings(); // refresh bookings instead of full reload
          }}
        />
      )}
    </div>
  );
}