import { useNavigate } from "react-router-dom";
import { getTokenFromCookie } from "../../auth";
import "./HomePage.css";

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
        <p>Helping students build confidence and succeed</p>
        <button onClick={handleBookClick} className="primary-btn">Book a Session</button>
      </section>

      <section id="tutoring">
        <h2>Tutoring</h2>
        <p>
          I offer personalised Maths tutoring for GCSE students. Whether you're aiming for a pass or pushing for top grades, I tailor each session to your goals and learning style.
        </p>
        <ul>
          <li>🧠 Simplified explanations for complex concepts</li>
          <li>📈 Proven results – 100% pass rate with previous students</li>
          <li>📅 Flexible scheduling and online sessions via Zoom</li>
          <li>✅ Progress tracking and optional homework support</li>
        </ul>
      </section>

      <section id="about">
        <h2>About Me</h2>
        <p>
          I’m Alex Burnet, a Computer Science student at the University of Birmingham, and an incoming Software Developer at Lockheed Martin UK. I'm passionate about mentoring, problem-solving, and helping students reach their full potential.
        </p>
        <ul>
          <li>💻 Full Stack Developer – I create everything from web apps to 3D renderers</li>
          <li>🌐 You can check out my full portfolio at <a href="https://alexbur.net" target="_blank" rel="noopener noreferrer">alexbur.net</a></li>
        </ul>
      </section>

      <section id="experience">
        <h2>Experience</h2>
        <p>
          I’ve tutored students for over 2 years, helping them boost grades and grow in confidence. My background in software development and education helps me explain abstract concepts in a relatable way.
        </p>
        <ul>
          <li>✅ 100% Pass rate</li>
          <li>👨‍🏫 Focus on adapting to different learning styles</li>
          <li>🧾 Experience in lesson planning, progress tracking, and feedback</li>
        </ul>
      </section>

      <section id="contact">
        <h2>Contact Me</h2>
        <p>Have questions or want to learn more? Feel free to message me on WhatsApp:</p>
        <p>
          WhatsApp:{" "}
          <a
            href="https://wa.me/447914821599"
            target="_blank"
            rel="noopener noreferrer"
          >
            +44 7914 821 599
          </a>
        </p>
      </section>
    </div>
  );
}