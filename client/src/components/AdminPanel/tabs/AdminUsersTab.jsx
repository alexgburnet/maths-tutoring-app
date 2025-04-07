import { useEffect, useState } from 'react';
import UserService from '../../../services/UserService';
import UserModal from '../UserModal';

export default function AdminUsersTab() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        UserService.getAllUsers().then(setUsers);
    }, []);

    return (
        <div>
            <h2>Registered Users</h2>
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} onClick={() => setSelectedUser(user)} style={{ cursor: 'pointer' }}>
                                <td>{user.name} {user.surname}</td>
                                <td>{user.email}</td>
                                <td>{user.is_admin ? 'Admin' : 'User'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {selectedUser && <UserModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
        </div>
    );
}