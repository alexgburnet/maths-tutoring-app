import { useNavigate } from "react-router-dom";
import { getTokenFromCookie } from "../../auth";

export default function HomePage() {
  const navigate = useNavigate();
  const token = getTokenFromCookie();

  const handleBookClick = () => {
    if (token) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="home">
      <section className="hero">
        <h1>Welcome to My Tutoring Site</h1>
        <p>Helping students build confidence and succeed 📘</p>
        <button onClick={handleBookClick} className="primary-btn">Book a Session</button>
      </section>

      <section id="tutoring">
        <h2>Tutoring</h2>
        <p>I tutor maths at GCSE and A-Level, and can tailor sessions to individual needs.</p>
      </section>

      <section id="about">
        <h2>About Me</h2>
        <p>I'm a Computer Science student at Birmingham, passionate about education and mentoring.</p>
      </section>

      <section id="contact">
        <h2>Contact Me</h2>
        <p>Email: alex@example.com</p>
      </section>
    </div>
  );
}