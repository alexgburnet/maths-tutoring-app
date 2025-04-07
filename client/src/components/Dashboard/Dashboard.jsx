import './Dashboard.css';
import { features } from '../../data/features';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PlanService from '../../services/PlanService';
// Assuming you have a Loader component
// import Loader from '../Loader/Loader';

export default function Dashboard() {
    const [planData, setPlanData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const today = new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    useEffect(() => {
        const fetchPlan = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await PlanService.getCurrentPlan();
                setPlanData(data);
            } catch (err) {
                if (err.response && err.response.status === 404) {
                    // 404 means no plan found, which is okay
                    setPlanData(null);
                } else {
                    console.error("Error fetching weekly plan:", err);
                    setError('Could not load your weekly plan. Please try again later.');
                }
            }
            setIsLoading(false);
        };

        fetchPlan();
    }, []);

    // Helper to group plan entries by week
    const getGroupedPlan = () => {
        if (!planData || !planData.weekly_plan) return {};
        return planData.weekly_plan;
    };

    const groupedPlan = getGroupedPlan();
    const weeks = Object.keys(groupedPlan).sort((a, b) => parseInt(a) - parseInt(b));

    return (
        <div className="page-container dashboard-container">
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <hr className="page-separator" />
            </div>

            <div className="highlight-banner">
                <p><strong>Welcome back!</strong> Today is {today}.</p>
            </div>

            {isLoading ? (
                <div className="loading-spinner-container">{/* <Loader /> */}Loading...</div>
            ) : error ? (
                <div className="error-message">{error}</div>
            ) : planData ? (
                // Display Weekly Plan Section
                <div className="weekly-plan-section">
                    <h2 className="section-title">🗓️ Your Weekly Learning Plan</h2>
                    <p className="section-subtitle">
                        Here's your personalised plan leading up to your exam on {planData.plan.exam_date}.
                        Book sessions below or mark topics as complete.
                    </p>

                    {weeks.length > 0 ? (
                        weeks.map((weekNum, weekIndex) => (
                            <div key={`week-${weekNum}`} className="plan-week" style={{ animationDelay: `${weekIndex * 0.1}s` }}>
                                <h3 className="plan-week-header">Week {weekNum}</h3>
                                <div className="dashboard-cards"> {/* Re-use card layout */} 
                                    {groupedPlan[weekNum].map((entry, entryIndex) => (
                                        <div
                                            key={entry.entry_id}
                                            className={`plan-entry-card ${entry.completed ? 'completed' : ''}`}
                                            style={{ animationDelay: `${entryIndex * 0.05}s` }}
                                        >
                                            <div className="plan-entry-icon">📚</div>
                                            <div>
                                                <h4>{entry.topic_name} <span className="topic-category">({entry.category})</span></h4>
                                                {entry.focus_area && <p className="focus-area">Focus: {entry.focus_area}</p>}
                                                {entry.subtopics && entry.subtopics.length > 0 && (
                                                    <>
                                                        <p className="subtopics-title">Key Subtopics:</p>
                                                        <ul className="subtopics-list">
                                                            {entry.subtopics.map(sub => (
                                                                <li key={sub.weekly_plan_subtopic_id}>
                                                                    {sub.title} ({sub.tier})
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </>
                                                )}
                                                {/* TODO: Add button to mark complete */} 
                                                {entry.completed && (
                                                    <span className="completion-status">✅ Completed</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>Your weekly plan is currently empty. Contact your tutor if this seems incorrect.</p>
                    )}
                </div>
            ) : (
                // Display Take Quiz Section
                <div className="features-section"> {/* Re-use section class */} 
                    <h2 className="section-title">🎯 Personalised Learning Quiz</h2>
                    <p className="section-subtitle">
                        Take a short quiz to assess your current level and generate your personalised learning plan.
                    </p>

                    <div className="dashboard-cards">
                         {/* Wrap the card in Link */} 
                        <Link to="/quiz" className="quiz-link-card" style={{ flex: '1 1 100%' }}>
                            <div className="feature-card" style={{ animationDelay: '0s' }}>
                                <div className="feature-icon">🧠</div>
                                <div>
                                    <h3>Take Your Quiz</h3>
                                    <p>Start the quiz to find out what topics to focus on next and build your plan.</p>
                                    {/* Remove the button/coming soon text */}
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            )}

            {/* Recently Added Features Section (always shown) */} 
            <div className="features-section">
                <h2 className="section-title">✨ Recently Added Features</h2>
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