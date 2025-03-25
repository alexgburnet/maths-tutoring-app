import './MakeBooking.css';

import WeeklyCalendar from '../WeeklyCalendar/WeeklyCalendar';

export default function MakeBooking() {

    const sampleSlots = [
        { id: 1, startTime: '10:00 AM', day: 'Monday', user:"Alex"},
        { id: 2, startTime: '11:00 AM', day: 'Monday' },
        { id: 3, startTime: '10:00 AM', day: 'Tuesday' },
        { id: 4, startTime: '11:00 AM', day: 'Tuesday', user:"Alex"},
        { id: 5, startTime: '10:00 AM', day: 'Wednesday' },
        { id: 6, startTime: '11:00 AM', day: 'Wednesday' },
        { id: 7, startTime: '10:00 AM', day: 'Thursday', user:"Alex" },
        { id: 8, startTime: '11:00 AM', day: 'Thursday' },
        { id: 9, startTime: '10:00 AM', day: 'Friday' },
        { id: 10, startTime: '11:00 AM', day: 'Friday' },
      ];
    
    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className='page-title'>Make a Booking</h1>
                <hr classname='page-separator'/>
            </div>
            <div className='page-content'>
                <WeeklyCalendar slots={sampleSlots} />
            </div>
        </div>
    );
}
