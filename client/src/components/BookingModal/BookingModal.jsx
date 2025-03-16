import { useState } from "react";
import "./BookingModal.css";

export default function BookingModal({ slot, onClose, onSuccess }) {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    const token = document.cookie.split("token=")[1];
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({
        topic,
        scheduled_time: slot,
      }),
    });
  
    setLoading(false);
  
    const data = await res.json();
  
    if (res.ok) {
      onSuccess();
    } else {
      console.error("Booking error:", data.error);
      alert(data.error || "Booking failed.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>Book Session</h3>
        <p>Time: {new Date(slot).toLocaleString()}</p>
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="What topic do you want help with?"
        />
        <button onClick={handleConfirm} disabled={loading}>
            {loading ? (
                <span className="spinner" />
            ) : (
                "Confirm Booking"
            )}
        </button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}