import './Dashboard.css';
import { features } from '../../data/features';

export default function Dashboard() {
    const today = new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });


    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <hr className="page-separator" />
            </div>

            <div className="highlight-banner">
                <p><strong>Welcome back!</strong> Today is {today}.</p>
            </div>

            <div className="dashboard-cards">
                {features.map((f, idx) => (
                    <div
                        className="feature-card"
                        key={idx}
                        style={{ animationDelay: `${idx * 0.1}s` }}
                    >
                        <div className="feature-icon">{f.emoji}</div>
                        <div>
                            <h3>{f.title}</h3>
                            <p>{f.description}</p>
                            <small className="feature-date">Added: {f.date}</small>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}