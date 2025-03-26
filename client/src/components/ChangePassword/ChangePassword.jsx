import './ChangePassword.css';
import { useState } from 'react';
import UserService from '../../services/UserService';
import Modal from '../../components/Modal/Modal'; // adjust path if needed

export default function ChangePassword() {
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [status, setStatus] = useState({ loading: false, error: '', showSuccessModal: false });

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, error: '', showSuccessModal: false });
    
        if (formData.newPassword !== formData.confirmPassword) {
            setStatus({ loading: false, error: "New passwords don't match", showSuccessModal: false });
            return;
        }
    
        try {
            await UserService.changePassword(formData.oldPassword, formData.newPassword);
            setStatus({ loading: false, error: '', showSuccessModal: true });
            setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setStatus({ loading: false, error: err.message, showSuccessModal: false });
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Change Password</h1>
                <hr className="page-separator" />
            </div>

            <div className="page-content">
                <div className="settings-form-container">
                    <form className="settings-form" onSubmit={handleSubmit}>
                        <h2 className="form-heading">Update your password</h2>

                        <div className="form-group">
                            <label>Current Password</label>
                            <input
                                type="password"
                                name="oldPassword"
                                value={formData.oldPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <button type="submit" className="save-button" disabled={status.loading}>
                            {status.loading ? "Saving..." : "Save"}
                        </button>

                        {status.error && <p className="error-message">{status.error}</p>}
                    </form>
                </div>
            </div>

            <Modal show={status.showSuccessModal} onClose={() => setStatus(prev => ({ ...prev, showSuccessModal: false }))}>
                <h2>Password updated successfully</h2>
                <p>You can now use your new password next time you log in.</p>
            </Modal>
        </div>
    );
}