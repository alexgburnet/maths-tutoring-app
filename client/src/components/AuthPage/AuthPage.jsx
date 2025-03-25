import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./AuthPage.css";

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const initialMode = location.pathname.includes("signup") ? "signup" : "login";
  const [mode, setMode] = useState(initialMode);

  const cardRef = useRef(null);
  const loginRef = useRef(null);
  const signupRef = useRef(null);

  const resize = () => {
    const panel = mode === "login" ? loginRef.current : signupRef.current;
    if (!panel || !cardRef.current) return;

    requestAnimationFrame(() => {
      const height = panel.offsetHeight;
      cardRef.current.style.height = `${height}px`;
    });
  };

  useEffect(() => {
    resize();
    const timeout = setTimeout(resize, 400);
    window.addEventListener("resize", resize);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", resize);
    };
  }, [mode]);

  const toggleMode = () => {
    const newMode = mode === "login" ? "signup" : "login";
    setMode(newMode);
    navigate(`/${newMode}`);
  };

  return (
    <div className="auth-page">
      <div className="auth-card" ref={cardRef}>
        <div className={`form-slider ${mode === "signup" ? "shift-left" : ""}`}>
          {/* Login */}
          <div className="form-panel login-panel" ref={loginRef}>
            <h2>Sign In</h2>
            <form className="auth-form">
              <input type="email" placeholder="Email" required />
              <input type="password" placeholder="Password" required />
              <button type="submit">Sign In</button>
            </form>
            <div className="auth-toggle">
              <p>
                Don’t have an account?{" "}
                <button type="button" onClick={toggleMode}>Sign up</button>
              </p>
            </div>
          </div>

          {/* Signup */}
          <div className="form-panel signup-panel" ref={signupRef}>
            <h2>Create an Account</h2>
            <form className="auth-form">
              <input type="text" placeholder="Name" required />
              <input type="text" placeholder="Surname" required />
              <p className="note">
                Please use the email you use for Zoom
              </p>
              <input type="email" placeholder="Email" required />
              <input type="password" placeholder="Password" required />
              <button type="submit">Sign Up</button>
            </form>
            <div className="auth-toggle">
              <p>
                Already have an account?{" "}
                <button type="button" onClick={toggleMode}>Sign in</button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}