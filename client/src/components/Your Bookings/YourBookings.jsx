import React, { useEffect, useState, useRef } from 'react';
import BookingService from '../../services/BookingService';
import './YourBookings.css';

import DesktopBookingCard from '../DesktopBookingCard/DesktopBookingCard';
import MobileBookingCard from '../MobileBookingCard/MobileBookingCard';

export default function Bookings() {
    const [upcoming, setUpcoming] = useState([]);
    const [previous, setPrevious] = useState([]);
    const [loading, setLoading] = useState(true);
    const containerRef = useRef(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const el = containerRef.current;
        if (el) {
          setIsMobile(el.offsetWidth < 768); // set it initially
          const observer = new ResizeObserver(entries => {
            for (let entry of entries) {
              const width = entry.contentRect.width;
              setIsMobile(width < 768);
            }
          });
      
          observer.observe(el);
      
          return () => observer.disconnect();
        }
      }, []);

    useEffect(() => {
        BookingService.getUserBookings()
            .then(data => {
                const now = new Date();
                const upcomingBookings = data.filter(b => new Date(b.scheduled_time) >= now);
                const previousBookings = data.filter(b => new Date(b.scheduled_time) < now);

                upcomingBookings.sort((a, b) => new Date(a.scheduled_time) - new Date(b.scheduled_time));
                previousBookings.sort((a, b) => new Date(b.scheduled_time) - new Date(a.scheduled_time));

                setUpcoming(upcomingBookings);
                setPrevious(previousBookings);
            })
            .finally(() => setLoading(false));
    }, []);

    const cancelBooking = async (id) => {
        if (window.confirm("Are you sure you want to cancel this booking?")) {
            await BookingService.deleteBooking(id);
            setUpcoming(prev => prev.filter(b => b.id !== id));
        }
    };

    return (
        <div className="page-container" ref={containerRef}>
            <div className="page-header">
                <h1 className="page-title">Your Bookings</h1>
                <hr className="page-separator" />
            </div>

            {loading ? (
                <p>Loading bookings...</p>
            ) : (
                <div className="page-content">
                    <section className='upcoming-bookings'>
                        <h2>Upcoming Bookings</h2>
                        {upcoming.length > 0 ? (
                            <div className="booking-grid">
                                {isMobile 
                                    ? upcoming.map((b, index) => (
                                        <MobileBookingCard 
                                            key={b.id || index} 
                                            booking={b} 
                                            isUpcoming={true} 
                                            cancelBooking={cancelBooking} 
                                        />
                                    )) 
                                    : upcoming.map((b, index) => (
                                        <DesktopBookingCard 
                                            key={b.id || index} 
                                            booking={b} 
                                            isUpcoming={true} 
                                            cancelBooking={cancelBooking} 
                                        />
                                    ))}
                            </div>
                        ) : <p>No upcoming bookings</p>}
                    </section>

                    <section className='previous-bookings'>
                        <h2>Previous Bookings</h2>
                        {previous.length > 0 ? (
                            <div className="booking-grid">
                                {isMobile 
                                    ? previous.map((b, index) => (
                                        <MobileBookingCard 
                                            key={b.id || index} 
                                            booking={b} 
                                            isUpcoming={false} 
                                        />
                                    )) 
                                    : previous.map((b, index) => (
                                        <DesktopBookingCard 
                                            key={b.id || index} 
                                            booking={b} 
                                            isUpcoming={false} 
                                        />
                                    ))}
                            </div>
                        ) : <p>No previous bookings</p>}
                    </section>
                </div>
            )}
        </div>
    );
}