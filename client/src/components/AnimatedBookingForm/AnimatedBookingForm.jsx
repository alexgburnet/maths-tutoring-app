import React, { useEffect, useState, useRef } from 'react';
import BookingForm from '../BookingForm/BookingForm';
import './AnimatedBookingForm.css';

export default function AnimatedBookingForm({ rect, slot, onClose }) {
  const [animate, setAnimate] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const formRef = useRef();

  // Trigger the "open" animation on mount
  useEffect(() => {
    requestAnimationFrame(() => {
      setAnimate(true);
    });
  }, []);

  // When close is called, reverse the animation then call onClose after timeout
  const handleClose = () => {
    setAnimate(false); // triggers reverse animation
    setIsClosing(true);

    // After animation ends, call parent onClose
    setTimeout(() => {
      onClose();
    }, 300); // match the duration in your CSS
  };

  return (
    <div
      ref={formRef}
      className={`animated-booking-form ${animate ? 'animate' : ''}`}
      style={{
        top: `${rect.top}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
      }}
    >
      <BookingForm slot={slot} onClose={handleClose} />
    </div>
  );
}