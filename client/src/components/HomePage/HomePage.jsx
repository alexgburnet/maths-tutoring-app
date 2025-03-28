import { Typewriter } from 'react-simple-typewriter';
import { useEffect } from 'react';
import FeatureCarousel from '../FeatureCarousel/FeatureCarousel';

import { useNavigate } from "react-router-dom";
import { FaGraduationCap } from "react-icons/fa";
import "./HomePage.css";

export default function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.step, .arrow');
    elements.forEach(el => observer.observe(el));

    return () => {
      elements.forEach(el => observer.unobserve(el));
    };
  }, []);

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
          <p className="subtitle">
            <Typewriter
              words={['Clear explanations.', 'Personalised support.', 'Real results.']}
              loop={true}
              cursor
              cursorStyle="_"
              typeSpeed={70}
              deleteSpeed={50}
              delaySpeed={3000}
            />
          </p>
          <div className="cta">
            <button onClick={() => navigate("/dashboard")}>Book a Session</button>
          </div>
        </div>
      </section>
      <section className="features">
        <FeatureCarousel />
      </section>
    </div>
  );
}