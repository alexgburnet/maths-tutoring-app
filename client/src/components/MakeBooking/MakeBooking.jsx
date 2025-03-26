import './MakeBooking.css';

import WeeklyCalendar from '../WeeklyCalendar/WeeklyCalendar';

export default function MakeBooking() {    
    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className='page-title'>Book A Session</h1>
                <hr classname='page-separator'/>
            </div>
            <div className='page-content'>
                <WeeklyCalendar />
            </div>
        </div>
    );
}
