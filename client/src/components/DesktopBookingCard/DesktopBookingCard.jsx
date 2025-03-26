import './DesktopBookingCard.css';

export default function DesktopBookingCard({ booking, isUpcoming, cancelBooking }) {
    return (
        <div className="booking-card" key={booking.id}>

            <div className="topic card-section">
                <p>topic</p>
                <h3 className="booking-header">{booking.topic}</h3>
            </div>

            <div className="vertical-line"></div>

            <div className="date card-section">
                <p>date</p>
                <h3>{new Date(booking.scheduled_time).toLocaleString()}</h3>
            </div>

            <div className="vertical-line"></div>

            <div className="zoom card-section">
                <p>zoom link</p>
                <h3>{booking.zoom_link ? <a href={booking.zoom_link} target="_blank" rel="noreferrer">Join Meeting</a> : "—"}</h3>
            </div>

            <div className="vertical-line"></div>

            <div className="reference card-section">
                <p>payment ref:</p>
                <h3>{booking.payment_ref}</h3>
            </div>

            <div className="vertical-line"></div>

            <div className="payment card-section">
                <span className={`status ${booking.is_paid ? "paid" : "unpaid"}`}>
                    {booking.is_paid ? "Paid" : "Unpaid"}
                </span>
            </div>

            {isUpcoming && (
                <>
                    <div className="vertical-line"></div>
                    <div className="cancel card-section">
                        <button className="cancel-button" onClick={() => cancelBooking(booking.id)}>
                            <p>Cancel</p>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
