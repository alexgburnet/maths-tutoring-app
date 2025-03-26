import React from 'react';
import './SlotCard.css';

export default function SlotCard({ slot, onSelect = () => {} }) {
  const isBooked = slot.booked; // ✅ check booked boolean from API

  const handleClick = () => {
    if (!isBooked) {
      onSelect(slot);
    }
  };

  return (
    <div
      className={`slot-card ${isBooked ? 'booked' : 'available'}`}
      onClick={handleClick}
    >
      <p className="slot-time">{slot.startTime}</p>
      {isBooked && slot.user?.name && (
        <p className="student-name">{slot.user.name}</p>
      )}
    </div>
  );
}