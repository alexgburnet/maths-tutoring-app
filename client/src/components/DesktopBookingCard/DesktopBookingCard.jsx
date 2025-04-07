import './DesktopBookingCard.css';
import PlanService from '../../services/PlanService';
import { useState, useEffect } from 'react';

export default function DesktopBookingCard({ booking, isUpcoming, cancelBooking }) {
    const [isMarkingComplete, setIsMarkingComplete] = useState(false);
    const [localCompletedStatus, setLocalCompletedStatus] = useState(booking.entry_completed || false);

    useEffect(() => {
        setLocalCompletedStatus(booking.entry_completed || false);
    }, [booking.entry_completed]);

    const handleMarkComplete = async (entryId) => {
        if (!entryId) return;
        setIsMarkingComplete(true);
        try {
            await PlanService.markEntryComplete(entryId);
            setLocalCompletedStatus(true);
        } catch (error) {
            console.error("Failed to mark entry complete:", error);
            setIsMarkingComplete(false);
        }
    };

    const showCompletionSection = !isUpcoming && booking.entry_id;

    return (
        <div className="booking-card" key={booking.id}>

            <div className="topic card-section">
                <p>topic</p>
                <h3 className="booking-header">{booking.topic_display || 'General'}</h3>
            </div>

            <div className="vertical-line"></div>

            <div className="date card-section">
                <p>date</p>
                <h3>{new Date(booking.scheduled_time).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</h3>
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

            {showCompletionSection && (
                 <>
                     <div className="vertical-line"></div>
                     <div className="completion card-section">
                         <p>Happy with this topic?</p>
                         <button 
                             className="mark-complete-button" 
                             onClick={() => handleMarkComplete(booking.entry_id)}
                             disabled={isMarkingComplete || localCompletedStatus}
                         >
                             {localCompletedStatus ? 'Completed' : (isMarkingComplete ? 'Marking...' : 'Mark Complete')}
                         </button>
                     </div>
                 </>
             )}

            {isUpcoming && (
                <>
                    <div className="vertical-line"></div>
                    <div className="cancel card-section">
                        <button className="cancel-button" onClick={() => cancelBooking(booking.id)}>
                            Cancel
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
