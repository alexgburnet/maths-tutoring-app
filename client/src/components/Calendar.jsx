import { useState, useEffect } from "react";

export default function Calendar({ onSlotClick }) {
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    const fetchSlots = async () => {
      const token = document.cookie.split("token=")[1];
      const res = await fetch("/api/slots", {
        headers: { Authorization: token },
      });
      const data = await res.json();
      setSlots(data);
    };

    fetchSlots();
  }, []);

  return (
    <div>
      <h3>Available Slots</h3>
      {slots.length === 0 ? (
        <p>No available slots</p>
      ) : (
        slots.map((slot) => (
          <div key={slot.id}>
            <button
              onClick={() => onSlotClick(slot.start_time)}
              style={{
                marginBottom: "1rem",
                width: "100%",
                padding: "0.5rem",
                background: "#2e2e2e",
                color: "#fff",
                border: "1px solid #444",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              {new Date(slot.start_time).toLocaleString()}
            </button>
          </div>
        ))
      )}
    </div>
  );
}