export default function BookingCard({ booking, isSelected }) {
    const { topic, scheduled_time, is_paid } = booking;
  
    return (
      <div
        style={{
          background: "#1e1e1e",
          padding: "1rem",
          borderRadius: "10px",
          marginBottom: "1rem",
          borderLeft: is_paid ? "4px solid #4caf50" : "4px solid #ff5252",
          border: isSelected ? "2px solid #4f83ff" : "2px solid transparent",
          cursor: "pointer",
          transition: "border 0.2s, background 0.2s",
          position: "relative",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#2a2a2a";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = isSelected ? "#2a2a2a" : "#1e1e1e";
        }}
      >
        <p>
          <strong>Topic:</strong> {topic}
        </p>
        <p>
          <strong>Time:</strong>{" "}
          {new Date(scheduled_time).toLocaleString()}
        </p>
  
        {/* ✅ Payment Status Indicator */}
        <div
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            fontSize: "0.85rem",
            fontWeight: "bold",
            color: is_paid ? "#4caf50" : "#ff5252",
          }}
        >
          {is_paid ? "✅ Paid" : "❌ Unpaid"}
        </div>
      </div>
    );
  }