import { useState, useEffect } from "react";
import BookingCard from "./BookingCard";
import Calendar from "./Calendar";
import BookingModal from "./BookingModal";

export default function Dashboard({ onLogout }) {
  const [bookings, setBookings] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

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
      {/* Left Column: Upcoming Sessions */}
      <div
        className="session-lists"
        style={{ flex: selectedBooking ? 1 : 2 }}
      >
        <h2>Upcoming Sessions</h2>
        {upcoming.map((b) => (
          <div key={b.id} onClick={() => setSelectedBooking(b)}>
            <BookingCard
              booking={b}
              isSelected={selectedBooking?.id === b.id}
            />
          </div>
        ))}

        <h2 style={{ marginTop: "2rem" }}>Previous Sessions</h2>
        {previous.map((b) => (
          <div key={b.id} onClick={() => setSelectedBooking(b)}>
            <BookingCard
              booking={b}
              isSelected={selectedBooking?.id === b.id}
            />
          </div>
        ))}
      </div>

      {/* Middle Column: Selected Booking Details */}
      {selectedBooking && (
        <div
          className="booking-details"
          style={{
            flex: 1,
            paddingLeft: "2rem",
            background: "#222",
            color: "#fff",
            borderRadius: "12px",
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <h3>Session Details</h3>
          <p><strong>Topic:</strong> {selectedBooking.topic}</p>
          <p><strong>Time:</strong> {new Date(selectedBooking.scheduled_time).toLocaleString()}</p>
          <p><strong>Payment Reference:</strong> {selectedBooking.payment_ref}</p>
          <p><strong>Status:</strong> {selectedBooking.is_paid ? "✅ Paid" : "❌ Unpaid"}</p>
          {selectedBooking.zoom_link && (
            <p>
              <strong>Zoom Link:</strong>{" "}
              <a
                href={selectedBooking.zoom_link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#4f83ff", textDecoration: "underline" }}
              >
                Join Meeting
              </a>
            </p>
          )}

          {/* Action Buttons */}
          <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
            <button
              onClick={() => setSelectedBooking(null)}
              style={{
                padding: "0.5rem 1rem",
                background: "#666",
                border: "none",
                borderRadius: "6px",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Close
            </button>

            {new Date(selectedBooking.scheduled_time).getTime() > Date.now() && (
              <button
                onClick={async () => {
                  await fetch(`/api/bookings/${selectedBooking.id}`, {
                    method: "DELETE",
                    headers: { Authorization: token },
                  });
                  fetchBookings();
                  setSelectedBooking(null);
                }}
                style={{
                  padding: "0.5rem 1rem",
                  background: "#e53935",
                  border: "none",
                  borderRadius: "6px",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Cancel Booking
              </button>
            )}
          </div>
        </div>
      )}

      {/* Right Column: Calendar */}
      <div className="calendar-column" style={{ flex: 1.5 }}>
        {showModal ? (
          <BookingModal
            slot={selectedSlot}
            onClose={() => setShowModal(false)}
            onSuccess={() => {
              setShowModal(false);
              fetchBookings();
              document.dispatchEvent(new Event("refresh-slots"));
            }}
          />
        ) : (
          <Calendar
            onSlotClick={(slot) => {
              setSelectedSlot(slot);
              setShowModal(true);
            }}
          />
        )}
      </div>
    </div>
  );
}