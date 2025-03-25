import React from 'react';
import './SlotCard.css';

export default function SlotCard({ slot }) {
  const isBooked = !!slot.user;

  const handleClick = () => {
    if (!isBooked) {
      // Logic here!
    }
  };

  return (
    <div
      className={`slot-card ${isBooked ? 'booked' : 'available'}`}
      onClick={handleClick}
    >
      <p className="slot-time">{slot.startTime}</p>
      {isBooked && <p className="student-name">{slot.user.name}</p>}
    </div>
  );
}