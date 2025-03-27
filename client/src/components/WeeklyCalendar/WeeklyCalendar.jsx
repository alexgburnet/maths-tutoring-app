import React, { useState, useEffect, useRef } from 'react';
import { GoChevronRight, GoChevronLeft } from "react-icons/go";
import SlotCard from '../SlotCard/SlotCard';
import BookingForm from '../BookingForm/BookingForm';
import Modal from '../Modal/Modal';
import SlotService from '../../services/SlotService';
import AnimatedBookingForm from '../AnimatedBookingForm/AnimatedBookingForm';

import './WeeklyCalendar.css';

export default function WeeklyCalendar() {
  const [currentMonday, setCurrentMonday] = useState(getMonday());
  const [slots, setSlots] = useState([]);
  const [slideDirection, setSlideDirection] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedSlotRect, setSelectedSlotRect] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const contentRef = useRef();

  useEffect(() => {
    fetchSlots();
  }, [currentMonday]);

  const fetchSlots = async () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = currentMonday < today ? today : currentMonday;
  
    const weekEnd = new Date(currentMonday);
    weekEnd.setDate(weekEnd.getDate() + 4);
  
    if (weekStart > weekEnd) {
      setSlots([]);
      return;
    }
  
    const start = weekStart.toISOString().split('T')[0];
    const end = weekEnd.toISOString().split('T')[0];
  
    try {
      const data = await SlotService.getAvailableSlots(start, end);
      setSlots(data);
    } catch (err) {
      console.error('Failed to fetch slots', err);
    }
  };

  function getMonday(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getWeekDates = (startDate) => {
    return Array.from({ length: 5 }, (_, i) => {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      return d;
    });
  };

  const slotsForDate = (date) => {
    const formatted = date.toISOString().split('T')[0];
    return slots.filter(slot => slot.start_time.startsWith(formatted));
  };

  const goToPreviousWeek = () => {
    setSelectedSlot(null);
    setSlideDirection('slide-right');
    setCurrentMonday(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 7);
      return newDate;
    });
  };

  const goToNextWeek = () => {
    setSelectedSlot(null);
    setSlideDirection('slide-left');
    setCurrentMonday(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 7);
      return newDate;
    });
  };

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 1060);
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const closeForm = () => {
    setSelectedSlot(null);
    setSelectedSlotRect(null);
  };

  return (
    <div className='calendar-container' ref={contentRef}>
      <div className='date-selector'>
        <button onClick={goToPreviousWeek} className='date-selector-button'>
          <GoChevronLeft size={25} />
        </button>
        <h2 className='calendar-title'>{formatDate(currentMonday)}</h2>
        <button onClick={goToNextWeek} className='date-selector-button'>
          <GoChevronRight size={25} />
        </button>
      </div>

      <hr className='calendar-separator' />

      <div
        className={`calendar-grid calendar-transition ${slideDirection}`}
        onAnimationEnd={() => setSlideDirection('')}
      >
        {getWeekDates(currentMonday).map(date => (
          <div key={date.toISOString()} className="day-column">
            <h3 className="day-header">
              {date.toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'short',
              })}
            </h3>
            <div className="slots">
              {slotsForDate(date).length > 0 ? (
                slotsForDate(date).map(slot => {
                  const ref = React.createRef();
                  return (
                    <SlotCard
                      key={slot.id}
                      ref={ref}
                      slot={{
                        ...slot,
                        id: slot.id,
                        date: new Date(slot.start_time).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit',
                        }),
                        startTime: new Date(slot.start_time).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        }),
                        startIso: slot.start_time,
                      }}
                      onSelect={(slot) => {
                        const rect = ref.current.getBoundingClientRect();
                        setSelectedSlot(slot);
                        setSelectedSlotRect(rect);
                      }}
                    />
                  );
                })
              ) : (
                <p className="no-slots">No slots</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {!isMobile && selectedSlot && selectedSlotRect && (
        <AnimatedBookingForm
          rect={selectedSlotRect}
          slot={selectedSlot}
          onClose={closeForm}
          onBooked={() => {
            closeForm();
            fetchSlots();
          }}
        />
      )}

      {isMobile && (
        <Modal show={!!selectedSlot} onClose={closeForm}>
          <BookingForm
            slot={selectedSlot}
            onClose={closeForm}
            onBooked={() => {
              closeForm();
              fetchSlots();
            }}
          />
        </Modal>
      )}
    </div>
  );
}