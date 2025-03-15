import './BookingCard.css';

export default function BookingCard({ booking, isSelected }) {
  const { topic, scheduled_time, is_paid } = booking;

  const classes = [
    "booking-card",
    is_paid ? "paid" : "unpaid",
    isSelected ? "selected" : "",
  ].join(" ");

  return (
    <div className={classes}>
      <p>
        <strong>Topic:</strong> {topic}
      </p>
      <p>
        <strong>Time:</strong>{" "}
        {new Date(scheduled_time).toLocaleString()}
      </p>

      <div className="payment-status">
        {is_paid ? "✅ Paid" : "❌ Unpaid"}
      </div>
    </div>
  );
}