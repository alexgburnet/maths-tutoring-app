import { useState, useEffect } from "react";
import './AdminPage.css';

export default function AdminPage() {
  const [startTime, setStartTime] = useState("");
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [assigningSlotId, setAssigningSlotId] = useState(null);
  const [notesFiles, setNotesFiles] = useState({});

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

  const handleCheckPayments = async () => {
    setPaymentLoading(true);
    await fetch("/api/admin/check-payments", {
      method: "POST",
      headers: { Authorization: token },
    });
  
    fetchBookings(); // Refresh updated payment statuses
    setPaymentLoading(false);
  };

  const downloadNotes = async (url) => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];
  
    if (!token) return alert("Not logged in.");
  
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: token
      }
    });
  
    if (!response.ok) {
      alert("Failed to download notes.");
      return;
    }
  
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
  
    // Optional: parse filename from header or fallback
    const contentDisposition = response.headers.get("Content-Disposition");
    const match = contentDisposition?.match(/filename="(.+)"/);
    const filename = match ? match[1] : "notes.pdf";
  
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    <div className="panel-container">
      <h2>Admin Panel: Manage Slots</h2>

      <div className="container">
        <label className="input-label">
          <h2 classname="new-slot-title">New Slot:</h2>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="input"
          />
        </label>
        <button
          onClick={handleAddSlot}
          disabled={loading || !startTime}
          className="slot-button"
        >
          {loading ? "Adding..." : "Add Slot"}
        </button>
      </div>

      <div className="container">
        <h3>Available Slots</h3>
        <table className="slot-table">
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
      </div>

      <div className="container">
        <h3>Upcoming Booked Sessions</h3>
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
                <tr key={b.id}>
                    <td>{dt.toLocaleDateString()}</td>
                    <td>{dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                    <td>{b.user_name || b.student_name}</td>
                    <td>{b.topic}</td>
                    <td>
                    <button onClick={() => handleCancelBooking(b.id)}>❌</button>
                    </td>
                </tr>
                );
            })}
        </tbody>
        </table>
        </div>

        <div className="container">
        <h3>Previous Sessions</h3>
        <div className="button-container">
            <h3>Previous Sessions</h3>
            <button
              onClick={handleCheckPayments}
              className="refresh-button"
              disabled={paymentLoading}
            >
              {paymentLoading ? (
                <span className="spinner" />
              ) : (
                "🔄 Refresh Payment Statuses"
              )}
            </button>
        </div>
        <table>
        <thead>
            <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Student</th>
            <th>Paid</th>
            <th>Upload Notes</th>
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
                        {b.is_paid ? (
                            "✅"
                        ) : (
                            <button
                            onClick={async () => {
                                await fetch(`/api/admin/mark-paid/${b.id}`, {
                                method: "POST",
                                headers: { Authorization: token },
                                });
                                fetchBookings(); // Refresh the list
                            }}
                            className="paid-button"
                            >
                            Mark as Paid
                            </button>
                        )}
                    </td>
                    <td>
                      {b.notes_url ? (
                        <button onClick={() => downloadNotes(b.notes_url)}>📥 Download Notes</button>
                      ) : (
                        <>
                          <input
                            type="file"
                            accept="application/pdf"
                            onChange={(e) =>
                              setNotesFiles({ ...notesFiles, [b.id]: e.target.files[0] })
                            }
                          />
                          <button
                            onClick={async () => {
                              const file = notesFiles[b.id];
                              if (!file) return alert("Please select a file first.");
                              const formData = new FormData();
                              formData.append("notes", file);

                              const res = await fetch(`/api/admin/upload-notes/${b.id}`, {
                                method: "POST",
                                headers: { Authorization: token },
                                body: formData,
                              });

                              if (res.ok) {
                                alert("✅ Notes uploaded!");
                                fetchBookings();
                              } else {
                                alert("❌ Failed to upload notes");
                              }
                            }}
                          >
                            Upload
                          </button>
                        </>
                      )}
                    </td>
                </tr>
                );
            })}
        </tbody>
        </table>
      </div>
    </div>
  );
}