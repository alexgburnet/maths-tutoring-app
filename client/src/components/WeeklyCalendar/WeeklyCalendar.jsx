import React from 'react';
import { useState } from 'react';
import { GoChevronRight, GoChevronLeft } from "react-icons/go";

import SlotCard from '../SlotCard/SlotCard';
import './WeeklyCalendar.css';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function WeeklyCalendar({ slots }) {
  // Slots expected format: [{ id, startTime, user, day: 'Monday' }, ...]

  const [week, setWeekSlots] = useState(slots);

  const slotsForDay = (day) => {
    return slots.filter(slot => slot.day === day);
  };

  return (
    <div className='calendar-container'>
        <div className='date-selector'>
            <button className='date-selector-button'><GoChevronLeft size={25}/></button>
            <h2 className='calendar-title'>24/03/2025</h2>
            <button className='date-selector-button'><GoChevronRight size={25}/></button>
        </div>
        <hr className='calendar-separator'/>
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
    </div>
  );
}