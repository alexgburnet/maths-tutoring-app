import './BookingCard.css';

export default function BookingCard({ booking, isUpcoming, cancelBooking }) {


    return (
        <div className="booking-card" key={booking.id}>
            <h3 className="booking-header">{booking.topic}</h3>
            <div class="vertical-line"></div>
            <p><strong>Date:</strong> {new Date(booking.scheduled_time).toLocaleString()}</p>
            <div class="vertical-line"></div>
            <p><strong>Zoom:</strong> {booking.zoom_link ? <a href={booking.zoom_link} target="_blank" rel="noreferrer">Join Meeting</a> : "—"}</p>
            <div class="vertical-line"></div>
            <p><strong>Payment Ref:</strong> {booking.payment_ref}</p>
            <div class="vertical-line"></div>
            {isUpcoming && (
                <>
                    <button className="cancel-button" onClick={() => cancelBooking(booking.id)}>
                        Cancel Booking
                    </button>
                    <div class="vertical-line"></div>
                </>
            )}
            <span className={`status ${booking.is_paid ? "paid" : "unpaid"}`}>
                    {booking.is_paid ? "Paid" : "Unpaid"}
            </span>
        </div>
    );
}