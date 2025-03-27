import { useNavigate } from "react-router-dom";
import { FaGraduationCap } from "react-icons/fa";
import "./HomePage.css";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home-wrapper">
      <nav className="navbar">
        <div className="navbar-left">
        <FaGraduationCap size={20} />
          <span className="brand">alexbur.net</span>
        </div>
        <div className="navbar-right">
          <button onClick={() => navigate("/login")} className="nav-btn">Sign In</button>
          <button onClick={() => navigate("/signup")} className="nav-btn secondary">Sign Up</button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <h1 className="main-title">One-to-One Maths Tutoring</h1>
          <p className="subtitle">Clear explanations. Personalised support. Real results.</p>
          <div className="cta">
            <button onClick={() => navigate("/dashboard")}>Book a Session</button>
          </div>
          <div className="features">
            <p>📄 Notes uploaded after each lesson</p>
            <p>🧠 AI-generated follow-up questions</p>
            <p>🎥 Zoom sessions scheduled automatically</p>
          </div>
        </div>
      </section>
    </div>
  );
}