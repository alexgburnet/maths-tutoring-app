export default function BookingCard({ booking }) {
    const date = new Date(booking.scheduled_time).toLocaleString();
    return (
      <div className="card">
        <p><strong>{booking.topic}</strong></p>
        <p>{date}</p>
      </div>
    );
  }