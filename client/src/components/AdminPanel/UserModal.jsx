import { useEffect, useState } from 'react';
import UserService from '/src/services/UserService';
import PlanService from '/src/services/PlanService';

import './UserModal.css';

export default function UserModal({ user, onClose }) {
    const [form, setForm] = useState({ ...user });
    const [plan, setPlan] = useState(null);

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
        await fetchPlan(); // refresh it
    };

    const fetchPlan = async () => {
        const data = await PlanService.getPlanForUser(form.id);
        setPlan(data);
    };

    useEffect(() => {
        fetchPlan();
    }, [user.id]);

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>Edit User – {user.name} {user.surname}</h2>
                <label>Target Grade:
                    <input type="number" name="target_grade" value={form.target_grade || ''} onChange={handleChange} />
                </label>
                <label>Exam Date:
                    <input type="date" name="exam_date" value={form.exam_date || ''} onChange={handleChange} />
                </label>
                <label>Maths Paper:
                    <select name="maths_paper" value={form.maths_paper || ''} onChange={handleChange}>
                        <option value="">--</option>
                        <option value="F">Foundation</option>
                        <option value="H">Higher</option>
                    </select>
                </label>

                <div className="modal-actions">
                    <button onClick={save}>Save</button>
                    <button onClick={regeneratePlan}>Regenerate Plan</button>
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
                                            {topic.topic_name} – {topic.category}
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