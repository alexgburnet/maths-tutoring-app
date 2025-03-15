import { useState, useEffect } from "react";

export default function AdminPage() {
  const [startTime, setStartTime] = useState("");
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = document.cookie.split("token=")[1];

  const fetchSlots = async () => {
    const res = await fetch("/api/slots", {
      headers: { Authorization: token },
    });
    const data = await res.json();
    setSlots(data);
  };

  const handleAddSlot = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/slots", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({
        start_time: startTime,
      }),
    });

    if (res.ok) {
      setStartTime("");
      fetchSlots();
    } else {
      console.error("Failed to create slot");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Admin Panel: Manage Slots</h2>

      <div style={{ marginBottom: "2rem" }}>
        <label>
          New Slot (ISO format):
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </label>
        <button onClick={handleAddSlot} disabled={loading || !startTime}>
          {loading ? "Adding..." : "Add Slot"}
        </button>
      </div>

      <h3>Available Slots</h3>
      <ul>
        {slots.map((slot) => (
          <li key={slot.id}>
            {new Date(slot.start_time).toLocaleString()} —{" "}
            {slot.booked ? "Booked" : "Available"}
          </li>
        ))}
      </ul>
    </div>
  );
}