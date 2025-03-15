import { useState, useEffect } from "react";
import BookingCard from "./BookingCard";
import Calendar from "./Calendar";
import BookingModal from "./BookingModal";

export default function Dashboard({ onLogout }) {
  const [bookings, setBookings] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function fetchBookings() {
      const token = document.cookie.split("token=")[1];
      const res = await fetch("/api/bookings", {
        headers: { Authorization: token },
      });
      const data = await res.json();
      setBookings(data);
    }
    fetchBookings();
  }, []);

  const upcoming = bookings.filter(b => new Date(b.scheduled_time) > new Date());
  const previous = bookings.filter(b => new Date(b.scheduled_time) <= new Date());

  return (
    <div className="dashboard-grid">
      {/* Left: Sessions */}
      <div className="session-lists">
        <h2>Upcoming Sessions</h2>
        {upcoming.map(b => <BookingCard key={b.id} booking={b} />)}

        <h2 style={{ marginTop: "2rem" }}>Previous Sessions</h2>
        {previous.map(b => <BookingCard key={b.id} booking={b} />)}
      </div>

      {/* Right: Calendar */}
      <div className="calendar-column">
        <Calendar onSlotClick={slot => {
          setSelectedSlot(slot);
          setShowModal(true);
        }} />
      </div>

      {showModal && (
        <BookingModal
          slot={selectedSlot}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            window.location.reload(); // or refetch bookings
          }}
        />
      )}
    </div>
  );
}