import { useState, useEffect } from "react";

export default function AdminPage() {
  const [startTime, setStartTime] = useState("");
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [assigningSlotId, setAssigningSlotId] = useState(null);

  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

    const fetchUsers = async () => {
        const res = await fetch("/api/admin/users", {
          headers: { Authorization: token },
        });
        const data = await res.json();
        setUsers(data);
      };

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
    fetchUsers();
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
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
        <thead>
            <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Cancel</th>
            <th>Assign</th>
            </tr>
        </thead>
        <tbody>
            {slots.map((slot) => {
            const dt = new Date(slot.start_time);
            return (
                <tr key={slot.id} style={{ borderBottom: "1px solid #444" }}>
                <td>{dt.toLocaleDateString()}</td>
                <td>{dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                <td>
                    {!slot.booked && (
                    <button onClick={() => handleDeleteSlot(slot.id)}>❌</button>
                    )}
                </td>
                <td>
                    {!slot.booked && assigningSlotId === slot.id ? (
                    <select
                        onChange={async (e) => {
                        const userId = e.target.value;
                        await fetch("/api/admin/assign-slot", {
                            method: "POST",
                            headers: {
                            "Content-Type": "application/json",
                            Authorization: token,
                            },
                            body: JSON.stringify({ user_id: userId, slot_id: slot.id }),
                        });
                        setAssigningSlotId(null);
                        fetchSlots();
                        fetchBookings();
                        }}
                    >
                        <option value="">Select User</option>
                        {users.map((u) => (
                        <option key={u.id} value={u.id}>
                            {u.email}
                        </option>
                        ))}
                    </select>
                    ) : (
                    !slot.booked && (
                        <button onClick={() => setAssigningSlotId(slot.id)}>Assign</button>
                    )
                    )}
                </td>
                </tr>
            );
            })}
        </tbody>
        </table>

        <h3 style={{ marginTop: "3rem" }}>Upcoming Booked Sessions</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
        <thead>
            <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Student</th>
            <th>Topic</th>
            <th>Cancel</th>
            </tr>
        </thead>
        <tbody>
            {bookings
            .filter((b) => new Date(b.scheduled_time) > new Date())
            .map((b) => {
                const dt = new Date(b.scheduled_time);
                return (
                <tr key={b.id} style={{ borderBottom: "1px solid #444" }}>
                    <td>{dt.toLocaleDateString()}</td>
                    <td>{dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                    <td>{b.user_name || b.student_name}</td>
                    <td>{b.topic}</td>
                    <td>
                    <button
                        onClick={() => handleCancelBooking(b.id)}
                        style={{ cursor: "pointer" }}
                    >
                        ❌
                    </button>
                    </td>
                </tr>
                );
            })}
        </tbody>
        </table>

        
        <h3 style={{ marginTop: "3rem" }}>Previous Sessions</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
        <thead>
            <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Student</th>
            <th>Paid</th>
            </tr>
        </thead>
        <tbody>
            {bookings
            .filter((b) => new Date(b.scheduled_time) <= new Date())
            .map((b) => {
                const dt = new Date(b.scheduled_time);
                return (
                <tr key={b.id} style={{ borderBottom: "1px solid #444" }}>
                    <td>{dt.toLocaleDateString()}</td>
                    <td>{dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                    <td>{b.user_name || b.student_name}</td>
                    <td style={{ color: b.is_paid ? "#4caf50" : "#ff5252", fontWeight: "bold" }}>
                    {b.is_paid ? "✅" : "❌"}
                    </td>
                </tr>
                );
            })}
        </tbody>
        </table>
    </div>
  );
}