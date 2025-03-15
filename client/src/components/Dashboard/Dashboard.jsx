import { useState, useEffect } from "react";
import BookingCard from "../BookingCard/BookingCard";
import Calendar from "../Calendar/Calendar";
import BookingModal from "../BookingModal/BookingModal";
import "./Dashboard.css";

export default function Dashboard({ onLogout }) {
  const [cancelLoading, setCancelLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
  {/* Left 2/3: Sessions container */}
  <div className="session-lists">
    <div className="session-split">
      {/* Left: Session list */}
      <div className="session-list-column">
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

      {/* Right: Session detail */}
      {!isMobile && (
        <div className={`booking-details ${selectedBooking ? "show" : "hidden"}`}>
          {selectedBooking && (
            <>
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
              <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
                <button onClick={() => setSelectedBooking(null)}>Close</button>
                {new Date(selectedBooking.scheduled_time).getTime() > Date.now() && (
                  <button
                    disabled={cancelLoading}
                    onClick={async () => {
                      setCancelLoading(true);
                      await fetch(`/api/bookings/${selectedBooking.id}`, {
                        method: "DELETE",
                        headers: { Authorization: token },
                      });
                      setCancelLoading(false);
                      fetchBookings();
                      setSelectedBooking(null);
                    }}
                  >
                    {cancelLoading ? <span className="spinner" /> : "Cancel Booking"}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {selectedBooking && window.innerWidth <= 768 && (
      <div className="mobile-modal" onClick={() => setSelectedBooking(null)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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

          <div style={{ marginTop: "1rem", display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
            <button onClick={() => setSelectedBooking(null)}>Close</button>
          </div>
        </div>
      </div>
    )}
    </div>
  </div>

  {/* Right 1/3: Calendar */}
  <div className="calendar-column">
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