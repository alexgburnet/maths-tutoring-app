import './AdminPanel.css';
import { useState } from 'react';
import AdminSlotsTab from './tabs/AdminSlotsTab';
import AdminUsersTab from './tabs/AdminUsersTab';
import AdminBookingsTab from './tabs/AdminBookingsTab';

export default function AdminPanel() {
    const [activeTab, setActiveTab] = useState('slots');

    const renderTab = () => {
        switch (activeTab) {
            case 'slots': return <AdminSlotsTab />;
            case 'users': return <AdminUsersTab />;
            case 'bookings': return <AdminBookingsTab />;
            default: return null;
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Admin Panel</h1>
                <hr className="page-separator" />
            </div>

            <div className="page-content">
                <div className="settings-tabs">
                    <button className={`tab ${activeTab === 'slots' ? 'active' : ''}`} onClick={() => setActiveTab('slots')}>Slots</button>
                    <button className={`tab ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>Bookings</button>
                    <button className={`tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Users</button>
                </div>
                <div className="admin-tab-content">{renderTab()}</div>
            </div>
        </div>
    );
}