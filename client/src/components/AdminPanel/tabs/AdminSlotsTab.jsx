import { useEffect, useState } from 'react';
import SlotService from '../../../services/SlotService';
import UserService from '../../../services/UserService';

export default function AdminSlotsTab() {
    const [slots, setSlots] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState({});
    const [startTime, setStartTime] = useState('');
    const [loadingSlots, setLoadingSlots] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(true);

    useEffect(() => {
        fetchSlots();
        fetchUsers();
    }, []);

    const fetchSlots = async () => {
        setLoadingSlots(true);
        try {
            const data = await SlotService.getAvailableSlots();
            const unbooked = data.filter(slot => !slot.booked);
            const sorted = [...unbooked].sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
            setSlots(sorted);
        } catch (err) {
            console.error('Error fetching slots', err);
        } finally {
            setLoadingSlots(false);
        }
    };

    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const userList = await UserService.getAllUsers();
            setUsers(userList);
        } catch (err) {
            console.error('Error fetching users', err);
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleAdd = async () => {
        try {
            await SlotService.addSlot(startTime);
            fetchSlots();
            setStartTime('');
        } catch (err) {
            console.error('Failed to add slot', err);
        }
    };

    const handleDelete = async (slotId) => {
        try {
            await SlotService.deleteSlot(slotId);
            fetchSlots();
        } catch (err) {
            console.error('Failed to delete slot', err);
        }
    };

    const handleAssign = async (slotId) => {
        const userId = selectedUsers[slotId];
        if (!userId) return;
        try {
            await SlotService.assignUserToSlot(slotId, userId);
            fetchSlots();
        } catch (err) {
            console.error('Failed to assign user to slot', err);
        }
    };

    const handleUserSelect = (slotId, userId) => {
        setSelectedUsers(prev => ({ ...prev, [slotId]: userId }));
    };

    return (
        <div>
            <h2>Manage Slots</h2>

            <div className="admin-form" style={{ maxWidth: '400px', marginBottom: '2rem' }}>
                <label htmlFor="slot-time">Add a new slot:</label>
                <input
                    id="slot-time"
                    type="datetime-local"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                />
                <button className="button-primary" onClick={handleAdd} disabled={!startTime}>
                    Add Slot
                </button>
            </div>

            {loadingSlots ? (
                <p className="loading">Loading slots...</p>
            ) : slots.length === 0 ? (
                <p className="empty-state">No unbooked slots found.</p>
            ) : (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Date & Time</th>
                                <th>Delete</th>
                                <th>Assign</th>
                            </tr>
                        </thead>
                        <tbody>
                            {slots.map(slot => (
                                <tr key={slot.id}>
                                    <td>{new Date(slot.start_time).toLocaleString()}</td>
                                    <td>
                                        <button
                                            onClick={() => handleDelete(slot.id)}
                                            className="button-danger"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                    <td>
                                        {loadingUsers ? (
                                            <span className="loading">Loading users...</span>
                                        ) : users.length === 0 ? (
                                            <span>No users</span>
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <select
                                                    value={selectedUsers[slot.id] || ''}
                                                    onChange={e => handleUserSelect(slot.id, e.target.value)}
                                                >
                                                    <option value="">Select user</option>
                                                    {users.map(user => (
                                                        <option key={user.id} value={user.id}>
                                                            {user.name || user.email}
                                                        </option>
                                                    ))}
                                                </select>
                                                <button
                                                    onClick={() => handleAssign(slot.id)}
                                                    disabled={!selectedUsers[slot.id]}
                                                    style={{ marginLeft: '0.5rem' }}
                                                >
                                                    Assign
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}