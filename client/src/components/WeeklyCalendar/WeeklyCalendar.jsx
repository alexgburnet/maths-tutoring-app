import React from 'react';
import SlotCard from '../SlotCard/SlotCard';
import './WeeklyCalendar.css';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function WeeklyCalendar({ slots }) {
  // Slots expected format: [{ id, startTime, user, day: 'Monday' }, ...]

  const slotsForDay = (day) => {
    return slots.filter(slot => slot.day === day);
  };

  return (
    <div className="calendar-grid">
      {daysOfWeek.map(day => (
        <div key={day} className="day-column">
          <h3 className="day-header">{day}</h3>
          <div className="slots">
            {slotsForDay(day).length > 0 ? (
              slotsForDay(day).map(slot => (
                <SlotCard key={slot.id} slot={slot} />
              ))
            ) : (
              <p className="no-slots">No slots</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}