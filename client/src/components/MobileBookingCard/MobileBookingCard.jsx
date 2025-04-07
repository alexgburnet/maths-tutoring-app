import './MobileBookingCard.css';

export default function MobileBookingCard({ booking, isUpcoming, cancelBooking }) {
    const sections = [
        {
            label: 'topic',
            content: <h3 className="booking-header">{booking.topic_display || 'General'}</h3>,
        },
        {
            label: 'date',
            content: <h3>{new Date(booking.scheduled_time).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</h3>,
        },
        {
            label: 'payment ref:',
            content: <h3>{booking.payment_ref}</h3>,
        },
        {
            label: 'status',
            content: (
                <span className={`status ${booking.is_paid ? 'paid' : 'unpaid'}`}>
                    {booking.is_paid ? 'Paid' : 'Unpaid'}
                </span>
            ),
        },
        {
            label: 'zoom link',
            content: (
                <h3>
                    {booking.zoom_link ? (
                        <a href={booking.zoom_link} target="_blank" rel="noreferrer">
                            Join Meeting
                        </a>
                    ) : (
                        '—'
                    )}
                </h3>
            ),
        },
    ];

    // Group sections into rows of 2
    const groupedSections = [];
    for (let i = 0; i < sections.length; i += 2) {
        groupedSections.push(sections.slice(i, i + 2));
    }

    return (
        <div className="mobile-booking-card" key={booking.id}>
            {groupedSections.map((pair, idx) => (
                <div className="mobile-row" key={idx}>
                    {pair.map((section, i) => (
                        <div key={i} className="mobile-section">
                            <p className="mobile-label">{section.label}</p>
                            {section.content}
                        </div>
                    ))}
                </div>
            ))}

            {isUpcoming && (
                <div className="mobile-row full-width">
                    <button className="cancel-button" onClick={() => cancelBooking(booking.id)}>
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
}