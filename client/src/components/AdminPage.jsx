import { useState, useEffect } from "react";

export default function AdminPage() {
  const [startTime, setStartTime] = useState("");
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  const fetchSlots = async () => {
    const res = await fetch("/api/slots", {
      headers: { Authorization: token },
    });
    const data = await res.json();
    setSlots(Array.isArray(data) ? data : []);
  };

  const fetchBookings = async () => {
    const res = await fetch("/api/admin/bookings", {
      headers: { Authorization: token },
    });
    const data = await res.json();
    setBookings(Array.isArray(data) ? data : []);
  };

  const handleAddSlot = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/slots", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ start_time: startTime }),
    });

    if (res.ok) {
      setStartTime("");
      fetchSlots();
    }
    setLoading(false);
  };

  const handleDeleteSlot = async (id) => {
    await fetch(`/api/admin/slots/${id}`, {
      method: "DELETE",
      headers: { Authorization: token },
    });
    fetchSlots();
  };

  const handleCancelBooking = async (id) => {
    await fetch(`/api/bookings/${id}`, {
      method: "DELETE",
      headers: { Authorization: token },
    });
    fetchBookings();
    fetchSlots(); // refresh slot availability
  };

  useEffect(() => {
    fetchSlots();
    fetchBookings();
  }, []);

  const upcomingBookings = bookings.filter(
    (b) => new Date(b.scheduled_time).getTime() > Date.now()
  );

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Admin Panel: Manage Slots</h2>

      <div style={{ marginBottom: "2rem" }}>
        <label>
          New Slot:
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            style={{ marginLeft: "0.5rem" }}
          />
        </label>
        <button
          onClick={handleAddSlot}
          disabled={loading || !startTime}
          style={{ marginLeft: "1rem" }}
        >
          {loading ? "Adding..." : "Add Slot"}
        </button>
      </div>

      <h3>Available Slots</h3>
      <ul>
        {slots.map((slot) => (
          <li key={slot.id}>
            {new Date(slot.start_time).toLocaleString()} —{" "}
            {slot.booked ? "Booked" : "Available"}
            {!slot.booked && (
              <button
                onClick={() => handleDeleteSlot(slot.id)}
                style={{ marginLeft: "1rem" }}
              >
                ❌ Delete
              </button>
            )}
          </li>
        ))}
      </ul>

      <h3 style={{ marginTop: "3rem" }}>Upcoming Booked Sessions</h3>
      {upcomingBookings.length === 0 ? (
        <p>No upcoming sessions</p>
      ) : (
        <ul>
          {upcomingBookings.map((b) => (
            <li key={b.id}>
              {new Date(b.scheduled_time).toLocaleString()} —{" "}
              {b.user_name || b.student_name} ({b.topic})
              <button
                onClick={() => handleCancelBooking(b.id)}
                style={{ marginLeft: "1rem" }}
              >
                ❌ Cancel
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}