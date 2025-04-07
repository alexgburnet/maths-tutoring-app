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
        <div className="page-container dashboard-container">
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <hr className="page-separator" />
            </div>

            <div className="highlight-banner">
                <p><strong>Welcome back!</strong> Today is {today}.</p>
            </div>

            {/* Quiz Section */}
            <div className="features-section">
                <h2 className="section-title">🎯 Personalised Learning Quiz</h2>
                <p className="section-subtitle">
                    Take a short quiz to assess your current level and get personalised recommendations.
                </p>

                <div className="dashboard-cards">
                    <div className="feature-card" style={{ animationDelay: '0s' }}>
                        <div className="feature-icon">🧠</div>
                        <div>
                            <h3>Take Your Quiz</h3>
                            <p>Start the quiz to find out what topics to focus on next.</p>
                            <small className="feature-date">
                                <button className="quiz-button">Coming Soon</button>
                            </small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="features-section">
                <h2 className="section-title">🛠 Recently Added Features</h2>
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
        </div>
    );
}