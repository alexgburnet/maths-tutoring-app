import React from 'react';
import './SlotCard.css';

const SlotCard = React.forwardRef(({ slot, onSelect = () => {} }, ref) => {
  const isBooked = slot.booked;

  const handleClick = () => {
    if (!isBooked) {
      onSelect(slot, ref); // 👈 pass the ref to the parent
    }
  };

  return (
    <div
      ref={ref}
      className={`slot-card ${isBooked ? 'booked' : 'available'}`}
      onClick={handleClick}
    >
      <p className="slot-time">{slot.startTime}</p>
      {isBooked && slot.user?.name && (
        <p className="student-name">{slot.user.name}</p>
      )}
    </div>
  );
});

export default SlotCard;