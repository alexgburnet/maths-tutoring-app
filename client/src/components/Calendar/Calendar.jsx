import { useState, useEffect } from "react";
import "./Calendar.css";

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

    const handler = () => fetchSlots();
    document.addEventListener("refresh-slots", handler);

    return () => {
        document.removeEventListener("refresh-slots", handler);
    };
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
              className="available-slot"
            >
              {new Date(slot.start_time).toLocaleString()}
            </button>
          </div>
        ))
      )}
    </div>
  );
}