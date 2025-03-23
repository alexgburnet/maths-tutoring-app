import { useState, useEffect } from "react";
import BookingCard from "../BookingCard/BookingCard";
import Calendar from "../Calendar/Calendar";
import BookingModal from "../BookingModal/BookingModal";
import "./Dashboard.css";

export default function Dashboard({ onLogout }) {
  const [cancelLoading, setCancelLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [showScrollArrow, setShowScrollArrow] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const el = document.querySelector('.session-list-column');
    if (!el) return;
  
    const handleScroll = () => {
      // Show arrow only when scrolled to the top
      setShowScrollArrow(el.scrollTop <= 5);
    };
  
    el.addEventListener('scroll', handleScroll);
  
    // Run once on mount to set correct state
    handleScroll();
  
    return () => {
      el.removeEventListener('scroll', handleScroll);
    };
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

  const refreshPayment = async (id) => {
    setRefreshLoading(true);
    try {
      const res = await fetch(`/api/bookings/${id}/check_payment`, {
        method: "POST",
        headers: { Authorization: token },
      });
  
      const data = await res.json();
      alert(data.message);
      fetchBookings(); // update the UI
    } catch (err) {
      alert("Failed to check payment status.");
      console.error("Payment check error:", err);
    } finally {
      setRefreshLoading(false);
    }
  };

  const downloadNotes = async (url) => {
    setDownloadLoading(true);
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: token,
        },
      });
  
      if (!response.ok) {
        alert("❌ Failed to download notes.");
        return;
      }
  
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
  
      const contentDisposition = response.headers.get("Content-Disposition");
      const match = contentDisposition?.match(/filename="(.+)"/);
      const filename = match ? match[1] : "notes.pdf";
  
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download error:", error);
      alert("Something went wrong while downloading.");
    } finally {
      setDownloadLoading(false); // ✅ Moved here
    }
  };

  const downloadFollowup = async (url) => {
    setDownloadLoading(true);
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: token,
        },
      });
  
      if (!response.ok) {
        alert("❌ Failed to download follow-up questions.");
        return;
      }
  
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
  
      const contentDisposition = response.headers.get("Content-Disposition");
      const match = contentDisposition?.match(/filename="(.+)"/);
      const filename = match ? match[1] : "followup_questions.pdf";
  
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download error:", error);
      alert("Something went wrong while downloading.");
    } finally {
      setDownloadLoading(false);
    }
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
        {upcoming.length === 0 ? (
          <p className="empty-text">No upcoming sessions</p>
        ) : (
          upcoming.map((b) => (
            <div key={b.id} onClick={() => setSelectedBooking(b)}>
              <BookingCard
                booking={b}
                isSelected={selectedBooking?.id === b.id}
              />
            </div>
          ))
        )}

        <h2 style={{ marginTop: "2rem" }}>Previous Sessions</h2>
        {previous.length === 0 ? (
          <p className="empty-text">No previous sessions</p>
        ) : (
          previous.map((b) => (
            <div key={b.id} onClick={() => setSelectedBooking(b)}>
              <BookingCard
                booking={b}
                isSelected={selectedBooking?.id === b.id}
              />
            </div>
          ))
        )}
        {(upcoming.length || previous.length) && (
          <div className={`scroll-arrow ${!showScrollArrow ? 'fade-out' : ''}`}>
            Scroll for more
          </div>
        )}
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
                {!selectedBooking.is_paid && (
                  <button
                    onClick={() => refreshPayment(selectedBooking.id)}
                    disabled={refreshLoading}
                  >
                    {refreshLoading ? <span className="spinner" /> : "🔄 Refresh Payment Status"}
                  </button>
                )}
                {selectedBooking.notes_url && (
                  <button onClick={() => downloadNotes(selectedBooking.notes_url)} disabled={downloadLoading}>
                    {downloadLoading ? <span className="spinner" /> : <span>📥 Download Notes</span>}
                  </button>
                )}
                {selectedBooking.notes_url && (
                  <button onClick={() => downloadNotes(selectedBooking.notes_url)} disabled={downloadLoading}>
                    {downloadLoading ? <span className="spinner" /> : <span>📥 Download Notes</span>}
                  </button>
                )}
                {selectedBooking.followup_url && (
                  <button onClick={() => downloadFollowup(selectedBooking.followup_url)} disabled={downloadLoading}>
                    {downloadLoading ? <span className="spinner" /> : <span>📘 Download Follow-up Questions</span>}
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

          <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem", justifyContent: "flex-end" }}>
            
            {!selectedBooking.is_paid && (
              <button
                onClick={() => refreshPayment(selectedBooking.id)}
                disabled={refreshLoading}
              >
                {refreshLoading ? <span className="spinner" /> : "🔄 Refresh Payment Status"}
              </button>
            )}
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
                {selectedBooking.notes_url && (
                  <button onClick={() => downloadNotes(selectedBooking.notes_url)} disabled={downloadLoading}>
                    {downloadLoading ? <span className="spinner" /> : <span>📥 Download Notes</span>}
                  </button>
                )}
                {selectedBooking.followup_url && (
                  <button onClick={() => downloadFollowup(selectedBooking.followup_url)} disabled={downloadLoading}>
                    {downloadLoading ? <span className="spinner" /> : <span>📘 Download Follow-up Questions</span>}
                  </button>
                )}
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