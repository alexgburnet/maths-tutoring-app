import { useEffect, useState } from 'react';
import UserService from '/src/services/UserService';
import PlanService from '/src/services/PlanService';

import './UserModal.css';

export default function UserModal({ user, onClose }) {
    const [form, setForm] = useState(null);
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const save = async () => {
        await UserService.updateUser(form.id, {
            target_grade: form.target_grade,
            exam_date: form.exam_date,
            maths_paper: form.maths_paper
        });
        alert("User updated");
    };

    const regeneratePlan = async () => {
        await PlanService.regeneratePlanForUser(form.id);
        alert("Plan regenerated");
        await fetchPlan();
    };

    const deletePlan = async () => {
        if (window.confirm("Are you sure you want to delete this user's plan permanently?")) {
            try {
                await PlanService.deletePlanForUser(form.id);
                alert("Plan deleted");
                setPlan(null); // Clear the plan display
            } catch (err) {
                console.error("Failed to delete plan:", err);
                alert(`Could not delete plan: ${err.response?.data?.message || err.message}`);
            }
        }
    };

    const fetchPlan = async () => {
        try {
            const data = await PlanService.getPlanForUser(user.id);
            setPlan(data);
        } catch (err) {
            console.warn("No plan found for user", err);
            setPlan(null);
        }
    };

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const detailedUser = await UserService.getUser(user.id);
                setForm(detailedUser);
            } catch (err) {
                console.error("Failed to fetch user:", err);
                alert("Could not load user details.");
            } finally {
                setLoading(false);
            }
        };

        fetchUserDetails();
        fetchPlan();
    }, [user.id]);

    if (loading || !form) {
        return (
            <div className="modal-overlay">
                <div className="modal">Loading user details...</div>
            </div>
        );
    }

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>Edit User – {form.name} {form.surname}</h2>

                <label>Target Grade:
                    <input
                        type="number"
                        name="target_grade"
                        value={form.target_grade || ''}
                        onChange={handleChange}
                    />
                </label>

                <label>Exam Date:
                    <input
                        type="date"
                        name="exam_date"
                        value={form.exam_date || ''}
                        onChange={handleChange}
                    />
                </label>

                <label>Maths Paper:
                    <select
                        name="maths_paper"
                        value={form.maths_paper || ''}
                        onChange={handleChange}
                    >
                        <option value="">--</option>
                        <option value="F">Foundation</option>
                        <option value="H">Higher</option>
                    </select>
                </label>

                <div className="modal-actions">
                    <button onClick={save}>Save</button>
                    <button onClick={regeneratePlan}>Regenerate Plan</button>
                    <button onClick={deletePlan} className="button-danger">Delete Plan</button>
                    <button onClick={onClose}>Close</button>
                </div>

                {plan && (
                    <div className="plan-preview">
                        <h3>Weekly Plan</h3>
                        <p><strong>Exam Date:</strong> {plan.plan.exam_date}</p>
                        <p><strong>Target Grade:</strong> {plan.plan.target_grade}</p>
                        {Object.entries(plan.weekly_plan).map(([week, topics]) => (
                            <div key={week}>
                                <h4>Week {week}</h4>
                                <ul>
                                    {topics.map(topic => (
                                        <li key={topic.topic_id}>
                                            <strong>{topic.topic_name}</strong> – {topic.category}
                                            {topic.subtopics && topic.subtopics.length > 0 && (
                                                <ul className="subtopic-list">
                                                    {topic.subtopics.map(sub => (
                                                        <li key={sub.id}>
                                                            • {sub.title} <small>({sub.tier}, weight {sub.weight})</small>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}