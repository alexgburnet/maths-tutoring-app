import './Settings.css';
import { useEffect, useState } from 'react';
import UserService from '../../services/UserService';
import Modal from '../../components/Modal/Modal'; // Adjust import path if needed

export default function Settings() {
    const [formData, setFormData] = useState({ name: '', surname: '', email: '' });
    const [status, setStatus] = useState({ loading: false, error: '', showSuccessModal: false });

    useEffect(() => {
        async function fetchUser() {
            const user = await UserService.getUserDetails();
            if (user) {
                setFormData({
                    name: user.name || '',
                    surname: user.surname || '',
                    email: user.email || '',
                });
            }
        }
        fetchUser();
    }, []);

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, error: '', showSuccessModal: false });

        try {
            await UserService.updateUserDetails(formData);
            setStatus({ loading: false, error: '', showSuccessModal: true });
        } catch (err) {
            setStatus({ loading: false, error: err.message, showSuccessModal: false });
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Settings</h1>
                <hr className="page-separator" />
            </div>

            <div className="page-content">
                <div className="settings-tabs">
                    <button className="tab active">Account</button>
                    <button className="tab disabled">Appearance</button>
                    <button className="tab disabled">Accessibility</button>
                </div>

                <div className="settings-form-container">
                    <form className="settings-form" onSubmit={handleSubmit}>
                        <h2 className="form-heading">Change your details</h2>

                        <div className="form-row">
                            <div className="form-group">
                                <label>First Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Last Name</label>
                                <input
                                    type="text"
                                    name="surname"
                                    value={formData.surname}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
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
                <h2>Details updated successfully</h2>
                <p>Your profile information has been saved.</p>
            </Modal>
        </div>
    );
}