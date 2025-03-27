import './Dashboard.css';

export default function Dashboard() {
    const today = new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const features = [
        {
            emoji: "📆",
            title: "Book Sessions Online",
            description: "Check availability and book 1-to-1 sessions directly from your dashboard.",
            date: "March 2025",
        },
        {
            emoji: "🔗",
            title: "Instant Zoom Invites",
            description: "Zoom links are automatically generated and emailed when you book.",
            date: "March 2025",
        },
        {
            emoji: "📄",
            title: "Access Session Notes",
            description: "After each session, your tutor uploads notes that you can download anytime.",
            date: "March 2025",
        },
        {
            emoji: "🧠",
            title: "AI-Generated Follow-Up Questions",
            description: "Smart questions are generated from your uploaded notes to help reinforce learning.",
            date: "March 2025",
        },
        {
            emoji: "💰",
            title: "Secure Payment Tracking",
            description: "Monzo integration checks if you've paid — no need to send confirmation manually.",
            date: "March 2025",
        },
    ];

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